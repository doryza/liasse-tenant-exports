/**
 * First-install seed. Every treatment, rate, package, product, article and
 * opening hour below was transcribed from the owner-authorized import of
 * faitmainmassotherapie.com. Nothing here is invented: where the source did
 * not state a fact (a shipping rate, an article body, a product photo) the
 * field is left empty for the owner to complete from the admin area.
 *
 * Runs once, guarded by the platform `_seed_version` sentinel.
 */
const assets = require('./lib/assets');

const J = (fr, en) => JSON.stringify({ fr, en });

// ---------------------------------------------------------------------------
// Treatments — [slug, family, fr name, en name, fr summary, en summary,
//               fr duration, en duration, price_cents, price_from]
// ---------------------------------------------------------------------------
const SERVICES = [
  ['massage-detente', 'massotherapie', 'Massage Détente', 'Relaxation massage',
    "Permet de calmer, d'apaiser, de réduire l'anxiété.", 'Calms, soothes and helps reduce anxiety.',
    'De 30 min à 1 h 30', 'From 30 min to 1 h 30', 6500, 1],
  ['massage-femme-enceinte', 'massotherapie', 'Massage pour Femme Enceinte', 'Prenatal massage',
    "Détente et soulagement global. À partir de 14 semaines de grossesse.", 'Relaxation and overall relief. From 14 weeks of pregnancy.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 9500, 1],
  ['massage-en-duo', 'massotherapie', 'Massage en Duo', 'Duo massage',
    'Un moment zen en duo, dans la même cabine.', 'A calm moment for two, in the same room.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 19000, 1],
  ['massage-detente-therapeutique', 'massotherapie', 'Massage Détente-Thérapeutique', 'Relaxation & therapeutic massage',
    "Tensions musculaires avec l'envie de se détendre? C'est le soin idéal.", 'Muscle tension but you still want to unwind? This is the one.',
    'De 30 min à 1 h 30', 'From 30 min to 1 h 30', 6500, 1],
  ['massage-sportif-therapeutique', 'massotherapie', 'Massage Sportif-Thérapeutique', 'Sports & therapeutic massage',
    'Massage, ventouses, taping et mobilisations pour un soin en profondeur prodigué par nos kinés.', 'Massage, cupping, taping and mobilisation for deep work, given by our kinesitherapists.',
    'De 30 min à 1 h 30', 'From 30 min to 1 h 30', 7500, 1],
  ['massage-sur-chaise', 'massotherapie', 'Massage sur chaise', 'Chair massage',
    'Du temps bien investi.', 'Time well spent.',
    "De 30 min à 1 h", 'From 30 min to 1 h', 6500, 1],
  ['reflexologie-des-pieds', 'massotherapie', 'Réflexologie des Pieds', 'Foot reflexology',
    "Plus qu'une douceur à vos pieds. Un travail organique assuré.", 'More than a treat for your feet — real organic work.',
    '1 h', '1 h', 11500, 0],
  ['drainage-lymphatique', 'massotherapie', 'Drainage Lymphatique', 'Lymphatic drainage',
    'La désintoxication du corps qui passe par le massage.', 'Detoxifying the body through massage.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 11500, 1],
  ['pierres-chaudes', 'massotherapie', 'Pierres Chaudes', 'Hot stones',
    'Une détente remplie de chaleur.', 'Deep relaxation, full of warmth.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 11500, 1],
  ['massage-lomi-lomi', 'massotherapie', 'Massage Lomi Lomi', 'Lomi Lomi massage',
    "Un moment de détente du corps et de l'esprit.", 'A moment of rest for body and mind.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 11000, 1],
  ['massage-fadoq', 'massotherapie', 'Massage FADOQ', 'FADOQ massage',
    'Un rabais de 10 % pour les membres de la FADOQ.', 'A 10% discount for FADOQ members.',
    "De 1 h à 1 h 30", 'From 1 h to 1 h 30', 8550, 1],

  ['lextremite', 'forfait', "L'Extrémité", 'The Extremities',
    'Massage spécialisé des mains, des pieds et de la tête.', 'Focused massage of the hands, feet and head.',
    '1 h', '1 h', 9500, 0],
  ['decouverte-reflexologie', 'forfait', 'À la découverte de la réflexologie', 'Discovering reflexology',
    'Le forfait idéal pour découvrir les bienfaits de la réflexologie plantaire.', 'The ideal package to discover the benefits of foot reflexology.',
    '1 h 30', '1 h 30', 15000, 0],
  ['nuque-epaules', 'forfait', 'Nuque & Épaules', 'Neck & shoulders',
    "Permet la détente d'une région spécifique.", 'Releases one specific area.',
    "De 30 min à 1 h", 'From 30 min to 1 h', 6500, 1],
  ['detente-globale', 'forfait', 'Détente Globale', 'Full relaxation',
    'Massage de tout le corps, incluant un massage de la tête et du visage.', 'Full-body massage, including head and face.',
    '1 h 45', '1 h 45', 14000, 0],
  ['moment-parfait', 'forfait', 'Moment Parfait', 'Perfect Moment',
    "Soin du visage Essentiel suivi d'un massage de détente de 60 minutes.", 'The Essential facial followed by a 60-minute relaxation massage.',
    '2 h', '2 h', 18000, 0],
  ['douce-peau', 'forfait', 'Douce Peau', 'Soft Skin',
    "Exfoliation, enveloppement et hydratation du corps suivis d'un soin du dos incluant un massage.", 'Body exfoliation, wrap and hydration followed by a back treatment with massage.',
    '2 h 15', '2 h 15', 22500, 0],
  ['moi-dabord', 'forfait', "Moi d'abord", 'Me First',
    "Exfoliation, enveloppement et hydratation du corps auxquels on ajoute un facial essentiel.", 'Body exfoliation, wrap and hydration, with the Essential facial added.',
    '2 h 30', '2 h 30', 22500, 0],
  ['du-temps-pour-moi', 'forfait', 'Du temps pour moi', 'Time for Me',
    "Soin du visage Essentiel adapté aux besoins de votre peau, un massage de 90 min suivi d'une pédicure.", 'The Essential facial adapted to your skin, a 90-minute massage, then a pedicure.',
    '4 h', '4 h', 29000, 0],
  ['bal-de-graduation', 'forfait', 'Bal de graduation 🎓', 'Prom package 🎓',
    'Offre spéciale bal de graduation.', 'Special prom offer.',
    '2 h', '2 h', 12500, 0],

  ['soin-visage-massage-enfant', 'enfants', 'Soin du Visage et Massage pour Enfant', 'Child facial & massage',
    'Soin du visage et massage adaptés aux enfants.', 'Facial and massage adapted for children.',
    '1 h', '1 h', 8000, 0],
  ['massage-pour-enfant', 'enfants', 'Massage pour Enfant', 'Child massage',
    'Une belle introduction au massage pour les 11 ans et moins. Le parent doit être présent.', 'A gentle introduction to massage for children 11 and under. A parent must be present.',
    "De 30 min à 1 h", 'From 30 min to 1 h', 5500, 1],
  ['facial-essentiel-enfant', 'enfants', 'Facial Essentiel pour enfant', 'Essential facial for children',
    "Il n'est jamais trop tôt pour prendre soin de la peau de son visage.", 'It is never too early to care for your skin.',
    '30 min', '30 min', 6500, 0],

  ['consultation-esthetique', 'esthetique', 'Consultation esthétique GRATUITE', 'FREE skin-care consultation',
    'La consultation garantit que vous recevez le traitement et les conseils qui vous conviennent.', 'A consultation makes sure you get the treatment and advice that suit you.',
    '30 min', '30 min', 0, 0],
  ['extension-de-cils', 'esthetique', 'Extension de cils', 'Lash extensions',
    'Les extensions intensifient le regard tout en conservant un effet naturel et élégant.', 'Extensions intensify the eyes while keeping a natural, elegant effect.',
    "De 1 h 30 à 2 h 15", 'From 1 h 30 to 2 h 15', 9500, 1],
  ['remplissage-cils', 'esthetique', 'Remplissage cils', 'Lash fill',
    'Le remplissage conserve des extensions belles et bien fournies au fil du temps.', 'A fill keeps extensions full and beautiful over time.',
    "De 1 h à 1 h 45", 'From 1 h to 1 h 45', 4000, 1],
  ['lashlift', 'esthetique', 'Lashlift (rehaussement des cils)', 'Lash lift',
    'Allongez et recourbez vos cils pour un regard naturel et envoûtant.', 'Lengthen and curl your lashes for a natural, captivating look.',
    '1 h', '1 h', 8000, 0],
  ['lamination-sourcils', 'esthetique', 'Lamination des sourcils', 'Brow lamination',
    "Restructurer la ligne des sourcils et donner la densité souhaitée afin d'intensifier votre regard.", 'Restructure the brow line and add the density you want.',
    '1 h', '1 h', 8000, 0],
  ['facial-essentiel', 'esthetique', 'Facial Essentiel', 'Essential facial',
    'Le soin du visage essentiel pour garder sa peau en santé.', 'The essential facial to keep your skin healthy.',
    '1 h', '1 h', 9000, 1],
  ['soin-signature-collagene', 'esthetique', 'Soin Signature Anti-âge au collagène', 'Signature anti-ageing collagen facial',
    "Révéler la jeunesse et l'éclat de votre peau.", 'Reveal the youth and glow of your skin.',
    '1 h 30', '1 h 30', 16000, 0],
  ['maderotherapie-visage', 'esthetique', 'Madérothérapie Visage', 'Facial maderotherapy',
    "Idéale pour la fatigue, le stress et les signes de l'âge.", 'Ideal for fatigue, stress and signs of ageing.',
    '1 h', '1 h', 9000, 0],

  ['epilation-aisselles', 'epilation', 'Épilation des aisselles', 'Underarm waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 2300, 0],
  ['epilation-sourcils', 'epilation', 'Épilation des sourcils', 'Brow shaping', 'À la cire ou à la pince.', 'Wax or tweezers.', '15 min', '15 min', 1500, 0],
  ['epilation-levre', 'epilation', 'Épilation de la lèvre supérieure', 'Upper-lip waxing', 'À la cire ou à la pince.', 'Wax or tweezers.', '15 min', '15 min', 1500, 0],
  ['epilation-dos', 'epilation', 'Épilation du dos', 'Back waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 4600, 0],
  ['epilation-torse', 'epilation', 'Épilation du torse', 'Chest waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 4200, 0],
  ['epilation-torse-abdomen', 'epilation', 'Épilation torse + abdomen', 'Chest & abdomen waxing', 'Épilation à la cire.', 'Waxing.', '45 min', '45 min', 5500, 0],
  ['epilation-jambes', 'epilation', 'Épilation jambes', 'Full-leg waxing', 'Épilation à la cire.', 'Waxing.', '45 min', '45 min', 4200, 0],
  ['epilation-demi-jambe', 'epilation', 'Épilation demi-jambe', 'Half-leg waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 2600, 0],
  ['epilation-bikini-regulier', 'epilation', 'Épilation Bikini régulier', 'Regular bikini waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 2300, 0],
  ['epilation-bikini-bresilien', 'epilation', 'Épilation Bikini brésilien', 'Brazilian bikini waxing', 'Épilation à la cire, échancré.', 'Waxing.', '30 min', '30 min', 2700, 0],
  ['epilation-bikini-integral', 'epilation', 'Épilation Bikini intégral', 'Full bikini waxing', 'Épilation à la cire.', 'Waxing.', '45 min', '45 min', 4000, 0],
  ['epilation-menton', 'epilation', 'Épilation menton', 'Chin waxing', 'À la cire ou à la pince.', 'Wax or tweezers.', '15 min', '15 min', 1200, 0],
  ['epilation-visage', 'epilation', 'Épilation visage', 'Face waxing', 'Sourcils, lèvre supérieure et menton.', 'Brows, upper lip and chin.', '20 min', '20 min', 3500, 0],
  ['epilation-inter-fessier', 'epilation', 'Épilation inter-fessier', 'Intergluteal waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 3500, 0],
  ['epilation-bras', 'epilation', 'Épilation des bras', 'Arm waxing', 'Épilation à la cire.', 'Waxing.', '30 min', '30 min', 2300, 0],

  ['manucure-beaute-des-mains', 'ongles', 'Manucure & Beauté des mains', 'Manicure & hand care',
    'Des mains soignées tout en douceur.', 'Beautifully cared-for hands.', '1 h', '1 h', 6000, 0],
  ['pose-dongles', 'ongles', "Pose d'ongles", 'Nail enhancements',
    'Des mains impeccables et des ongles élégants au quotidien.', 'Impeccable hands and elegant nails, every day.', '1 h 30', '1 h 30', 7500, 0],
  ['manucure-express', 'ongles', 'Manucure Express', 'Express manicure',
    'Refonte et manucure : conserve la forme harmonieuse des ongles naturels.', 'Reshape and manicure: keeps the natural nail beautifully shaped.', '1 h', '1 h', 6000, 0],
  ['pedicure', 'ongles', 'Pédicure', 'Pedicure',
    'Des pieds soignés tout en douceur.', 'Beautifully cared-for feet.', '1 h 30', '1 h 30', 7500, 0],
  ['pedicure-express', 'ongles', 'Pédicure Express ✨', 'Express pedicure ✨',
    'Idéal pour entretenir vos pieds et rafraîchir la couleur sans refaire toute la pédicure.', 'Ideal to maintain your feet and refresh the colour without a full pedicure.', '1 h', '1 h', 6000, 0],

  ['maderotherapie-vitalite', 'corps', 'Madérothérapie : Vitalité', 'Maderotherapy: Vitality',
    'Circulation, récupération et détente musculaire.', 'Circulation, recovery and muscle release.', '1 h', '1 h', 12500, 1],
  ['soin-du-dos', 'corps', 'Soin du dos', 'Back treatment',
    'Le soin du dos essentiel pour garder la peau en santé.', 'The essential back treatment to keep skin healthy.', '1 h', '1 h', 9000, 0],
  ['enveloppement-a-la-boue', 'corps', 'Enveloppement à la boue', 'Mud wrap',
    'Enveloppement du corps à la boue minéralisée.', 'Full-body mineralised mud wrap.', '1 h', '1 h', 9000, 0],
  ['maderotherapie-silhouette', 'corps', 'Madérothérapie : Silhouette et cellulite', 'Maderotherapy: Silhouette & cellulite',
    'Sculptez votre silhouette naturellement et révélez une peau plus lisse.', 'Sculpt your silhouette naturally and reveal smoother skin.', '1 h', '1 h', 12500, 0],
  ['soin-anti-cellulite', 'corps', 'Soin Anti-Cellulite', 'Anti-cellulite treatment',
    "Traitement stimulant aidant à activer la circulation, favoriser le drainage et améliorer l'apparence de la peau.", 'A stimulating treatment that activates circulation, supports drainage and improves the look of the skin.', '1 h', '1 h', 11500, 0],

  ['massage-sur-chaise-entreprise', 'entreprise', 'Massage sur chaise en entreprise', 'Corporate chair massage',
    "Pratiqué sur vos lieux de travail, le massage sur chaise devient un outil de prévention efficace. Une séance régulière d'à peine 15 minutes réduira le stress et augmentera la productivité.", 'Given at your workplace, chair massage becomes an effective prevention tool. A regular session of just 15 minutes reduces stress and increases productivity.',
    'Sur mesure', 'Tailored', null, 0],
];

// Packages — [slug, fr, en, fr summary, en summary, fr validity, en validity, price, popular, fr perks, en perks]
const PACKAGES = [
  ['forfait-3-massages-60', 'Forfait 3 massages de 60 minutes', 'Package: 3 × 60-minute massages',
    "Le forfait par excellence pour vous assurer de prendre soin de vous.", 'The package that makes sure you keep taking care of yourself.',
    'Valable pendant 12 mois', 'Valid for 12 months', 24225, 1,
    ["Rabais de 15 % sur le prix d'un massage à l'achat de 3 soins", '3 massages de 60 minutes', 'Applicable à nos massages détente et détente-thérapeutique', 'Applicable sur nos massages pour femmes enceintes', 'Ne peut être jumelé à aucune autre offre', 'Le forfait ne peut être partagé'],
    ['15% off the price of a massage when you buy 3', '3 × 60-minute massages', 'Applies to our relaxation and relaxation-therapeutic massages', 'Applies to our prenatal massages', 'Cannot be combined with any other offer', 'The package cannot be shared']],
  ['forfait-3-massages-90', 'Forfait 3 massages de 90 minutes', 'Package: 3 × 90-minute massages',
    "Le forfait par excellence pour vous assurer de prendre soin de vous.", 'The package that makes sure you keep taking care of yourself.',
    'Valable pendant 12 mois', 'Valid for 12 months', 30000, 0,
    ["Un rabais de 15 % sur le prix régulier d'un massage", '3 massages de 90 minutes', 'Applicable à nos massages détente et détente-thérapeutique', 'Applicable aux massages pour femme enceinte', 'Ne peut être jumelé à aucune autre offre', 'Le forfait ne peut être partagé'],
    ['15% off the regular price of a massage', '3 × 90-minute massages', 'Applies to our relaxation and relaxation-therapeutic massages', 'Applies to our prenatal massages', 'Cannot be combined with any other offer', 'The package cannot be shared']],
  ['forfait-5-massages-60', 'Forfait 5 massages de 60 minutes', 'Package: 5 × 60-minute massages',
    "Le forfait par excellence pour vous assurer de prendre soin de vous.", 'The package that makes sure you keep taking care of yourself.',
    'Valable pendant 12 mois', 'Valid for 12 months', 38000, 0,
    ['Un rabais de 20 % appliqué sur nos prix réguliers', '5 massages de 60 minutes', "S'applique aux massages de détente et détente-thérapeutique", "S'applique aux massages pour femmes enceintes", 'Ne peut être jumelé à aucune autre offre', 'Le forfait ne peut être partagé'],
    ['20% off our regular prices', '5 × 60-minute massages', 'Applies to relaxation and relaxation-therapeutic massages', 'Applies to prenatal massages', 'Cannot be combined with any other offer', 'The package cannot be shared']],
  ['forfait-5-massages-90', 'Forfait 5 massages de 90 minutes', 'Package: 5 × 90-minute massages',
    "Le forfait par excellence pour vous assurer de prendre soin de vous.", 'The package that makes sure you keep taking care of yourself.',
    'Valable pendant 12 mois', 'Valid for 12 months', 50000, 0,
    ['Un rabais de 20 % appliqué sur nos prix réguliers', '5 massages de 90 minutes', "S'applique aux massages de détente et détente-thérapeutique", "S'applique aux massages pour femmes enceintes", 'Ne peut être jumelé à aucune autre offre', 'Le forfait ne peut être partagé'],
    ['20% off our regular prices', '5 × 90-minute massages', 'Applies to relaxation and relaxation-therapeutic massages', 'Applies to prenatal massages', 'Cannot be combined with any other offer', 'The package cannot be shared']],
  ['cure-silhouette-legerete', 'Cure Silhouette & Légèreté', 'Silhouette & Lightness programme',
    "Un programme de soins conçu pour stimuler la circulation, favoriser le drainage et améliorer l'apparence de la peau.", 'A programme designed to stimulate circulation, support drainage and improve the look of the skin.',
    'Valable pendant 3 mois', 'Valid for 3 months', 50000, 0,
    ['Soin Anti-Cellulite', 'Madérothérapie : Silhouette et cellulite'],
    ['Anti-cellulite treatment', 'Maderotherapy: Silhouette & cellulite']],
];

// Products — [slug, fr, en, price, collection, fr desc, en desc, image, in_stock, variant_label_fr, variants]
const PRODUCTS = [
  ['lingettes-demaquillantes', 'Lingettes démaquillantes', 'Makeup-remover cloths', 2100, 'rituel',
    'Paquet de 5 lingettes démaquillantes.', 'Pack of 5 makeup-remover cloths.', null, 1, null, null],
  ['bougie-camphre-cachemire', 'Bougie Camphre + Cachemire', 'Camphor + Cashmere candle', 2500, 'ralentir',
    "Une fragrance douce et enveloppante, subtilement vanillée et profondément chaleureuse, pensée pour transformer chaque instant en un cocon intime, apaisant et élégant. Notes de tête : framboise, eau de coco. Notes de cœur : sapin, camphre, lavande fraîche, jasmin. Notes de fond : vanille, bois, cachemire.",
    'A soft, enveloping fragrance, subtly vanilla and deeply warm, made to turn any moment into an intimate, soothing cocoon. Top: raspberry, coconut water. Heart: fir, camphor, fresh lavender, jasmine. Base: vanilla, wood, cashmere.',
    assets.prodBougieCamphre, 1, null, null],
  ['serviette-cheveu-boho', 'Serviette cheveu Boho', 'Boho hair towel', 4100, 'rituel', '', '', assets.prodServietteBoho, 1, null, null],
  ['tisane-a-la-lavande', 'Tisane à la lavande', 'Lavender herbal tea', 2295, 'ralentir',
    "La tisane à la lavande est fabriquée à partir des bourgeons de la fleur de lavande infusés dans de l'eau chaude. Pourpre et violette, avec un parfum incomparable, la lavande est l'une des herbes préférées du monde. Depuis des siècles, elle est utilisée en aromathérapie pour son effet calmant et sa capacité à réduire l'anxiété.",
    'Lavender tea is made from lavender buds infused in hot water. Purple and violet, with an incomparable scent, lavender is one of the world’s best-loved herbs, used for centuries in aromatherapy for its calming effect and its ability to reduce anxiety.',
    assets.prodTisaneLavande, 1, null, null],
  ['beurre-hydratant-cuccio', 'Beurre Hydratant Cuccio', 'Cuccio body butter', 1695, 'rituel',
    "Transformez votre peau en une peau soyeuse et lisse avec ces mélanges de beurres corporels. Une peau extra douce de longue durée grâce à des formules hydratantes à libération prolongée 24 heures. Format : 4 oz.",
    'Turn your skin silky and smooth with these body-butter blends. Extra-soft skin that lasts, thanks to 24-hour slow-release hydrating formulas. Size: 4 oz.',
    null, 1, J('Parfum', 'Scent'), JSON.stringify(['Grenade & Figue', 'Limette & Aloe Vera', 'Miel & Lait'])],
  ['bain-moussant-maree', 'Bain moussant — Marée', 'Marée bubble bath', 2499, 'rituel',
    "Un bain moussant formulé avec des ingrédients sains et hydratants qui créent une mousse généreuse. Enrichi d'avoine apaisante, d'argile et d'aloe vera, il laisse la peau douce, souple et nourrie. Format 340 g, donne environ 7 bains.",
    'A bubble bath formulated with healthy, hydrating ingredients that create a generous foam. Enriched with soothing oat, clay and aloe vera, it leaves skin soft, supple and nourished. 340 g, about 7 baths.',
    null, 1, J('Parfum', 'Scent'), JSON.stringify(['Cèdre baie de genévrier', 'Orange', 'Hibiscus'])],
  ['exfoliant-peche-framboise', 'Exfoliant de corps au sucre — Pêche & Framboise', 'Sugar body scrub — Peach & Raspberry', 2850, 'rituel',
    "Un exfoliant naturel et végan au sucre, parfum pêche et framboise, signé Cocooning Love. 250 g. Conçu pour une utilisation sous la douche, ce soin adoucit, lisse la peau, uniformise son apparence et contribue à diminuer les marques.",
    'A natural, vegan sugar scrub with peach and raspberry, by Cocooning Love. 250 g. Made for use in the shower, it softens and smooths the skin, evens its appearance and helps reduce marks.',
    null, 1, null, null],
  ['bruine-dambiance-ciao-bella', "Bruine d'ambiance Ciao Bella", 'Ciao Bella room mist', 2200, 'ralentir',
    "Le moyen idéal d'apporter élégance et éclat à vos espaces préférés. Avec ses notes délicates de jasmin, de violette, de cèdre et d'agrumes, Ciao Bella offre un mélange équilibré de douceur florale, de zeste frais et de chaleur boisée.",
    'The ideal way to bring elegance and glow to your favourite spaces. With delicate notes of jasmine, violet, cedar and citrus, Ciao Bella offers a balanced blend of floral softness, fresh zest and woody warmth.',
    null, 1, null, null],
  ['verre-a-cocktail-fleurs', 'Verre à cocktail fleurs', 'Floral cocktail glass', 2495, 'offrir', '', '', null, 1, null, null],
  ['tasse-fleurs-gravees', 'Tasse fleurs gravées', 'Engraved floral mug', 2095, 'offrir', '', '', null, 1, null, null],
  ['bougie-amore', 'Bougie Amore', 'Amore candle', 2800, 'offrir', '', '', null, 1, null, null],
  ['bougie-musea', 'Bougie Musea', 'Musea candle', 3400, 'offrir', '', '', null, 1, null, null],
  ['huile-parfumee-diffuseur', 'Huile parfumée pour diffuseur', 'Fragrance oil for diffuser', 1685, 'ralentir', '', '',
    null, 1, J('Parfum', 'Scent'), JSON.stringify(['Citrouille Heirloom'])],
  ['palo-santo', 'Palo Santo', 'Palo Santo', 999, 'ralentir', '', '', assets.prodPaloSanto, 1, null, null],
  ['bandeau-boho', 'Bandeau Boho', 'Boho headband', 1500, 'me-choisir', '', '', assets.prodBandeauBoho, 1, null, null],
  ['chouchou-boho', 'Chouchou Boho', 'Boho scrunchie', 1000, 'me-choisir', '', '', null, 1, null, null],
  ['cahier-de-notes', 'Cahier de notes', 'Notebook', 1999, 'offrir', '', '', null, 1, null, null],
  ['bougie-rose-champagne', 'Bougie Rose + Champagne', 'Rose + Champagne candle', 2500, 'offrir', '', '', null, 1, null, null],
  ['mini-bain-moussant-rose-champagne', 'Mini bain moussant : Rose + Champagne', 'Mini bubble bath: Rose + Champagne', 1200, 'rituel', '', '', null, 1, null, null],
  ['gel-massage-terragel', 'Gel de massage TerraGel 100 % pur', 'TerraGel 100% pure massage gel', 1998, 'rituel', '', '', null, 0, null, null],
  ['cuccio-hydratation-grenade-figue', 'Cuccio Hydratation — Grenade & figue', 'Cuccio Hydration — Pomegranate & fig', 4999, 'rituel', '', '', null, 0, null, null],
  ['gant-exfoliant-rose', 'Gant Exfoliant rose', 'Pink exfoliating glove', 1198, 'rituel', '', '', null, 1, null, null],
  ['sel-de-bain-lavande', 'Sel de bain à la lavande', 'Lavender bath salt', 995, 'rituel', '', '', null, 1, null, null],
  ['eau-de-linge-lavande', 'Eau de linge 250 ml — Lavande', 'Linen water 250 ml — Lavender', 2395, 'ralentir', '', '', null, 1, null, null],
  ['bougie-orange-lavande', 'Bougie Orange Lavande', 'Orange Lavender candle', 2295, 'ralentir', '', '', null, 1, null, null],
  ['bougie-lavande-pure', 'Bougie Lavande Pure', 'Pure Lavender candle', 2495, 'ralentir', '', '', null, 1, null, null],
  ['bougie-poire-canneberges', 'Bougie Poire & Canneberges', 'Pear & Cranberry candle', 2495, 'offrir', '', '', null, 0, null, null],
  ['serum-gel-visage-vitamine-c', 'Sérum Gel visage — Vitamine C, Acide Hyaluronique & Niacinamide', 'Face gel serum — Vitamin C, Hyaluronic Acid & Niacinamide', 3350, 'me-choisir', '', '', null, 1, null, null],
];

const POSTS = [
  ['rituel-bain-fait-main', 'Rituel bain FAIT MAIN 🛀 : un moment cocooning pour se reconnecter à soi',
    'The FAIT MAIN bath ritual 🛀: a cocooning moment to reconnect with yourself',
    "Le Rituel de bain FAIT MAIN… un moment de douceur. Dans nos vies trépidantes, il est facile d'oublier de prendre soin de soi.",
    'The FAIT MAIN bath ritual… a moment of softness. In our busy lives, it is easy to forget to take care of ourselves.',
    '2025-08-13', assets.blogRituelBain],
  ['ce-soir-on-mange-favuzzi', 'Ce soir on mange Favuzzi !', 'Tonight we eat Favuzzi!',
    "Vous le savez, je suis une épicurienne. Les pâtes, les pizzas, les ragoûts, les pains, les salades, les vins, les huiles d'olive…",
    'As you know, I am an epicurean. Pasta, pizza, stews, breads, salads, wines, olive oils…',
    '2024-06-23', assets.blogFavuzzi],
  ['pains-plats-facon-fait-main', 'Pains plats faciles façon Fait Main — une de mes recettes bien-être préférées',
    'Easy Fait Main flatbreads — one of my favourite wellness recipes',
    "Je suis une gourmande. Je l'avoue et je l'assume. Je suis une épicurienne à ma façon.",
    'I love good food. I admit it and I own it. I am an epicurean in my own way.',
    '2024-04-15', assets.blogPainsPlats],
];

module.exports = async function (db) {
  // ---- Settings -----------------------------------------------------------
  const settings = {
    business_name: 'Fait Main Massothérapie',
    tagline: J('Massothérapie, esthétique & boutique bien-être · Mirabel', 'Massage therapy, skin care & wellness shop · Mirabel'),
    hero_title: J('Offrez-vous un moment de bien-être qui fait vraiment du bien.', 'Give yourself a moment of well-being that truly does you good.'),
    hero_subtitle: J('Des soins et des produits choisis avec cœur pour ralentir, se déposer et se reconnecter à soi.', 'Treatments and products chosen with care, to slow down, settle and reconnect with yourself.'),
    signature_line: J('Ralentir. Se déposer. Se reconnecter à soi.', 'Slow down. Settle. Reconnect with yourself.'),
    story_title: J('Derrière Fait Main 🌿', 'Behind Fait Main 🌿'),
    story_text: J(
      "Fait Main est né d'un désir profond : celui d'offrir un espace où l'on peut simplement ralentir… et se retrouver.\n\nAu fil du temps, j'ai compris que prendre soin du corps, ce n'est pas seulement une question d'esthétique ou de détente. C'est une façon de se reconnecter à soi, de relâcher ce qu'on porte pour revenir à l'essentiel.\n\nChaque soin que j'offre, chaque produit que je choisis, est pensé avec cette intention : apporter du vrai, du doux, du réconfortant. Parce que dans le quotidien, on donne beaucoup. On pense à tout, à tout le monde… et souvent, on s'oublie.\n\nFait Main est là pour ça. Pour vous offrir un moment qui vous appartient. Un moment pour respirer, pour vous déposer, pour vous sentir bien — vraiment.\n\n💛 Annie",
      "Fait Main was born from a deep wish: to offer a place where you can simply slow down… and find yourself again.\n\nOver time I understood that caring for the body is not only about beauty or relaxation. It is a way of reconnecting with yourself, of letting go of what you carry to come back to what matters.\n\nEvery treatment I give, every product I choose, is thought through with that intention: to bring something real, soft and comforting. Because day to day, we give a great deal. We think of everything, of everyone… and we often forget ourselves.\n\nThat is what Fait Main is for. To offer you a moment that belongs to you. A moment to breathe, to settle, to feel good — truly.\n\n💛 Annie"),
    about_title: J('Annie Bouchard', 'Annie Bouchard'),
    about_role: J('Propriétaire & massothérapeute', 'Owner & massage therapist'),
    about_text: J(
      "Quel bonheur que de travailler en massothérapie! Je dirais plus que du bonheur, mais surtout une grande passion du corps et de l'esprit.\n\nJ'ai toujours cherché à apporter le bien-être autour de moi. À travers la massothérapie, j'ai trouvé l'équilibre parfait que je partage aujourd'hui avec les membres de mon équipe pour qu'à travers eux, vous ressentiez tout le bien-être Fait Main.",
      "What a joy it is to work in massage therapy. More than joy, really — a deep passion for the body and the mind.\n\nI have always tried to bring well-being to those around me. Through massage therapy I found the perfect balance, which I share today with my team so that through them, you feel everything Fait Main stands for."),
    approach_text: J(
      "Notre équipe offre des massages suédois, thérapeutiques et sportifs, mêlant techniques de relaxation extra et intra-musculaire. Nous aimons travailler avec les huiles essentielles et les rubéfiants pour favoriser votre bien-être tout en optimisant l'efficacité des soins.",
      'Our team offers Swedish, therapeutic and sports massage, combining extra- and intra-muscular relaxation techniques. We like working with essential oils and rubefacients to support your well-being while making each treatment more effective.'),
    diplomas_text: J(
      "Chez Fait Main Massothérapie, tous les massothérapeutes qui prennent soin de vous détiennent un diplôme reconnu par une association professionnelle en massothérapie. Ainsi, pour chaque visite, un reçu d'assurance vous sera remis.",
      'At Fait Main Massothérapie, every therapist who takes care of you holds a diploma recognised by a professional massage-therapy association. An insurance receipt is issued for every visit.'),
    zen_text: J(
      "Nous vous accueillons dans une ambiance chaleureuse offerte uniquement chez nous. Profitez d'un espace relaxant où thé et eau citronnée sont à votre disposition. Votre expérience détente débute dès votre arrivée.",
      'We welcome you into a warm atmosphere you will find only here. Enjoy a relaxing space where tea and lemon water are waiting for you. Your moment of calm begins the second you arrive.'),
    qualifications_text: J(
      "Les compétences des membres de notre équipe sont variées et nombreuses : kinésithérapie, massage aux ventouses, taping sportif, réflexologie, pierres chaudes et plus encore. Nos massothérapeutes tiennent à cœur votre santé globale.",
      'Our team’s skills are many and varied: kinesitherapy, cupping massage, sports taping, reflexology, hot stones and more. Our therapists genuinely care about your overall health.'),
    esthetique_intro: J(
      "Tous nos soins d'esthétique sont conçus pour sublimer votre beauté naturelle, tout en vous offrant une expérience chaleureuse et relaxante.",
      'All our skin-care treatments are designed to enhance your natural beauty while giving you a warm, relaxing experience.'),
    esthetique_text: J(
      "Prendre soin de votre peau est bien plus qu'un service : c'est une promesse. Nos esthéticiennes sont formées, diplômées, attentionnées et profondément engagées à vous offrir une expérience personnalisée et chaleureuse. Chaque soin du visage est pensé pour répondre aux besoins uniques de votre peau, dans une atmosphère apaisante où vous pouvez réellement décrocher.\n\nQu'il s'agisse d'un soin éclat, d'un traitement ciblé ou simplement d'un moment pour vous reconnecter à vous-même, nous vous accueillons avec douceur et professionnalisme. Bienvenue dans votre espace beauté et bien-être. ✨",
      'Caring for your skin is much more than a service: it is a promise. Our estheticians are trained, qualified, attentive and deeply committed to giving you a personalised, warm experience. Every facial is designed around the unique needs of your skin, in a calm atmosphere where you can genuinely switch off.\n\nWhether it is a glow treatment, a targeted one, or simply a moment to reconnect with yourself, we welcome you with gentleness and professionalism. Welcome to your beauty and well-being space. ✨'),
    epilation_intro: J(
      "Parce que prendre soin de soi passe aussi par l'épilation — dans un environnement où le respect, la discrétion et le confort sont au cœur de l'expérience.",
      'Because self-care includes hair removal — in a setting where respect, discretion and comfort are at the heart of the experience.'),
    corps_intro: J(
      "Nos soins du corps favorisent la détente musculaire et nerveuse, la diminution du stress et des tensions, l'amélioration de la circulation et une sensation globale de légèreté et de bien-être. Plus qu'un soin, c'est une expérience qui se prolonge bien au-delà de votre visite.",
      'Our body treatments support muscular and nervous relaxation, reduce stress and tension, improve circulation and bring an overall feeling of lightness and well-being. More than a treatment, it is an experience that continues well beyond your visit.'),
    ongles_intro: J('Tous vos services d’ongles personnalisés sous un même toit.', 'All your personalised nail services under one roof.'),
    location_intro: J(
      "Un espace lumineux, zen et accueillant, pensé pour favoriser la connexion, le bien-être et l'apprentissage 🌿",
      'A bright, calm and welcoming space, designed to encourage connection, well-being and learning 🌿'),
    location_text: J(
      "Que ce soit pour une réunion, une conférence, un atelier, un cercle de femmes ou une formation, notre espace s'adapte à votre vision.",
      'Whether it is a meeting, a talk, a workshop, a women’s circle or a training session, our space adapts to your vision.'),
    location_perks: J(
      "Jusqu'à 12 à 15 personnes\nTélévision pour vos présentations\nInternet haute vitesse\nThé & café pour une expérience chaleureuse (en extra)\nPossibilité de traiteur (en extra)",
      'Up to 12–15 people\nTelevision for your presentations\nHigh-speed internet\nTea & coffee for a warm welcome (extra)\nCatering available (extra)'),
    boutique_intro: J('Magasinez selon votre envie du moment.', 'Shop the mood you are in.'),
    boutique_text: J(
      "Des produits d'ici, choisis avec intention pour créer de vrais moments de bien-être. Laissez-vous guider… votre moment commence ici.",
      'Local products, chosen with intention to create real moments of well-being. Let yourself be guided — your moment starts here.'),
    local_products_text: J(
      "Nous encourageons les produits locaux. Chez Fait Main Massothérapie, nous vous présentons uniquement des produits aux résultats bénéfiques éprouvés.",
      'We champion local products. At Fait Main Massothérapie we only carry products with proven benefits.'),
    contact_intro: J(
      "Passez nous dire bonjour! Notre boutique est ouverte au public durant nos heures d'ouverture. Contactez-nous en cas de question. Au plaisir!",
      'Come say hello. Our shop is open to the public during opening hours. Get in touch with any question — we would love to hear from you.'),
    hours_note: J('Nos heures varient pour mieux vous servir.', 'Our hours vary so we can serve you better.'),
    reservation_intro: J(
      "Prenez un moment pour vous : votre corps et votre esprit vous diront merci. Chez Fait Main Massothérapie, nous prenons le temps qu'il faut pour échanger avec vous — le temps nécessaire pour favoriser une détente optimale.",
      'Take a moment for yourself — your body and mind will thank you. At Fait Main Massothérapie we take the time to talk with you, the time it takes for real relaxation.'),
    stress_effects: J(
      "Maux de tête\nTension ou douleur musculaire\nDouleurs thoraciques\nAugmentation de la fréquence cardiaque et de la pression artérielle\nAffaiblissement du système immunitaire\nFatigue, insomnie",
      'Headaches\nMuscle tension or pain\nChest pain\nIncreased heart rate and blood pressure\nWeakened immune system\nFatigue, insomnia'),
    privacy_notice: J(
      "Ce site recueille vos coordonnées afin de traiter votre message ou votre commande. Votre espace personnel vous permet de retrouver vos commandes. Ne transmettez aucun renseignement de santé par ce formulaire. Les paiements en ligne sont traités par PayPal : aucun numéro de carte n'est enregistré sur ce site. Communiquez avec l'entreprise pour toute question concernant vos renseignements.",
      'This site collects your contact details in order to handle your message or your order. Your personal space lets you find your orders again. Please do not send health information through this form. Online payments are processed by PayPal: no card number is stored on this site. Contact the business with any question about your information.'),
    payment_terms: J('', ''),
    // Owner-controlled gates. Everything that speaks for the business or spends
    // money stays off until Annie confirms it from the admin area.
    contact_verified: '0', address_verified: '0', hours_verified: '0',
    privacy_approved: '0', messages_enabled: '0',
    payments_enabled: '0', payment_terms_approved: '0', live_actions_enabled: '0',
    shipping_enabled: '0',
    free_shipping_threshold_cents: '7500',
    shipping_flat_cents: '',
    gst_rate_bp: '500', qst_rate_bp: '998',
    gst_number: '', qst_number: '',
    booking_url: 'https://www.faitmainmassotherapie.com/book-online',
    booking_url_verified: '0',
    _p_hero_image_url: assets.heroMassage,
    _p_story_image_url: assets.anniePortrait,
    _p_about_image_url: assets.anniePortraitChair,
    _p_location_image_url: assets.salleLocation,
    _p_contact_image_url: assets.eucalyptus,
    _p_banner_massotherapie_url: assets.bannerMassage,
    _p_banner_esthetique_url: assets.bannerEsthetique,
    _p_banner_ongles_url: assets.bannerOngles,
    _p_banner_corps_url: assets.bannerCorps,
    _p_banner_forfaits_url: assets.bannerForfaits,
    _p_banner_equipe_url: assets.bannerEquipe,
    _p_collection_ralentir_url: assets.shopSlow,
    _p_collection_offrir_url: assets.shopGift,
    _p_collection_me_choisir_url: assets.shopSelf,
    _p_collection_rituel_url: assets.shopRitual,
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.run('INSERT INTO admin_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING', [key, String(value)]);
  }

  // ---- Treatments ---------------------------------------------------------
  for (let i = 0; i < SERVICES.length; i++) {
    const [slug, family, name, nameEn, desc, descEn, dur, durEn, price, from] = SERVICES[i];
    await db.run(
      'INSERT INTO services(slug,family,name,name_en,description,description_en,duration_label,duration_label_en,price_cents,price_from,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11 WHERE NOT EXISTS(SELECT 1 FROM services WHERE slug=$1)',
      [slug, family, name, nameEn, desc, descEn, dur, durEn, price, from, i + 1],
    );
  }
  // Treatments shown on the home page.
  for (const slug of ['massage-detente', 'facial-essentiel', 'maderotherapie-silhouette', 'reflexologie-des-pieds'])
    await db.run('UPDATE services SET featured=1 WHERE slug=$1', [slug]);

  // ---- Packages -----------------------------------------------------------
  for (let i = 0; i < PACKAGES.length; i++) {
    const [slug, name, nameEn, sum, sumEn, val, valEn, price, popular, perks, perksEn] = PACKAGES[i];
    await db.run(
      'INSERT INTO packages(slug,name,name_en,summary,summary_en,validity,validity_en,price_cents,popular,perks,perks_en,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12 WHERE NOT EXISTS(SELECT 1 FROM packages WHERE slug=$1)',
      [slug, name, nameEn, sum, sumEn, val, valEn, price, popular, JSON.stringify(perks), JSON.stringify(perksEn), i + 1],
    );
  }

  // ---- Products -----------------------------------------------------------
  for (let i = 0; i < PRODUCTS.length; i++) {
    const [slug, name, nameEn, price, collection, desc, descEn, image, inStock, variantLabel, variants] = PRODUCTS[i];
    await db.run(
      'INSERT INTO products(slug,name,name_en,price_cents,collection,description,description_en,image_url,in_stock,variant_label,variants,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12 WHERE NOT EXISTS(SELECT 1 FROM products WHERE slug=$1)',
      [slug, name, nameEn, price, collection, desc, descEn, image, inStock, variantLabel, variants, i + 1],
    );
  }
  for (const slug of ['bougie-camphre-cachemire', 'tisane-a-la-lavande', 'serviette-cheveu-boho', 'palo-santo'])
    await db.run('UPDATE products SET featured=1 WHERE slug=$1', [slug]);

  // ---- Opening hours (imported, shown as unconfirmed until Annie validates) -
  const HOURS = [[1, '09:00', '20:00', 0], [2, '09:00', '20:00', 0], [3, '07:30', '20:00', 0],
    [4, '09:00', '20:00', 0], [5, '09:00', '16:00', 0], [6, '09:00', '14:00', 0], [7, '', '', 1]];
  for (const r of HOURS) await db.run('INSERT INTO hours(weekday,opens,closes,closed) VALUES($1,$2,$3,$4) ON CONFLICT(weekday) DO NOTHING', r);

  // ---- Journal ------------------------------------------------------------
  // Only the titles, dates, images and opening lines were importable. The full
  // bodies are left empty on purpose — Annie pastes them in from /admin/posts.
  for (let i = 0; i < POSTS.length; i++) {
    const [slug, title, titleEn, excerpt, excerptEn, day, image] = POSTS[i];
    await db.run(
      'INSERT INTO posts(slug,title,title_en,excerpt,excerpt_en,published_on,image_url,published,sort_order) '
      + 'SELECT $1,$2,$3,$4,$5,$6,$7,1,$8 WHERE NOT EXISTS(SELECT 1 FROM posts WHERE slug=$1)',
      [slug, title, titleEn, excerpt, excerptEn, day, image, i + 1],
    );
  }
};
