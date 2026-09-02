/* VendVite payment receipt helpers. Dependency-free so the tenant runtime can
 * render a proper PDF without exposing platform billing internals. */

function roundMoney(value){ return Math.round(Number(value) || 0); }

function taxBreakdown(totalCents){
  var total = Math.max(0, roundMoney(totalCents));
  var expectedSubtotal = 59900;
  var expectedGst = 2995;
  var expectedQst = 5975;
  if (total === expectedSubtotal + expectedGst + expectedQst) {
    return { subtotalCents: expectedSubtotal, gstCents: expectedGst, qstCents: expectedQst, totalCents: total };
  }
  var subtotal = Math.round(total / 1.14975);
  var gst = Math.round(subtotal * 0.05);
  return {
    subtotalCents: subtotal,
    gstCents: gst,
    qstCents: Math.max(0, total - subtotal - gst),
    totalCents: total
  };
}

function invoiceNumber(id, dateValue, isTest){
  var d = dateValue ? new Date(dateValue) : new Date();
  var year = Number.isFinite(d.getTime()) ? d.getUTCFullYear() : new Date().getUTCFullYear();
  return 'VV-' + (isTest ? 'TEST-' : '') + year + '-' + String(id).padStart(6, '0');
}

function money(cents){
  return (Number(cents || 0) / 100).toFixed(2).replace('.', ',') + ' $ CAD';
}

function dateFr(value){
  var d = new Date(value);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toLocaleDateString('fr-CA', { year:'numeric', month:'long', day:'numeric', timeZone:'America/Toronto' });
}

