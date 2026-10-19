# Resto General — Plateforme Restaurant & Commande en Ligne (White-Label)

Plateforme moderne de commande en ligne pour restaurants, pizzerias, snacks, bistrots et fast-food. Conçue pour être déployée clé en main en **15 minutes** par client.

- **0 % de commission** (alternative directe aux 30% d'UberEats / Deliveroo)
- **Coût d'hébergement quasi nul** (Vercel Serverless + Supabase tier gratuit + Stripe Checkout)
- **Écran cuisine temps réel (`/cuisine`)** avec carillon sonore et impression directe de tickets 80 mm (ESC/POS)
- **Espace gérant (`/gerant`)** : gestion des stocks/ruptures, fermeture exceptionnelle, codes promo, générateur de QR codes tables, et rapport de caisse (Rapport Z)

---

## ⚡ Configuration White-Label en 1 Fichier

Pour configurer la plateforme pour un nouveau restaurant client, modifiez uniquement :
`shared/restaurant.config.js`

```js
export const RESTAURANT_CONFIG = {
  brand: {
    name: "Nom du Restaurant",
    tagline: "Cuisine authentique & produits frais",
    heroTitle: "Le goût du",
    heroHighlight: "fait maison !",
    // ...
  },
  theme: {
    primaryColor: "#059669", // Change la couleur d'accent de tout le site, boutons et dashboards
    primaryHover: "#047857"
  },
  contact: {
    phone: "01 23 45 67 89",
    phoneRaw: "+33123456789",
    address: { full: "10 rue de Paris, 75001 Paris" },
    mapsUrl: "https://maps.google.com/?q=..."
  },
  features: {
    takeaway: true,      // Click & Collect
    delivery: true,      // Livraison
    dineIn: true,        // Commande sur place avec QR Code Table
    pizzaDeals: false,   // Offre 3ème pizza offerte (activer pour pizzerias)
    drinkDeals: true     // Remise boisson avec plat
  },
  delivery: {
    minOrderCents: 2500, // 25.00 € minimum
    allowedPostcodes: ["75001", "75002"] // [] = toutes zones
  }
}
```

---

## 🏗️ Architecture

- **Client** : React 18 + Vite + Framer Motion. Theming dynamique via variables CSS injectées depuis `restaurant.config.js`.
- **API & Sécurité** : Fonctions Vercel Serverless (`api/` et `lib/handlers.js`). Calcul des prix autoritaire côté serveur pour empêcher toute falsification de prix.
- **Base de données** : Supabase PostgreSQL (commandes, configuration, ruptures de stock, codes promo, articles personnalisés).
- **Paiements** : Stripe Checkout (Cartes, Apple Pay, Google Pay).
- **Écran Cuisine (`/cuisine`)** : Polling 3s, réveil écran (`navigator.wakeLock`), alarme sonore synchrone (`AudioContext`), impression thermique 80 mm.
- **Espace Gérant (`/gerant`)** : Interface d'administration protégée par mot de passe.

---

## 🚀 Déploiement d'un nouveau client (15 min)

1. **GitHub** :
   Pousser le code sur le repository :
   ```bash
   git remote add origin https://github.com/mounirhsairi/resto_general.git
   git push -u origin main
   ```

2. **Supabase** :
   - Créer un projet Supabase gratuit.
   - Aller dans **SQL Editor** et exécuter le contenu de `supabase/schema.sql`.
   - Récupérer l'URL du projet et la clé `service_role` (Settings > API).

3. **Vercel** :
   - Importer le dépôt GitHub sur Vercel.
   - Renseigner les variables d'environnement (voir `.env.example`) :
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `KITCHEN_PASSWORD` (mot de passe d'accès pour `/cuisine` et `/gerant`)
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `PUBLIC_URL`

4. **Stripe (Mode Réel)** :
   - Connecter le compte Stripe du client (IBAN + SIRET).
   - Ajouter l'endpoint Webhook : `https://VOTRE-DOMAINE/api/stripe-webhook` avec les événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
   - Copier le signing secret dans `STRIPE_WEBHOOK_SECRET`.

---

## 💻 Développement local

```bash
# Installation des dépendances
npm install

# Lancement en local (serveur complet avec API + DB mémoire si Supabase non configuré)
npm run build
npm start
# -> http://localhost:3000

# Lancer la suite de tests automatisés (16 validations de sécurité et de flux)
npm run test:server
```
