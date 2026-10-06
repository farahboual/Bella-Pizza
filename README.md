# Taco Pizza — site + commande en ligne (Vercel + Supabase + Stripe)

## Architecture
- Site : React/Vite (build → `dist/`). Prix : `shared/menuData.js` (source unique, le serveur recalcule tous les totaux).
- API : fonctions Vercel dans `api/` (logique dans `lib/`). Base de commandes : Supabase. Paiement : Stripe Checkout.
- Écran cuisine : `/cuisine` (page statique `public/cuisine/`, protégée par mot de passe côté API).

## Mise en ligne (ordre conseillé)
1. **Supabase** : créer un projet, ouvrir SQL Editor, exécuter `supabase/schema.sql`. Noter `Project URL` et la clé **service_role** (Settings > API).
2. **Vercel** : importer le repo (preset Vite détecté). Ajouter les variables de `.env.example` (Settings > Environment Variables), puis redéployer.
3. **Stripe** (mode test d'abord) : Developers > Webhooks > Add endpoint
   - URL : `https://VOTRE-DOMAINE/api/stripe-webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`
   - Copier le *Signing secret* (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`, redéployer.
   - Test : carte `4242 4242 4242 4242`, date future, CVC au choix.
4. **Passage en réel** : compte Stripe du restaurant vérifié (SIRET, IBAN), remplacer par `sk_live_...` et créer le webhook en mode Live (nouveau `whsec_...`).
5. Activer dans Stripe les reçus e-mail clients (Settings > Emails) et Apple Pay / Google Pay (Settings > Payment methods).
6. Vercel > Firewall : ajouter une règle de limitation de débit sur `/api/orders` (ex. 10 requêtes/minute/IP).

## Écran cuisine
- Tablette : ouvrir `https://VOTRE-DOMAINE/cuisine`, mot de passe = `KITCHEN_PASSWORD`, toucher « Se connecter et activer le son ».
- Laisser l'onglet **ouvert au premier plan**, volume au maximum. Mise à jour toutes les 3 s. L'alarme sonne tant qu'une commande est « nouvelle ».
- 🖨 Imprimer : ticket 80 mm. Sans fenêtre d'impression : Chrome lancé avec `--kiosk-printing`, imprimante thermique par défaut.

## Développement local
`npm install` · `npm run build` · `npm start` (http://localhost:3000, base en mémoire si Supabase non configuré) · `npm run test:server` (16 vérifications).
