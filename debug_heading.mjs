import { readFileSync, writeFileSync } from 'fs'
let c = readFileSync('public/gerant/index.html', 'utf8')

// Extract the exact old heading block
const i = c.indexOf('Rapport Z &amp; Statistiques')
const blockStart = c.lastIndexOf('<div style=', i)
const statGridIdx = c.indexOf('<div class="stat-grid">', i)
const oldBlock = c.slice(blockStart, statGridIdx)
console.log('OLD BLOCK repr:', JSON.stringify(oldBlock))
