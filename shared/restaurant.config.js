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
    name: "Taco Pizza",
    shortName: "TacoPizza",
    tagline: "Le goût du fait maison !",
    subTagline: "Des produits frais, des recettes généreuses et une équipe passionnée pour vous régaler.",
    heroTitle: "Le goût du",
    heroHighlight: "fait maison !",
    heroBadge: "🍕 Fait maison chaque jour",
    badgeFloat: {
      title: "Livraison gratuite",
      subtitle: "dès 25 €"
    },
    metaDescription: "Commandez en ligne vos pizzas, tacos, burgers et plats préparés maison. Livraison rapide ou à emporter.",
    footerNote: "Pâte fraîche maison & ingrédients sélectionnés avec soin.",
    mentions: "Tarifs sous réserve d'erreurs typographiques ou de modifications ultérieures. Promotions valables jusqu'à l'édition d'un nouveau prospectus. Offres non cumulables. Photos non contractuelles. Pour votre santé, pratiquez une activité physique régulière — www.mangerbouger.fr"
  },

  // --- 2. THEME & COLORS ---
  // Change primaryColor to instantly re-theme the entire website, buttons, badges & dashboards!
  // Examples:
  // - Pizzeria / Fast Food: #C41E17 (Red)
  // - Bistro / Grill / Burger: #D97706 (Amber) or #B45309
  // - Healthy / Salads / Vegetarian: #059669 (Emerald)
  // - Japanese / Sushi: #DC2626 (Crimson) or #0F172A (Navy/Gold)
  // - Modern Café / Bakery: #78350F (Warm Brown) or #4F46E5 (Indigo)
  theme: {
    primaryColor: "#C41E17",
    primaryHover: "#E82020",
    primaryLight: "#fff5f4",
    fontFamily: "'Nunito', 'Archivo', Arial, sans-serif"
  },

  // --- 3. CONTACT & LOCATION ---
  contact: {
    phone: "02 41 03 57 87",
    phoneRaw: "+33241035787",
    email: "contact@restaurant.fr",
    address: {
      street: "15 rue de Rouen",
      postalCode: "49400",
      city: "Saumur",
      full: "15 rue de Rouen, 49400 Saumur"
    },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taco+Pizza+15+rue+de+Rouen+49400+Saumur"
  },

  // --- 4. FEATURE TOGGLES ---
  // Turn specific modules ON or OFF per restaurant client
  features: {
    takeaway: true,       // Click & Collect (À emporter)
    delivery: true,       // Delivery (Livraison)
    dineIn: true,         // On-site table / QR code ordering (Sur place)
    pizzaDeals: true,     // "2 pizzas bought = 3rd free" (set false for non-pizzerias)
    drinkDeals: true,     // "Canette 1€ with food" promotion
    halalBadge: true,     // Display Halal mention/badge
    promoBanner: true,    // Highlight banner for specials/deals
    bestsellers: true     // "Nos incontournables" section
  },

  // --- 5. DELIVERY RULES ---
  delivery: {
    minOrderCents: 2500,          // 25.00 € minimum order for delivery
    freeDeliveryAboveCents: 2500, // 25.00 € for free delivery
    deliveryFeeCents: 0,          // Additional fee in cents if below free threshold
    allowedPostcodes: ["49400"],  // Empty array [] allows all postcodes
    conditionText: "Livraison gratuite à domicile et au bureau, à partir de 25 € de commande. Zone de livraison limitée. Minimum de commande 25 €. Paiement sur place ou en ligne (CB, Mastercard, Visa). Par mesure de sécurité, nos livreurs n'ont pas plus de 15 € sur eux, merci de faire l'appoint."
  },

  // --- 6. OPENING SCHEDULE ---
  // Configures the dynamic "Ouvert / Fermé" status badge and orders gating
  schedule: {
    displayText: "Ouvert 7j/7 · 11h à 14h30 et 18h à 23h",
    weekly: {
      lun: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
      mar: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
      mer: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
      jeu: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
      ven: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:30' },
      sam: { open: true, lunchStart: '11:00', lunchEnd: '15:00', eveStart: '18:00', eveEnd: '23:30' },
      dim: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' }
    }
  }
}
