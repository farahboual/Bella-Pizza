import {readFileSync} from 'fs'
const txt = readFileSync('public/cuisine/index.html','utf8')
console.log('length:', txt.length)
const idx = txt.indexOf('cran')
console.log('context:', JSON.stringify(txt.slice(Math.max(0,idx-10), idx+40)))
// Check what the test actually looks for
const search = '\u00C9cran cuisine'  // É = \u00C9
console.log('searching for:', JSON.stringify(search))
console.log('found?', txt.includes(search))
// Also check lowercase
const search2 = '\u00e9cran cuisine'
console.log('lowercase found?', txt.includes(search2))
