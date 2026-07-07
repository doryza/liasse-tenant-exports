module.exports = async function(db) {
  async function S(k, v) {
    if (v == null) return;
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [k, v]);
  }
  async function IMG(k, v) {
    await db.run('INSERT INTO admin_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [k, v]);
  }

  await S('business_name', 'Ember & Oak');
  await S('tagline', 'Montreal micro-roastery');
  await S('hero_eyebrow', 'Mile End · Montreal');
  await S('hero_title', 'Roasted small. Drawn by hand. Montreal.');
  await S('hero_subtitle', 'We roast in five-kilo batches on a single drum, pulling each one by eye and ear until the cherry shows up. One fire, one hand, from green bean to your cup.');
  await S('hero_cta', 'See the roasts');
  await S('story_heading', 'How the fire got started');
  await S('story_text', 'It began in a narrow alley off Saint-Laurent in 2016, with a secondhand five-kilo drum and a stack of green Ethiopian we could barely afford. We roasted at night, cracked the door to let the smoke out, and handed bags to anyone who would take one. The neighbours started knocking. A cafe on Bernard asked for a standing order. Then a corner storefront came up for lease, two blocks from that first alley — so we moved the fire in, and never looked back.');
  await S('roasts_heading', 'Three we roast every week');
  await S('roasts_intro', 'Small lots, turned around fast. What is in the hopper this week, and where each one lands in the cup.');
  await S('wholesale_heading', 'Put our fire behind your bar');
  await S('wholesale_intro', 'We supply cafes, restaurants, and offices across Montreal — roasted to order, delivered by bike within the neighbourhood. Tell us what you pour and we will dial in a profile with you.');
  await S('visit_heading', 'Come stand by the drum');
  await S('visit_intro', 'We are two blocks off Saint-Laurent in Mile End. The roaster runs most mornings — follow the smell.');
  await S('visit_address', '5412 Rue Saint-Dominique, Mile End, Montreal, QC H2T 1V4');
  await S('footer_tagline', 'Roasted by hand in Mile End, Montreal.');
  await S('this_week', 'Roasted this week: Lot 47 — Guji, Ethiopia');

  await IMG('_p_hero_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455919/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455919003.png');
  await IMG('_p_about_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455918/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455918410.png');
  await IMG('_p_map_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455916/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455916718.png');
  await IMG('_p_wholesale_image_url', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455919/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455919045.png');

  var rc = await db.get('SELECT COUNT(*)::int c FROM roasts');
  if (!rc || !rc.c) {
    var roasts = [
      ['Alleyway', 'Guji, Ethiopia', 'Blueberry, Jasmine, Cane sugar', 1, 'Our first-ever profile, and still the one people come back for. A washed Guji dropped just past first crack at 198C, so the florals stay loud and the sweetness stays clean.', '$21 / 340g', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455918/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455918099.png', 1],
      ['Bernard', 'Huila, Colombia', 'Red apple, Toffee, Cocoa nib', 2, 'The cafe order that turned a hobby into a shop. Balanced and forgiving, built to shine in milk and to hold its own black. We pull the batch at 205C.', '$19 / 340g', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455917/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455917634.png', 2],
      ['Nightshift', 'Sumatra + Brazil', 'Dark cocoa, Molasses, Toasted walnut', 3, 'Roasted long into second crack for the espresso bar. Heavy body, low acidity, and enough backbone to carry a double through a busy morning.', '$18 / 340g', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455917/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455917238.png', 3],
      ['Ember Seasonal', 'Antigua, Guatemala', 'Dried fig, Brown butter, Orange peel', 2, 'This month rotating lot. Whatever is singing loudest on the cupping table gets the ember mark and a spot in the hopper.', '$22 / 340g', 'https://res.cloudinary.com/duhp69meg/image/upload/v1783455916/tapavis_tenant_ember-and-oak/build_ember-and-oak_1783455916667.png', 4]
    ];
    for (var i = 0; i < roasts.length; i++) {
      var r = roasts[i];
      await db.run('INSERT INTO roasts (name, origin, tasting_notes, roast_level, description, price, image_url, sort_order, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)', r);
    }
  }

  var sc = await db.get('SELECT COUNT(*)::int c FROM story_moments');
  if (!sc || !sc.c) {
    var moments = [
      ['2016', 'The first roast', 'A secondhand five-kilo drum in an alley off Saint-Laurent. We cracked the door for the smoke and roasted after dark.', 1],
      ['2018', 'The first cafe', 'A standing order on Bernard turned nights of roasting into mornings of deliveries, one crate of bags at a time.', 2],
      ['2021', 'The shop', 'A storefront two blocks from the alley. The fire moved in for good, and the door has stayed open since.', 3]
    ];
    for (var j = 0; j < moments.length; j++) {
      await db.run('INSERT INTO story_moments (year, title, description, sort_order) VALUES ($1,$2,$3,$4)', moments[j]);
    }
  }

  var hc = await db.get('SELECT COUNT(*)::int c FROM hours');
  if (!hc || !hc.c) {
    var hrs = [
      ['Monday', '7:00 - 17:00', 1],
      ['Tuesday', '7:00 - 17:00', 2],
      ['Wednesday', '7:00 - 17:00', 3],
      ['Thursday', '7:00 - 18:00', 4],
      ['Friday', '7:00 - 18:00', 5],
      ['Saturday', '8:00 - 18:00', 6],
      ['Sunday', '8:00 - 16:00', 7]
    ];
    for (var k = 0; k < hrs.length; k++) {
      await db.run('INSERT INTO hours (day, hours, sort_order) VALUES ($1,$2,$3)', hrs[k]);
    }
  }

  var pc = await db.get('SELECT COUNT(*)::int c FROM posts');
  if (!pc || !pc.c) {
    var posts = [
      ['Lot 47 is on the drum', 'This week we are running Lot 47, a washed Guji we cupped last Thursday and could not put down. Blueberry up front, jasmine on the finish. On the shelf until it sells out.', 'This week'],
      ['Why we drop the Alleyway at 198C', 'A few degrees past first crack is where this Guji shows its florals without turning grassy. Any hotter and the jasmine folds into toast. It is a narrow window, and we chase it every batch.', 'Roasting notes'],
      ['Cupping the new Guatemala', 'Six lots on the table this morning, one clear winner: an Antigua with dried fig and brown butter. It becomes this month Ember Seasonal starting Friday.', 'Cupping'],
      ['Delivering by bike all summer', 'Every wholesale order inside the neighbourhood goes out by cargo bike, roasted the morning it ships. No idling vans, no day-old beans.', 'News']
    ];
    for (var p = 0; p < posts.length; p++) {
      var po = posts[p];
      await db.run('INSERT INTO posts (title, content, category, published) VALUES ($1,$2,$3,1)', po);
    }
  }

  var ec = await db.get('SELECT COUNT(*)::int c FROM wholesale_enquiries');
  if (!ec || !ec.c) {
    await db.run('INSERT INTO wholesale_enquiries (name, cafe, volume, email, message, status) VALUES ($1,$2,$3,$4,$5,$6)', ['Marie Lavoie', 'Cafe Résonance', '12 kg / week', 'marie@resonance.example', 'We are switching roasters and loved the Bernard on a tasting. Could we set up a standing weekly order and talk espresso profiles?', 'new']);
    await db.run('INSERT INTO wholesale_enquiries (name, cafe, volume, email, message, status) VALUES ($1,$2,$3,$4,$5,$6)', ['Devon Clarke', 'The Reading Room', '5 kg / week', 'hello@readingroom.example', 'Small bookshop cafe near Laurier. Looking for one filter roast to pour by the cup. The Alleyway sounds perfect.', 'contacted']);
  }
};
