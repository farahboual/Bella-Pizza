===================================================================
CLIENT ASSETS DIRECTORY
===================================================================

Drop your client files here. They are immediately accessible at:
  /client-assets/<filename>

CONVENTIONS (Zero configuration required):
───────────────────────────────────────────
1. LOGO:
   - Drop 'logo.png' (or logo.jpg / logo.svg)
   - In shared/restaurant.config.js, set:
       logoUrl: "/client-assets/logo.png"

2. HERO COVER BANNER:
   - Drop 'hero.jpg' (or hero.png / hero.webp)
   - In shared/restaurant.config.js, set:
       heroImage: "/client-assets/hero.jpg"

3. DISH & CATEGORY PHOTOS:
   - Drop photos here with any name, e.g.:
       pizza.jpg, burger.jpg, salade.jpg, tiramisu.jpg
   - In shared/restaurant.config.js, point to them:
       img: "/client-assets/burger.jpg"
   - Or on an individual item:
       { name: "Cheese", ..., img: "/client-assets/cheese.jpg" }

Any file dropped in this folder is automatically bundled by Vite
and deployed to Vercel without touching any code!
===================================================================
