/* Branded workspace activation mail. Keep a text alternative and use tables
 * and inline styles so the essential layout survives email-client filtering. */
var SEAL = 'https://res.cloudinary.com/duhp69meg/image/upload/c_crop,g_north,h_538,w_534/f_png,q_auto,w_640/v1788268189/vendvite/logo.png';
function esc(value){
  return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function build(options){
  var broker=options.broker,fr=options.lang!=='en',hours=options.validHours===72?72:1;
  var copy=fr?{
    subject:'VendVite — Votre espace vous attend',
    preheader:'Votre page à votre nom, votre quartier, vos prochaines conversations. Ouvrez votre espace VendVite.',
    eyebrow:'Votre espace est prêt',
    title:'Votre prochain quartier vous attend.',
    greeting:broker.full_name?'Bonjour '+broker.full_name+',':'Bonjour,',
    intro:'Bienvenue chez VendVite. Votre espace est prêt : donnez votre touche à votre page, puis préparez votre première campagne postale.',
    cta:'Ouvrir mon espace',
    validity:hours===72?'Lien personnel à usage unique, valable 72 heures.':'Lien personnel à usage unique, valable une heure.',
    next:'La suite, en toute simplicité',
    steps:[
      ['Votre page, à votre image.','Vérifiez vos coordonnées et personnalisez votre présentation.'],
      ['Votre quartier, votre campagne.','Choisissez votre secteur, consultez la lettre et le coût total avant de commander.'],
      ['Vos prochaines conversations.','Les propriétaires demandent leur analyse comparative de marché gratuite. Vous recevez leurs coordonnées dans votre espace et par courriel.']
    ],
    offer:'Votre page de capture est comprise à 0 $.',
    price:'Réservée aux campagnes postales VendVite. Envois à 1,59 $ par lettre, avant taxes. Aucun abonnement à la page.',
    fallback:'Le bouton ne fonctionne pas ?',
    fallbackLink:'Ouvrir mon espace avec ce lien',
    expiry:'Lien expiré ?',
    expiryLink:'Demander un nouveau lien',
    help:'Une question ? Répondez simplement à ce courriel.',
    unsolicited:'Si vous n’avez pas demandé cet accès, vous pouvez ignorer ce courriel.'
  }:{
    subject:'VendVite — Your workspace is ready',
    preheader:'Your own page, your neighbourhood, your next conversations. Open your VendVite workspace.',
    eyebrow:'Your workspace is ready',
    title:'Your next neighbourhood is waiting.',
    greeting:broker.full_name?'Hello '+broker.full_name+',':'Hello,',
    intro:'Welcome to VendVite. Your workspace is ready: make your page your own, then prepare your first mailing campaign.',
    cta:'Open my workspace',
    validity:hours===72?'Personal, single-use link. Valid for 72 hours.':'Personal, single-use link. Valid for one hour.',
    next:'Here’s what comes next',
    steps:[
      ['Your page, your identity.','Check your contact details and personalize your introduction.'],
      ['Your neighbourhood, your campaign.','Choose your area, review the letter and see the total cost before you order.'],
      ['Your next conversations.','Homeowners request their free comparative market analysis. Their contact details arrive in your workspace and by email.']
    ],
    offer:'Your lead capture page is included at $0.',
    price:'Reserved for VendVite postal campaigns. Mailings at $1.59 per letter, before tax. No page subscription.',
    fallback:'Button not working?',
    fallbackLink:'Use this link to open my workspace',
    expiry:'Link expired?',
    expiryLink:'Request a new link',
    help:'Have a question? Simply reply to this email.',
    unsolicited:'If you didn’t request this access, you can ignore this email.'
  };
  var url=esc(options.url),loginUrl=esc(options.loginUrl);
  var steps=copy.steps.map(function(step,index){return '<tr><td width="30" valign="top" style="width:30px;padding:0 0 18px;color:#A91D37;font-family:Georgia,serif;font-size:23px;line-height:26px">'+(index+1)+'</td><td valign="top" style="padding:0 0 18px;font-size:15px;line-height:23px;color:#514940"><strong style="color:#302A25">'+esc(step[0])+'</strong><br>'+esc(step[1])+'</td></tr>';}).join('');
  var html='<!doctype html><html lang="'+(fr?'fr':'en')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+esc(copy.subject)+'</title>'
    +'<style>@media only screen and (max-width:480px){.vv-outer{padding:12px 8px!important}.vv-pad{padding-left:24px!important;padding-right:24px!important}.vv-title{font-size:30px!important;line-height:35px!important}}</style></head>'
    +'<body style="margin:0;padding:0;background-color:#0D0A0B;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">'
    +'<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">'+esc(copy.preheader)+'</div>'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#0D0A0B"><tr><td class="vv-outer" align="center" style="padding:28px 16px">'
    +'<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-top:3px solid #E30B2D">'
    +'<tr><td class="vv-pad" bgcolor="#171213" style="padding:24px 36px;background-color:#171213"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="68" style="width:68px"><img src="'+SEAL+'" alt="" width="56" height="56" style="display:block;border:0;width:56px;height:56px"></td><td style="color:#F5EFE6;font-family:Georgia,Times,serif;font-size:30px;font-weight:bold;letter-spacing:-1px">VendVite<span style="color:#FF3350">.</span></td></tr></table></td></tr>'
    +'<tr><td class="vv-pad" bgcolor="#F5EFE6" style="padding:32px 36px 28px;background-color:#F5EFE6;color:#302A25">'
    +'<p style="margin:0 0 14px;color:#8B3A2A;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">'+esc(copy.eyebrow)+'</p>'
    +'<h1 class="vv-title" style="margin:0 0 24px;color:#302A25;font-family:Georgia,Times,serif;font-size:36px;line-height:41px;font-weight:bold">'+esc(copy.title)+'</h1>'
    +'<p style="margin:0 0 10px;font-size:16px;line-height:25px;color:#302A25">'+esc(copy.greeting)+'</p>'
    +'<p style="margin:0 0 24px;font-size:16px;line-height:25px;color:#514940">'+esc(copy.intro)+'</p>'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" bgcolor="#BB1232" style="background-color:#BB1232;border-radius:5px;mso-padding-alt:18px 16px"><a href="'+url+'" style="display:block;padding:18px 16px;border:1px solid #BB1232;border-radius:5px;background-color:#BB1232;color:#FFFFFF;font-size:17px;line-height:23px;font-weight:bold;text-align:center;text-decoration:none;mso-padding-alt:0">'+esc(copy.cta)+' <span aria-hidden="true">&rarr;</span></a></td></tr></table>'
    +'<p style="margin:12px 0 28px;color:#665B50;font-size:12px;line-height:18px;text-align:center">'+esc(copy.validity)+'</p>'
    +'<h2 style="margin:0 0 20px;padding-top:24px;border-top:1px solid #D6CBBB;color:#302A25;font-family:Georgia,Times,serif;font-size:22px;line-height:29px">'+esc(copy.next)+'</h2>'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">'+steps+'</table>'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#EAE0D2" style="padding:18px;border-left:3px solid #C79A5B;background-color:#EAE0D2;color:#514940;font-size:13px;line-height:21px"><strong style="color:#302A25;font-size:15px">'+esc(copy.offer)+'</strong><br>'+esc(copy.price)+'</td></tr></table>'
    +'<p style="margin:24px 0 0;color:#665B50;font-size:12px;line-height:20px">'+esc(copy.fallback)+' <a href="'+url+'" style="color:#9F1730;text-decoration:underline">'+esc(copy.fallbackLink)+'</a>.<br>'+esc(copy.expiry)+' <a href="'+loginUrl+'" style="color:#9F1730;text-decoration:underline">'+esc(copy.expiryLink)+'</a>.</p>'
    +'</td></tr><tr><td class="vv-pad" bgcolor="#171213" style="padding:24px 36px;background-color:#171213;text-align:center">'
    +'<p style="margin:0 0 8px;color:#F5EFE6;font-size:13px;line-height:21px">'+esc(copy.help)+'</p>'
    +'<p style="margin:0;color:#BEB1A5;font-size:11px;line-height:18px">'+esc(copy.unsolicited)+'</p>'
    +'</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>';
  var text=['VendVite',copy.greeting,'',copy.title,copy.intro,'',copy.cta+' : '+options.url,copy.validity,'',copy.next]
    .concat(copy.steps.map(function(step,index){return (index+1)+'. '+step[0]+' '+step[1];}))
    .concat(['',copy.offer,copy.price,'',copy.expiry+' '+options.loginUrl,'',copy.help,copy.unsolicited]).join('\n').replace(/\u00a0/g,' ');
  return {to:broker.email,subject:copy.subject,html:html,text:text,
    from:{email:'notifications@vendvite.app',name:'VendVite'},
    replyTo:{email:'notifications@vendvite.app',name:'VendVite'},skipInbox:true};
}
module.exports={build:build};
