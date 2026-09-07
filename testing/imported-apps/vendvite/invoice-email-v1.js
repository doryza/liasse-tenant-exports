'use strict';
var invoiceTools=require('./invoice-v2');
var configTools=require('./invoice-settings-v1');
function escape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

function message(invoice,broker,issuer,url,settings){
  var config=configTools.configuration(settings,issuer);settings=config.settings;issuer=config.issuer;
  var campaign=invoice.campaign||{};
  var isCampaign=invoice.kind==='campagne';
  var test=Number(invoice.is_test)===1||invoice.paypal_mode==='sandbox'||Number(campaign.is_test)===1||campaign.paypal_mode==='sandbox';
  var count=Number(campaign.address_count||campaign.quantity||0);
  var values={numero_facture:invoice.invoice_number,nom_agent:broker.full_name||'',numero_campagne:invoice.campaign_id||'—',nombre_lettres:isCampaign?count:'—',centre:campaign.centre_label||'—',total:invoiceTools.money(invoice.total_cents),sous_total:invoiceTools.money(invoice.subtotal_cents),tps:invoiceTools.money(invoice.gst_cents),tvq:invoiceTools.money(invoice.qst_cents)};
  var rows=[['Date',invoiceTools.dateFr(invoice.payment_time||invoice.created_at)],['Facturé à',[broker.full_name,broker.agency,broker.email].filter(Boolean).join(' · ')]];
  if(isCampaign)rows.push(['Campagne','N° '+invoice.campaign_id],['Lettres',String(count)],['Centre du secteur',campaign.centre_label||'—']);
  else rows.push(['Service','Abonnement annuel VendVite'],['Période couverte',invoiceTools.dateFr(invoice.period_start)+' au '+invoiceTools.dateFr(invoice.period_end)]);
  rows.push(['Sous-total',values.sous_total],['TPS (5 %)'+(issuer.gst?' · '+issuer.gst:''),values.tps],['TVQ (9,975 %)'+(issuer.qst?' · '+issuer.qst:''),values.tvq],[test?'Total simulé':'Total payé',values.total]);
  var reference=invoice.paypal_transaction_id||invoice.paypal_order_id||invoice.paypal_subscription_id;if(reference)rows.push(['Référence PayPal',reference]);
  var intro=configTools.expand(settings.invoice_email_intro,values),footer=configTools.expand(settings.invoice_email_footer,values),title=configTools.expand(settings.invoice_email_title,values);
  var notice=test?'Document de test sans valeur comptable. Aucun paiement réel n’a été encaissé'+(isCampaign?' et aucun courrier ne sera posté pour ce test.':'.'):isCampaign?'Votre campagne sera déposée chez Postes Canada sous 72 heures après la confirmation du paiement. Le délai de livraison postal s’ajoute.':'';
  var issuerLines=[issuer.name,issuer.address,issuer.email].filter(Boolean),showLink=settings.invoice_pdf_link==='1';
  var text=(test?'TEST PAYPAL\n'+notice+'\n\n':'')+title+'\nBonjour '+(broker.full_name||'')+',\n\n'+intro+'\nFacture '+invoice.invoice_number+'\n\n'+rows.map(function(r){return r[0]+' : '+r[1];}).join('\n')+(isCampaign?'\nPage de capture incluse à 0 $.':'')+(showLink?'\n\n'+settings.invoice_button_label+' : '+url:'')+'\n\n'+footer+(!test&&notice?'\n\n'+notice:'')+'\n\nÉmise par\n'+issuerLines.join('\n');
  function paragraphs(value){return escape(value).replace(/\n/g,'<br>');}
  var html='<div style="font-family:Arial,sans-serif;background:#f5f3ee;padding:28px;color:#242820"><div style="max-width:600px;margin:auto;background:#fff;padding:28px;border:1px solid #d8d5cb;border-radius:8px">'
    +'<p style="font-weight:bold;color:#ac1835;letter-spacing:.08em">VendVite'+(test?' · TEST PAYPAL':'')+'</p><h1 style="font-family:Georgia,serif;font-size:25px">'+escape(title)+'</h1>'
    +(test?'<p style="padding:12px;border:1px solid #ac1835;color:#8e1430;line-height:1.6">'+escape(notice)+'</p>':'')
    +'<p>Bonjour '+escape(broker.full_name)+',</p><p style="line-height:1.6">'+paragraphs(intro)+'</p><p><strong>Facture '+escape(invoice.invoice_number)+'</strong></p>'
    +'<table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px;overflow-wrap:anywhere">'+rows.map(function(r){return '<tr><td style="width:42%;padding:10px 0;border-bottom:1px solid #ddd;color:#595a54">'+escape(r[0])+'</td><td style="padding:10px 0 10px 12px;border-bottom:1px solid #ddd;text-align:right">'+escape(r[1])+'</td></tr>';}).join('')+'</table>'
    +(isCampaign?'<p style="font-size:14px;line-height:1.6">Page de capture incluse à 0 $.</p>':'')
    +(showLink?'<p><a href="'+escape(url)+'" style="display:inline-block;padding:14px 20px;background:#b51d3a;color:#fff;text-decoration:none;border-radius:4px">'+escape(settings.invoice_button_label)+'</a></p>':'')
    +'<p style="font-size:14px;line-height:1.6">'+paragraphs(footer)+'</p>'+(!test&&notice?'<p style="font-size:13px;color:#595a54;line-height:1.6">'+escape(notice)+'</p>':'')
    +'<p style="font-size:13px;color:#595a54;line-height:1.6;border-top:1px solid #ddd;padding-top:16px">Émise par<br>'+issuerLines.map(escape).join('<br>')+'</p></div></div>';
  var result={to:broker.email,skipInbox:true,subject:(test?'[TEST PAYPAL] ':'')+configTools.expand(settings.invoice_email_subject,values).replace(/[\r\n]+/g,' ').slice(0,220),html:html,text:text};
  if(settings.invoice_attach_pdf==='1')result.attachments=[{content:invoiceTools.buildInvoicePdf(Object.assign({},invoice,{is_test:test?1:0}),broker,issuer).toString('base64'),filename:invoice.invoice_number+'.pdf',type:'application/pdf',disposition:'attachment'}];
  return result;
}

