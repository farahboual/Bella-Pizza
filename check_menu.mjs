// Sanity-check shared/menuData.js content (run with: node check_menu.mjs)
import fs from 'node:fs';

const s = fs.readFileSync('shared/menuData.js', 'utf8');
console.log('LEN=' + s.length);
console.log('HAS_PIZZAS=' + s.includes('pizzas'));
console.log('HAS_PIZZA_OFFER=' + s.includes('la 3ème gratuite'));
console.log('HAS_SUPP=' + s.includes('supp:'));
console.log('HAS_SAUCES=' + s.includes('sauces:'));
console.log('HAS_BOisson=' + s.includes('boisson:'));
console.log('HAS_ADDONS=' + s.includes('addOnsFor'));
const lines = s.split('\n');
console.log('--- first 3 lines ---');
console.log(lines.slice(0, 3).join('\n'));
console.log('--- last 3 lines ---');
console.log(lines.slice(-3).join('\n'));
