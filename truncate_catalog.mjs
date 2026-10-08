// Truncate shared/catalog.js to its corrected first 30 lines (clean UTF-8).
import fs from 'node:fs';

const src = fs.readFileSync('shared/catalog.js', 'utf8');
const lines = src.split('\n');
// Keep the corrected new content (lines 1-30), drop the duplicate old tail.
const clean = lines.slice(0, 30).join('\n') + '\n';
fs.writeFileSync('shared/catalog.js', clean, 'utf8');
const out = fs.readFileSync('shared/catalog.js', 'utf8');
console.log('wrote', fs.statSync('shared/catalog.js').size, 'bytes');
console.log('lines', out.split('\n').length);
console.log('--- last 4 ---');
console.log(out.split('\n').slice(-4).join('\n'));