async function send(options){
  var db=options.db,invoice=options.invoice,broker=options.broker,campaign=invoice&&invoice.campaign;
  if(!invoice||Number(invoice.broker_id)!==Number(broker.id)||!invoice.invoice_number||(invoice.kind==='campagne'?(!campaign||campaign.payment_status!=='paid'):(!invoice.paypal_subscription_id||!invoice.payment_time)))throw Error('A paid invoice is required');
  var claimed=await db.get("UPDATE broker_invoices SET email_claimed_at=NOW(),email_error=NULL WHERE id=$1 AND emailed_at IS NULL AND (email_claimed_at IS NULL OR email_claimed_at<NOW()-INTERVAL '10 minutes') RETURNING *,email_claimed_at::text AS email_claim_key",[invoice.id]);
  if(!claimed){
    var current=await db.get('SELECT emailed_at FROM broker_invoices WHERE id=$1',[invoice.id]);
    return {status:current&&current.emailed_at?'already_sent':'sending',emailedAt:current&&current.emailed_at};
  }
  var result;
  try{
    result=await options.email.send(message(Object.assign({},claimed,{campaign:campaign}),broker,options.issuer,options.url,options.settings));
    // The platform also returns {error} or {skipped:true}; neither is a send.
    if(!result||result.success!==true||result.skipped||result.error)throw Error('Email provider did not accept the invoice');
  }catch(e){
    await db.run('UPDATE broker_invoices SET email_claimed_at=NULL,email_error=$1 WHERE id=$2 AND email_claimed_at=$3::timestamptz AND emailed_at IS NULL',[String(e.message||'Email delivery failed').slice(0,500),invoice.id,claimed.email_claim_key]);
    throw e;
  }
  var id=result.messageId||(result.response&&result.response.headers&&result.response.headers['x-message-id'])||null;
  // Keep the claim if saving the successful send fails; do not immediately
  // release it and risk a duplicate while the provider is delivering it.
  var saved=await db.get('UPDATE broker_invoices SET emailed_at=NOW(),email_message_id=$1,email_error=NULL,email_claimed_at=NULL WHERE id=$2 AND email_claimed_at=$3::timestamptz RETURNING emailed_at',[id,invoice.id,claimed.email_claim_key]);
  if(!saved)throw Error('Invoice delivery claim changed');
  return {status:'sent',emailedAt:saved.emailed_at};
}
module.exports={message:message,send:send};
