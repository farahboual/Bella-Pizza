/**
 * ===================================================================
 * RESTAURANT CONFIG — EVERYTHING IN ONE FILE (WHITE-LABEL)
 * ===================================================================
 *
 * HOW TO ONBOARD A NEW CLIENT IN 5 MINUTES:
 * ─────────────────────────────────────────
 * 1. Drop their logo  →  public/client-assets/logo.png
 * 2. Drop food photos →  public/client-assets/pizza.jpg, burger.jpg …
 *    (any web format: .jpg .jpeg .png .webp .avif)
 * 3. Edit this file: name, colors, phone, hours, menu categories & items
 * 4. git add -A && git commit -m "feat: new client XYZ" && git push
 * 5. Vercel auto-deploys in ~30s. Done.
 *
 * TIPS:
 * • Each menu category has an optional `img` (hero image for the card)
 *   and each item can have its own `img` too — just use the filename.
 * • If no logo file exists the site shows a monogram (first letter of name).
 * • Colors: pick any CSS hex. primaryColor drives buttons, pills, badges.
 * • Set features.xxx = false to hide sections you don't need.
 * ===================================================================
 */

export const RESTAURANT_CONFIG = {

  // ─── 1. BRAND & IDENTITY ──────────────────────────────────────────
  brand: {
    name:          "L'Atelier Gourmand",
    shortName:     "Atelier",         // shown under monogram & in footer
    tagline:       "Cuisine authentique & produits frais",
    subTagline:    "Des recettes généreuses préparées chaque jour avec des ingrédients frais, locaux et de saison.",
    heroTitle:     "Le goût des",
    heroHighlight: "bonnes choses.",
    heroBadge:     "Cuisine artisanale & produits frais",
    badgeFloat:    { title: "Livraison offerte", subtitle: "dès 25 €" },

    /**
     * LOGO: drop your file in public/client-assets/ and set the path below.
     * Example: logoUrl: "/client-assets/logo.png"
     * Leave commented-out to use the auto-generated monogram.
     */
    // logoUrl: "/client-assets/logo.png",

    /**
     * HERO IMAGE: the big photo shown on the right side of the hero section.
     * Drop a file in public/client-assets/ and reference it here.
     * Example: heroImage: "/client-assets/hero.jpg"
     * Leave commented-out to use the default pizza photo.
     */
    // heroImage: "/client-assets/hero.jpg",

    metaDescription: "Commandez en ligne nos spécialités faites maison. Livraison rapide ou à emporter.",
    footerNote:      "Produits frais & ingrédients rigoureusement sélectionnés.",
    mentions:        "Tarifs indicatifs sous réserve de modifications. Promotions non cumulables. Pour votre santé, pratiquez une activité physique régulière — www.mangerbouger.fr"
  },

  // ─── 2. THEME & COLORS ────────────────────────────────────────────
  theme: {
    primaryColor:    "#A3785E",   // Warm Sandstone — buttons, pills, active states
    primaryHover:    "#8B5E45",   // Deeper tone for hover
    primaryLight:    "#FAF6F1",   // Very light tint — card backgrounds, etc.
    backgroundColor: "#F5F2EB",  // Page background
    textColor:       "#28231F",   // Body text
    fontFamily:      "'Nunito', 'Archivo', Arial, sans-serif"
  },

  // ─── 3. CONTACT & LOCATION ────────────────────────────────────────
  contact: {
    phone:    "01 42 68 55 00",
    phoneRaw: "+33142685500",     // E.164 format for tel: links
    email:    "contact@latelier-gourmand.fr",
    address: {
      street:     "18 Rue des Gourmets",
      postalCode: "75002",
      city:       "Paris",
      full:       "18 Rue des Gourmets, 75002 Paris"
    },
    mapsUrl: "https://maps.google.com/?q=Paris"
  },

  // ─── 4. FEATURE TOGGLES ───────────────────────────────────────────
  features: {
    takeaway:    true,   // Click & Collect (À emporter)
    delivery:    true,   // Delivery (Livraison)
    dineIn:      true,   // On-site / QR code ordering (Sur place)
    pizzaDeals:  true,   // "2 pizzas achetées = 3ème offerte" strip
    drinkDeals:  true,   // "Canette à prix réduit avec un plat"
    halalBadge:  false,  // Show Halal badge in delivery section
    promoBanner: true,   // Highlight banner for specials
    bestsellers: true    // "Nos incontournables" section
  },

  // ─── 5. DELIVERY RULES ────────────────────────────────────────────
  delivery: {
    minOrderCents:          2000,  // 20.00 € minimum
    freeDeliveryAboveCents: 2500,  // 25.00 € → free delivery
    deliveryFeeCents:        250,  // 2.50 € fee below threshold
    allowedPostcodes:          [], // [] = all postcodes accepted (demo mode)
    conditionText: "Livraison offerte à partir de 25 € de commande. Préparation soignée et livraison rapide dans des emballages éco-responsables."
  },

  // ─── 6. OPENING SCHEDULE ──────────────────────────────────────────
  schedule: {
    displayText: "Mardi au Dimanche · 11h30 à 14h30 & 18h30 à 23h00",
    weekly: {
      lun: { open: false, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mar: { open: true,  lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mer: { open: true,  lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      jeu: { open: true,  lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      ven: { open: true,  lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:30' },
      sam: { open: true,  lunchStart: '11:30', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:30' },
      dim: { open: true,  lunchStart: '11:30', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:00' }
    }
  },

  // ─── 7. IMAGES & CLIENT ASSETS ───────────────────────────────────
  /**
   * HOW TO ADD PHOTOS FOR A CLIENT:
   * 1. Drop files into: public/client-assets/
   * 2. Point to them below. If a file is omitted or missing,
   *    the site automatically uses beautiful default food photos.
   */
  images: {
    // Category cover photos (fallback for all items in that category)
    pizzas:   "/client-assets/pizza.jpg",
    burgers:  "/client-assets/burgers.jpg",
    salades:  "/client-assets/salades.jpg",
    texmex:   "/client-assets/entrees.jpg",
    desserts: "/client-assets/desserts.jpg",
    boissons: "/client-assets/boissons.jpg",

    // Optional specific dish photos (by dish slug: "cheese", "regina", etc.)
    items: {}
  },

  // ─── 8. MENU ──────────────────────────────────────────────────────
  /**
   * HOW TO ADD A CATEGORY:
   *   { id: 'burgers', label: 'Burgers', img: '/client-assets/burgers.jpg', items: [...] }
   *
   * HOW TO ADD AN ITEM:
   *   { name: 'Cheese Burger', desc: 'Steak 150g, cheddar...', price: '9,50 €', img: '/client-assets/cheese.jpg' }
   *
   * The `img` field on categories is used as a fallback for all items in that category.
   * The `img` field on an item overrides the category fallback for that specific item.
   * All images must be in public/client-assets/ and referenced with a leading slash.
   *
   * PIZZA SIZES (special category type):
   *   Set `pizza: true` on the category — it activates the size selector.
   *   Sizes are defined in the `sizes` array below.
   *
   * NOTES:
   *   Optional array of strings shown above the item grid for a category.
   */
  menu: {

    // Pizza sizes (only used for categories with pizza:true)
    pizzaSizes: [
      { label: "Junior",  price: "9 €",  extraPerTopping: "+1 €" },
      { label: "Sénior",  price: "14 €", extraPerTopping: "+1,50 €" },
      { label: "Méga",    price: "19 €", extraPerTopping: "+2 €" }
    ],

    categories: [

      // ── PIZZAS (special: uses size selector) ──
      {
        id:    "pizzas",
        label: "Pizzas",
        pizza: true,                          // activates size pills
        img:   "/client-assets/pizza.jpg",    // drop your pizza photo here
        // Tomate base pizzas
        tomatePizzas: [
          { name: "CLASSICA",       desc: "Basilic frais, huile d'olive vierge" },
          { name: "REGINA",         desc: "Champignons de Paris frais, jambon blanc aux herbes" },
          { name: "CAMPIONE",       desc: "Pur bœuf haché assaisonné, champignons de Paris" },
          { name: "MIAMI",          desc: "Jambon blanc, œuf bio" },
          { name: "NAPOLITAINE",    desc: "Anchois marinés, câpres, olives taggiasche" },
          { name: "CALZONE",        desc: "Jambon blanc, œuf bio, mozzarella fondante" },
          { name: "HAWAÏENNE",      desc: "Jambon blanc, morceaux d'ananas rôti" },
          { name: "NEPTUNE",        desc: "Thon germon, olives taggiasche, œuf bio" },
          { name: "CHORIZO",        desc: "Tomates cerises confites, chorizo ibérique, olives" },
          { name: "SPÉCIALE",       desc: "Jambon blanc, oignons confits, poivrons marinés, chèvre frais" },
          { name: "FRUITS DE MER",  desc: "Mélange de fruits de mer, persillade maison" },
          { name: "3 JAMBONS",      desc: "Jambon blanc, chorizo ibérique, lardons fumés" },
          { name: "EXTRÊME",        desc: "Bœuf haché façon bouchère, chorizo ibérique" },
          { name: "BOLOGNAISE",     desc: "Bœuf haché mijoté, pommes grenailles, oignons confits" },
          { name: "4 FROMAGES",     desc: "Parmesan 24 mois, gorgonzola, chèvre frais, mozzarella" },
          { name: "VÉGÉTARIENNE",   desc: "Champignons, poivrons marinés, tomates fraîches, oignons, olives" },
          { name: "CHEESE BURGER",  desc: "Bœuf haché boucher, cheddar affiné, oignons rouges" },
          { name: "BOURSIN",        desc: "Bœuf haché façon bouchère, boursin crémeux" },
          { name: "MEXICAINE",      desc: "Merguez artisanale, bœuf haché, poivrons sautés" },
          { name: "FAJITAS",        desc: "Filet de poulet mariné, ail doux, oignons, poivrons" },
          { name: "INDIENNE",       desc: "Bœuf haché, poulet rôti, crème fraîche douce" },
          { name: "PAYSANNE",       desc: "Lardons fumés croustillants, champignons, œuf bio" },
          { name: "4 SAISONS",      desc: "Jambon blanc, cœurs d'artichauts, poivrons, champignons, olives" },
          { name: "ORIENTALE",      desc: "Merguez de bœuf/agneau, oignons, poivrons, œuf bio, olives" },
          { name: "LATINA",         desc: "Sauce BBQ, fromage, viande hachée, merguez" }
        ],
        // Crème base pizzas
        cremePizzas: [
          { name: "SAVOYARDE",      desc: "Bacon croustillant, champignons de Paris, œuf bio" },
          { name: "FERMIÈRE",       desc: "Jambon blanc, pommes grenailles, champignons, œuf bio" },
          { name: "MONTAGNARDE",    desc: "Fromage à raclette affiné, bacon, pommes de terre" },
          { name: "CARNIVORE",      desc: "Bœuf haché, merguez, jambon blanc, poulet mariné" },
          { name: "CAMPAGNARDE",    desc: "Filet de poulet rôti, champignons frais" },
          { name: "PARISIENNE",     desc: "Jambon blanc, pommes grenailles fondantes" },
          { name: "REINE BLANCHE",  desc: "Jambon blanc supérieur, champignons de Paris frais" },
          { name: "CHICKEN",        desc: "Filet de poulet rôti, pommes grenailles, œuf bio" },
          { name: "GORFA",          desc: "Pur bœuf haché, oignons confits, chèvre crémeux" },
          { name: "ROMANA",         desc: "Saumon fumé d'Écosse, touche de citron doux" },
          { name: "TARTIFLETTE",    desc: "Lardons fumés, pommes grenailles, reblochon fermier AOP" },
          { name: "BLANCHE NEIGE",  desc: "Gorgonzola doux, brie de Meaux, parmesan, chèvre" },
          { name: "MIEL",           desc: "Fromage de chèvre affiné, filet de miel de fleurs" },
          { name: "CURRY",          desc: "Sauce curry douce maison, poulet rôti fermier" }
        ]
      },

      // ── BURGERS ──
      {
        id:    "burgers",
        label: "Burgers",
        img:   "/client-assets/burgers.jpg",
        notes: ["Pain brioché artisanal · Frites fraîches incluses", "+1 € avec boisson fraîche 33cl"],
        items: [
          { name: "Cheese",        desc: "Steak façon bouchère 150g, cheddar affiné, oignons caramélisés, sauce maison",  price: "9,50 €" },
          { name: "DB Cheese",     desc: "2 Steaks façon bouchère, double cheddar affiné, sauce fumée maison",             price: "11,50 €" },
          { name: "Triple Cheese", desc: "3 Steaks façon bouchère, triple cheddar affiné, cornichons doux",                price: "13,50 €" },
          { name: "Fish",          desc: "Filet de cabillaud pané croustillant, sauce tartare maison, cheddar",            price: "9,50 €" },
          { name: "Chicken",       desc: "Filet de poulet croustillant mariné maison, cheddar fondu, sauce ciboulette",    price: "9,50 €" },
          { name: "Royal Chèvre",  desc: "Steak boucher 150g, chèvre chaud au miel de fleurs, roquette, oignons rouges",  price: "12,00 €" },
          { name: "Royal Chicken", desc: "Poulet croustillant, galette de pomme de terre dorée, œuf au plat, cheddar",    price: "12,50 €" }
        ]
      },

      // ── SALADES ──
      {
        id:    "salades",
        label: "Salades & Bowls",
        img:   "/client-assets/salades.jpg",
        items: [
          { name: "Pacifique",    desc: "Mesclun croquant, saumon fumé d'Écosse, avocat frais, graines de sésame dorées", price: "9,50 €" },
          { name: "Niçoise",      desc: "Mesclun, thon germon, pommes grenailles, œufs mollets, olives taggiasche",       price: "8,50 €" },
          { name: "Chèvre chaud", desc: "Mesclun, toasts dorés au chèvre chaud, miel de fleurs, cerneaux de noix",        price: "9,00 €" },
          { name: "Exotique",     desc: "Mesclun, crevettes marinées, avocat frais, mangue, sauce cocktail douce",        price: "9,50 €" },
          { name: "Campagnarde",  desc: "Mesclun, pommes grenailles, effiloché de poulet fermier rôti, concombre, œuf mollet", price: "9,00 €" }
        ]
      },

      // ── ENTRÉES & TAPAS ──
      {
        id:    "texmex",
        label: "Entrées & Tapas",
        img:   "/client-assets/entrees.jpg",
        items: [
          { name: "Mozza sticks",  desc: "8 pièces au cœur de mozzarella fondante + sauce dip au choix",              price: "7,50 €" },
          { name: "Chicken wings", desc: "8 pièces croustillantes marinées aux épices douces + sauce barbecue",        price: "8,50 €" },
          { name: "Tenders",       desc: "6 aiguillettes de filet de poulet croustillant pané maison",                 price: "8,50 €" },
          { name: "Calamars",      desc: "Calamars dorés croustillants + quartier de citron et sauce tartare",         price: "8,00 €" },
          { name: "Onion rings",   desc: "8 rondelles d'oignons dorées et croustillantes",                             price: "6,00 €" },
          { name: "Frites",        desc: "Frites fraîches maison dorées à souhait",                                    price: "3,50 €" },
          { name: "Potatoes",      desc: "Pommes grenailles rôties aux herbes de Provence",                            price: "4,00 €" }
        ]
      },

      // ── DESSERTS ──
      {
        id:    "desserts",
        label: "Desserts",
        img:   "/client-assets/desserts.jpg",
        items: [
          { name: "Brownies",               desc: "Brownie fondant chocolat noir 70% et éclats de noix de pécan",         price: "3,00 €" },
          { name: "Tiramisu",               desc: "Tiramisu artisanal au café expresso et mascarpone onctueux",            price: "4,50 €" },
          { name: "Tarte citron ou pommes", desc: "Tartelette artisanale pur beurre",                                      price: "4,00 €" },
          { name: "Glace Häagen-Dazs",      desc: "Pot individuel 95ml aux parfums gourmands",                            price: "3,90 €" }
        ]
      },

      // ── BOISSONS ──
      {
        id:    "boissons",
        label: "Boissons",
        img:   "/client-assets/boissons.jpg",
        notes: ["Canette 33cl : 1 € avec un plat · 2,00 € seule"],
        items: [
          { name: "Canettes 33cl", desc: "Coca-Cola, Coca Zéro, San Pellegrino, Fuze Tea, Orangina", price: "2,00 €" },
          { name: "Maxi 1,5L",     desc: "Coca-Cola, Coca Zéro, Fanta, Ice Tea",                     price: "3,90 €" },
          { name: "Maxi Oasis 2L", desc: "Oasis Tropical format familial",                           price: "4,50 €" }
        ]
      }
    ]
  }
}
