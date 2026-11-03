import fs from 'node:fs';

let code = fs.readFileSync('shared/restaurant.config.js', 'utf8');

code = code.replace(
  /pates:\s*"\/client-assets\/pizza\.jpg",\r?\n\s+gratins:\s*"\/client-assets\/tapas\.jpg",/,
  `pates:    "/client-assets/pates.jpg",\n    gratins:  "/client-assets/gratin.jpg",`
);

code = code.replace(
  /'pepperoni':\s*'\/client-assets\/pizza\.jpg',/,
  `'pepperoni':           '/client-assets/pepperoni.jpg',`
);

code = code.replace(
  /'calzone-soufflee':\s*'\/client-assets\/pizza\.jpg',/,
  `'calzone-soufflee':    '/client-assets/calzone.jpg',`
);

const oldDishes = `      // Pâtes & Gratins
      'carbonara-penne':           '/client-assets/pizza.jpg',
      'bolognaise-spaghetti':      '/client-assets/pizza.jpg',
      'pate-saumon-penne':         '/client-assets/salades.jpg',
      'spaghetti-fruit-de-mer':    '/client-assets/panamera.jpg',
      'forestiere-penne':          '/client-assets/pizza.jpg',
      'pate-curry-penne':          '/client-assets/pizza.jpg',
      'gratin-fondant-savoyard':   '/client-assets/tapas.jpg',
      'le-gratin-du-chef':         '/client-assets/tapas.jpg',
      'panuozzo':                  '/client-assets/tapas.jpg',
      'petite-salade':             '/client-assets/salades.jpg',`;

const newDishes = `      // Pâtes & Gratins
      'carbonara-penne':           '/client-assets/pates.jpg',
      'bolognaise-spaghetti':      '/client-assets/pates.jpg',
      'pate-saumon-penne':         '/client-assets/pates.jpg',
      'spaghetti-fruit-de-mer':    '/client-assets/panamera.jpg',
      'forestiere-penne':          '/client-assets/pates.jpg',
      'pate-curry-penne':          '/client-assets/pates.jpg',
      '4-formaggi-pate-au-choix':  '/client-assets/pates.jpg',
      'gratin-fondant-savoyard':   '/client-assets/gratin.jpg',
      'le-gratin-du-chef':         '/client-assets/gratin.jpg',
      'panuozzo':                  '/client-assets/panuozzo.jpg',
      'petite-salade':             '/client-assets/salades.jpg',`;

code = code.replace(oldDishes, newDishes);

fs.writeFileSync('shared/restaurant.config.js', code, 'utf8');
console.log('Successfully updated shared/restaurant.config.js with new dish photos');
