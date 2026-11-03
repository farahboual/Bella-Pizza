import fs from 'fs';

let cfg = fs.readFileSync('shared/restaurant.config.js', 'utf8');

// 1. Brand identity
cfg = cfg.replace(/name:\s*"[^"]+"/, 'name:          "Tramonto"');
cfg = cfg.replace(/shortName:\s*"[^"]+"/, 'shortName:     "Tramonto"');
cfg = cfg.replace(/tagline:\s*"[^"]+"/, 'tagline:       "Pizzeria & Cuisine Italienne Artisanale · Cholet"');
cfg = cfg.replace(/subTagline:\s*"[^"]+"/, 'subTagline:    "Pizzas napolitaines cuites à la flamme, burrata crémeuse et recettes signatures préparées chaque jour avec passion."');
cfg = cfg.replace(/heroTitle:\s*"[^"]+"/, 'heroTitle:     "L\'art de la pizza"');
cfg = cfg.replace(/heroHighlight:\s*"[^"]+"/, 'heroHighlight: "à Cholet."');
cfg = cfg.replace(/heroBadge:\s*"[^"]+"/, 'heroBadge:     "Pizzeria artisanale · Produits frais italiens"');

// 2. Contact & Address
cfg = cfg.replace(/phone:\s*"[^"]+"/, 'phone:    "02 44 09 82 10"');
cfg = cfg.replace(/phoneRaw:\s*"[^"]+"/, 'phoneRaw: "+33244098210"');
cfg = cfg.replace(/email:\s*"[^"]+"/, 'email:    "contact@tramonto-cholet.fr"');
cfg = cfg.replace(/street:\s*"[^"]+"/, 'street:     "172 Rue Nationale"');
cfg = cfg.replace(/postalCode:\s*"[^"]+"/, 'postalCode: "49300"');
cfg = cfg.replace(/city:\s*"[^"]+"/, 'city:       "Cholet"');
cfg = cfg.replace(/full:\s*"[^"]+"/, 'full:       "172 Rue Nationale, 49300 Cholet"');
cfg = cfg.replace(/mapsUrl:\s*"[^"]+"/, 'mapsUrl: "https://www.google.com/maps/place/Tramonto/@47.0621019,-0.8821661,17z/data=!3m1!4b1!4m6!3m5!1s0x4806470039569a47:0xfd2b4535d3a02516!8m2!3d47.0621019!4d-0.8821661!16s%2Fg%2F11yprwvxmy"');

// 3. Theme warm terracotta & gold sunset (Tramonto = Coucher de soleil en italien)
cfg = cfg.replace(/primaryColor:\s*"[^"]+"/, 'primaryColor:    "#A35334"'); // Terracotta sunset
cfg = cfg.replace(/primaryHover:\s*"[^"]+"/, 'primaryHover:    "#863E24"');

// 4. Delivery rules & Postcodes
cfg = cfg.replace(/allowedPostcodes:\s*\[[^\]]*\]/, 'allowedPostcodes: ["49300", "49280", "49450"]');
cfg = cfg.replace(/displayText:\s*"[^"]+"/, 'displayText: "Mardi au Dimanche · 11h30–14h00 & 18h30–00h00"');

// 5. Image mappings for Tramonto dishes
const itemMapping = `      // Tramonto Signature Pizzas
      'burratissima':          '/client-assets/burratissima.jpg',
      'panamera':              '/client-assets/panamera.jpg',
      'thon-de-passion':       '/client-assets/thon-passion.jpg',
      '4-fromages-tramonto':   '/client-assets/4-fromages-tramonto.jpg',
      'tiramisu-maison-tramonto': '/client-assets/tiramisu-tramonto.jpg',
      'tiramisu':              '/client-assets/tiramisu-tramonto.jpg',`;

cfg = cfg.replace(/\/\/ Specific dish photos for variety across the menu\s+items:\s*\{/, `// Specific dish photos for variety across the menu\n    items: {\n${itemMapping}`);

fs.writeFileSync('shared/restaurant.config.js', cfg, 'utf8');
console.log('restaurant.config.js customized for Tramonto Cholet!');
