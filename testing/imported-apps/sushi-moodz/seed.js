module.exports = async function(db, services){
  services = services || {};
  var cfg = (services && services.config) || {};
  async function setP(key,val){ try{ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",[key,val]); }catch(e){} }
  async function setImg(key,val){ try{ await db.run("INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",[key,val]); }catch(e){} }
  await setP('business_name', cfg.businessName || cfg.displayName || 'Sushi Moodz');
  await setP('tagline_fr','Sushi · Nigiri · Maki — table japonaise');
  await setP('tagline_en','Sushi · Nigiri · Maki — a Japanese table');
  await setP('hero_title_fr','Sushi Moodz');
  await setP('hero_title_en','Sushi Moodz');
  await setP('hero_thesis_fr','Le riz est tiède, le poisson est froid. Le sushi comme une calligraphie : précis, épuré, inoubliable.');
  await setP('hero_thesis_en','Warm rice, cold fish. Sushi treated like calligraphy — precise, spare, unforgettable.');
  await setP('philosophy_fr','Chaque pièce est façonnée à la main, à l’instant. Rien de superflu, rien qui manque.');
  await setP('philosophy_en','Every piece is shaped by hand, to order. Nothing extra, nothing missing.');
  await setP('order_band_fr','L’envie ne se discute pas.');
  await setP('order_band_en','Craving? Don’t argue with it.');
  await setP('order_url','');
  await setP('hours_fr','Mar – Jeu : 17 h – 22 h\nVen – Sam : 17 h – 23 h\nDim : 16 h – 21 h\nLundi : fermé');
  await setP('hours_en','Tue – Thu: 5 – 10 pm\nFri – Sat: 5 – 11 pm\nSun: 4 – 9 pm\nMon: closed');
  await setP('map_lat','45.5019'); await setP('map_lng','-73.5674'); await setP('map_zoom','15');
  if(cfg.contactEmail) await setP('contact_email', cfg.contactEmail);
  if(cfg.contactPhone) await setP('contact_phone', cfg.contactPhone);
  if(cfg.businessAddress) await setP('business_address', cfg.businessAddress);
  await setImg('_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218908.png');

  var mc=await db.get("SELECT COUNT(*) c FROM menu_items");
  if(!mc || parseInt(mc.c)==0){
    var items=[
      ['Nigiri saumon','Salmon nigiri','Saumon frais, riz vinaigré tiède.','Fresh salmon over warm seasoned rice.',4.25,'nigiri','https://res.cloudinary.com/duhp69meg/image/upload/v1783657217/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657217689.png','',1,1,10],
      ['Nigiri thon','Tuna nigiri','Thon rouge, une pointe de wasabi frais.','Bluefin tuna, a touch of fresh wasabi.',4.75,'nigiri','','',0,1,20],
      ['Nigiri crevette','Shrimp nigiri','Crevette pochée, riz tiède.','Poached shrimp, warm rice.',3.95,'nigiri','','',0,1,30],
      ['Nigiri anguille','Eel nigiri','Anguille grillée, sauce unagi.','Grilled eel, unagi glaze.',5.25,'nigiri','','grillé',0,1,40],
      ['Rouleau California','California roll','Crabe, avocat, concombre, sésame.','Crab, avocado, cucumber, sesame.',6.50,'maki','','',0,1,50],
      ['Maki épicé au thon','Spicy tuna roll','Thon, mayo épicée, ciboule.','Tuna, spicy mayo, scallion.',7.25,'maki','','épicé',0,1,60],
      ['Maki concombre-avocat','Cucumber-avocado roll','Concombre croquant, avocat.','Crisp cucumber, avocado.',5.50,'maki','','végé',0,1,70],
      ['Dragon roll','Dragon roll','Crevette tempura, anguille, avocat.','Tempura shrimp, eel, avocado.',12.95,'maki','https://res.cloudinary.com/duhp69meg/image/upload/v1783657219/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657219415.png','',1,1,80],
      ['Sashimi de saumon (5 mcx)','Salmon sashimi (5 pc)','Cinq tranches épaisses de saumon.','Five thick slices of salmon.',11.50,'sashimi','','',0,1,90],
      ['Sashimi assorti (9 mcx)','Assorted sashimi (9 pc)','Saumon, thon, poisson blanc du jour.','Salmon, tuna, white fish of the day.',18.95,'sashimi','','',0,1,100],
      ['Plateau découverte (24 mcx)','Discovery platter (24 pc)','Assortiment nigiri et maki pour deux.','Nigiri and maki selection for two.',32.00,'plateaux','','',0,1,110],
      ['Plateau Moodz (38 mcx)','Moodz platter (38 pc)','Le grand partage : sashimi, nigiri, makis signature.','The big share: sashimi, nigiri, signature rolls.',49.00,'plateaux','https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218175.png','',1,1,120],
      ['Mochi glacé (3 mcx)','Ice cream mochi (3 pc)','Matcha, mangue, sésame noir.','Matcha, mango, black sesame.',6.00,'desserts','','végé',0,1,130],
      ['Tempura de banane','Banana tempura','Banane croustillante, miel, glace.','Crispy banana, honey, ice cream.',6.50,'desserts','','',0,1,140],
      ['Thé vert','Green tea','Sencha infusé à la commande.','Sencha brewed to order.',3.00,'boissons','','végé',0,1,150],
      ['Saké tiède','Warm sake','Servi dans un tokkuri traditionnel.','Served in a traditional tokkuri.',8.50,'boissons','','',0,1,160],
      ['Ramune','Ramune soda','Soda japonais à la bille, édition originale.','Japanese marble soda, original flavour.',4.00,'boissons','','',0,1,170]
    ];
    for(var i=0;i<items.length;i++){ await db.run("INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,dietary,featured,available,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", items[i]); }
  }

  var gc=await db.get("SELECT COUNT(*) c FROM gallery");
  if(!gc || parseInt(gc.c)==0){
    var gal=[
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218110.png','Comptoir','Le comptoir','The counter',10],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218072.png','Mains','Les mains','The hands',20],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657217/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657217111.png','Sashimi','Sashimi','Sashimi',30],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218152.png','Découpe','La découpe','The cut',40],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657217/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657217523.png','Saké','Le saké','The sake',50],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657217/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657217331.png','Mochi','Le mochi','The mochi',60],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657218/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657218791.png','Salle','La salle','The room',70],
      ['https://res.cloudinary.com/duhp69meg/image/upload/v1783657217/tapavis_tenant_sushi-moodz/build_sushi-moodz_1783657217689.png','Nigiri','Nigiri','Nigiri',80]
    ];
    for(var j=0;j<gal.length;j++){ await db.run("INSERT INTO gallery (image_url,title,caption_fr,caption_en,sort_order) VALUES ($1,$2,$3,$4,$5)", gal[j]); }
  }

  var pc=await db.get("SELECT COUNT(*) c FROM posts");
  if(!pc || parseInt(pc.c)==0){
    var posts=[
      ['Un nouveau menu de saison','Le chef renouvelle la carte au rythme de la pêche. Ce mois-ci : sériole, saint-jacques et oursin quand la mer le permet.','','Nouvelles',1],
      ['Nos poissons, notre exigence','Livraison quotidienne, découpe le matin, service le soir. Nous ne travaillons que le poisson que nous servirions à notre propre table.','','Coulisses',1],
      ['Réservez pour les fêtes','Les plateaux de partage se réservent 48 h à l’avance pour les grandes tablées. Écrivez-nous ou utilisez le formulaire de réservation.','','Annonces',1],
      ['Atelier makis — bientôt','Une soirée pour apprendre à rouler ses propres makis avec le chef. Places limitées, détails à venir.','','Événements',1]
    ];
    for(var k=0;k<posts.length;k++){ await db.run("INSERT INTO posts (title,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5)", posts[k]); }
  }

  var rc=await db.get("SELECT COUNT(*) c FROM reservations");
  if(!rc || parseInt(rc.c)==0){
    await db.run("INSERT INTO reservations (name,phone,email,res_date,res_time,guests,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",['Marie Tremblay','514 555 0110','','2024-12-31','19:30',4,'Table près de la fenêtre si possible','nouvelle']);
    await db.run("INSERT INTO reservations (name,phone,email,res_date,res_time,guests,notes,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",['Alex Nguyen','514 555 0198','','2025-01-04','18:00',2,'Allergie aux arachides','confirmée']);
  }

  var fc=await db.get("SELECT COUNT(*) c FROM form_submissions");
  if(!fc || parseInt(fc.c)==0){
    await db.run("INSERT INTO form_submissions (name,email,phone,message) VALUES ($1,$2,$3,$4)",['Julien Roy','julien@exemple.com','','Faites-vous des plateaux végétariens pour un groupe de six ?']);
  }
};
