# 🚀 Guide de Personnalisation Express (Nouveau Client en 15 min)

Ce guide est conçu pour vous permettre de dupliquer et livrer un site clé-en-main pour n'importe quelle pizzeria, burger restaurant ou brasserie en **moins de 15 minutes**, sans toucher à la logique complexe du code.

---

## 📋 Résumé des 3 Étapes

| Étape | Fichier / Emplacement | Temps estimé |
|---|---|---|
| **1. Identité & Menu** | `shared/restaurant.config.js` | 7 min |
| **2. Photos du restaurant** | `public/client-assets/` | 5 min |
| **3. Variables & Déploiement** | `.env` / Vercel | 3 min |

---

## 🛠️ ÉTAPE 1 : Configurer le Restaurant (`shared/restaurant.config.js`)

Ouvrez le fichier `shared/restaurant.config.js`. C'est le **centre de contrôle unique** de la marque blanche.

### 1.1 Identité de Marque
```javascript
brand: {
  name: "Nom du Restaurant",             // ex: "Pizza Bella", "Le Smash Gourmet"
  tagline: "Pizzeria Artisanale au Feu de Bois",
  heroTitle: "L'art de la vraie pizza",
  heroHighlight: "italienne.",
  description: "Pâte maturée 48h et produits frais italiens..."
}
```

### 1.2 Coordonnées & Accès
```javascript
contact: {
  phone: "01 42 00 00 00",               // Téléphone affiché
  phoneRaw: "+33142000000",             // Format international pour WhatsApp & appels
  email: "contact@pizzabella.fr",
  address: {
    street: "12 Rue de la Paix",
    city: "Paris",
    postalCode: "75002",
    country: "France"
  },
  mapsUrl: "https://goo.gl/maps/..."     // Lien direct Google Maps du client
}
```

### 1.3 Paramètres de Commande & Livraison
```javascript
features: {
  takeaway: true,    // Vente à emporter (Click & Collect)
  delivery: true,    // Livraison à domicile
  dineIn: true       // Commande à table (QR Code)
},
delivery: {
  minOrderCents: 2000,           // 20.00 € minimum pour être livré
  freeDeliveryAboveCents: 3000,  // Livraison offerte dès 30.00 €
  deliveryFeeCents: 250,         // Frais de livraison (ex: 2.50 €)
  allowedPostcodes: ["75001", "75002"] // Laisser vide [] pour accepter tous les codes postaux
}
```

### 1.4 Horaires d'ouverture
Ajustez les heures pour chaque jour (`open: true/false`, `lunchStart`, `eveStart`, etc.).

---

## 📸 ÉTAPE 2 : Déposer les Photos du Client (`public/client-assets/`)

Toutes les photos sont regroupées dans `public/client-assets/`.

Il vous suffit de remplacer les fichiers par les photos du client (ou vos photos générées) en gardant les mêmes noms :

1. **`hero.jpg`** : La photo d'ambiance principale plein écran (la table, le four, ou le plat signature).
2. **`pizza.jpg`** : Photo de couverture pour la catégorie Pizzas.
3. **`burgers.jpg`** : Photo de couverture pour les Burgers.
4. **`salades.jpg`** : Photo pour les Salades.
5. **`tapas.jpg`** : Photo pour les Entrées / Tapas / Tex-Mex.
6. **`desserts.jpg`** : Photo pour les Desserts.
7. **`boissons.jpg`** : Photo pour les Boissons.

> **Astuce Gain de Temps** : Si le client n'a pas de photos pour certains plats individuels, le système bascule automatiquement sur la photo de catégorie par défaut. Aucune image brisée possible.

---

## 🔐 ÉTAPE 3 : Variables & Déploiement Vercel

Dans les **Environment Variables** de votre projet sur [Vercel](https://vercel.com) (ou dans votre fichier `.env`) :

```env
# Clé secrète d'accès pour l'écran Cuisine & Gérant
KITCHEN_KEY=mot_de_passe_cuisine_du_client

# (Optionnel) Clé Stripe pour le paiement en ligne direct
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Une fois les variables saisies :
- Faites un `git push origin main`
- Le site est en ligne en ~45 secondes.

---

## 📱 URLs à donner au Restaurateur

Une fois déployé (ex: `https://restaurant-demo.vercel.app`) :

1. **Pour les Clients** : `https://restaurant-demo.vercel.app`
2. **Pour la Cuisine (KDS tablette / écran cuisine)** :  
   `https://restaurant-demo.vercel.app/cuisine?k=mot_de_passe_cuisine_du_client`  
   *(Enregistrez ce lien en favori sur la tablette de la cuisine : l'alarme sonne dès qu'une commande tombe).*
3. **Pour le Gérant (Gestion stock, ruptures minute & stats)** :  
   `https://restaurant-demo.vercel.app/gerant?k=mot_de_passe_cuisine_du_client`

---

## 🎬 Script Idéal pour votre Reel (Format 30-45s)

| Temps | Visuel | Voix off / Texte à l'écran |
|---|---|---|
| **00:00 - 00:04** | Votre tête ou plan sur une pizza sortie du four | *"Pizzaiolos et restaurateurs : vous en avez pas marre de donner 30% de commission à Uber Eats et Deliveroo ?"* |
| **00:04 - 00:14** | Enregistrement de votre téléphone (navigation fluide sur le site) | *"Voici le système qu'on installe pour nos restaurants : un site ultra-rapide à votre image, Click & Collect, livraison et paiement en ligne sans intermédiaire."* |
| **00:14 - 00:24** | Plan sur tablette / écran cuisine qui sonne et affiche le ticket | *"En cuisine, une tablette reçoit les commandes en direct avec alarme sonore et impression ticket. Zéro erreur de commande."* |
| **00:24 - 00:30** | Plan sur le gérant ou logo avec CTA | *"Prêt à garder 100% de votre chiffre d'affaires ? Envoyez 'DEMO' en DM pour installer le vôtre cette semaine."* |