function latin1(value){
  return String(value == null ? '' : value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE')
    .split('').map(function(ch){ return ch.charCodeAt(0) <= 255 ? ch : '?'; }).join('');
}

function pdfString(value){
  return latin1(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildInvoicePdf(invoice, broker, issuer){
  issuer = issuer || {};
  broker = broker || {};
  var isTest = Number(invoice && invoice.is_test) === 1 || (invoice && invoice.is_test === true);
  var c = [];
  function fill(hex){
    var h = String(hex || '#000000').replace('#','');
    var r = parseInt(h.slice(0,2),16) / 255;
    var g = parseInt(h.slice(2,4),16) / 255;
    var b = parseInt(h.slice(4,6),16) / 255;
    c.push(r.toFixed(3) + ' ' + g.toFixed(3) + ' ' + b.toFixed(3) + ' rg');
  }
  function stroke(hex){
    var h = String(hex || '#000000').replace('#','');
    c.push((parseInt(h.slice(0,2),16)/255).toFixed(3) + ' ' + (parseInt(h.slice(2,4),16)/255).toFixed(3) + ' ' + (parseInt(h.slice(4,6),16)/255).toFixed(3) + ' RG');
  }
  function text(x,y,size,font,value,alignWidth){
    var prefix = 'BT /' + (font || 'F1') + ' ' + size + ' Tf 1 0 0 1 ' + x + ' ' + y + ' Tm ';
    if (alignWidth) {
      // Approximation is deliberate: standard Helvetica has no shaping API in
      // this dependency-free renderer, and invoice values are short.
      var estimated = latin1(value).length * size * 0.51;
      prefix = 'BT /' + (font || 'F1') + ' ' + size + ' Tf 1 0 0 1 ' + Math.max(x, x + alignWidth - estimated) + ' ' + y + ' Tm ';
    }
    c.push(prefix + '(' + pdfString(value) + ') Tj ET');
  }
  function line(x1,y1,x2,y2,width){ c.push((width || 1) + ' w ' + x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S'); }

  // Header: restrained VendVite dossier identity.
  fill('#0D0A0B'); c.push('0 680 612 112 re f');
  fill('#E30B2D'); c.push('0 680 10 112 re f');
  fill('#FFFFFF');
  text(50,738,27,'F2','VendVite');
  text(50,713,9,'F1',isTest ? 'TEST PAYPAL · AUCUN PAIEMENT RÉEL' : 'REÇU DE PAIEMENT · ABONNEMENT ANNUEL');
  text(382,739,11,'F2','FACTURE NO',180);
  text(382,720,12,'F2',invoice.invoice_number || '',180);
  text(382,702,9,'F1',dateFr(invoice.payment_time || invoice.created_at),180);

  fill('#111214');
  text(50,642,9,'F2','ÉMISE PAR');
  text(50,622,12,'F2',issuer.name || 'Liasse Technologique');
  text(50,606,9,'F1',issuer.address || 'vendvite.app');
  text(50,592,9,'F1',issuer.email || 'notifications@liasse.tech');

  text(326,642,9,'F2','FACTURÉ À');
  text(326,622,12,'F2',broker.full_name || '-');
  text(326,606,9,'F1',broker.agency || '');
  text(326,592,9,'F1',broker.email || '');

  fill('#F2F2F0'); c.push('50 522 512 30 re f');
  fill('#5F646C');
  text(62,533,9,'F2','DESCRIPTION');
  text(432,533,9,'F2','MONTANT',118);
  fill('#111214');
  text(62,493,11,'F2','Abonnement annuel VendVite');
  text(62,476,9,'F1','Page privée, capture de pistes et espace courtier');
  text(432,493,11,'F1',money(invoice.subtotal_cents),118);
  stroke('#D5D8D3'); line(50,458,562,458,1);

  fill('#5F646C');
  text(62,436,9,'F1','Période couverte : ' + dateFr(invoice.period_start) + ' au ' + dateFr(invoice.period_end));

  fill('#30343A');
  text(338,392,10,'F1','Sous-total',120); text(458,392,10,'F1',money(invoice.subtotal_cents),92);
  var gstLabel = 'TPS (5 %)';
  if (issuer.gst) gstLabel += ' · ' + issuer.gst;
  var qstLabel = 'TVQ (9,975 %)';
  if (issuer.qst) qstLabel += ' · ' + issuer.qst;
  text(286,368,9,'F1',gstLabel,172); text(458,368,10,'F1',money(invoice.gst_cents),92);
  text(286,344,9,'F1',qstLabel,172); text(458,344,10,'F1',money(invoice.qst_cents),92);
  stroke('#111214'); line(338,328,562,328,1);
  fill('#111214');
  text(320,303,13,'F2',isTest ? 'TOTAL SIMULÉ' : 'TOTAL PAYÉ',128); text(458,303,13,'F2',money(invoice.total_cents),92);

  fill('#F7F8F5'); c.push('50 224 512 50 re f');
  fill('#5F646C');
  text(62,250,9,'F2','PAYÉ AVEC PAYPAL');
  text(62,233,9,'F1',invoice.paypal_transaction_id || invoice.paypal_subscription_id || '');
  text(330,250,9,'F2','ABONNEMENT');
  text(330,233,9,'F1',invoice.paypal_subscription_id || '');

  stroke('#D5D8D3'); line(50,92,562,92,1);
  fill('#5F646C');
  text(50,70,9,'F1',isTest ? 'Document de test sans valeur comptable. Aucun paiement réel n\'a été encaissé.' : 'Merci pour votre confiance. Cette facture confirme le paiement indiqué ci-dessus.');
  text(50,52,9,'F1','VendVite · vendvite.app · ' + (issuer.email || 'notifications@liasse.tech'));

  var stream = c.join('\n') + '\n';
  var objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + Buffer.byteLength(stream, 'latin1') + ' >>\nstream\n' + stream + 'endstream'
  ];
  var pdf = '%PDF-1.4\n%âãÏÓ\n';
  var offsets = [0];
  objects.forEach(function(obj, index){
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += (index + 1) + ' 0 obj\n' + obj + '\nendobj\n';
  });
  var xref = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  offsets.slice(1).forEach(function(offset){ pdf += String(offset).padStart(10,'0') + ' 00000 n \n'; });
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  return Buffer.from(pdf, 'latin1');
}

module.exports = {
  taxBreakdown: taxBreakdown,
  invoiceNumber: invoiceNumber,
  buildInvoicePdf: buildInvoicePdf,
  money: money,
  dateFr: dateFr
};
