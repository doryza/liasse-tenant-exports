module.exports = async function(db){
  async function set(k, v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING',[k, v]); }
  async function setImg(k, v){ await db.run('INSERT INTO admin_settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()',[k, v]); }

  await set('tagline', 'Évaluation gratuite de votre propriété');
  await set('stat_homes_sold', '512');
  await set('stat_avg_days', '19');
  await set('stat_list_to_sale', '99');
  await set('stat_career_volume', '285');
  await set('social_facebook', 'https://facebook.com');
  await set('social_instagram', 'https://instagram.com');
  await set('social_linkedin', 'https://linkedin.com');
  await set('social_youtube', 'https://youtube.com');
  await set('social_tiktok', 'https://tiktok.com');
  await setImg('_p_agent_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_vendvite/build_vendvite_1783139713969.png');

  var tc = await db.get('SELECT COUNT(*)::int c FROM testimonials');
  if(!tc || tc.c===0){
    var tst = [
      ['Julie & Marc D.', 'Rosemont, Montréal', "Notre maison s'est vendue en six jours, bien au-delà de ce que nous espérions. Le dossier préparé avant la mise en marché a tout changé.", '+14 % du prix demandé', 1],
      ['Sophie L.', 'Laval-des-Rapides', "Une approche calme et chiffrée, sans pression. J'ai su exactement ce que valait ma propriété avant de décider.", 'Vendu en 9 jours', 2],
      ['Ahmed & Nadia', 'Griffintown, Montréal', "On avait reçu trois évaluations très différentes. Celle-ci était la seule appuyée par des ventes réelles du secteur.", '+8 % du prix demandé', 3],
      ['Robert P.', 'Brossard', "Professionnel du début à la fin. La fiche visuelle de ma maison m'a mis en confiance dès le premier contact.", 'Offres multiples', 4]
    ];
    for(var i=0;i<tst.length;i++){ var r=tst[i]; await db.run('INSERT INTO testimonials (author,neighborhood,quote,sale_result,sort_order,published) VALUES ($1,$2,$3,$4,$5,1)',[r[0],r[1],r[2],r[3],r[4]]); }
  }

  var pc = await db.get('SELECT COUNT(*)::int c FROM posts');
  if(!pc || pc.c===0){
    var posts = [
      ['Ce que vaut vraiment votre maison en 2024', "L'écart entre le prix affiché et le prix vendu s'est resserré. Voici comment lire le marché de votre quartier.", "Le prix demandé n'est qu'un point de départ. Ce qui compte, c'est le prix vendu — celui que le marché confirme.\n\nDans la plupart des quartiers, le ratio prix vendu sur prix demandé s'établit aujourd'hui autour de 99 %. Une propriété correctement évaluée se vend près de sa valeur affichée, et souvent plus vite.\n\nUne évaluation sérieuse s'appuie sur les ventes comparables des douze derniers mois, ajustées pour les particularités de votre propriété : superficie, état, exposition, rénovations récentes.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783139713/tapavis_tenant_vendvite/build_vendvite_1783139713856.png', 'Marché'],
      ['Cinq gestes qui augmentent la valeur perçue', "Avant la première visite, la perception de valeur se joue en quelques détails. Voici les cinq plus rentables.", "La valeur perçue précède la valeur négociée. Voici cinq interventions à faible coût et fort rendement.\n\n1. La lumière : remplacez les ampoules froides par une lumière chaude et uniforme.\n2. La première impression : entrée dégagée, poignées propres, porte fraîchement peinte.\n3. Le désencombrement : chaque pièce doit respirer.\n4. Les petites réparations visibles : robinet qui goutte, joint de silicone jauni.\n5. La mise en valeur de la vue : c'est ce que la fiche révèle en premier.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_vendvite/build_vendvite_1783139714196.png', 'Conseils'],
      ['Vendre au bon moment : lire les saisons du marché', "Le meilleur moment pour vendre dépend de votre quartier et de votre type de propriété.", "Le printemps attire le plus d'acheteurs, mais aussi le plus de vendeurs. À l'automne, un inventaire réduit peut jouer en votre faveur.\n\nCe qui compte davantage que la saison : le niveau d'inventaire dans votre secteur précis. Un déséquilibre entre l'offre et la demande locale a plus d'effet sur votre prix que le calendrier.\n\nUne évaluation à jour vous indique si le moment est favorable pour votre adresse en particulier.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783139715/tapavis_tenant_vendvite/build_vendvite_1783139715010.png', 'Marché'],
      ['Pourquoi une fiche visuelle avant la mise en marché', "Présenter votre propriété comme un actif, dès le premier échange, change la conversation avec les acheteurs.", "Un dossier soigné n'est pas un luxe : c'est un signal. Il indique que la propriété est prise au sérieux, ce qui attire des acheteurs sérieux.\n\nLa fiche visuelle — vue de rue, coordonnées, données clés — pose les bases d'une négociation appuyée par des faits plutôt que par des impressions.\n\nC'est l'approche que nous appliquons dès la première adresse saisie.", 'https://res.cloudinary.com/duhp69meg/image/upload/v1783139714/tapavis_tenant_vendvite/build_vendvite_1783139714414.png', 'Approche']
    ];
    for(var j=0;j<posts.length;j++){ var p=posts[j]; await db.run('INSERT INTO posts (title,excerpt,content,image_url,category,published) VALUES ($1,$2,$3,$4,$5,1)',[p[0],p[1],p[2],p[3],p[4]]); }
  }

  var lc = await db.get('SELECT COUNT(*)::int c FROM leads');
  if(!lc || lc.c===0){
    var leads = [
      ['Caroline Bélanger', 'caroline.b@exemple.com', '(514) 555-0142', '450 av. du Parc, Montréal, QC', "D'ici 3 mois", 'nouveau'],
      ['Martin Gagnon', 'mgagnon@exemple.com', '(450) 555-0187', '12 rue des Érables, Laval, QC', 'Dès que possible', 'contacté'],
      ['Isabelle Roy', 'iroy@exemple.com', '(438) 555-0110', '88 boul. Taschereau, Brossard, QC', "J'explore simplement", 'nouveau']
    ];
    for(var k=0;k<leads.length;k++){ var l=leads[k]; await db.run('INSERT INTO leads (name,email,phone,address,timeframe,status) VALUES ($1,$2,$3,$4,$5,$6)',[l[0],l[1],l[2],l[3],l[4],l[5]]); }
  }
};
