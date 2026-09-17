/**
 * Owner-authorized imported assets, served from the platform R2 copies.
 * Never hotlink the previous host. Every entry below was visually inspected
 * before being bound to a page or a product — unverified thumbnails are
 * deliberately absent so no photograph is ever attached to the wrong item.
 */
const base = 'https://pub-007338adea45415ba231abbf2404da85.r2.dev/website-imports/b12153e0-d25e-4ce8-9d2f-04ade6e94e76/';
const at = (name) => base + name;

module.exports = {
  base,
  // Page photography (inspected)
  heroMassage: at('d621e949537f4ce9c3ea5fa39a283fc99c077c7d00f7dccb544b8f8938f150b7.webp'),
  bannerMassage: at('8fd9c1c208074ae24ea12161bfa4c30dc3e7ac9cd54d749cbeff3ea084a70230.webp'),
  bannerEsthetique: at('b4f2b9b696c9778be54fab8a26f6304f9aa7334c8e620b79c3a42203a61036b0.webp'),
  bannerOngles: at('3ebed85888ec081634a304c5df528958558260b5b6ad688787a3d90be3a67065.webp'),
  bannerCorps: at('ea317a5c482118e1d4c8fa42a3683f04b1c4fbec547db0e1997c57d92d0e1cf5.webp'),
  bannerForfaits: at('616a181ffa00c468e98f39dd62a34b99ef059dea07e819922050c0a3dfce7791.webp'),
  bannerEquipe: at('cf6074afc3d61c998134bf1df7c9359890088f0567ba03fa1b3d42da883f662d.webp'),
  eucalyptus: at('a603776068ea8c2c78d24eb1bbd58f3755a0e5acce18f040d9cdbd023ca30ca7.webp'),
  salleLocation: at('acbaf5144cf691577ffeae57f88ea3c606af317b6e92084e08af839a8688d7ae.webp'),
  // Annie Bouchard — both portraits are labelled Annie by the source and each
  // is reused in the same context the source used it in.
  anniePortrait: at('c2851755ced4e8475e2e5e7237724fc68e986e1b0abc96031052d1138818ac89.webp'),
  anniePortraitChair: at('11e4f00779f6ed5afc9d120985d5fe37208a3b1974514e7508add378911c803d.webp'),
  // Boutique collection cards (inspected still lifes, no product claim)
  shopSlow: at('51cb6f9c952004dd57d78117f061f16e8da89933bc1528055b05cc0c974135b2.webp'),
  shopGift: at('09ff52657af9f9f8d578e6eafdb1a331de8c7b8cadcb9743741d3d59a4ab4574.webp'),
  shopSelf: at('05f05aa97c9e8980d8e748f56f1d6724ad711811e9e892d52615db880d747f57.webp'),
  shopRitual: at('1bb16f860b01b42fe266afa81d2da3a52aa413879146404da87498ed519322a5.webp'),
  // Product photography — ONLY products whose photo was positively identified.
  prodBougieCamphre: at('2df85c11733af908cb61c8c8c387854420baadc0a5a67a283f9148119633e87f.webp'),
  prodServietteBoho: at('346f754859712411b83d5cb4066a7a670826493de032c36212a29551a6f200a2.webp'),
  prodTisaneLavande: at('1eee22fca602c79a76e8dca1745bfabf88ccd62aa6f480f5cfe60e6eb46be580.webp'),
  prodPaloSanto: at('fc064e83d3843def6a946448faa95743f2b39a43c73ed01bbd64601bf89b5ee9.webp'),
  prodBandeauBoho: at('ce83ae33da23a2724cb7f383182f40dceb22f8cf61916d00d03211c103b99e08.webp'),
  // Blog article images (alt text on each matched its article title)
  blogRituelBain: at('a6634201233fdf1f75ecbbbec992848ea1bf710cb8858839d6441d7bbc81c3a7.webp'),
  blogFavuzzi: at('2ebb7d3dbede42ebb2482c18cfa726fb2293253981b967792b84b0b098fc392c.webp'),
  blogPainsPlats: at('40862762bcf93fd4b17907144afb776c9d0ee2ef5c6ca0d656ae4ae79084e061.webp'),
};
