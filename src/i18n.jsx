import { createContext, useContext, useState, useEffect } from 'react'

const LangCtx = createContext({ lang: 'fr', setLang: () => {}, t: () => '' })

export const translations = {
  fr: {
    navCarte: "La Carte",
    navDelivery: "Livraison & Accès",
    navHours: "Horaires",
    cartTitle: "Votre Panier",
    cartEmpty: "Votre panier est vide",
    cartEmptySub: "Découvrez nos pizzas cuites au feu de bois et nos smash burgers.",
    subtotal: "Sous-total",
    deliveryFee: "Frais de livraison",
    free: "Offert",
    checkout: "Commander",
    badgeBestSeller: "Signature",
    badgeChefsPick: "Création Maison",
    badgeHalal: "Sélection Viandes Fraîches",
    badgeHomemade: "Pâte Pétrie Maison",
    badgeReviews: "Préparation Minute",
    badgeCraft: "Artisan Pizzaiolo",
    chooseSauce: "Choix des Sauces Maison (inclus)",
    chooseSauceSub: "Sélectionnez vos sauces préférées :",
    crustOptions: "Suppléments Gourmands",
    selectSize: "Taille de pizza :",
    callToOrder: "Appeler",
    add: "Ajouter au panier",
    added: "Ajouté !",
    orderOnline: "Commander en ligne",
    viewMenu: "Découvrir la carte",
    heroTitle: "L'Art de la Napolitaine",
    heroHighlight: "Façonnée à la main.",
    heroSubtitle: "Pâte pétrie chaque jour, fermentation lente & smash burgers d'artisan cuits à la commande.",
    deliveryNotice: "Préparation minute • Livraison soignée & à emporter",
    openNow: "Ouvert actuellement",
    closedNow: "Fermé actuellement",
    filterAll: "Tout",
    searchPlaceholder: "Rechercher une pizza, un burger...",
    sauceHint: "Sauce incluse avec vos frites maison",
    dealCanette: "Offre Boisson Fraîche",
    dealCanetteSub: "Une boisson italienne fraîche à 2,00 € avec votre plat",
    confirmOrder: "Valider la commande",
    // Categories
    catPizzas: "Pizzas Napolitaines",
    catBurgers: "Smash Burgers",
    catBoissons: "Boissons & Mocktails",
    catDesserts: "Dolci & Desserts",
    // Info Cards
    infoDeliveryTitle: "Livraison Express",
    infoDeliverySub: "À domicile ou au bureau",
    infoMinOrder: "Minimum de commande",
    infoFee: "Frais de livraison",
    infoFreeAbove: "Livraison offerte dès",
    infoPayments: "Moyens de paiement",
    infoPaymentsVal: "CB, Visa, Mastercard, Apple Pay, Espèces",
    infoAddressTitle: "Adresse & Contact",
    infoDirections: "Itinéraire Maps",
    infoHoursTitle: "Horaires d'Ouverture",
    infoHoursSub: "Service midi & soir 7j/7",
    dayMon: "Lundi",
    dayTueSun: "Mardi – Dimanche",
    statusClosed: "Fermé",
    // Customizer Modal
    modalCustomizeTitle: "Personnaliser votre choix",
    modalChooseCrust: "Choix de la pâte & empâtement",
    modalCrustClassic: "Tradition Napolitaine",
    modalCrustClassicDesc: "Fermentation lente 72h au levain naturel, bords alvéolés cuits au feu de bois.",
    modalCrustCheesy: "Croûte Farcie à la Ricotta di Bufala",
    modalCrustCheesyDesc: "Bords roulés garnis de ricotta fraîche et mozzarella fondante (+2,50 €).",
    modalSaucesTitle: "Sauces & Émulsions de l'Atelier",
    modalSaucesSub: "Jusqu'à 2 sauces artisanales offertes",
    modalSaucesLimit: "2 sauces incluses offertes",
    modalSauces: "Sauce incluse (jusqu'à 2 au choix)",
    modalExtrasTitle: "Suppléments & Finitions Gastronomiques",
    modalExtrasSub: "Sublimez votre plat avec des ingrédients nobles sélectionnés",
    modalExtras: "Extras & Gourmandises",
    modalExtraBurrata: "Burratina crémeuse des Pouilles 125g (+2,50 €)",
    modalExtraTruffle: "Crème de truffe noire d'Italie (+2,00 €)",
    modalExtraBacon: "Bacon de bœuf croustillant fumé (+1,50 €)",
    modalChefNote: "Précisions pour le pizzaïolo (optionnel)",
    modalChefNotePlaceholder: "Ex. : cuisson légèrement plus poussée, sans basilic...",
    modalBasePrice: "Prix de base",
    modalExtrasPrice: "Suppléments",
    modalTotalCustom: "Total personnalisé",
    modalTotal: "Total",
    modalAddToCart: "Ajouter au panier",
    // Upsell
    upsellTitle: "Envie d'une boisson fraîche ?",
    upsellAdd: "Ajouter",
    // Cart inputs
    cartName: "Votre Nom",
    cartPhone: "Numéro de téléphone",
    cartAddress: "Adresse de livraison",
    cartAddressHint: "Numéro, rue, code postal, ville",
    cartNote: "Instructions pour la cuisine ou le livreur",
    cartNotePlaceholder: "Ex: sans oignons, code porte 1234, interphone...",
    cartTakeaway: "À emporter (Click & Collect)",
    cartDelivery: "Livraison à domicile",
    cartDineIn: "Sur place (Table)",
    cartPaymentOnSite: "Paiement sur place (CB ou Espèces)",
    cartPaymentOnline: "Paiement sécurisé par Carte",
    cartTablePrompt: "Numéro de votre table",
    cartClose: "Fermer"
  },
  en: {
    navCarte: "The Menu",
    navDelivery: "Delivery & Access",
    navHours: "Hours",
    cartTitle: "Your Order",
    cartEmpty: "Your cart is empty",
    cartEmptySub: "Discover our wood-fired Neapolitan pizzas & artisanal smash burgers.",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    free: "Free",
    checkout: "Checkout",
    badgeBestSeller: "Signature",
    badgeChefsPick: "House Creation",
    badgeHalal: "Fresh Meats Selection",
    badgeHomemade: "Handcrafted Dough",
    badgeReviews: "Freshly Made to Order",
    badgeCraft: "Artisan Pizzaiolo",
    chooseSauce: "Included House Sauces",
    chooseSauceSub: "Select your favorite sauces:",
    crustOptions: "Gourmet Extras",
    selectSize: "Pizza Size:",
    callToOrder: "Call Us",
    add: "Add to cart",
    added: "Added!",
    orderOnline: "Order Online",
    viewMenu: "Explore the Menu",
    heroTitle: "The Art of Neapolitan",
    heroHighlight: "Handcrafted to Order.",
    heroSubtitle: "Daily hand-kneaded dough, slow fermentation & artisanal smash burgers cooked fresh.",
    deliveryNotice: "Freshly made to order • Careful delivery & takeaway",
    openNow: "Currently Open",
    closedNow: "Currently Closed",
    filterAll: "All",
    searchPlaceholder: "Search pizza, burger, drink...",
    sauceHint: "House sauces included with fresh fries",
    dealCanette: "Chilled Drink Deal",
    dealCanetteSub: "Add an Italian cold soda for 2.00 € with your dish",
    confirmOrder: "Place Order",
    // Categories
    catPizzas: "Neapolitan Pizzas",
    catBurgers: "Smash Burgers",
    catBoissons: "Drinks & Mocktails",
    catDesserts: "Dolci & Desserts",
    // Info Cards
    infoDeliveryTitle: "Express Delivery",
    infoDeliverySub: "To your home or office",
    infoMinOrder: "Minimum order",
    infoFee: "Delivery fee",
    infoFreeAbove: "Free delivery from",
    infoPayments: "Payment methods",
    infoPaymentsVal: "Card, Visa, Mastercard, Apple Pay, Cash",
    infoAddressTitle: "Location & Contact",
    infoDirections: "Get Directions",
    infoHoursTitle: "Opening Hours",
    infoHoursSub: "Lunch & Dinner 7 days a week",
    dayMon: "Monday",
    dayTueSun: "Tuesday – Sunday",
    statusClosed: "Closed",
    // Customizer Modal
    modalCustomizeTitle: "Customize your dish",
    modalChooseCrust: "Dough & Crust Selection",
    modalCrustClassic: "Neapolitan Tradition",
    modalCrustClassicDesc: "Slow 72h sourdough fermentation, light airy wood-fired crust.",
    modalCrustCheesy: "Stuffed Crust Ricotta di Bufala",
    modalCrustCheesyDesc: "Hand-rolled crust stuffed with fresh ricotta & melted mozzarella (+2.50 €).",
    modalSaucesTitle: "Artisanal Sauces & Emulsions",
    modalSaucesSub: "Up to 2 complimentary house sauces",
    modalSaucesLimit: "2 complimentary sauces included",
    modalSauces: "Included Sauces (choose up to 2)",
    modalExtrasTitle: "Gourmet Extras & Noble Toppings",
    modalExtrasSub: "Elevate your dish with chef-selected ingredients",
    modalExtras: "Extras & Toppings",
    modalExtraBurrata: "Creamy Whole Pugliese Burratina 125g (+2.50 €)",
    modalExtraTruffle: "Italian Black Truffle Cream (+2.00 €)",
    modalExtraBacon: "Crispy Wood-Smoked Beef Bacon (+1.50 €)",
    modalChefNote: "Special instructions for the chef (optional)",
    modalChefNotePlaceholder: "E.g.: crust slightly well-done, no oregano...",
    modalBasePrice: "Base price",
    modalExtrasPrice: "Extras",
    modalTotalCustom: "Custom total",
    modalTotal: "Total",
    modalAddToCart: "Add to order",
    // Upsell
    upsellTitle: "Add a refreshing drink?",
    upsellAdd: "Add",
    // Cart inputs
    cartName: "Your Full Name",
    cartPhone: "Phone number",
    cartAddress: "Delivery Address",
    cartAddressHint: "Street address, apartment, postal code, city",
    cartNote: "Special instructions for the kitchen or courier",
    cartNotePlaceholder: "E.g. no onions, door code 1234, floor 2...",
    cartTakeaway: "Takeaway (Click & Collect)",
    cartDelivery: "Home Delivery",
    cartDineIn: "Dine-in (Table)",
    cartPaymentOnSite: "Pay on-site (Card or Cash)",
    cartPaymentOnline: "Secure Card Checkout",
    cartTablePrompt: "Table number",
    cartClose: "Close"
  }
}

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('bp_lang') || 'fr'
    } catch {
      return 'fr'
    }
  })

  const setLang = (newLang) => {
    setLangState(newLang)
    try {
      localStorage.setItem('bp_lang', newLang)
    } catch {}
  }

  const t = (key) => translations[lang]?.[key] || translations.fr[key] || key

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)

export const LanguageToggle = () => {
  const { lang, setLang } = useLang()

  return (
    <div className="lang-toggle-container" role="group" aria-label="Language selection">
      <button
        type="button"
        className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
        onClick={() => setLang('fr')}
        aria-label="Français"
      >
        <span className="lang-code">FR</span>
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-label="English"
      >
        <span className="lang-code">EN</span>
      </button>
    </div>
  )
}
