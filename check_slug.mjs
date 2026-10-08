// Print the slug in shared/catalog.js to verify it is correct.
import fs from 'node:fs';
const s = fs.readFileSync('shared/catalog.js', 'utf8');
const m = s.match(/const slug=.*?;/);
console.log('SLUG=' + m[0]);
