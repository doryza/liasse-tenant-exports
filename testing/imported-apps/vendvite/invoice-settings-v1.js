'use strict';
var fields=[
 {key:'invoice_attach_pdf',label:'Joindre la facture PDF au courriel',type:'checkbox',default:'0'},
 {key:'invoice_pdf_link',label:'Afficher le lien pour télécharger la facture PDF',type:'checkbox',default:'1'},
 {key:'invoice_email_subject',label:'Objet du courriel',type:'text',max:180,required:true,template:true,default:'VendVite — Votre facture {numero_facture}'},
 {key:'invoice_email_title',label:'Titre du courriel',type:'text',max:180,required:true,template:true,default:'Votre facture VendVite'},
 {key:'invoice_email_intro',label:'Message d’introduction',type:'textarea',max:2000,template:true,default:'Voici le détail de votre commande VendVite.'},
 {key:'invoice_email_footer',label:'Message de fin',type:'textarea',max:2000,template:true,default:'Merci de votre confiance.\nL’équipe VendVite'},
 {key:'invoice_button_label',label:'Texte du bouton de téléchargement',type:'text',max:80,required:true,default:'Télécharger ma facture'},
 {key:'invoice_issuer_name',label:'Nom de l’entreprise qui facture',type:'text',max:120,required:true,issuer:'name'},
 {key:'invoice_issuer_address',label:'Adresse de facturation de l’entreprise',type:'text',max:160,issuer:'address'},
 {key:'invoice_issuer_email',label:'Courriel de facturation',type:'email',max:160,required:true,issuer:'email'},
 {key:'invoice_gst_number',label:'Numéro de TPS',type:'text',max:40,issuer:'gst'},
 {key:'invoice_qst_number',label:'Numéro de TVQ',type:'text',max:40,issuer:'qst'}
];
var variables={numero_facture:'Numéro de facture',nom_agent:'Nom de l’agent',numero_campagne:'Numéro de campagne',nombre_lettres:'Nombre de lettres',centre:'Centre du secteur',total:'Total avec taxes',sous_total:'Sous-total',tps:'TPS',tvq:'TVQ'};
function validate(values){
 if(!values||typeof values!=='object'||Array.isArray(values))throw Error('Réglages invalides.');
 var clean={};
 Object.keys(values).forEach(function(key){
  var field=fields.find(function(f){return f.key===key;});if(!field)throw Error('Réglage inconnu : '+key);
  var value=values[key];
  if(field.type==='checkbox'){
   if(![true,false,0,1,'0','1'].includes(value))throw Error('Choix invalide : '+field.label);
   clean[key]=(value===true||value===1||value==='1')?'1':'0';return;
  }
  if(typeof value!=='string')throw Error('Texte requis : '+field.label);
  value=value.trim();if((field.required&&!value)||value.length>field.max)throw Error('Vérifiez le champ « '+field.label+' ».');
  if(field.type!=='textarea'&&/[\r\n]/.test(value))throw Error('Une seule ligne est permise : '+field.label);
  if(field.type==='email'&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))throw Error('Courriel de facturation invalide.');
  if(field.template){
   value.replace(/\{([^{}]+)\}/g,function(_,name){if(!Object.prototype.hasOwnProperty.call(variables,name))throw Error('Variable inconnue : {'+name+'}');return _;});
  }
  clean[key]=value;
 });return clean;
}
function configuration(stored,issuer){
 stored=stored||{};issuer=Object.assign({name:'VendVite',address:'Québec, Canada',email:'notifications@liasse.tech',gst:'',qst:''},issuer||{});
 var settings={};fields.forEach(function(f){settings[f.key]=stored[f.key]!=null?String(stored[f.key]):f.issuer?String(issuer[f.issuer]||''):f.default;});
 return {settings:settings,issuer:{name:settings.invoice_issuer_name,address:settings.invoice_issuer_address,email:settings.invoice_issuer_email,gst:settings.invoice_gst_number,qst:settings.invoice_qst_number}};
}
function expand(template,values){return String(template||'').replace(/\{([^{}]+)\}/g,function(match,name){return Object.prototype.hasOwnProperty.call(values,name)?String(values[name]):match;});}
module.exports={fields:fields,variables:variables,validate:validate,configuration:configuration,expand:expand};
