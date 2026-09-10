'use strict';
const previous=require('./homepage-copy-v6');
function updated(lang,copy){const result=Object.assign({},previous[lang],copy);delete result.hp_ui_filter;delete result.hp_ui_type;return result;}
module.exports={
 fr:updated('fr',{
  hp_builder_lede:'Choisissez un secteur, ajustez le rayon et gardez les adresses à contacter. Vous pouvez exclure celles déjà ciblées, puis vérifier votre lettre et le total avant de commander.',
  hp_ui_history:'Exclure les adresses ciblées',hp_ui_history_period:'Dans les 90 derniers jours',hp_ui_area:'Voir le secteur',
  hp_steps:previous.fr.hp_steps.map((step,index)=>index===0?['Choisissez vos portes','Repérez un quartier, ajustez le rayon puis vérifiez votre sélection adresse par adresse. Excluez au besoin les adresses déjà ciblées.']:step)
 }),
 en:updated('en',{
  hp_builder_lede:'Choose an area, adjust the radius and keep the addresses you want to contact. You can exclude previously targeted addresses, then review your letter and total before ordering.',
  hp_ui_history:'Exclude previously targeted addresses',hp_ui_history_period:'In the last 90 days',hp_ui_area:'View area',
  hp_steps:previous.en.hp_steps.map((step,index)=>index===0?['Choose your doors','Find a neighbourhood, adjust the radius and review your selection address by address. Exclude previously targeted addresses as needed.']:step)
 })
};
