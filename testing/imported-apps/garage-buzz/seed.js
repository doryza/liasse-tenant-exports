module.exports = async function(db){
async function setImg(k,v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]); }
async function set(k,v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k,v]); }
await setImg('_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1788579329/tapavis_tenant_garage-buzz/build_garage-buzz_1788579329342.png');
await setImg('_p_trans_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1788579329/tapavis_tenant_garage-buzz/build_garage-buzz_1788579329286.png');
await setImg('_p_garage_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1788579328/tapavis_tenant_garage-buzz/build_garage-buzz_1788579328799.png');
await set('hours_mon','08:00 – 17:00');
await set('hours_tue','08:00 – 17:00');
await set('hours_wed','08:00 – 17:00');
await set('hours_thu','08:00 – 17:00');
await set('hours_fri','08:00 – 17:00');
await set('hours_sat','09:00 – 13:00');
await set('hours_sun','');

var sc=await db.get('SELECT COUNT(*)::int AS c FROM services');
if(sc.c===0){
var svc=[
['Vidange d\'huile','Oil change','Huile et filtre, vérification des niveaux.','Oil and filter, fluid check.',30,60,1,1],
['Freins','Brake service','Plaquettes et disques, inspection complète.','Pads and rotors, full inspection.',90,180,2,1],
['Pneus — pose et équilibrage','Tire mount & balance','Montage saisonnier et équilibrage.','Seasonal swap and balancing.',45,80,3,0],
['Inspection','Inspection','Contrôle mécanique complet du véhicule.','Full mechanical vehicle check.',60,90,4,0],
['Batterie','Battery test & replace','Test de charge et remplacement au besoin.','Load test and replacement if needed.',30,40,5,0],
['Climatisation','A/C service','Recharge et vérification du système.','Recharge and system check.',60,120,6,0]
];
for(var i=0;i<svc.length;i++){ var s=svc[i]; await db.run('INSERT INTO services (name,name_en,description,description_en,duration_min,price,sort_order,featured,published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)',[s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7]]); }
}

var syc=await db.get('SELECT COUNT(*)::int AS c FROM symptoms');
if(syc.c===0){
var sy=[
['Grincement au freinage','Squealing when braking','freins',1],
['Pédale de frein molle','Soft brake pedal','freins',2],
['Témoin moteur allumé','Check-engine light on','moteur',1],
['Perte de puissance','Loss of power','moteur',2],
['Surchauffe','Overheating','moteur',3],
['Batterie à plat','Dead battery','electrique',1],
['Phares faibles','Dim headlights','electrique',2],
['Usure inégale des pneus','Uneven tire wear','pneus',1],
['Vibration à haute vitesse','Vibration at speed','pneus',2],
['Cognement en roulant','Knocking while driving','bruits',1],
['Sifflement','Whistling noise','bruits',2]
];
for(var j=0;j<sy.length;j++){ var y=sy[j]; await db.run('INSERT INTO symptoms (name,name_en,category,sort_order) VALUES ($1,$2,$3,$4)',[y[0],y[1],y[2],y[3]]); }
}

var fc=await db.get('SELECT COUNT(*)::int AS c FROM faqs');
if(fc.c===0){
var fa=[
['Puis-je laisser ma voiture toute la journée ?','Can I leave my car for the day?','Oui. Choisissez « Je laisse la voiture » à l\'étape du dépôt et récupérez-la quand elle est prête.','Yes. Pick "I leave the car" at the drop-off step and collect it once ready.',1],
['Comment fonctionne la boîte à clés ?','How does the key box work?','Déposez vos clés la veille dans la boîte sécurisée à l\'entrée. Notez la réservation sur l\'enveloppe fournie.','Drop your keys the night before in the secure box at the entrance. Note the booking on the provided envelope.',2],
['Puis-je annuler un rendez-vous ?','Can I cancel an appointment?','Oui, depuis « Mon compte », section À venir. Vous pouvez annuler à tout moment avant l\'heure prévue.','Yes, from "My account", Upcoming section. You can cancel any time before the slot.',3],
['Combien de temps dure un rendez-vous ?','How long does an appointment take?','Le temps estimé s\'affiche sur votre fiche à mesure que vous choisissez les travaux.','The estimated time appears on your work order as you choose the work.',4],
['Comment changer la langue du site ?','How do I change the language?','Utilisez le sélecteur FR | EN en haut de chaque page. Votre choix est retenu.','Use the FR | EN switch at the top of every page. Your choice is remembered.',5]
];
for(var k=0;k<fa.length;k++){ var f=fa[k]; await db.run('INSERT INTO faqs (question,question_en,answer,answer_en,sort_order) VALUES ($1,$2,$3,$4,$5)',[f[0],f[1],f[2],f[3],f[4]]); }
}

var pc=await db.get('SELECT COUNT(*)::int AS c FROM posts');
if(pc.c===0){
var po=[
['Préparez votre véhicule pour l\'hiver','Pneus, batterie, liquide lave-glace : la liste courte avant le premier gel.','Conseils'],
['Pourquoi la vidange régulière compte','Un moteur bien huilé dure plus longtemps. Voici l\'intervalle recommandé.','Conseils'],
['Freins : les signes à ne pas ignorer','Grincement, pédale molle, vibrations — ce qu\'ils veulent dire.','Sécurité'],
['Nouveau : réservez en ligne en deux minutes','Votre fiche de travail se remplit à mesure. Essayez-la.','Nouvelles']
];
for(var p=0;p<po.length;p++){ var pp=po[p]; await db.run('INSERT INTO posts (title,content,category,published,sort_order) VALUES ($1,$2,$3,1,$4)',[pp[0],pp[1],pp[2],p]); }
}
};
