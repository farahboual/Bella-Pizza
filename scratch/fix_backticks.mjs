import fs from 'node:fs';
let s = fs.readFileSync('lib/handlers.js', 'utf8');
s = s.replace('delete itemImages[pizzas::junior]', 'delete itemImages[`pizzas:${baseSlug}:junior`]');
s = s.replace('delete itemImages[pizzas::senior]', 'delete itemImages[`pizzas:${baseSlug}:senior`]');
s = s.replace('delete itemImages[pizzas::mega]', 'delete itemImages[`pizzas:${baseSlug}:mega`]');
fs.writeFileSync('lib/handlers.js', s, 'utf8');
console.log('✅ Backticks fixed properly');
