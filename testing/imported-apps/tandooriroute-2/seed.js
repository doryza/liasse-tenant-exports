module.exports = async function(db){
  async function setImg(key,val){ await db.run("INSERT INTO admin_settings (key,value,updated_at) VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[key,val]); }
  await setImg("_p_hero_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716025781.png");
  await setImg("_p_about_image_url","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026602.png");
  var kv = { order_online_url:"", google_reviews_url:"", facebook_url:"", instagram_url:"", tiktok_url:"", contact_phone:"438-435-6829", contact_email:"dory@liasse.tech", business_address:"Blainville, Québec", map_query:"Tandoori Route Blainville QC", business_name:"Tandoori Route" };
  for(var k in kv){ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",[k,kv[k]]); }

  var dc = await db.get("SELECT COUNT(*)::int c FROM dishes");
  if(dc.c===0){
    var dishes = [
      ["Poulet au beurre","Morceaux de poulet tendres dans une sauce crémeuse à la tomate, parfumée d'épices douces.","Plats principaux","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026730.png",1,1],
      ["Biryani d'agneau","Riz basmati parfumé mêlé d'agneau et d'un mélange d'épices aromatiques.","Plats principaux","https://res.cloudinary.com/duhp69meg/image/upload/v1780716028/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716028698.png",1,2],
      ["Poulet tandoori","Poulet mariné aux épices et aux herbes, servi bien doré.","Tandoor","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026372.png",1,3],
      ["Samosas aux légumes","Chaussons croustillants garnis de pommes de terre et de petits pois épicés.","Entrées","https://res.cloudinary.com/duhp69meg/image/upload/v1780716025/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716025701.png",0,4],
      ["Paneer tikka","Cubes de fromage paneer marinés et grillés avec poivrons et oignons.","Végétarien","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026779.png",1,5],
      ["Pain naan à l'ail","Pain moelleux à l'ail et au beurre, parfait pour accompagner vos plats.","Pains","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026500.png",0,6]
    ];
    for(var i=0;i<dishes.length;i++){ var d=dishes[i]; await db.run("INSERT INTO dishes (name,description,category,image_url,featured,sort_order,published) VALUES ($1,$2,$3,$4,$5,$6,1)",[d[0],d[1],d[2],d[3],d[4],d[5]]); }
  }

  var rc = await db.get("SELECT COUNT(*)::int c FROM reviews");
  if(rc.c===0){
    var reviews = [
      ["Marie-Claude Lavoie",5,"Le meilleur restaurant indien de la région! Les saveurs sont au rendez-vous et le service est impeccable.","Il y a 2 semaines"],
      ["Raj Patel",5,"Une cuisine généreuse et authentique. Le poulet au beurre est un vrai délice, on se croirait en Inde.","Il y a 1 mois"],
      ["Sophie Tremblay",4,"Très belle découverte à Blainville. Portions copieuses et personnel accueillant. Je recommande!","Il y a 1 mois"],
      ["David Bergeron",5,"Commandé pour emporter, tout était encore chaud et savoureux. Le biryani est exceptionnel.","Il y a 2 mois"],
      ["Amélie Gagnon",5,"Ambiance moderne et chaleureuse, plats végétariens excellents. On y retourne sans hésiter.","Il y a 3 mois"]
    ];
    for(var j=0;j<reviews.length;j++){ var r=reviews[j]; await db.run("INSERT INTO reviews (author,rating,content,review_date,published) VALUES ($1,$2,$3,$4,1)",[r[0],r[1],r[2],r[3]]); }
  }

  var pc = await db.get("SELECT COUNT(*)::int c FROM posts");
  if(pc.c===0){
    var posts = [
      ["La commande en ligne est arrivée!","Bonne nouvelle : vous pouvez désormais commander vos plats préférés de Tandoori Route directement en ligne, pour emporter ou sur place.\n\nParcourez le menu complet, ajoutez vos favoris au panier et passez prendre votre commande en quelques minutes. Pratique, rapide et toujours aussi savoureux.","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026730.png","Annonce"],
      ["À la découverte de nos plats végétariens","Chez Tandoori Route, les amateurs de cuisine végétarienne sont gâtés. Du paneer tikka aux currys de légumes en passant par les lentilles, nos assiettes regorgent de saveurs.\n\nVenez explorer une sélection pensée pour tous les goûts, accompagnée de nos pains moelleux fraîchement préparés.","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026779.png","Menu"],
      ["Tandoori Route, votre table indienne à Blainville","Installé au cœur de Blainville, Tandoori Route vous accueille dans une ambiance moderne et chaleureuse pour partager les saveurs authentiques de l'Inde.\n\nQue ce soit en famille, entre amis ou pour un repas à emporter, nous avons hâte de vous faire voyager le temps d'un repas.","https://res.cloudinary.com/duhp69meg/image/upload/v1780716026/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716026602.png","Restaurant"],
      ["Nos suggestions pour un repas à partager","Vous hésitez sur quoi commander? Misez sur le partage : quelques entrées, un grand plat principal, un assortiment de pains et un dessert pour terminer en douceur.\n\nUne formule conviviale qui permet de goûter à un maximum de saveurs en bonne compagnie.","https://res.cloudinary.com/duhp69meg/image/upload/v1780716028/tapavis_tenant_tandooriroute-2/build_tandooriroute-2_1780716028698.png","Conseils"]
    ];
    for(var p=0;p<posts.length;p++){ var po=posts[p]; await db.run("INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,1)",[po[0],po[1],po[2],po[3]]); }
  }

  var hc = await db.get("SELECT COUNT(*)::int c FROM hours");
  if(hc.c===0){
    var hours = [
      ["Lundi","Monday","",1,1],
      ["Mardi","Tuesday","11h00 – 22h00",0,2],
      ["Mercredi","Wednesday","11h00 – 22h00",0,3],
      ["Jeudi","Thursday","11h00 – 22h00",0,4],
      ["Vendredi","Friday","11h00 – 23h00",0,5],
      ["Samedi","Saturday","12h00 – 23h00",0,6],
      ["Dimanche","Sunday","12h00 – 21h00",0,7]
    ];
    for(var h=0;h<hours.length;h++){ var hr=hours[h]; await db.run("INSERT INTO hours (day_fr,day_en,hours_text,closed,sort_order) VALUES ($1,$2,$3,$4,$5)",[hr[0],hr[1],hr[2],hr[3],hr[4]]); }
  }
};
