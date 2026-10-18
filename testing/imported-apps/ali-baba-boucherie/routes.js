// Homepage menu cache. Module scope on purpose: the platform calls the
// exported factory on every request but keeps this module loaded, so state
// kept here lasts across requests (and resets on each deploy).
const crMenuCache = { menu: null, nextAt: 0, pending: null };

module.exports = function(services) {
  const express = require('express');
  const router = express.Router();
  const db = services.db;

  const T = {
    fr: {
      brand: 'Ali Baba Grillades',
      enable_notif: 'Activer les notifications',
      hero_subtitle: 'Grillades libanaises sur charbon de bois à Blainville. Boucherie, brochettes taouk & kafta, filet mignon, côtelettes d\'agneau et tartares — préparés à la commande.',
      menu_title: 'Notre menu', menu_subtitle: "Des viandes fraîches de notre boucherie, marinées maison et grillées sur charbon de bois. Servies en assiette ou en sandwich, avec houmous, pita épicé et sauce à l'ail.",
      no_menu: 'Le menu sera bientôt disponible.',
      footer_rights: 'Tous droits réservés',
      contact_us: 'Nous joindre',
      open_hours: 'Heures d\'ouverture', phone: 'Téléphone', email: 'Courriel',
      day_mon: 'Lundi', day_tue: 'Mardi', day_wed: 'Mercredi', day_thu: 'Jeudi', day_fri: 'Vendredi', day_sat: 'Samedi', day_sun: 'Dimanche',
      closed: 'Fermé'
    },
    en: {
      brand: 'Ali Baba Grillades',
      enable_notif: 'Enable notifications',
      hero_subtitle: 'Lebanese charcoal grill in Blainville. Butcher shop, taouk & kafta skewers, filet mignon, lamb chops and tartares — made to order.',
      menu_title: 'Our menu', menu_subtitle: 'Fresh meats from our butcher counter, house-marinated and grilled over wood charcoal. Served on a platter or in a sandwich, with hummus, spiced pita and garlic sauce.',
      no_menu: 'Menu coming soon.',
      footer_rights: 'All rights reserved',
      contact_us: 'Contact us',
      open_hours: 'Hours', phone: 'Phone', email: 'Email',
      day_mon: 'Monday', day_tue: 'Tuesday', day_wed: 'Wednesday', day_thu: 'Thursday', day_fri: 'Friday', day_sat: 'Saturday', day_sun: 'Sunday',
      closed: 'Closed'
    }
  };
  function formatPrice(p) { if (p == null || p === '') return ''; return Number(p).toFixed(2) + ' $'; }

  // Fallback for the homepage slider, used only when the command.restaurant
  // menu feed could not be read yet (see homepageMenu below). Snapshot of the
  // Liasse Restaurants export from 2026-06-19. Image URLs carry a Cloudinary
  // w_640,h_480,c_fill transform so the slider stays light.
  const MENU_PREVIEW = {
    "categories": [
      "Assiettes",
      "Entrées",
      "Sandwichs",
      "Tartares",
      "Breuvages",
      "Dessert"
    ],
    "items": [
      {
        "id": "ab1",
        "name": "Poulet sur charbon en crapaudine",
        "price": 25.99,
        "category": "Assiettes",
        "description": "Poulet entier en crapaudine, grillé sur charbon de bois.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898961/tapavis_menu/296/zkpkruhfiq2vqdzvisx0.jpg"
      },
      {
        "id": "ab2",
        "name": "Mix",
        "price": 32,
        "category": "Assiettes",
        "description": "Taouk, kafta et filet mignon grillés sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898959/tapavis_menu/296/l6qrlo9ykavj0wszyh2c.jpg"
      },
      {
        "id": "ab3",
        "name": "Filet mignon",
        "price": 39,
        "category": "Assiettes",
        "description": "Bœuf tendre grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898960/tapavis_menu/296/w9hcgfmjapohgaglmm4a.jpg"
      },
      {
        "id": "ab4",
        "name": "Kafta",
        "price": 30,
        "category": "Assiettes",
        "description": "Bœuf haché, persil, oignon et épices, grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898962/tapavis_menu/296/pwmlbzi4kkrjrn6aazi0.jpg"
      },
      {
        "id": "ab5",
        "name": "Taouk",
        "price": 32,
        "category": "Assiettes",
        "description": "Poitrine de poulet marinée, grillée sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898962/tapavis_menu/296/iruy1v5h35zxwriqzabi.jpg"
      },
      {
        "id": "ab6",
        "name": "Makanek",
        "price": 32,
        "category": "Assiettes",
        "description": "Saucisses libanaises non piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898963/tapavis_menu/296/qoo2efrlejjtvlbodfzh.jpg"
      },
      {
        "id": "ab7",
        "name": "Côtelettes d'agneau",
        "price": 40,
        "category": "Assiettes",
        "description": "Côtelettes d'agneau grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898966/tapavis_menu/296/yt9pwpwp02y7vnrcxkm3.jpg"
      },
      {
        "id": "ab8",
        "name": "Soujouk",
        "price": 32,
        "category": "Assiettes",
        "description": "Saucisses arméniennes piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898965/tapavis_menu/296/fpruetusiyssanepfoea.jpg"
      },
      {
        "id": "ab9",
        "name": "Merguez",
        "price": 32,
        "category": "Assiettes",
        "description": "Saucisses marocaines non piquantes, grillées sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898964/tapavis_menu/296/rxbuefnkkkmleg7prcjl.jpg"
      },
      {
        "id": "ab10",
        "name": "Foie de veau de grain",
        "price": 35,
        "category": "Assiettes",
        "description": "Foie de veau de grain grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061818/tapavis_menu/296/foie_de_veau_de_grain_1782061816066.png"
      },
      {
        "id": "ab11",
        "name": "Agneau qc. en cubes",
        "price": 40,
        "category": "Assiettes",
        "description": "Agneau du Québec en cubes, grillé sur charbon. Servi avec légumes grillés, pain pita épicé, houmous et sauce à l'ail. ½ kg ou 1 kg.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061816/tapavis_menu/296/agneau_qc_en_cubes_1782061814979.png"
      },
      {
        "id": "ab12",
        "name": "Babaghanouge",
        "price": 7.5,
        "category": "Entrées",
        "description": "Caviar d'aubergine grillée au tahini, citron et ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061795/tapavis_menu/296/babaghanouge_1782061794032.png"
      },
      {
        "id": "ab13",
        "name": "Patates à l'ail",
        "price": 4.99,
        "category": "Entrées",
        "description": "Pommes de terre sautées à l'ail et coriandre. Format petit ou grand.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061795/tapavis_menu/296/patates_a_l_ail_1782061793656.png"
      },
      {
        "id": "ab14",
        "name": "Riz",
        "price": 3.99,
        "category": "Entrées",
        "description": "Riz libanais parfumé. Format petit ou grand.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061828/tapavis_menu/296/riz_1782061826840.png"
      },
      {
        "id": "ab15",
        "name": "Hommous",
        "price": 7.5,
        "category": "Entrées",
        "description": "Purée de pois chiches au tahini, citron et huile d'olive. Format petit ou grand.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061793/tapavis_menu/296/hommous_1782061791979.png"
      },
      {
        "id": "ab16",
        "name": "Fattouche",
        "price": 4.99,
        "category": "Entrées",
        "description": "Salade de légumes croquants et pain pita grillé, vinaigrette au sumac.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782062416/tapavis_menu/296/fattouche_1782062414159.png"
      },
      {
        "id": "ab17",
        "name": "Taboulé",
        "price": 4.99,
        "category": "Entrées",
        "description": "Salade de persil, boulgour, tomate et menthe, citron et huile d'olive.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782062428/tapavis_menu/296/taboule_1782062426682.png"
      },
      {
        "id": "ab18",
        "name": "Sauce à l'ail",
        "price": 7.5,
        "category": "Entrées",
        "description": "Notre sauce à l'ail maison, crémeuse et généreuse.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061795/tapavis_menu/296/sauce_a_l_ail_1782061794060.png"
      },
      {
        "id": "ab19",
        "name": "Pain pita épicé",
        "price": 3.57,
        "category": "Entrées",
        "description": "Pain pita moyen assaisonné de sauce piquante et d'oignons, le tout grillé.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782062440/tapavis_menu/296/pain_pita_epice_1782062438515.png"
      },
      {
        "id": "ab20",
        "name": "Sac de 5 pitas moyennes",
        "price": 2.5,
        "category": "Entrées",
        "description": "Sac de 5 pains pita moyens.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782062655/tapavis_menu/296/dgjoct5idueftu4qfxxs.jpg"
      },
      {
        "id": "ab21",
        "name": "Sandwich Shish taouk",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Poitrine de poulet marinée, grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898972/tapavis_menu/296/zxacvy75nmtgrcl0jd1t.jpg"
      },
      {
        "id": "ab22",
        "name": "Sandwich Filet mignon",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Filet mignon grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898973/tapavis_menu/296/okka7eig9hv5cczktkff.jpg"
      },
      {
        "id": "ab23",
        "name": "Sandwich Steak",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Steak grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898975/tapavis_menu/296/un8hwnr3asdhm68gpxho.jpg"
      },
      {
        "id": "ab24",
        "name": "Sandwich Kafta",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Brochette de bœuf haché, persil, oignon et épices, grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898974/tapavis_menu/296/ac30uszwyjejexi27bhr.jpg"
      },
      {
        "id": "ab25",
        "name": "Sandwich Makaneek",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Saucisses libanaises non piquantes, grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898977/tapavis_menu/296/suycuncj0ylxjb5qo3x4.jpg"
      },
      {
        "id": "ab26",
        "name": "Sandwich Soujouk",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Saucisses arméniennes piquantes, grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898977/tapavis_menu/296/klmcglqmwktai6dbdm1d.jpg"
      },
      {
        "id": "ab27",
        "name": "Sandwich Arayes",
        "price": 12.99,
        "category": "Sandwichs",
        "description": "Pain pita farci de kafta et grillé sur charbon, croustillant. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898978/tapavis_menu/296/eqcby2c0p8avm0lmxdde.jpg"
      },
      {
        "id": "ab28",
        "name": "Sandwich Foie",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Foie grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061807/tapavis_menu/296/sandwich_foie_1782061805486.png"
      },
      {
        "id": "ab29",
        "name": "Sandwich Crevettes",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Crevettes grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061806/tapavis_menu/296/sandwich_crevettes_1782061804583.png"
      },
      {
        "id": "ab30",
        "name": "Hamburger",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Galette de bœuf grillée sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061808/tapavis_menu/296/hamburger_1782061806892.png"
      },
      {
        "id": "ab31",
        "name": "Sandwich Agneau",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Agneau grillé sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061808/tapavis_menu/296/sandwich_agneau_1782061806619.png"
      },
      {
        "id": "ab32",
        "name": "Sandwich Merguez",
        "price": 9.99,
        "category": "Sandwichs",
        "description": "Saucisses marocaines non piquantes, grillées sur charbon. Garni de tomate, cornichon, oignon, houmous ou sauce à l'ail.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782061818/tapavis_menu/296/sandwich_merguez_1782061815915.png"
      },
      {
        "id": "ab33",
        "name": "Boeuf (tartare)",
        "price": 9.5,
        "category": "Tartares",
        "description": "Tartare de bœuf libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899013/tapavis_menu/296/yyhhj3jhqznnjyqmujre.jpg"
      },
      {
        "id": "ab34",
        "name": "Agneau (tartare)",
        "price": 9.99,
        "category": "Tartares",
        "description": "Tartare d'agneau libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899015/tapavis_menu/296/i86zl9dfmhfnf1widnya.jpg"
      },
      {
        "id": "ab35",
        "name": "Veau (tartare)",
        "price": 9.5,
        "category": "Tartares",
        "description": "Tartare de veau libanais. Styles tablé, kebbeh, kafta ou malsé. Sandwich ou au kilo.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781899014/tapavis_menu/296/f4zigtnpkzxgxttfvngu.jpg"
      },
      {
        "id": "ab36",
        "name": "Pepsi",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063139/tapavis_menu/296/x7whccqlumhpcdenctur.jpg"
      },
      {
        "id": "ab37",
        "name": "Pepsi Diète",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063175/tapavis_menu/296/jtqhze789mplbs2etd5f.jpg"
      },
      {
        "id": "ab38",
        "name": "Coca-Cola",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063303/tapavis_menu/296/gs2kjjq1k8le6dvuu4rh.jpg"
      },
      {
        "id": "ab39",
        "name": "7 UP",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063329/tapavis_menu/296/nie5drrrzijmhovts7ha.jpg"
      },
      {
        "id": "ab40",
        "name": "Crush",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063354/tapavis_menu/296/pfdafxggjox2pculd1ui.jpg"
      },
      {
        "id": "ab41",
        "name": "Bouteille d'Eau",
        "price": 3.25,
        "category": "Breuvages",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063406/tapavis_menu/296/pf1xgiqhcdqgxmlbgabv.jpg"
      },
      {
        "id": "ab42",
        "name": "Ayrane",
        "price": 4.5,
        "category": "Breuvages",
        "description": "Boisson lactée rafraîchissante à base de yogourt.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1782063412/tapavis_menu/296/py7om9aueqptdelwfyom.jpg"
      },
      {
        "id": "ab43",
        "name": "Mélange de Baklava",
        "price": 9.86,
        "category": "Dessert",
        "description": "10 morceaux de baklavas frais.",
        "imageUrl": "https://media.liasse.tech/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/v1781898981/tapavis_menu/296/bor0dhsbt3tdtyx1xzpk.jpg"
      }
    ]
  };
  const MENU_PREVIEW_CAT_EN = {"Entrées":"Starters","Sandwichs":"Sandwiches","Tartares":"Tartares","Assiettes":"Platters","Breuvages":"Drinks","Dessert":"Desserts"};

  // The homepage slider shows the live command.restaurant menu, read from the
  // public feed its ordering page uses, so menu edits there reach the site
  // without a code change. Category order follows command.restaurant and
  // options are left out. Unavailable dishes stay listed; ordering enforces
  // availability anyway. The copy is kept 10 min and refreshed in the
  // background; a failed read keeps the last good copy and retries after a
  // minute.
  const CR_MENU_URL = 'https://order.command.restaurant/b/ali-baba-boucherie/order/menu.json';
  const CR_MENU_TTL_MS = 10 * 60 * 1000;
  const CR_MENU_RETRY_MS = 60 * 1000;
  const httpFetch = services.fetch || (typeof fetch === 'function' ? fetch : null);

  function sliderImage(url) {
    if (!url) return '';
    const s = String(url);
    // Images live on media.liasse.tech since 2026-10-18 (same /upload/ layout as Cloudinary had).
    if (s.indexOf('media.liasse.tech/upload/') !== -1) return s.replace(/\/upload\/(?!w_)/, '/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/');
    if (s.indexOf('res.cloudinary.com/') === -1) return url;
    return s.replace(/\/image\/upload\/(?!w_)/, '/image/upload/w_640,h_480,c_fill,g_auto,q_auto,f_auto/');
  }

  function previewFromFeed(feed) {
    const menu = feed && feed.menu;
    if (!menu || !Array.isArray(menu.items)) return null;
    const order = Array.isArray(menu.categoryOrder) ? menu.categoryOrder.slice() : [];
    const items = menu.items.filter(function(it) { return it && it.name; }).map(function(it) {
      const category = it.category || '';
      if (category && order.indexOf(category) === -1) order.push(category);
      return {
        id: it.id,
        name: it.name,
        price: it.price,
        category: category,
        description: String(it.description || '').replace(/\s+/g, ' ').trim(),
        imageUrl: sliderImage(it.imageUrl)
      };
    });
    if (items.length === 0) return null;
    function rank(c) { const i = order.indexOf(c); return i === -1 ? order.length : i; }
    items.sort(function(a, b) { return rank(a.category) - rank(b.category); });
    const categories = order.filter(function(c) { return items.some(function(it) { return it.category === c; }); });
    return { categories: categories, items: items };
  }

  async function loadCrMenu() {
    try {
      if (!httpFetch) throw new Error('fetch unavailable');
      const r = await httpFetch(CR_MENU_URL, { signal: AbortSignal.timeout(4000), headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const next = previewFromFeed(await r.json());
      if (!next) throw new Error('feed has no dishes');
      crMenuCache.menu = next;
      crMenuCache.nextAt = Date.now() + CR_MENU_TTL_MS;
    } catch (e) {
      console.error('[menu] command.restaurant feed:', e.message);
      crMenuCache.nextAt = Date.now() + CR_MENU_RETRY_MS;
    }
  }

  async function homepageMenu() {
    if (!crMenuCache.pending && Date.now() >= crMenuCache.nextAt) {
      crMenuCache.pending = loadCrMenu().then(function() { crMenuCache.pending = null; });
    }
    // Only the first read after a deploy is waited on (nextAt is still 0);
    // after that the page answers at once and refreshes behind the scenes.
    if (crMenuCache.pending && crMenuCache.nextAt === 0) await crMenuCache.pending;
    return crMenuCache.menu || MENU_PREVIEW;
  }

  const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
  function parseHours(raw) {
    if (!raw) return null;
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr)) return null;
      const byDay = {};
      for (const row of arr) {
        if (!row || !row.day) continue;
        byDay[String(row.day).toLowerCase()] = row;
      }
      return DAY_KEYS.map(function(d){
        const r = byDay[d] || {};
        return { day: d, open: r.open || '', close: r.close || '', closed: !!r.closed };
      });
    } catch(e) { return null; }
  }

  function resolveContactEmail(settings) {
    return (settings && (settings.admin_email || settings.contact_email)) || (services.config && services.config.contactEmail) || '';
  }

  async function getSettings() {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); return o; } catch(e) { return {}; }
  }

  function applyTextOverrides(t, settings, lang) {
    const suffix = '_' + lang;
    for (const k in settings) {
      if (k.indexOf('text_') === 0 && k.lastIndexOf(suffix) === k.length - suffix.length) {
        const tKey = k.slice(5, k.length - suffix.length);
        if (tKey) t[tKey] = settings[k];
      }
    }
    return t;
  }

  router.use(function(req, res, next) {
    let lang = (req.query && req.query.lang) || (req.cookies && req.cookies.pwa_lang) || 'fr';
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    if (req.query && (req.query.lang === 'fr' || req.query.lang === 'en')) {
      try { res.cookie('pwa_lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false }); } catch(e) {}
    }
    req.lang = lang;
    next();
  });

  // =========================================================================
  // Keychain attribution middlewares — MUST be registered BEFORE the route
  // handlers (Express middleware only applies to subsequent routes). Earlier
  // version had these below the page routes → never fired on the landing pages.
  // =========================================================================
  function tpath(req, sub) {
    return typeof req.tenantPath === 'function' ? req.tenantPath(sub) : sub;
  }

  // Step 1: capture ?keychain= into a year-long httpOnly cookie. Sanity-
  // checked shape so the URL can't poison the cookie. Verbose log so the
  // first reproduction attempt produces a clear breadcrumb in server logs.
  router.use(function captureKeychainCookie(req, res, next) {
    if (req.method === 'GET' && req.query && typeof req.query.keychain === 'string') {
      var k = req.query.keychain.trim();
      if (/^[A-Za-z0-9_-]{4,64}$/.test(k)) {
        try {
          res.cookie('keychain_attribution', k, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
          });
          console.log('[keychain-mw] captured keychain=' + k + ' path=' + req.path);
        } catch (e) {
          console.warn('[keychain-mw] cookie set failed:', e && e.message);
        }
      } else if (k) {
        console.warn('[keychain-mw] rejected malformed keychain param: ' + k);
      }
    }
    next();
  });

  // Step 2: post-auth attribution + upsell. services.auth.optionalAuth
  // populates req.user when a session exists. Wraps everything in try/catch
  // so a DB or email failure here can never break a page render.
  router.use(services.auth.optionalAuth, async function attributeKeychainOnLogin(req, res, next) {
    try {
      var hasUser = !!(req.user && req.user.id);
      var hasCookie = !!(req.cookies && req.cookies.keychain_attribution);
      // Verbose state log on EVERY non-asset, non-API request — only way to
      // see when the keychain cookie is present but req.user isn't (means
      // services.auth.optionalAuth didn't recognize the session). Filter out
      // assets/api so log volume stays sane. Remove once the flow is proven.
      if (
        req.method === 'GET' &&
        !req.path.startsWith('/api/') &&
        !req.path.includes('.')
      ) {
        var cookieKeys = req.cookies ? Object.keys(req.cookies) : [];
        console.log(
          '[keychain-mw:probe] path=' + req.path +
          ' hasUser=' + hasUser +
          ' hasCookie=' + hasCookie +
          ' cookies=[' + cookieKeys.join(',') + ']'
        );
      }
      if (!hasUser || !hasCookie) return next();

      const keychainId = req.cookies.keychain_attribution;
      const userId = req.user.id;

      // ON CONFLICT must include the partial-index WHERE clause to match
      // the schema's `keychain_visitors_user_keychain_idx ... WHERE user_id
      // IS NOT NULL`. Without it Postgres throws:
      //   "there is no unique or exclusion constraint matching the ON
      //    CONFLICT specification"
      // because a partial unique index requires the conflict target to
      // include the same predicate.
      const inserted = await db.run(
        `INSERT INTO keychain_visitors (user_id, email, full_name, keychain_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (user_id, keychain_id) WHERE user_id IS NOT NULL DO NOTHING
         RETURNING id`,
        [userId, req.user.email || null, req.user.full_name || req.user.name || null, keychainId]
      );
      // PgTenantDb.run returns { changes, lastInsertRowid } (better-sqlite3
      // style), NOT raw pg's { rows, rowCount }. Earlier check read
      // inserted.rows[0]?.id which was always undefined → wasFirstAttribution
      // stayed false → row got inserted but upsell + show-review cookie were
      // never triggered. Use lastInsertRowid (which RETURNING id populates)
      // as the "is this the first attribution?" signal.
      const wasFirstAttribution = !!(inserted && inserted.lastInsertRowid);
      const insertedRowId = inserted && inserted.lastInsertRowid;

      if (wasFirstAttribution) {
        console.log('[keychain-mw] FIRST attribution recorded id=' + insertedRowId + ' user=' + userId + ' keychain=' + keychainId);
        // Pass the visitor's locale (from the tenant lang middleware) so
        // sendTapContactUpsellEmail can localize the body. Falls back to
        // req.user.preferred_language if the platform user record has one
        // (some pwa_users rows carry it), else 'en'.
        const visitorLang = (req.lang === 'fr' || req.lang === 'en')
          ? req.lang
          : (req.user && req.user.preferred_language) || 'en';
        sendTapContactUpsellEmail({
          user_id: userId,
          email: req.user.email,
          full_name: req.user.full_name || req.user.name,
          keychain_id: keychainId,
          insertedId: insertedRowId,
          lang: visitorLang,
        }).catch(function (err) {
          console.error('[keychain-mw] TapContact upsell failed:', err && err.message);
        });
        try {
          res.cookie('keychain_show_review', '1', {
            maxAge: 30 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax',
          });
        } catch (_) { /* noop */ }
        try { res.clearCookie('keychain_attribution'); } catch (_) {}
      } else {
        console.log('[keychain-mw] already attributed (no-op) user=' + userId + ' keychain=' + keychainId);
        // Still consume the cookie so we don't keep re-attempting.
        try { res.clearCookie('keychain_attribution'); } catch (_) {}
      }
    } catch (err) {
      console.error('[keychain-mw] middleware error:', err && err.message, err && err.stack);
    }
    next();
  });

  // Quick debug endpoint: dumps current attribution state for the logged-in
  // user. Returns JSON. Useful for verifying middleware ran without having
  // to scrape server logs. Safe to leave in — exposes only the user's own
  // attribution rows. Hit /api/keychain-debug from the browser console
  // after logging in.
  router.get('/api/keychain-debug', services.auth.optionalAuth, async function (req, res) {
    try {
      const userId = req.user && req.user.id;
      const cookies = req.cookies || {};
      const rows = userId
        ? await db.all(
            'SELECT id, user_id, email, keychain_id, upsell_sent_at, created_at FROM keychain_visitors WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
          )
        : [];
      res.json({
        loggedIn: !!userId,
        userId: userId || null,
        userEmail: req.user && req.user.email || null,
        cookieKeychainAttribution: cookies.keychain_attribution || null,
        cookieShowReview: cookies.keychain_show_review || null,
        cookieTenantTokenPresent: !!cookies.tenant_token,
        attributions: rows,
      });
    } catch (err) {
      res.status(500).json({ error: err && err.message });
    }
  });

  // Helper: send the TapContact upsell. Localized via visitor.lang (set
  // by the attribution middleware from req.lang). Link points at the
  // TapContact homepage with ?keychain=<id> appended — the homepage
  // (views/home.ejs in tapavis-admin) detects the param and shows the
  // "You seem to already have a keychain! Activate your subscription"
  // prompt that links to /subscribe/<id>. This lets the homepage own
  // the activation CTA copy instead of duplicating it in this email.
  async function sendTapContactUpsellEmail(visitor) {
    if (!visitor || !visitor.email || !visitor.keychain_id) {
      console.warn('[keychain-mw] upsell skipped — missing email or keychain on visitor row:', JSON.stringify(visitor));
      return;
    }
    const appName = (services.config && services.config.displayName) || 'Ali Baba Grillades';
    const homeUrl = 'https://tapcontact.ca/?keychain=' + encodeURIComponent(visitor.keychain_id);
    const isFr = visitor.lang === 'fr';

    const subject = isFr
      ? 'Vous avez un porte-clés TapContact'
      : 'You have a TapContact keychain';
    const greeting = isFr ? 'Bonjour !' : 'Hey!';
    const intro = isFr
      ? 'Nous remarquons que vous avez acquis un porte-clés de <strong>' + appName + '</strong>. Transformez-le en carte de contact personnelle ou de carte d\'affaires en créant votre profil ici :'
      : 'We notice you acquired a keychain from <strong>' + appName + '</strong>. Make it your personal contact card or business card by creating a profile here:';
    const ctaLabel = isFr ? 'Activer mon abonnement' : 'Activate my subscription';
    const benefits = isFr
      ? 'Partage illimité de votre profil TapContact <strong>à vie</strong> — paiement unique de 12,95 $.'
      : 'Unlimited sharing of your TapContact profile <strong>for life</strong> — one-time $12.95.';
    const fallback = isFr
      ? 'Si le bouton ne fonctionne pas, copiez ce lien :'
      : 'If the button does not work, copy this link:';

    const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">' +
      '<h2 style="margin:0 0 16px;font-size:20px">' + greeting + '</h2>' +
      '<p style="line-height:1.6">' + intro + '</p>' +
      '<p style="text-align:center;margin:24px 0"><a href="' + homeUrl + '" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700">' + ctaLabel + '</a></p>' +
      '<p style="line-height:1.6">' + benefits + '</p>' +
      '<p style="color:#888;font-size:12px;margin-top:24px">' + fallback + '<br>' + homeUrl + '</p>' +
      '</div>';
    await services.email.send({
      to: visitor.email,
      from: { email: 'contact@tapcontact.ca', name: 'TapContact' },
      subject: subject,
      html: html,
    });
    const stampId = visitor.insertedId || visitor.id;
    if (stampId) {
      await db.run(
        'UPDATE keychain_visitors SET upsell_sent_at = NOW(), updated_at = NOW() WHERE id = $1',
        [stampId]
      );
    }
    console.log('[keychain-mw] TapContact upsell sent to ' + visitor.email + ' (keychain=' + visitor.keychain_id + ' lang=' + visitor.lang + ')');
  }

  // Reads google_place_id from the PLATFORM table public.subscriber_pwas.
  // The admin sets it in tapavis-admin → AI Builder → Apps → "Set Place ID"
  // (NOT in this tenant's admin_settings). PgTenantDb sets search_path to
  // "tenant_<slug>, public" so unqualified subscriber_pwas resolves to the
  // platform schema. Cached per process for the lifetime of a single
  // request via a closure-free SELECT each time — value rarely changes so
  // the small DB hit is negligible.
  async function fetchAppGooglePlaceId() {
    try {
      const slug = (services.config && services.config.slug) || 'ali-baba-boucherie';
      const row = await db.get(
        'SELECT google_place_id FROM public.subscriber_pwas WHERE slug = $1',
        [slug]
      );
      const value = (row && row.google_place_id) || null;
      // First-touch debug: log so we can see in server output what the
      // attribution flow + modal partial will use as the Place ID. Remove
      // once the flow is proven stable.
      if (!fetchAppGooglePlaceId._loggedOnce) {
        console.log('[keychain-place-id] subscriber_pwas slug=' + slug + ' google_place_id=' + (value || '(null)'));
        fetchAppGooglePlaceId._loggedOnce = true;
      }
      return value;
    } catch (err) {
      console.warn('[fetchAppGooglePlaceId] lookup failed:', err && err.message);
      return null;
    }
  }

  async function renderCtx(req) {
    const settings = await getSettings();
    const t = applyTextOverrides(Object.assign({}, T[req.lang] || T.fr), settings, req.lang);
    // googlePlaceId pulled from the platform table so the in-tenant review
    // modal can build the 5-star Google review URL from the same value the
    // admin set in tapavis-admin's AI Builder Apps list.
    const googlePlaceId = await fetchAppGooglePlaceId();
    return {
      t: t,
      lang: req.lang,
      settings: settings,
      googlePlaceId: googlePlaceId,
      formatPrice: formatPrice,
      hours: parseHours(settings.hours_json),
    };
  }

  router.get('/', async function(req, res) {
    try {
      const ctx = await renderCtx(req);
      const platforms = await db.all('SELECT * FROM delivery_platforms WHERE active = 1 ORDER BY position ASC').catch(function(){ return []; });
      res.render('index', Object.assign(ctx, { platforms: platforms, preview: await homepageMenu(), previewCatEn: MENU_PREVIEW_CAT_EN }));
    } catch(e) { res.status(500).send('Erreur'); }
  });

  // The site is this one page. The menu lives in its slider (from
  // command.restaurant); old /menu links land on that section. The other old
  // pages (/livraison, /apropos, /offres) fall through to the catch-all at the
  // bottom, which sends them to the homepage.
  router.get('/menu', function(req, res) { res.redirect(301, tpath(req, '/') + '#menu'); });

  // Captures 1-3 star feedback from the in-page review modal. Emails the
  // tenant's contact_email. 4 and 5 star paths are handled client-side
  // (thank-you / Google review link) and never POST here.
  router.post('/api/keychain-review', async function(req, res) {
    try {
      const rating = parseInt((req.body && req.body.rating) || '0', 10);
      const message = ((req.body && req.body.message) || '').trim().slice(0, 5000);
      // userEmail from the modal form's email input — the visitor's own
      // address so the admin can reply directly. Falls back to the
      // logged-in pwa_user's email if the form omitted it.
      const formEmailRaw = ((req.body && req.body.userEmail) || '').trim();
      const userId = req.user && req.user.id;
      if (!userId || !rating || rating < 1 || rating > 5 || !message) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }
      const userEmail = formEmailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmailRaw)
        ? formEmailRaw
        : (req.user && req.user.email) || null;
      const visitor = await db.get(
        `SELECT v.id, v.email, v.full_name, v.keychain_id
           FROM keychain_visitors v
          WHERE v.user_id = $1
          ORDER BY v.created_at DESC LIMIT 1`,
        [userId]
      );
      if (!visitor) {
        return res.status(404).json({ success: false, error: 'No attribution' });
      }
      // Route to the tenant's "Courriel administrateur" (admin_email)
      // first, falling back to contact_email per resolveContactEmail.
      // Matches the tapavis-admin /api/low-rating-feedback recipient path
      // so the rating modal behavior is parity with business-association.
      const toEmail = resolveContactEmail(await getSettings());
      const appName = (services.config && services.config.displayName) || 'Ali Baba Grillades';
      const subject = appName + ' — ' + rating + '-star feedback from keychain visitor';
      const senderLine = (visitor.full_name ? visitor.full_name + ' (' : '') + (userEmail || '—') + (visitor.full_name ? ')' : '');
      const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">' +
        '<h2 style="margin:0 0 12px">New keychain visitor feedback</h2>' +
        '<p><strong>Rating:</strong> <span style="color:#fbbf24;letter-spacing:2px;font-size:18px">' + '★'.repeat(rating) + '</span><span style="color:#d1d5db;letter-spacing:2px;font-size:18px">' + '☆'.repeat(5 - rating) + '</span> (' + rating + '/5)</p>' +
        '<p><strong>From:</strong> ' + escapeHtml(senderLine) + '</p>' +
        '<p><strong>Keychain ID:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">' + escapeHtml(visitor.keychain_id) + '</code></p>' +
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-top:16px;white-space:pre-wrap;line-height:1.5">' + escapeHtml(message) + '</div>' +
        '<p style="color:#6b7280;font-size:13px;margin-top:18px">Reply to this email to respond directly to ' + escapeHtml(userEmail || 'the visitor') + '.</p>' +
        '</div>';
      try {
        await services.email.send({
          to: toEmail,
          subject: subject,
          html: html,
          replyTo: userEmail || undefined,
        });
      } catch (emailErr) {
        console.error('[keychain-review] email failed:', emailErr.message);
        return res.status(500).json({ success: false, error: 'Email send failed' });
      }
      console.log('[keychain-review] feedback emailed to ' + toEmail + ' (rating=' + rating + ' from=' + (userEmail || 'unknown') + ')');
      res.json({ success: true });
    } catch(e) {
      console.error('[keychain-review POST]', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function isAdminPage(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.redirect('admin/login');
    next();
  }
  function isAdminApi(req, res, next) {
    if (!services.admin.isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  // The dashboard is only shortcuts to the admin pages. Visit statistics live
  // in the owner's Liasse dashboard (platform session tracking); this site no
  // longer counts page views itself.
  router.get('/admin', isAdminPage, function(req, res) { res.render('admin', { page: 'dashboard' }); });

  router.get('/admin/delivery', isAdminPage, function(req, res) { res.render('admin-delivery', { page: 'delivery' }); });
  // Explicit /admin/team registered BEFORE the auto-injected /admin/:module
  // handler (which `return`s without responding for mod === 'team'), so this
  // wins via Express's first-match-wins routing.
  router.get('/admin/team', isAdminPage, function(req, res) { res.render('admin-team', { page: 'team' }); });
  // Retired admin sections. The one-page site never read them: the homepage
  // menu comes from command.restaurant's menu feed (see homepageMenu), and
  // posts, offers and members had no place on the page. Old bookmarks
  // land on the dashboard instead of the /admin/:module fallback, which no
  // longer has a view for them.
  router.get(['/admin/menu', '/admin/posts', '/admin/offers', '/admin/members'], isAdminPage, function(req, res) {
    res.redirect(tpath(req, '/admin'));
  });

  // --- Admin team management (admin_users + admin_invites are platform tables in tenant schema) ---
  router.get('/api/admin/team', isAdminApi, async function(req, res) {
    try {
      const members = await db.all('SELECT id, name, email, role, active, created_at, last_login_at FROM admin_users ORDER BY created_at DESC').catch(function(){ return []; });
      const invites = await db.all('SELECT id, email, role, status, created_at, expires_at FROM admin_invites ORDER BY created_at DESC').catch(function(){ return []; });
      res.json({ members: members || [], invites: invites || [] });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/team/invite', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const email = (b.email || '').trim().toLowerCase();
      const role = (b.role || 'admin').trim().toLowerCase();
      if (!email || email.indexOf('@') === -1) return res.status(400).json({ error: 'invalid_email' });

      const existing = await db.get('SELECT id FROM admin_users WHERE email = $1 AND active = 1', [email]);
      if (existing) return res.status(409).json({ error: 'already_admin' });
      const pending = await db.get("SELECT id FROM admin_invites WHERE email = $1 AND status = 'pending'", [email]);
      if (pending) return res.status(409).json({ error: 'already_invited' });

      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.run(
        "INSERT INTO admin_invites (email, token, role, status, expires_at, created_at) VALUES ($1, $2, $3, 'pending', $4, NOW())",
        [email, token, role, expiresAt]
      );

      // Build absolute activation URL — tenantPath handles both custom domain
      // and platform-served (/pwa/<slug>/) cases.
      const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0];
      const host = req.get('host') || '';
      const path = typeof req.tenantPath === 'function' ? req.tenantPath('/admin/activate/' + token) : '/admin/activate/' + token;
      const activationUrl = proto + '://' + host + path;
      const appName = (services.config && services.config.displayName) || 'Ali Baba Grillades';

      try {
        await services.email.send({
          to: email,
          subject: 'Invitation à gérer ' + appName,
          html: '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:540px;margin:0 auto;padding:32px;color:#1a1a1a">' +
            '<h2 style="margin:0 0 16px">Vous êtes invité(e)!</h2>' +
            '<p style="line-height:1.6;color:#444">Vous avez été invité(e) comme <strong>' + role + '</strong> pour gérer <strong>' + appName + '</strong>.</p>' +
            '<p style="line-height:1.6;color:#444">Cliquez sur le bouton ci-dessous pour activer votre compte:</p>' +
            '<p style="margin:24px 0"><a href="' + activationUrl + '" style="display:inline-block;padding:13px 28px;background:#39FF14;color:#000;font-weight:800;border-radius:8px;text-decoration:none">Activer mon accès</a></p>' +
            '<p style="font-size:13px;color:#888;line-height:1.5">Ce lien expire dans 7 jours. Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br><span style="word-break:break-all">' + activationUrl + '</span></p>' +
            '</div>'
        });
      } catch (emailErr) {
        console.error('Team invite email failed:', emailErr.message);
        // Don't delete the invite — admin can copy the activation URL manually
        return res.status(500).json({ error: 'email_send_failed', activation_url: activationUrl });
      }
      res.json({ success: true, invite: { email: email, role: role } });
    } catch(e) {
      console.error('Team invite error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/api/admin/team/revoke/:id', isAdminApi, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'invalid_id' });
      await db.run('UPDATE admin_users SET active = 0 WHERE id = $1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.delete('/api/admin/team/invite/:id', isAdminApi, async function(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id) return res.status(400).json({ error: 'invalid_id' });
      await db.run('DELETE FROM admin_invites WHERE id = $1', [id]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Audience counts for the Communications page.
  router.get('/api/admin/stats', isAdminApi, async function(req, res) {
    res.json({
      userCount: await services.auth.getUserCount().catch(function(){ return 0; }),
      pushSubscriberCount: await services.push.getSubscriptionCount().catch(function(){ return 0; })
    });
  });

  router.get('/api/admin/modules', isAdminApi, function(req, res) {
    res.json({
      modules: [
        {
          key: 'delivery_platforms', label: 'Plateformes de livraison', icon: 'truck',
          fields: [
            { name: 'name', label: 'Nom de la plateforme', type: 'text', required: true, description: 'Nom affiché de la plateforme.', placeholder: 'ex. Uber Eats' },
            { name: 'logo_url', label: 'Logo', type: 'image', description: 'Logo de la plateforme. Recommandé: carré 400x400px sur fond transparent ou blanc.' },
            { name: 'link_url', label: 'Lien vers la commande', type: 'url', required: true, description: 'Lien direct vers votre restaurant sur cette plateforme.', placeholder: 'https://www.ubereats.com/...' },
            { name: 'position', label: "Ordre d'affichage", type: 'number', default: 0, description: 'Plus petit = en premier.', placeholder: '0' },
            { name: 'active', label: 'Active', type: 'boolean', default: true, description: 'Afficher cette plateforme publiquement.' }
          ]
        }
      ]
    });
  });

  // Shared INSERT helper used by all admin POST routes
  function adminInsert(table, allowedFields, body) {
    const b = body || {};
    const cols = [], vals = [], phs = [];
    let i = 1;
    allowedFields.forEach(function(f) {
      if (b[f] !== undefined) {
        cols.push(f);
        vals.push(b[f] === '' ? null : b[f]);
        phs.push('$' + i);
        i++;
      }
    });
    if (!cols.length) return null;
    return {
      sql: 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + phs.join(',') + ') RETURNING id',
      vals: vals
    };
  }

  // Shared UPDATE helper used by all admin PUT routes
  function adminUpdate(table, allowedFields, body, id) {
    const b = body || {};
    const sets = [], vals = [];
    let i = 1;
    allowedFields.forEach(function(f) {
      if (b[f] !== undefined) {
        sets.push(f + ' = $' + i);
        vals.push(b[f] === '' ? null : b[f]);
        i++;
      }
    });
    if (!sets.length) return null;
    sets.push('updated_at = NOW()');
    vals.push(id);
    return {
      sql: 'UPDATE ' + table + ' SET ' + sets.join(', ') + ' WHERE id = $' + i,
      vals: vals
    };
  }

  // --- CRUD: delivery_platforms ---
  router.get('/api/admin/delivery_platforms', isAdminApi, async function(req, res) {
    try {
      const rows = await db.all('SELECT * FROM delivery_platforms ORDER BY position ASC, id ASC');
      res.json({ delivery_platforms: rows });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.post('/api/admin/delivery_platforms', isAdminApi, async function(req, res) {
    try {
      const q = adminInsert('delivery_platforms', ['name','logo_url','link_url','position','active'], req.body);
      if (!q) return res.status(400).json({ error: 'No fields' });
      const r = await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM delivery_platforms WHERE id = $1', [r.lastInsertRowid]);
      res.json({ item: row, id: r.lastInsertRowid });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.put('/api/admin/delivery_platforms/:id', isAdminApi, async function(req, res) {
    try {
      const q = adminUpdate('delivery_platforms', ['name','logo_url','link_url','position','active'], req.body, req.params.id);
      if (!q) return res.status(400).json({ error: 'No fields' });
      await db.run(q.sql, q.vals);
      const row = await db.get('SELECT * FROM delivery_platforms WHERE id = $1', [req.params.id]);
      res.json({ item: row });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });
  router.delete('/api/admin/delivery_platforms/:id', isAdminApi, async function(req, res) {
    try { await db.run('DELETE FROM delivery_platforms WHERE id = $1', [req.params.id]); res.json({ success: true }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/upload', isAdminApi, async function(req, res) {
    try {
      const dataUri = req.body && req.body.dataUri;
      if (!dataUri) return res.status(400).json({ error: 'Missing dataUri' });
      if (!services.cloudinary || !services.cloudinary.uploader) return res.status(503).json({ error: 'Upload service unavailable' });
      const result = await services.cloudinary.uploader.upload(dataUri, { folder: (services.config.slug || 'pwa') + '/admin' });
      res.json({ url: result.secure_url });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.get('/api/admin/settings', isAdminApi, async function(req, res) {
    try { const rows = await db.all('SELECT key, value FROM admin_settings'); const o = {}; rows.forEach(function(r){ o[r.key] = r.value; }); res.json({ settings: o }); }
    catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.put('/api/admin/settings', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      if (!b.key) return res.status(400).json({ error: 'Missing key' });
      await db.run('INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()', [b.key, b.value == null ? '' : String(b.value)]);
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // Bulk settings upsert — accepts { settings: { key1: val1, key2: val2 } }
  const SITE_SETTINGS_ALLOWED = new Set([
    'business_name','tagline','admin_email','contact_email','contact_phone','business_address',
    'footer_intro_fr','footer_intro_en','hours_json',
    'social_facebook','social_instagram','social_twitter','social_tiktok','social_youtube','social_linkedin',
    '_p_nav_logo_url'
  ]);
  router.put('/api/admin/site_settings', isAdminApi, async function(req, res) {
    try {
      const incoming = (req.body && req.body.settings) || {};
      const keys = Object.keys(incoming).filter(function(k){ return SITE_SETTINGS_ALLOWED.has(k); });
      for (const k of keys) {
        const v = incoming[k];
        await db.run(
          'INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
          [k, v == null ? '' : String(v)]
        );
      }
      res.json({ success: true, saved: keys.length });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  router.post('/api/admin/broadcast', isAdminApi, async function(req, res) {
    try {
      const b = req.body || {};
      const title = (b.title || '').toString().trim();
      const body = (b.body || '').toString().trim();
      if (!title || !body) return res.status(400).json({ error: 'missing_fields' });
      const channels = b.channels || {};
      const sendPush = channels.push !== false;
      const sendEmail = !!channels.email;
      if (!sendPush && !sendEmail) return res.status(400).json({ error: 'no_channel' });

      const result = {};

      if (sendPush) {
        try {
          if (services.push && typeof services.push.broadcast === 'function') {
            const pushRes = await services.push.broadcast({ title: title, body: body });
            result.push = { sent: pushRes.sent || 0, failed: pushRes.failed || 0, total: pushRes.total || 0 };
          } else {
            result.push = { error: 'push_unavailable' };
          }
        } catch(e) {
          console.error('Broadcast push error:', e.message);
          result.push = { error: e.message };
        }
      }

      if (sendEmail) {
        try {
          const emailUsers = await db.all(
            "SELECT id, email FROM users WHERE email IS NOT NULL AND email <> '' AND (email_verified IS NULL OR email_verified = 1) AND email_unsubscribed_at IS NULL"
          ).catch(function(){ return []; });
          const appName = (services.config && services.config.displayName) || 'Ali Baba Grillades';
          const safeBody = body.replace(/[<>]/g, function(c){ return c === '<' ? '&lt;' : '&gt;'; }).replace(/\n/g, '<br>');
          const safeTitle = title.replace(/[<>]/g, function(c){ return c === '<' ? '&lt;' : '&gt;'; });
          const html = '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a">' +
            '<h2 style="color:#0a0a0a;margin:0 0 16px">' + safeTitle + '</h2>' +
            '<div style="font-size:15px;line-height:1.55;color:#333">' + safeBody + '</div>' +
            '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">' +
            '<p style="font-size:12px;color:#888;margin:0">' + appName + '</p>' +
            '</div>';
          let sent = 0, failed = 0;
          for (const row of emailUsers) {
            try {
              await services.email.send({ to: row.email, subject: appName + ' — ' + title, html: html });
              sent++;
            } catch(e) { failed++; console.error('Broadcast email failed for', row.email, e.message); }
          }
          result.email = { sent: sent, failed: failed, total: emailUsers.length };
        } catch(e) {
          console.error('Broadcast email error:', e.message);
          result.email = { error: e.message };
        }
      }

      res.json({ success: true, result: result });
    } catch(e) {
      console.error('Broadcast error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Catch-all: redirect unknown GET routes to PWA home (prevents "Cannot GET" errors)
  // Only matches GET requests — POST/PUT/DELETE API endpoints are unaffected

// ========== ADMIN BACKEND PAGE ROUTES (auto-injected fallback) ==========
function requireAdmin(req, res, next) {
  if (req.query.admin_token) {
    try {
      var jwt = require('jsonwebtoken');
      var payload = jwt.verify(req.query.admin_token, services.jwtSecret);
      if (payload.admin === true && payload.slug === 'ali-baba-boucherie') {
        // Set self-verifying JWT cookie — works across all replicas without Redis
        try {
          var adminJwt = jwt.sign({ admin: true, slug: 'ali-baba-boucherie', userId: payload.userId || 0 }, services.jwtSecret, { expiresIn: '24h' });
          res.cookie('pwa_admin_ali-baba-boucherie', adminJwt, {
            httpOnly: true, secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/'
          });
        } catch (cookieErr) { /* non-fatal */ }
        return res.redirect(req.tenantPath(req.path));
      }
    } catch (e) { /* invalid token */ }
  }
  if (services.admin && services.admin.isAdmin(req)) {
    req.adminUser = { role: 'owner' };
    return next();
  }
  return res.redirect(req.tenantPath('/admin/login'));
}

router.get('/admin', requireAdmin, async function(req, res) {
  try {
    var stats = {};
    try {
      var modules = await services.db.all("SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_type = 'BASE TABLE' AND table_name NOT IN ('admin_users','admin_invites','admin_webauthn_credentials','admin_settings','site_visits','users','push_subscriptions','webauthn_credentials','user_positions')");
      for (var m of modules) {
        try { var c = await services.db.get('SELECT COUNT(*) as c FROM ' + m.table_name); stats[m.table_name] = parseInt(c.c); } catch(e) {}
      }
    } catch(e) {}
    res.render('admin', { adminUser: req.adminUser, stats: stats });
  } catch(e) { res.render('admin', { adminUser: req.adminUser, stats: {} }); }
});
router.get('/admin/:module', requireAdmin, async function(req, res) {
  var mod = req.params.module;
  if (mod === 'login' || mod === 'logout' || mod === 'team' || mod === 'invite' || mod === 'activate') return;
  try { res.render('admin-' + mod, { adminUser: req.adminUser }); }
  catch(e) { res.status(404).send('Page not found'); }
});
// ========== END ADMIN BACKEND PAGE ROUTES ==========

  router.get('*', function(req, res, next) {
    // Don't redirect API calls — return 404 JSON instead
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Let admin paths fall through to the platform's admin fallback handler
    if (req.path === '/admin' || req.path.startsWith('/admin/')) {
      return next();
    }
    res.redirect('./');
  });

  return router;
};
