module.exports = async function(db) {
  const settings = [
    ['site_title', 'Joe — Montreal Real Estate Broker | Remax'],
    ['meta_description', "Sell your Montreal property with Joe — Remax. Get a free, no-pressure home valuation from a friendly local broker."],
    ['brand_name', 'Joe'],
    ['brand_subtitle', 'Montreal Real Estate'],
    ['hero_title', "Thinking of selling your Montreal home?"],
    ['hero_subtitle', "Hi, I'm Joe. I'll give you a free, honest valuation and a friendly chat — no pressure, no pushy sales talk. Just real numbers and a real plan."],
    ['hero_cta', 'Get My Free Valuation →'],
    ['about_title', "Hey, I'm Joe — your friendly Montreal realtor."],
    ['about_text', "I've been helping families in Montreal sell their homes for over 15 years. From the Plateau to Verdun, from Rosemont to NDG, I know the neighborhoods, the buyers, and exactly what your home is worth in today's market.\n\nWhat makes me different? I'm here for the relationship, not just the transaction. I'll never push you to list before you're ready. And when we do sell, I'll fight for every dollar like it's coming out of my own pocket."],
    ['sold_title', 'Recently Sold Properties'],
    ['sold_subtitle', 'Real results from real Montreal neighborhoods.'],
    ['skills_title', 'Skills that get your home sold'],
    ['testimonials_title', 'What sellers say about Joe'],
    ['contact_title', "Ready to sell? Let's chat — coffee on me."],
    ['contact_subtitle', "Fill out the form and I'll personally reach out within a few hours with a free home valuation. No bots, no call centers — just Joe."],
    ['footer_tagline', 'Helping Montrealers sell their home with confidence since 2009.'],
    ['social_facebook', 'https://facebook.com/'],
    ['social_instagram', 'https://instagram.com/'],
    ['social_linkedin', 'https://linkedin.com/'],
    ['social_youtube', '']
  ];
  for (const [k, v] of settings) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946322/tapavis_tenant_remax-3/build_remax-3_1778946322209.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");
  await db.run("INSERT INTO admin_settings (key, value) VALUES ('_p_joe_photo_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946327/tapavis_tenant_remax-3/build_remax-3_1778946327162.png') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()");

  const propCount = (await db.get('SELECT COUNT(*)::int AS c FROM sold_properties')).c;
  if (propCount === 0) {
    const props = [
      ['Charming Plateau Condo', 'Plateau-Mont-Royal', '$685,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946324/tapavis_tenant_remax-3/build_remax-3_1778946323984.png', 2, 1, '2024-09-15', 1],
      ['Elegant Outremont Townhouse', 'Outremont', '$1,485,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946323/tapavis_tenant_remax-3/build_remax-3_1778946323500.png', 4, 3, '2024-08-22', 1],
      ['Sun-Filled Rosemont Duplex', 'Rosemont-La Petite-Patrie', '$925,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946339/tapavis_tenant_remax-3/build_remax-3_1778946339003.png', 5, 2, '2024-07-30', 0],
      ['Modern Verdun Family Home', 'Verdun', '$745,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946323/tapavis_tenant_remax-3/build_remax-3_1778946323131.png', 3, 2, '2024-06-18', 0],
      ['Bright NDG Bungalow', 'Notre-Dame-de-Grâce', '$815,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946324/tapavis_tenant_remax-3/build_remax-3_1778946323984.png', 3, 2, '2024-05-12', 0],
      ['Mile End Loft with Terrace', 'Mile End', '$795,000', 'https://res.cloudinary.com/duhp69meg/image/upload/v1778946323/tapavis_tenant_remax-3/build_remax-3_1778946323500.png', 2, 2, '2024-04-08', 0]
    ];
    for (const p of props) {
      await db.run('INSERT INTO sold_properties (title, neighborhood, price, image_url, bedrooms, bathrooms, sold_date, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', p);
    }
  }

  const testCount = (await db.get('SELECT COUNT(*)::int AS c FROM testimonials')).c;
  if (testCount === 0) {
    const tests = [
      ['Marie & Philippe Tremblay', 'Sold in Plateau-Mont-Royal', "Joe is the real deal. He came over, listened to our concerns about timing, and gave us a price range that turned out to be spot-on. We accepted an offer 4 days after listing — above asking. No drama, no pressure. Just results.", 5],
      ['Alex Bertrand', 'Sold a duplex in Rosemont', "I had two other agents tell me what they thought I wanted to hear. Joe told me the truth, and that's exactly why we worked with him. Sold quickly and for more than I expected. Already recommended him to my brother.", 5],
      ['Sophie Lavoie', 'Sold in NDG', "Selling my mom's home was emotional. Joe handled every detail with patience and respect. He explained everything in plain language and made sure we never felt rushed. A genuinely kind professional.", 5],
      ['Daniel Cohen', 'Sold in Outremont', "Five stars isn't enough. Joe negotiated $40k over our list price thanks to multiple offers he generated through his network. He knows Montreal inside out.", 5],
      ['Catherine Roy & David Lin', 'Sold in Verdun', "Joe felt like a friend from day one — warm, casual, but seriously sharp on numbers. We trusted him completely and the result speaks for itself.", 5],
      ['Jean-François Martel', 'Sold in Mile End', "Joe got our condo sold in 9 days. His photos, staging tips, and marketing were on point. Highly recommend if you want zero stress.", 5]
    ];
    for (const t of tests) {
      await db.run('INSERT INTO testimonials (name, role, content, rating, featured) VALUES ($1,$2,$3,$4,1)', t);
    }
  }

  const skillCount = (await db.get('SELECT COUNT(*)::int AS c FROM skills')).c;
  if (skillCount === 0) {
    const skills = [
      ['Local Market Expertise', "I live and work in Montreal. I know what's selling on your street, what isn't, and exactly why.", '🗺️', 1],
      ['Honest Pricing', "No inflated promises to win your listing. Just real numbers based on real comps.", '💯', 2],
      ['Smart Negotiation', "15 years of negotiating means I keep the deal warm while pushing for top dollar.", '🤝', 3],
      ['Marketing That Works', "Professional photos, drone footage, social campaigns, and an active buyer network.", '📸', 4],
      ['Always Available', "You call, I answer. No assistants, no voicemail tag. Real responsiveness.", '📞', 5],
      ['Bilingual Service', "En français ou en anglais — whichever you're more comfortable with.", '🇨🇦', 6]
    ];
    for (const s of skills) {
      await db.run('INSERT INTO skills (name, description, icon, order_index) VALUES ($1,$2,$3,$4)', s);
    }
  }

  const postCount = (await db.get('SELECT COUNT(*)::int AS c FROM posts')).c;
  if (postCount === 0) {
    const posts = [
      ['3 Tips to Sell Your Montreal Home This Fall', "Fall is one of the best selling seasons in Montreal — buyers are serious and inventory tightens. Here are three things I tell every seller before we list: 1) Get a pre-listing inspection. It catches surprises before buyers do. 2) Stage the entryway. First impressions matter more than people realize. 3) Price honestly. Overpricing kills momentum in the first two weeks.", 'Tips'],
      ['Plateau vs. Rosemont: Where Should You Buy?', "Two of Montreal's most beloved neighborhoods, two very different vibes. The Plateau is dense, lively, and walkable — perfect if you want cafés on every corner. Rosemont is greener, quieter, and more family-friendly. Prices reflect that: Plateau condos run higher per square foot, but Rosemont offers more space for the dollar.", 'Tips'],
      ["What's Really Happening in the Montreal Market", "After two years of buyer fatigue, we're seeing a clear shift. Quality properties priced right are getting multiple offers again. The lesson? Don't chase the market down. Price it right, prepare it well, and let buyers do the work.", 'Market Update']
    ];
    for (const p of posts) {
      await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,1)', p);
    }
  }
};
