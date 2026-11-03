/**
 * ===================================================================
 * RESTAURANT CONFIG — BELLA PIZZERIA (DEMO FLAGSHIP)
 * ===================================================================
 */

export const RESTAURANT_CONFIG = {

  // ─── 1. BRAND & IDENTITY ──────────────────────────────────────────
  brand: {
    name:          "Bella Pizza",
    shortName:     "Bella Pizza",
    tagline:       "Pizzeria Napolitaine & Smash Burgers Artisanaux",
    subTagline:    "Farine italienne type 00, fermentation 72h, cuisson au feu de bois à 480°C. Produits nobles d'Italie et viande française.",
    heroTitle:     "L'Art de la Napolitaine",
    heroHighlight: "au Feu de Bois.",
    heroBadge:     "Pâte au levain 72h · Cuisson 90 sec à 480°C",
    badgeFloat:    { title: "Livraison Chaude", subtitle: "En moins de 30 min" },

    logoUrl:   "/client-assets/logo.png",
    heroImage: "/client-assets/hero.jpg",

    metaDescription: "Bella Pizza — Pizzeria napolitaine artisanale & smash burgers gourmets. Commande en ligne, livraison rapide et à emporter.",
    footerNote:      "Tous nos produits sont préparés à la commande avec des ingrédients frais importés d'Italie.",
    mentions:        "Bella Pizza Pizzeria · Pour votre santé, pratiquez une activité physique régulière — www.mangerbouger.fr"
  },

  // ─── 2. THEME & COLORS (ITALIAN TRICOLOR & LUXURY DARK SLATE) ─────
  theme: {
    primaryColor:    "#C81D25",   // Italian Tomato Red
    primaryHover:    "#A7151C",   // Deep Crimson hover
    primaryLight:    "#FDFBF7",   // Warm Fior di Latte background
    backgroundColor: "#111413",  // Dark Slate / Wood Oven Ambiance
    textColor:       "#F5F2EB",   // Creamy warm text
    fontFamily:      "'Plus Jakarta Sans', 'Playfair Display', sans-serif"
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
      'margherita-dop':        '/client-assets/pizza.jpg',
      'burratissima-di-bella': '/client-assets/burratissima.jpg',
      'regina-royale':         '/client-assets/pizza.jpg',
      'diavola-piccante':      '/client-assets/calzone.jpg',
      '4-formaggi-rustica':    '/client-assets/4-fromages-tramonto.jpg',
      'tartufo-suprema':       '/client-assets/pizza.jpg',
      'double-smash-cheese':   '/client-assets/burgers.jpg',
      'truffle-smash-burger':  '/client-assets/burgers.jpg',
      'smokey-bacon-bbq':      '/client-assets/burgers.jpg',
      'crispy-chicken-spicy':  '/client-assets/burgers.jpg',
      'tiramisu-maison-tradizionale': '/client-assets/tiramisu-tramonto.jpg'
    }
  }
};
