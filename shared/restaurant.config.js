/**
 * ===================================================================
 * RESTAURANT CONFIGURATION — SINGLE SOURCE OF TRUTH (WHITE-LABEL)
 * ===================================================================
 * To configure this platform for a new restaurant client, edit this
 * single file. All storefront components, kitchen screen, manager
 * portal, and order validation rules will update automatically.
 */

export const RESTAURANT_CONFIG = {
  // --- 1. BRAND & IDENTITY ---
  brand: {
    name: "L'Atelier Gourmand",
    // logoUrl: "/logo.png",   // ← Uncomment & point to your image to override the SVG logo
    shortName: "Atelier",
    tagline: "Cuisine authentique & produits frais",
    subTagline: "Des recettes généreuses préparées chaque jour avec des ingrédients frais, locaux et de saison.",
    heroTitle: "Le goût des",
    heroHighlight: "bonnes choses.",
    heroBadge: "✨ Cuisine fraîche & fait maison",
    badgeFloat: {
      title: "Livraison offerte",
      subtitle: "dès 25 €"
    },
    metaDescription: "Commandez en ligne nos spécialités faites maison, pizzas artisanales et burgers gourmets. Livraison rapide ou à emporter.",
    footerNote: "Produits frais & ingrédients rigoureusement sélectionnés.",
    mentions: "Tarifs indicatifs sous réserve de modifications. Promotions non cumulables. Pour votre santé, pratiquez une activité physique régulière — www.mangerbouger.fr"
  },

  // --- 2. THEME & COLORS (Option 2: Nude / Warm Sandstone & Muted Almond) ---
  theme: {
    primaryColor: "#A3785E",   // Warm Sandstone / Earthy Cocoa
    primaryHover: "#8B5E45",   // Roasted Almond / Deeper Sandstone
    primaryLight: "#FAF6F1",   // Oat Milk Cream
    backgroundColor: "#F5F2EB",// Warm Stone Linen
    textColor: "#28231F",      // Dark Mocha Charcoal
    fontFamily: "'Nunito', 'Archivo', Arial, sans-serif"
  },

  // --- 3. CONTACT & LOCATION ---
  contact: {
    phone: "01 42 68 55 00",
    phoneRaw: "+33142685500",
    email: "contact@latelier-gourmand.fr",
    address: {
      street: "18 Rue des Gourmets",
      postalCode: "75002",
      city: "Paris",
      full: "18 Rue des Gourmets, 75002 Paris"
    },
    mapsUrl: "https://maps.google.com/?q=Paris"
  },

  // --- 4. FEATURE TOGGLES ---
  features: {
    takeaway: true,       // Click & Collect (À emporter)
    delivery: true,       // Delivery (Livraison)
    dineIn: true,         // On-site table / QR code ordering (Sur place)
    pizzaDeals: true,     // "2 pizzas achetées = 3ème offerte"
    drinkDeals: true,     // "Canette à prix réduit avec un plat"
    halalBadge: false,    // Neutral bistro feel
    promoBanner: true,    // Highlight banner for specials
    bestsellers: true     // "Nos incontournables"
  },

  // --- 5. DELIVERY RULES ---
  delivery: {
    minOrderCents: 2000,          // 20.00 € minimum order
    freeDeliveryAboveCents: 2500, // 25.00 € for free delivery
    deliveryFeeCents: 250,        // 2.50 € delivery fee
    allowedPostcodes: [],         // [] = accepts all postal codes in demo mode!
    conditionText: "Livraison offerte à partir de 25 € de commande. Préparation soignée et livraison rapide dans des emballages éco-responsables."
  },

  // --- 6. OPENING SCHEDULE ---
  schedule: {
    displayText: "Mardi au Dimanche · 11h30 à 14h30 & 18h30 à 23h00",
    weekly: {
      lun: { open: false, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mar: { open: true, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      mer: { open: true, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      jeu: { open: true, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:00' },
      ven: { open: true, lunchStart: '11:30', lunchEnd: '14:30', eveStart: '18:30', eveEnd: '23:30' },
      sam: { open: true, lunchStart: '11:30', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:30' },
      dim: { open: true, lunchStart: '11:30', lunchEnd: '15:00', eveStart: '18:30', eveEnd: '23:00' }
    }
  }
}
