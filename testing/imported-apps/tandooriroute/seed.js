module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};

  const settingsDefault = [
    ['tagline', 'Votre route vers la saveur — la cuisine indienne authentique à Blainville.'],
    ['business_name', cfg.businessName || cfg.displayName || 'Tandoori Route'],
    ['contact_email', cfg.contactEmail || 'tandooriroute@gmail.com'],
    ['contact_phone', cfg.contactPhone || ''],
    ['business_address', cfg.businessAddress || '1185 Bd Curé-Labelle, Blainville, QC, J7C 4K6'],
    ['hours', 'Mar-Jeu : 11h30 - 21h\nVen-Sam : 11h30 - 22h\nDim : 12h - 21h\nLun : Fermé'],
    ['about_text_fr', "Tandoori Route, c'est l'aventure d'une famille passionnée qui a choisi Blainville pour faire découvrir aux Basses-Laurentides les saveurs authentiques de la cuisine indienne. Nos plats sortent tout droit du tandoor — ce four d'argile traditionnel qui cuit à 480°C et donne à nos viandes leur croûte fumée et leur tendreté incomparable. Du Biryani au poulet mariné 24 heures aux currys mijotés avec nos mélanges d'épices maison, chaque plat est une étape sur votre route vers la saveur. Premier restaurant indien de la région — venez découvrir."],
    ['about_text_en', "Tandoori Route is the story of a passionate family who chose Blainville to bring authentic Indian flavors to the Basses-Laurentides. Our dishes come straight out of the tandoor — the traditional clay oven that roars at 480°C and gives our meats their smoky crust and unmatched tenderness. From 24-hour marinated Chicken Biryani to curries simmered with our house spice blends, every plate is a stop on your route to flavor. The first Indian restaurant in the area — come and discover."],
    ['footer_intro_fr', "Cuisine indienne et pakistanaise authentique à Blainville. Recettes traditionnelles, ingrédients de qualité et plats préparés à la commande."],
    ['footer_intro_en', "Authentic Indian and Pakistani cuisine in Blainville. Traditional recipes, quality ingredients and made-to-order dishes."]
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    const items = [
      ["Poulet au beurre", "Butter Chicken", "Poulet désossé dans une sauce crémeuse et onctueuse à la tomate, préparée avec beurre et épices traditionnelles", "Boneless chicken in a smooth, creamy tomato sauce made with butter and traditional spices.", 15.99, "poulet", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780759944/tapavis_menu/639/cqpmxhvxkyfas1oue0qw.jpg", 1, 0, 1],
      ["Poulet Korma", "Chicken Korma", "Poulet braisé dans une sauce curry et crémeuse au yogourt, aux épices, riche et savoureuse", "Chicken braised in a creamy yogurt curry sauce with spices — rich and flavourful.", 15.99, "poulet", null, 2, 0, 1],
      ["Poulet Cari", "Chicken Curry", "Poulet mijoté dans une sauce curry savoureuse aux épices, riche et bien relevée", "Chicken simmered in a savoury, well-spiced curry sauce — rich and bold.", 15.99, "poulet", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780844492/tapavis_menu/639/svxljnat31y2bwt4nrvi.jpg", 3, 0, 1],
      ["Poulet Palak", "Chicken Palak", "Épinards et Poulet mijotés ensemble dans un curry savoureux", "Spinach and chicken simmered together in a savoury curry.", 15.99, "poulet", null, 4, 0, 1],
      ["Poulet Tikka Masala", "Chicken Tikka Masala", "Morceaux de poulet marinés et grillés, servis dans une sauce tomate crémeuse et épicée.", "Marinated, grilled chicken pieces served in a creamy, spiced tomato sauce.", 16.99, "poulet", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799740/tapavis_menu/639/jzeedqahj2k21d6oq50u.jpg", 5, 0, 1],
      ["Karahi Poulet", "Karahi Chicken", null, null, 17.99, "poulet", null, 6, 0, 1],
      ["Tandoori Poulet", "Tandoori Chicken", "Cuisse de poulet marinée dans du yogourt, de l'ail, du gingembre et un mélange traditionnel d'épices indiennes.", "Chicken thigh marinated in yogurt, garlic, ginger and a traditional blend of Indian spices.", 7.99, "poulet", null, 7, 0, 1],
      ["Agneau Korma", "Lamb Korma", "Agneau braisé dans une sauce curry et crémeuse au yogourt, aux épices, riche et savoureuse.", "Lamb braised in a creamy yogurt curry sauce with spices — rich and flavourful.", 17.99, "agneau", null, 1, 0, 1],
      ["Agneau Cari", "Lamb Curry", "Agneau mijoté dans une sauce curry savoureuse aux épices, riche et bien relevée.", "Lamb simmered in a savoury, well-spiced curry sauce — rich and bold.", 17.99, "agneau", null, 2, 0, 1],
      ["Agneau Palak", "Lamb Palak", "Épinards et Agneau mijotés ensemble dans un curry savoureux.", "Spinach and lamb simmered together in a savoury curry.", 17.99, "agneau", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760423/tapavis_menu/639/tzi2onyi8uep4bxcgyui.jpg", 3, 0, 1],
      ["Karahi Agneau", "Karahi Lamb", null, null, 21.99, "agneau", null, 4, 0, 1],
      ["Dal Makhni", "Dal Makhani", "Lentilles noires crémeuses mijotées lentement avec beurre et épices.", "Creamy black lentils slow-simmered with butter and spices.", 12.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760237/tapavis_menu/639/khcsg7tx884iph5b6amd.jpg", 1, 0, 1],
      ["Kadhi Pakora", "Kadhi Pakora", "Sauce au yogourt légèrement acidulée et épicée, garnie de beignets de légumes frits.", "Lightly tangy, spiced yogurt sauce topped with fried vegetable fritters.", 14.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799589/tapavis_menu/639/uy1gvywxcmo0hkduba7a.jpg", 2, 0, 1],
      ["Shahi Paneer", "Shahi Paneer", "Paneer cuit dans une sauce crémeuse et onctueuse à la tomate, préparée avec beurre et épices traditionnelles.", "Paneer cooked in a smooth, creamy tomato sauce made with butter and traditional spices.", 15.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760951/tapavis_menu/639/z7pqhgfn4mpxjd1rvq0r.jpg", 3, 0, 1],
      ["Paneer Tikka Masala", "Paneer Tikka Masala", "Morceaux de Paneer marinés et grillés, servis dans une sauce tomate crémeuse et épicée.", "Marinated, grilled paneer pieces served in a creamy, spiced tomato sauce.", 16.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780844190/tapavis_menu/639/ucyfsongb9gmdessy241.jpg", 4, 0, 1],
      ["Palak Paneer", "Palak Paneer", "Épinards et paneer mijotés ensemble dans un curry savoureux.", "Spinach and paneer simmered together in a savoury curry.", 15.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780844300/tapavis_menu/639/uajvxmkccnzzssdfbw7p.jpg", 5, 0, 1],
      ["Chana Masala", "Chana Masala", "Curry savoureux de pois chiches épicé avec des assaisonnements traditionnels.", "Savoury chickpea curry spiced with traditional seasonings.", 11.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780800108/tapavis_menu/639/d23drzv8c4fzsgp57mcp.jpg", 6, 0, 1],
      ["Chana Bhatura", "Chana Bhatura", "Pois Chiches épicés avec 2 bhaturas frits.", "Spiced chickpeas served with 2 fried bhaturas.", 13.99, "vegetarien", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760059/tapavis_menu/639/ase8aaw1x2qtvhl0loeo.jpg", 7, 0, 1],
      ["Samosa (2 mcx)", "Samosa (2 pcs)", null, null, 3.99, "alacarte", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799156/tapavis_menu/639/fb9soufexvhdas2nlra4.jpg", 1, 0, 1],
      ["Onion Bhaji", "Onion Bhaji", null, null, 6.99, "alacarte", null, 2, 0, 1],
      ["Rouleaux de printemps (5 mcx)", "Spring Rolls (5 pcs)", null, null, 4.99, "alacarte", null, 3, 0, 1],
      ["Frites", "Fries", null, null, 4.99, "alacarte", null, 4, 0, 1],
      ["Frites Masala", "Masala Fries", null, null, 6.99, "alacarte", null, 5, 0, 1],
      ["Samosa Chaat", "Samosa Chaat", null, null, 8.99, "alacarte", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780845248/tapavis_menu/639/g3o9y6iiia7dm5z3to7e.jpg", 6, 0, 1],
      ["Aloo Tiki Chaat", "Aloo Tikki Chaat", null, null, 8.99, "alacarte", null, 7, 0, 1],
      ["Naan", "Naan", null, null, 2.5, "alacarte", null, 8, 0, 1],
      ["Naan à l'ail", "Garlic Naan", null, null, 3.5, "alacarte", null, 9, 0, 1],
      ["Riz Basmati", "Basmati Rice", null, null, 4.99, "alacarte", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799317/tapavis_menu/639/a8p9pilyxvbqobllyhgt.jpg", 10, 0, 1],
      ["Biryani au poulet", "Chicken Biryani", null, null, 14.99, "alacarte", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780845042/tapavis_menu/639/na7eowzxdihnqm1zzhzz.jpg", 11, 0, 1],
      ["Raita", "Raita", null, null, 4.99, "alacarte", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799950/tapavis_menu/639/ejvhob27q0gpcsz0y6kk.jpg", 12, 0, 1],
      ["Poutine Poulet au beurre", "Butter Chicken Poutine", null, null, 12.99, "poutine", null, 1, 0, 1],
      ["Poutine Shahi Paneer", "Shahi Paneer Poutine", null, null, 12.99, "poutine", null, 2, 0, 1],
      ["Rasmalai (2 pcs)", "Rasmalai (2 pcs)", null, null, 4.5, "desserts", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780799455/tapavis_menu/639/xstkrezkvtqrgbzqnfoe.jpg", 1, 0, 1],
      ["Gulab Jamun (2 pcs)", "Gulab Jamun (2 pcs)", null, null, 3.99, "desserts", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780844873/tapavis_menu/639/atplbdpwazfjqrtgggym.jpg", 2, 0, 1],
      ["Kulfi", "Kulfi", null, null, 3.5, "desserts", null, 3, 0, 1],
      ["Cardamome Chai", "Cardamom Chai", null, null, 3.5, "boissons", null, 1, 0, 1],
      ["Karak Chai", "Karak Chai", null, null, 3.5, "boissons", null, 2, 0, 1],
      ["Kashmiri Chai", "Kashmiri Chai", null, null, 3.5, "boissons", null, 3, 0, 1],
      ["Mango Lassi", "Mango Lassi", null, null, 4.99, "boissons", null, 4, 0, 1],
      ["Canette", "Soft Drink (Can)", null, null, 2.5, "boissons", null, 5, 0, 1],
      ["Eau", "Water", null, null, 1.99, "boissons", null, 6, 0, 1],
      ["Thali Non-Vég", "Non-Veg Thali", "Butter chicken servi avec channa masala, riz, naan, raita, salade fraîche et boisson en canette incluse. Sur place seulement / Dine-in only. Midi seulement : disponible de 11h30 à 15h00.", "Butter chicken served with channa masala, rice, naan, raita, fresh salad and a canned drink included. Dine-in only. Lunch only: available 11:30 AM–3:00 PM.", 16.99, "thali", null, 1, 0, 1],
      ["Thali Vég", "Veg Thali", "Shahi paneer servi avec channa masala, riz, naan, raita, salade fraîche et boisson en canette incluse. Sur place seulement / Dine-in only. Midi seulement : disponible de 11h30 à 15h00.", "Shahi paneer served with channa masala, rice, naan, raita, fresh salad and a canned drink included. Dine-in only. Lunch only: available 11:30 AM–3:00 PM.", 16.99, "thali", null, 2, 0, 1],
      ["Wrap Poulet au beurre", "Butter Chicken Wrap", "Poulet au beurre dans un naan, garni de laitue, tomates et oignons.", "Butter chicken in a naan, topped with lettuce, tomatoes and onions.", 11.99, "wraps", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760707/tapavis_menu/639/psp34mviazjd0uedruoc.jpg", 1, 0, 1],
      ["Wrap Tandoori Poulet", "Tandoori Chicken Wrap", "Poulet tandoori dans un naan, garni de laitue, tomates et oignons, sauce maison et sauce tandoori.", "Tandoori chicken in a naan, topped with lettuce, tomatoes and onions, house sauce and tandoori sauce.", 11.99, "wraps", null, 2, 0, 1],
      ["Wrap Shahi Paneer", "Shahi Paneer Wrap", "Shahi paneer dans un naan, garni de laitue, tomates et oignons.", "Shahi paneer in a naan, topped with lettuce, tomatoes and onions.", 11.99, "wraps", "https://res.cloudinary.com/duhp69meg/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1780760876/tapavis_menu/639/mhdec8duxsnebrkct1p1.jpg", 3, 0, 1],
      ["Wrap Kabab", "Kabab Wrap", "Kabab dans un naan, garni de laitue, tomates et oignons, sauce maison et sauce tandoori.", "Kabab in a naan, topped with lettuce, tomatoes and onions, house sauce and tandoori sauce.", 12.99, "wraps", null, 4, 0, 1],
      ["Faites un trio (Patates + Canette)", "Make it a Combo (Fries + Can)", "Ajoutez des frites et une canette à votre wrap.", "Add fries and a canned drink to your wrap.", 4.99, "wraps", null, 5, 0, 1],
    ];
    for (const it of items) {
      await db.run('INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,featured,available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', it);
    }
  }

  const platCount = await db.get('SELECT COUNT(*) AS c FROM delivery_platforms').catch(function(){ return { c: 0 }; });
  if (!platCount || Number(platCount.c) === 0) {
    const platforms = [
      ['Uber Eats', '', 'https://www.ubereats.com', 1, 1],
      ['DoorDash', '', 'https://www.doordash.com', 2, 1],
      ['SkipTheDishes', '', 'https://www.skipthedishes.com', 3, 1]
    ];
    for (const p of platforms) {
      await db.run('INSERT INTO delivery_platforms (name,logo_url,link_url,position,active) VALUES ($1,$2,$3,$4,$5)', p);
    }
  }

  const postCount = await db.get('SELECT COUNT(*) AS c FROM posts').catch(function(){ return { c: 0 }; });
  if (!postCount || Number(postCount.c) === 0) {
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Tandoori Route ouvre ses portes à Blainville !", "Enfin de la cuisine indienne dans les Basses-Laurentides. Notre tandoor est allumé, nos épices sont fraîchement moulues et notre Biryani au poulet n'attend que vous. Venez essayer le premier restaurant indien de Blainville — au 1185 Bd Curé-Labelle.", "Ouverture", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Notre Biryani au poulet : 24 heures de patience", "Le secret d'un vrai Biryani, c'est le temps. Nous marinons notre poulet pendant 24 heures dans un mélange de yogourt, gingembre, ail, garam masala maison et une pointe de safran. Résultat : chaque grain de basmati absorbe ces arômes et chaque bouchée raconte une histoire.", "Coulisses", 1]);
    await db.run('INSERT INTO posts (title,content,category,published) VALUES ($1,$2,$3,$4)',
      ["Suivez-nous sur Facebook et Instagram", "Photos de plats fraîchement sortis du tandoor, événements spéciaux, nouveautés au menu — toute l'actualité de Tandoori Route est sur nos réseaux sociaux. Rejoignez la communauté qui a déjà adopté son restaurant indien préféré à Blainville.", "Communauté", 1]);
  }
};
