module.exports = async function(db) {
  const settings = [
    ['hero_title_fr','Des histoires qui prennent vie'],
    ['hero_title_en','Stories that come alive'],
    ['hero_subtitle_fr','Chaque récit est dicté à voix haute, transcrit avec soin, puis affiné pour vous offrir une expérience de lecture intime.'],
    ['hero_subtitle_en','Every tale is spoken aloud, carefully transcribed, then polished to give you an intimate reading experience.'],
    ['hero_cta_fr','Découvrir les histoires'],
    ['hero_cta_en','Browse the stories'],
    ['tagline_fr','Histoires originales dictées à la voix'],
    ['tagline_en','Original stories dictated by voice'],
    ['about_title_fr','À propos de l’auteure'],
    ['about_title_en','About the author'],
    ['about_text_fr','J’écris à voix haute. Chaque chapitre commence par un murmure dans un microphone, une émotion dictée à brûle-pourpoint, puis transcrite et ciselée à la main. Mes histoires parlent de mémoire, de tendresse et des petites lumières qu’on garde précieusement. Merci de me lire.'],
    ['about_text_en','I write out loud. Every chapter begins as a whisper into a microphone, an emotion dictated on the fly, then transcribed and shaped by hand. My stories are about memory, tenderness, and the small lights we hold dear. Thank you for reading.'],
    ['featured_label_fr','À la une'],
    ['featured_label_en','Featured'],
    ['payment_instructions_fr','Faites un virement Interac à l’adresse mystorybook@liasse.tech avec la référence de commande comme question (réponse : story). Une fois le paiement reçu, je vous fais parvenir l’accès au livre dans les 24 h.'],
    ['payment_instructions_en','Send an Interac e-Transfer to mystorybook@liasse.tech using your order reference as the security question (answer: story). Once payment is received, I’ll grant you access to the book within 24 hours.'],
    ['contact_text_fr','Une question, une suggestion, ou simplement envie d’échanger ? Écrivez-moi, je réponds personnellement.'],
    ['contact_text_en','A question, a suggestion, or simply want to chat? Write to me — I reply personally.'],
    ['author_name','Dory'],
    ['_p_hero_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1777142115/tapavis_tenant_mystory/build_mystory_1777142115056.png'],
    ['_p_about_image_url','https://res.cloudinary.com/duhp69meg/image/upload/v1777142116/tapavis_tenant_mystory/build_mystory_1777142116563.png']
  ];
  for (const [k,v] of settings) {
    await db.run("INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING", [k, v]);
  }
  const stories = [
    {title:'Le chemin du brouillard',subtitle:'Un récit d’automne',desc:'Une marche solitaire sur une route de campagne se transforme en voyage à travers des souvenirs oubliés. Une histoire courte, contemplative, sur le pouvoir des chemins familiers.',excerpt:'Le matin sentait le bois mouillé. Je marchais sans but, et pourtant chaque pas semblait répondre à une question que je n’avais pas encore posée...',img:'https://res.cloudinary.com/duhp69meg/image/upload/v1777142120/tapavis_tenant_mystory/build_mystory_1777142120741.png',price:499,genre:'Récit',featured:1,wc:8240,status:'published'},
    {title:'La chaise berçante',subtitle:'Souvenirs du lac',desc:'Trois générations d’une famille se retrouvent autour d’une vieille chaise berçante au bord d’un lac. Un roman court sur la transmission, la perte et les soirs d’été qui ne finissent pas.',excerpt:'Grand-maman disait que la chaise avait sa propre mémoire. Quand je m’y suis assise pour la première fois, j’ai compris ce qu’elle voulait dire...',img:'https://res.cloudinary.com/duhp69meg/image/upload/v1777142125/tapavis_tenant_mystory/build_mystory_1777142125083.png',price:899,genre:'Roman court',featured:1,wc:24500,status:'published'},
    {title:'Le bateau de papier',subtitle:'Conte d’hiver',desc:'Un petit garçon dépose un bateau de papier sur un étang gelé et fait un vœu. Une nouvelle douce et lumineuse pour les soirs où l’on a besoin d’espérer.',excerpt:'Léo avait six ans et un grand secret plié dans la poche de son manteau. Le bateau de papier attendait son moment...',img:'https://res.cloudinary.com/duhp69meg/image/upload/v1777142116/tapavis_tenant_mystory/build_mystory_1777142116597.png',price:299,genre:'Nouvelle',featured:0,wc:3120,status:'published'},
    {title:'Lettres à personne',subtitle:'En préparation',desc:'Un recueil de lettres jamais envoyées, écrites au fil des saisons. Sortie prévue prochainement.',excerpt:'',img:'https://res.cloudinary.com/duhp69meg/image/upload/v1777142127/tapavis_tenant_mystory/build_mystory_1777142127687.png',price:599,genre:'Recueil',featured:0,wc:0,status:'draft'}
  ];
  for (const s of stories) {
    const r = await db.run("INSERT INTO stories (title, subtitle, description, excerpt, image_url, price_cents, genre, featured, word_count, status, author_name, language) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id",[s.title,s.subtitle,s.desc,s.excerpt,s.img,s.price,s.genre,s.featured,s.wc,s.status,'Dory','fr']);
    if (s.status === 'published' && s.wc > 0) {
      const chapters = [
        {pos:1,title:'Chapitre 1',content:s.excerpt + '\n\nLes feuilles tombaient comme des lettres jamais lues. Chacune racontait une saison qui s’était glissée entre nos doigts sans qu’on s’en aperçoive. Je m’arrêtai un instant, fermai les yeux, et écoutai le silence se remplir de voix anciennes.\n\nIl y avait là, suspendu dans l’air frais du matin, le rire d’une grand-mère, un éclat de vaisselle, un chant à mi-voix dans une cuisine d’autrefois. Ces choses-là ne meurent pas, elles attendent qu’on les écoute.'},
        {pos:2,title:'Chapitre 2',content:'Le sentier tournait à droite, près du vieux pommier. C’est là que tout avait commencé, des années auparavant. Je ne savais pas alors que les départs ressemblaient parfois à des retours déguisés.\n\nJe ramassai une pomme tombée. Elle avait la couleur du miel d’octobre. Je la gardai dans ma poche comme un talisman, comme une promesse muette de revenir, encore.'},
        {pos:3,title:'Chapitre 3',content:'Quand le soleil traversa enfin le brouillard, j’eus l’impression d’avoir traversé toute une vie. Pourtant la maison était à peine à un kilomètre. Le temps, parfois, s’étire pour mieux nous apprendre quelque chose.\n\nJe poussai la porte. Le café m’attendait. Le silence aussi. Et quelque part, au fond de moi, une page nouvelle commençait à s’écrire.'}
      ];
      for (const c of chapters) {
        await db.run("INSERT INTO chapters (story_id, position, title, content) VALUES ($1,$2,$3,$4)",[r.lastInsertRowid,c.pos,c.title,c.content]);
      }
      const fullText = chapters.map(c=>'## '+c.title+'\n\n'+c.content).join('\n\n');
      await db.run("UPDATE stories SET full_text=$1 WHERE id=$2",[fullText,r.lastInsertRowid]);
    }
  }
  await db.run("INSERT INTO posts (title, content, category, image_url) VALUES ($1,$2,$3,$4)",['Bienvenue sur My Story','Voici un petit espace personnel où je partagerai les coulisses de mes récits, mes inspirations et les nouvelles parutions. Restez curieux !','Annonce','https://res.cloudinary.com/duhp69meg/image/upload/v1777142120/tapavis_tenant_mystory/build_mystory_1777142120801.png']);
};