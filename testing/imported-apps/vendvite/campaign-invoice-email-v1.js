'use strict';
var invoiceTools=require('./invoice-v2');
function escape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

function message(invoice,broker,issuer,url){
  var campaign=invoice.campaign||{};
  var test=Number(invoice.is_test)===1||invoice.paypal_mode==='sandbox'||Number(campaign.is_test)===1||campaign.paypal_mode==='sandbox';
  var count=Number(campaign.address_count||campaign.quantity||0);
  var rows=[['Campagne','N° '+invoice.campaign_id],['Lettres',String(count)],['Centre du secteur',campaign.centre_label||'—'],['Sous-total',invoiceTools.money(invoice.subtotal_cents)],['TPS (5 %)',invoiceTools.money(invoice.gst_cents)],['TVQ (9,975 %)',invoiceTools.money(invoice.qst_cents)],[test?'Total simulé':'Total payé',invoiceTools.money(invoice.total_cents)]];
  var intro=test?'Voici la facture de votre campagne postale de test. Aucun paiement réel n’a été encaissé et aucun courrier ne sera posté pour ce test.':'Votre paiement est confirmé. La facture de votre campagne postale est jointe en PDF.';
  var footer=test?'Document de test sans valeur comptable.':'Votre campagne sera déposée chez Postes Canada sous 72 heures après la confirmation du paiement. Le délai de livraison postal s’ajoute.';
  var title=test?'Votre facture de campagne — TEST PAYPAL':'Votre facture de campagne VendVite';
  var text='Bonjour '+(broker.full_name||'')+',\n\n'+intro+'\nFacture '+invoice.invoice_number+'\n\n'+rows.map(function(r){return r[0]+' : '+r[1];}).join('\n')+'\nPage de capture incluse à 0 $.\n\nTélécharger la facture : '+url+'\n\n'+footer;
  var html='<div style="font-family:Arial,sans-serif;background:#f5f3ee;padding:28px;color:#242820"><div style="max-width:600px;margin:auto;background:#fff;padding:28px;border:1px solid #d8d5cb;border-radius:8px">'
    +'<p style="font-weight:bold;color:#ac1835;letter-spacing:.08em">VendVite'+(test?' · TEST PAYPAL':'')+'</p><h1 style="font-family:Georgia,serif;font-size:25px">'+escape(title)+'</h1>'
    +'<p>Bonjour '+escape(broker.full_name)+',</p><p style="line-height:1.6">'+escape(intro)+'</p><p><strong>Facture '+escape(invoice.invoice_number)+'</strong></p>'
    +'<table style="width:100%;border-collapse:collapse;font-size:14px">'+rows.map(function(r){return '<tr><td style="padding:10px 0;border-bottom:1px solid #ddd;color:#595a54">'+escape(r[0])+'</td><td style="padding:10px 0 10px 12px;border-bottom:1px solid #ddd;text-align:right">'+escape(r[1])+'</td></tr>';}).join('')+'</table>'
    +'<p style="font-size:14px;line-height:1.6">Page de capture incluse à 0 $.</p><p><a href="'+escape(url)+'" style="display:inline-block;padding:14px 20px;background:#b51d3a;color:#fff;text-decoration:none;border-radius:4px">Télécharger ma facture</a></p>'
    +'<p style="font-size:13px;color:#595a54;line-height:1.6">'+escape(footer)+'</p></div></div>';
  return {to:broker.email,skipInbox:true,subject:'VendVite — '+(test?'[TEST PAYPAL] ':'')+'Votre facture de campagne '+invoice.invoice_number,html:html,text:text,attachments:[{content:invoiceTools.buildInvoicePdf(Object.assign({},invoice,{is_test:test?1:0}),broker,issuer).toString('base64'),filename:invoice.invoice_number+'.pdf',type:'application/pdf',disposition:'attachment'}]};
}

async function send(options){
  var db=options.db,invoice=options.invoice,broker=options.broker,campaign=invoice&&invoice.campaign;
  if(!invoice||invoice.kind!=='campagne'||!campaign||campaign.payment_status!=='paid'||Number(invoice.broker_id)!==Number(broker.id)||!invoice.invoice_number)throw Error('A paid campaign invoice is required');
  var claimed=await db.get("UPDATE broker_invoices SET email_claimed_at=NOW(),email_error=NULL WHERE id=$1 AND emailed_at IS NULL AND (email_claimed_at IS NULL OR email_claimed_at<NOW()-INTERVAL '10 minutes') RETURNING *,email_claimed_at::text AS email_claim_key",[invoice.id]);
  if(!claimed){
    var current=await db.get('SELECT emailed_at FROM broker_invoices WHERE id=$1',[invoice.id]);
    return {status:current&&current.emailed_at?'already_sent':'sending',emailedAt:current&&current.emailed_at};
  }
  var result;
  try{
    result=await options.email.send(message(Object.assign({},claimed,{campaign:campaign}),broker,options.issuer,options.url));
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
