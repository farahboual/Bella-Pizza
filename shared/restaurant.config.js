/**
 * ===================================================================
 * RESTAURANT CONFIG — BELLA PIZZA (L'ATELIER NAPOLETANO)
 * ===================================================================
 */

export const RESTAURANT_CONFIG = {

  // ─── 1. BRAND & IDENTITY ──────────────────────────────────────────
  brand: {
    name:          "Bella Pizza",
    shortName:     "Bella Pizza",
    tagline:       "Pizzeria Napolitaine & Smash Burgers Artisanaux",
    subTagline:    "Pâte pétrie chaque jour, fermentation lente, cuisson vive à haute température. Produits frais d'Italie et viandes sélectionnées.",
    heroTitle:     "L'Art de la Napolitaine",
    heroHighlight: "au Feu de Bois.",
    heroBadge:     "Cuisine artisanale & cuissons minute",
    badgeFloat:    { title: "Préparation Minute", subtitle: "Sur place & Livraison" },

    logoUrl:   "/client-assets/logo.png",
    heroImage: "/client-assets/hero.jpg",

    metaDescription: "Bella Pizza — Pizzeria napolitaine artisanale & smash burgers gourmets. Commande en ligne, livraison soignée et à emporter.",
    footerNote:      "Tous nos plats sont préparés à la commande à partir de produits bruts et sélectionnés.",
    mentions:        "Bella Pizza Pizzeria · Pour votre santé, pratiquez une activité physique régulière — www.mangerbouger.fr"
  },

  // ─── 2. THEME & COLORS (L'ATELIER NAPOLETANO) ─────────────────────
  theme: {
    primaryColor:    "#7A1C1C",   // Deep Oxblood
    primaryHover:    "#5C1414",   // Dark Barolo
    primaryLight:    "#FFFFFF",   // Pure Alabaster card
    backgroundColor: "#FBF9F5",   // Warm Alabaster Background
    textColor:       "#181513",   // Deep Espresso Text
    accentGold:      "#C8A97E",   // Antique Gold
    borderColor:     "#EAE4DC",   // Limestone Border
    fontFamily:      "'General Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
    fontSerif:       "'Fraunces', Georgia, serif"
  },

  // ─── 3. CONTACT & LOCATION ────────────────────────────────────────
  contact: {
    phone:    "01 42 68 55 00",
    phoneRaw: "+33142685500",
    email:    "contact@bellapizza-demo.fr",
    address: {
      street:     "12 Rue de la Pizza Napolitaine",
      postalCode: "75002",
      city:       "Paris",
      full:       "12 Rue de la Pizza Napolitaine, 75002 Paris"
    },
    mapsUrl: "https://maps.google.com"
  },

  // ─── 4. FEATURE TOGGLES ───────────────────────────────────────────
  features: {
    takeaway:    true,
    delivery:    true,
    dineIn:      true,
    pizzaDeals:  false,
    drinkDeals:  true,
    halalBadge:  true,
    promoBanner: true,
    bestsellers: true
  },

  // ─── 5. DELIVERY RULES ────────────────────────────────────────────
  delivery: {
    minOrderCents:          1800,  // 18.00 € minimum
    freeDeliveryAboveCents: 2500,  // 25.00 € free delivery
    deliveryFeeCents:        200,  // 2.00 € fee
    allowedPostcodes: [],          // Open in demo mode
    conditionText: "Livraison express en sac isotherme haute température. Frais offerts dès 25 €."
  },

  // ─── 6. OPENING SCHEDULE ──────────────────────────────────────────
  schedule: {
    displayText: "7j/7 · 11h45–14h30 & 18h30–23h00",
    weekly: {
      lun: { open: true, lunchStart: '11:45', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mar: { open: true, lunchStart: '11:45', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mer: { open: true, lunchStart: '11:45', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      jeu: { open: true, lunchStart: '11:45', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      ven: { open: true, lunchStart: '11:45', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:30' },
      sam: { open: true, lunchStart: '11:45', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:30' },
      dim: { open: true, lunchStart: '11:45', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:00' }
    }
  },

  // ─── 7. IMAGES ────────────────────────────────────────────────────
  images: {
    pizzas:   "/client-assets/pizza.jpg",
    burgers:  "/client-assets/burgers.jpg",
    boissons: "/client-assets/boissons.jpg",
    desserts: "/client-assets/desserts.jpg",
    items: {
      'margherita-dop':                 '/client-assets/pizza.jpg',
      'regina-royale':                  '/client-assets/regina-royale.jpg',
      'diavola-piccante':               '/client-assets/pepperoni.jpg',
      '4-formaggi-rustica':             '/client-assets/pizza-4fromages.jpg',
      'burratissima-di-bella':          '/client-assets/burratissima.jpg',
      'tartufo-suprema':                '/client-assets/tartufo-suprema.jpg',
      'double-smash-cheese':            '/client-assets/burgers.jpg',
      'truffle-smash-burger':           '/client-assets/truffle-burger.jpg',
      'smokey-bacon-bbq':               '/client-assets/smokey-bacon-bbq.jpg',
      'crispy-chicken-spicy':           '/client-assets/burger-chicken.jpg',
      'san-pellegrino-limonata':        '/client-assets/san-pellegrino-limonata.jpg',
      'san-pellegrino-aranciata-rossa': '/client-assets/san-pellegrino-aranciata.jpg',
      'coca-cola-vintage-bouteille-verre': '/client-assets/boissons.jpg',
      'fuze-tea-peche-intense':         '/client-assets/boissons.jpg',
      'tiramisu-maison-tradizionale':   '/client-assets/tiramisu-tramonto.jpg',
      'pizza-choco-noisette-pistache':  '/client-assets/desserts.jpg'
    }
  }
};
