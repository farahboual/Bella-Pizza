import fs from 'fs';

let config = fs.readFileSync('shared/restaurant.config.js', 'utf8');

const oldImages = `  images: {
    // Category cover photos (fallback for all items in that category)
    pizzas:   "/client-assets/pizza.jpg",
    burgers:  "/client-assets/burgers.jpg",
    salades:  "/client-assets/salades.jpg",
    texmex:   "/client-assets/entrees.jpg",
    desserts: "/client-assets/desserts.jpg",
    boissons: "/client-assets/boissons.jpg",

    // Optional specific dish photos (by dish slug: "cheese", "regina", etc.)
    items: {}
  },`;

const newImages = `  images: {
    // Category cover photos (fallback for all items in that category)
    pizzas:   "/client-assets/pizza.jpg",
    burgers:  "/client-assets/burgers.jpg",
    salades:  "/client-assets/salades.jpg",
    texmex:   "/client-assets/tapas.jpg",
    desserts: "/client-assets/desserts.jpg",
    boissons: "/client-assets/boissons.jpg",

    // Specific dish photos for variety across the menu
    items: {
      // Pizzas
      'classica':        '/client-assets/pizza.jpg',
      'regina':          '/client-assets/story-4-plated.jpg',
      'campione':        '/client-assets/pizza.jpg',
      '4-fromages':      '/client-assets/pizza-4fromages.jpg',
      'latina':          '/client-assets/story-4-plated.jpg',

      // Burgers
      'cheese':          '/client-assets/burgers.jpg',
      'db-cheese':       '/client-assets/burgers.jpg',
      'triple-cheese':   '/client-assets/burgers.jpg',
      'chicken':         '/client-assets/burger-chicken.jpg',
      'royal-chicken':   '/client-assets/burger-chicken.jpg',
      'royal-chevre':    '/client-assets/burgers.jpg',
      'fish':            '/client-assets/burgers.jpg',

      // Salades
      'pacifique':       '/client-assets/salades.jpg',
      'nicoise':         '/client-assets/salades.jpg',
      'chevre-chaud':    '/client-assets/salades.jpg',
      'exotique':        '/client-assets/salades.jpg',
      'campagnarde':     '/client-assets/salades.jpg',

      // Tapas & Entrées
      'mozza-sticks':    '/client-assets/tapas.jpg',
      'chicken-wings':   '/client-assets/tapas.jpg',
      'tenders':         '/client-assets/tapas.jpg',
      'calamars':        '/client-assets/tapas.jpg',
      'onion-rings':     '/client-assets/tapas.jpg',
      'frites':          '/client-assets/tapas.jpg',
      'potatoes':        '/client-assets/tapas.jpg',

      // Desserts
      'tiramisu':        '/client-assets/desserts.jpg',
      'brownies':        '/client-assets/desserts.jpg',
      'tarte-citron-ou-pommes': '/client-assets/desserts.jpg',
      'glace-haagen-dazs':      '/client-assets/desserts.jpg',

      // Boissons
      'canettes-33cl':   '/client-assets/boissons.jpg',
      'maxi-15l':        '/client-assets/boissons.jpg',
      'maxi-oasis-2l':   '/client-assets/boissons.jpg'
    }
  },`;

config = config.replace(/\r\n/g, '\n');
config = config.replace(oldImages.replace(/\r\n/g, '\n'), newImages);

fs.writeFileSync('shared/restaurant.config.js', config, 'utf8');
console.log('restaurant.config.js updated with complete photo catalog mapping!');
