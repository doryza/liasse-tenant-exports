// RED BOX — Poulet Nashville. Seed: business facts, menu groups and items.
// Page imagery (_p_*_image_url) is upserted by migrations.sql (BARE Cloudinary
// URLs); the views also carry hardcoded fallbacks to the same URLs so the site
// renders even before migrations run.
module.exports = async function(db, services) {
  services = services || {};
  const cfg = services.config || {};

  const settingsDefault = [
    ['business_name', cfg.businessName || cfg.displayName || 'RED BOX'],
    ['tagline', 'Le poulet le plus croustillant en ville.'],
    ['seo_description', 'RED BOX — Poulet Nashville. Le poulet frit réinventé : extrêmement croustillant, jamais gras. Filets de poulet premium, frites ondulées et sauce signature, dans la boîte rouge iconique. Terrebonne, QC.'],
    ['contact_email', cfg.contactEmail || 'info@redboxpoulet.ca'],
    ['contact_phone', cfg.contactPhone || '(514) 886-4545'],
    ['business_address', cfg.businessAddress || '110-2790 Boul. de la Pinière, Terrebonne, QC J6X 0G4'],
    ['flagship_neighbour', 'Superbol'],
    ['footer_intro_fr', "Le poulet frit réinventé. Extrêmement croustillant. Zéro gras saturé. L'expérience fast-casual premium au Québec."],
    ['footer_intro_en', 'Fried chicken reinvented. Extremely crispy. Zero saturated fat. The premium fast-casual experience in Quebec.'],
    ['footer_credit', 'Propulsé par Liasse'],
    // Hero slider: curated from existing brand visuals (one URL per line). The
    // home hero crossfades through these; editable in Admin → Bannière défilante.
    ['hero_slides', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/hero.png\nhttps://res.cloudinary.com/duhp69meg/image/upload/v1782232050/redboxpoulet/site/vibe.png\nhttps://res.cloudinary.com/duhp69meg/image/upload/v1782232052/redboxpoulet/site/action.png\nhttps://res.cloudinary.com/duhp69meg/image/upload/v1782232188/redboxpoulet/site/tenders_macro_1782232188334.png'],
    // Native Liasse Restaurants ordering host (linked business #657) — /commander
    // loads the menu, verifies phones and places orders against this host.
    ['order_base_url', 'https://redboxpoulet.liasse.tech'],
    // Socials — the original site's links were non-functional placeholders, so
    // we leave them blank (the social row stays hidden until real URLs are set
    // from the admin backend).
    ['social_instagram', ''],
    ['social_facebook', ''],
    ['social_tiktok', '']
  ];
  for (const [k, v] of settingsDefault) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }

  const catCount = await db.get('SELECT COUNT(*) AS c FROM menu_categories').catch(function(){ return { c: 0 }; });
  if (!catCount || Number(catCount.c) === 0) {
    const cats = [
      ['solo', 'Les Boîtes Solo', 'The Solo Boxes', 'Servies avec frites ondulées, Texas toast et sauce signature RED BOX.', 'Served with wavy fries, Texas toast and signature RED BOX sauce.', 1],
      ['grosse', 'La Grosse Boîte', 'The Big Box', 'Le repas familial. Conçu pour partager.', 'The family meal. Built to share.', 2],
      ['burgers', 'Les Burgers & Extras', 'Burgers & Extras', '', '', 3]
    ];
    for (const c of cats) {
      await db.run('INSERT INTO menu_categories (slug,name_fr,name_en,served_note_fr,served_note_en,position) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING', c);
    }
  }

  const menuCount = await db.get('SELECT COUNT(*) AS c FROM menu_items').catch(function(){ return { c: 0 }; });
  if (!menuCount || Number(menuCount.c) === 0) {
    // [name_fr, name_en, desc_fr, desc_en, price, category, image_url, position, is_popular, is_extra]
    const items = [
      ['Boîte 3 Filets', '3-Tender Box', '3 filets croustillants, frites ondulées, 1 Texas toast, 1 sauce.', '3 crispy tenders, wavy fries, 1 Texas toast, 1 sauce.', 12.99, 'solo', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_3filets_1782232169349.png', 1, 0, 0],
      ['Boîte 4 Filets', '4-Tender Box', '4 filets croustillants, frites ondulées, 1 Texas toast, 1 sauce.', '4 crispy tenders, wavy fries, 1 Texas toast, 1 sauce.', 14.99, 'solo', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_4filets_1782232168971.png', 2, 1, 0],
      ['Boîte 6 Filets', '6-Tender Box', '6 filets croustillants, frites ondulées, 1 Texas toast, 2 sauces.', '6 crispy tenders, wavy fries, 1 Texas toast, 2 sauces.', 18.99, 'solo', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/box_6filets_1782232169238.png', 3, 0, 0],
      ['La Grosse Boîte', 'The Big Box', "Conçue pour partager. Poulet d'un côté, frites de l'autre, sauces au milieu. 12 filets croustillants, une montagne de frites ondulées, 4 Texas toasts beurrés et 4 sauces RED BOX.", 'Built to share. Chicken on one side, fries on the other, sauces in the middle. 12 crispy tenders, a mountain of wavy fries, 4 buttered Texas toasts and 4 RED BOX sauces.', 36.99, 'grosse', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232051/redboxpoulet/site/packaging.png', 1, 0, 0],
      ['Burger Red Box Solo', 'Red Box Burger Solo', '3 filets premium empilés dans un pain brioché, avec salade de chou fraîche et sauce maison.', 'Three premium tenders stacked in a brioche bun with fresh coleslaw and house sauce.', 9.99, 'burgers', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232169/redboxpoulet/menu/burger_solo_1782232169368.png', 1, 0, 0],
      ['Frites Ondulées', 'Wavy Fries', 'Portion régulière.', 'Regular portion.', 3.99, 'burgers', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/fries_1782232179220.png', 2, 0, 1],
      ['Texas Toast', 'Texas Toast', "Beurre à l'ail, grillé.", 'Garlic butter, grilled.', 1.99, 'burgers', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/texas_toast_1782232178583.png', 3, 0, 1],
      ['Salade de Chou', 'Coleslaw', 'Crémeuse et fraîche.', 'Creamy & fresh.', 2.49, 'burgers', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232177/redboxpoulet/menu/slaw_1782232177035.png', 4, 0, 1],
      ['Sauce Red Box Signature', 'Red Box Signature Sauce', 'La sauce secrète (extra).', 'The secret sauce (extra).', 0.50, 'burgers', 'https://res.cloudinary.com/duhp69meg/image/upload/v1782232179/redboxpoulet/menu/sauce_1782232178894.png', 5, 0, 1],
      ['1 Filet Extra', 'Extra Tender', '', '', 3.49, 'burgers', null, 6, 0, 1],
      ['Boissons', 'Drinks', 'Fontaine, thé glacé, limonade.', 'Fountain, iced tea, lemonade.', 2.49, 'burgers', null, 7, 0, 1]
    ];
    for (const it of items) {
      await db.run('INSERT INTO menu_items (name_fr,name_en,description_fr,description_en,price,category,image_url,position,is_popular,is_extra) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', it);
    }
  }
};
