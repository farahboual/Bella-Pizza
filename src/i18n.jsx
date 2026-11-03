import { createContext, useContext, useState, useEffect } from 'react'

const LangCtx = createContext({ lang: 'fr', setLang: () => {}, t: () => '' })

export const translations = {
  fr: {
    navCarte: "La Carte",
    navDelivery: "Livraison & Accès",
    navHours: "Horaires",
    cartTitle: "Votre Panier",
    cartEmpty: "Votre panier est vide",
    cartEmptySub: "Découvrez nos pizzas cuites au feu de bois et nos smash burgers !",
    subtotal: "Sous-total",
    deliveryFee: "Frais de livraison",
    free: "Offert",
    checkout: "Commander",
    badgeBestSeller: "Best-seller",
    badgeChefsPick: "Sélection du Chef",
    badgeHalal: "Certifié Halal",
    badgeHomemade: "Pâte au levain 72h",
    badgeReviews: "4.9 ★ 180+ avis",
    chooseSauce: "Choix des Sauces Maison (inclus)",
    chooseSauceSub: "Sélectionnez vos sauces préférées :",
    crustOptions: "Suppléments Gourmands",
    selectSize: "Taille de pizza :",
    callToOrder: "Appeler",
    add: "Ajouter",
    added: "Ajouté !",
    orderOnline: "Commander en ligne →",
    viewMenu: "Voir la carte →",
    heroTitle: "L'Art de la Napolitaine",
    heroHighlight: "au Feu de Bois.",
    heroSubtitle: "Pizzas napolitaines à pâte maturée 72h, smash burgers d'exception & dolci italiens.",
    deliveryNotice: "Livraison express en sac isotherme · Préparation minute",
    openNow: "Ouvert actuellement",
    closedNow: "Fermé actuellement",
    filterAll: "Tout voir",
    searchPlaceholder: "Rechercher une pizza, un burger...",
    sauceHint: "Sauce incluse avec vos frites maison",
    dealCanette: "Offre Boisson",
    dealCanetteSub: "1 canette fraîche à seulement 1 € avec votre plat",
    confirmOrder: "Valider la commande"
  },
  en: {
    navCarte: "The Menu",
    navDelivery: "Delivery & Location",
    navHours: "Hours",
    cartTitle: "Your Cart",
    cartEmpty: "Your cart is empty",
    cartEmptySub: "Explore our wood-fired Neapolitan pizzas & gourmet smash burgers!",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    free: "Free",
    checkout: "Checkout",
    badgeBestSeller: "Bestseller",
    badgeChefsPick: "Chef's Pick",
    badgeHalal: "Halal Certified",
    badgeHomemade: "72h Sourdough Crust",
    badgeReviews: "4.9 ★ 180+ reviews",
    chooseSauce: "Choose House Sauces (included)",
    chooseSauceSub: "Pick your favorite dipping sauces:",
    crustOptions: "Gourmet Extras",
    selectSize: "Pizza Size:",
    callToOrder: "Call Us",
    add: "Add to cart",
    added: "Added!",
    orderOnline: "Order Online →",
    viewMenu: "Explore Menu →",
    heroTitle: "The Art of Neapolitan",
    heroHighlight: "Wood-Fired Pizza.",
    heroSubtitle: "72-hour slow fermented dough, artisanal smash burgers & handcrafted Italian dolci.",
    deliveryNotice: "Thermal delivery bag express · Freshly made to order",
    openNow: "Open now",
    closedNow: "Currently closed",
    filterAll: "View all",
    searchPlaceholder: "Search for a pizza, burger...",
    sauceHint: "House sauces included with fresh fries",
    dealCanette: "Drink Special",
    dealCanetteSub: "Chilled soda for only 1 € with any main dish",
    confirmOrder: "Place Order"
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
        <span className="lang-flag">🇫🇷</span>
        <span className="lang-code">FR</span>
      </button>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-label="English"
      >
        <span className="lang-flag">🇬🇧</span>
        <span className="lang-code">EN</span>
      </button>
    </div>
  )
}
