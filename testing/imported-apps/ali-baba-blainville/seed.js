module.exports = async function(db, services){
var cfg=(services&&services.config)||{};
async function setNew(k,v){await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO NOTHING',[k,v]);}
async function setImg(k,v){await db.run('INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k,v]);}
await setNew('business_name',cfg.businessName||cfg.displayName||'Alibaba Grillade');
await setNew('tagline','Grillé au bois. Rien d’autre.');
await setNew('contact_email',cfg.contactEmail||'alibaba@liasse.tech');
await setNew('contact_phone',cfg.contactPhone||'');
await setNew('business_address',cfg.businessAddress||'Blainville, Québec');
await setNew('order_url','');
await setNew('order_platform_name','Commande en ligne');
await setNew('order_pickup_time','Prêt en 20–30 min');
await setNew('hours','Lun – Jeu : 11 h – 22 h\nVen – Sam : 11 h – 23 h\nDim : 12 h – 22 h');
await setImg('_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017152.png');
await setImg('_p_about_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017454.png');
await setImg('_p_sig_wood_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017425.png');
await setImg('_p_sig_braise_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017555.png');
await setImg('_p_sig_fumee_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017065.png');
var mc=await db.get('SELECT COUNT(*) c FROM menu_items',[]);
if(!mc||Number(mc.c)===0){
var items=[
['Filet Mignon Grillé','Grilled Filet Mignon','Filet mignon mariné, saisi sur la braise vive, servi avec riz, salade et ail toum.','Marinated filet mignon seared over live coals, served with rice, salad and garlic toum.',24.99,'Filet Mignon','https://res.cloudinary.com/duhp69meg/image/upload/v1783479018/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479018246.png',1,1],
['Shish Taouk','Shish Taouk','Cubes de poulet marinés à l’ail et au citron, grillés au feu de bois.','Chicken cubes marinated in garlic and lemon, grilled over wood fire.',18.99,'Shish Taouk','https://res.cloudinary.com/duhp69meg/image/upload/v1783479019/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479019672.png',1,1],
['Assiette Shish Taouk','Shish Taouk Plate','Généreuse portion avec riz, salade, navets marinés et ail toum.','Generous portion with rice, salad, pickled turnips and garlic toum.',21.99,'Shish Taouk','',2,0],
['Demi-Poulet Grillé','Half Grilled Chicken','Demi-poulet mariné, doré lentement sur charbon de bois.','Marinated half chicken, slowly charred over wood charcoal.',16.99,'Poulet','https://res.cloudinary.com/duhp69meg/image/upload/v1783479016/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479016834.png',1,1],
['Ailes de Poulet','Chicken Wings','Ailes marinées et grillées, sauce à l’ail ou piquante.','Marinated grilled wings, garlic or hot sauce.',13.99,'Poulet','',2,0],
['Kafta Grillée','Grilled Kafta','Bœuf haché, persil et épices, façonné à la main et grillé au bois.','Ground beef, parsley and spices, hand-shaped and wood-grilled.',17.99,'Kafta','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017787.png',1,1],
['Assiette Kafta','Kafta Plate','Brochettes de kafta avec riz, salade et pain grillé.','Kafta skewers with rice, salad and grilled bread.',20.99,'Kafta','',2,0],
['Maaneh','Maaneh','Saucisse d’agneau épicée, notre spécialité grillée au feu de bois.','Spiced lamb sausage, our wood-fire grilled specialty.',15.99,'Maaneh','https://res.cloudinary.com/duhp69meg/image/upload/v1783479017/tapavis_tenant_ali-baba-blainville/build_ali-baba-blainville_1783479017399.png',1,1]
];
for(var i=0;i<items.length;i++){var it=items[i];await db.run('INSERT INTO menu_items (name,name_en,description,description_en,price,category,image_url,sort_order,featured,available,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,NOW(),NOW())',[it[0],it[1],it[2],it[3],it[4],it[5],it[6],it[7],it[8]]);}
}
var pc=await db.get('SELECT COUNT(*) c FROM posts',[]);
if(!pc||Number(pc.c)===0){
var posts=[
['Grillé au feu de bois, comme nulle part ailleurs','Chez Alibaba Grillade, tout passe par notre gril au bois franc — le seul dans les Laurentides. La fumée du charbon donne à nos viandes un goût que le gaz ne pourra jamais imiter. On allume le bois à la main, on attend la braise, puis on saisit.','Notre histoire'],
['Commandez en ligne pour emporter','Passez votre commande en quelques clics et venez la chercher bien chaude. Filet mignon, shish taouk, poulet, kafta et maaneh vous attendent, grillés à la commande.','Commande'],
['Nos brochettes, du marinage à la braise','Nos viandes marinent de longues heures avant d’être saisies sur la braise vive. C’est long, c’est manuel, et ça goûte la différence à chaque bouchée.','Cuisine']
];
for(var j=0;j<posts.length;j++){var p=posts[j];await db.run('INSERT INTO posts (title,content,category,published,created_at,updated_at) VALUES ($1,$2,$3,1,NOW(),NOW())',[p[0],p[1],p[2]]);}
}
};
