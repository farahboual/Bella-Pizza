#!/usr/bin/env node
// pipeline.mjs — Full test pipeline for taco-pizza-order
// Covers: build, legacy regression, promo codes, table/sur_place, manager API, manual closure
import http from 'node:http'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { execSync } from 'node:child_process'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const PORT = 3222
const B = `http://localhost:${PORT}`
const K = { 'x-kitchen-key': 'kitchen-pw' }   // cuisine screen password
const GK = { 'x-kitchen-key': 'gerant-pw' }    // gérant screen password

let totalFails = 0
let totalPass = 0
let sectionFails = 0
let currentSection = ''

const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'

function section(name) {
  currentSection = name
  sectionFails = 0
  console.log(`\n${CYAN}${BOLD}── ${name} ${'─'.repeat(Math.max(0, 55 - name.length))}${RESET}`)
}

function ok(label, cond, detail = '') {
  if (cond) {
    totalPass++
    console.log(`  ${GREEN}PASS${RESET}  ${label}`)
  } else {
    totalFails++
    sectionFails++
    console.log(`  ${RED}FAIL${RESET}  ${label}${detail ? `  →  ${RED}${detail}${RESET}` : ''}`)
  }
}

const post = (p, o, h = {}) =>
  fetch(B + p, { method: 'POST', headers: { 'content-type': 'application/json', ...h }, body: typeof o === 'string' ? o : JSON.stringify(o) })

const get = (p, h = {}) => fetch(B + p, { headers: h })

const kit = async () => (await (await get('/api/kitchen', K)).json()).orders

const cust = { name: 'Test', phone: '0612345678', address: '1 rue X', postcode: '49400' }

// ─── Section 1: Build ──────────────────────────────────────────────────────────
section('1. Build (npm run build)')
try {
  execSync('npm run build', {
    cwd: new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
    stdio: 'pipe',
    timeout: 120000,
  })
  ok('npm run build exits with code 0', true)
} catch (e) {
  ok('npm run build exits with code 0', false, e.stderr?.toString().slice(0, 200) || e.message)
}

// ─── Start test server ────────────────────────────────────────────────────────
let got = null
const mock = http.createServer((q, s) => {
  let b = ''
  q.on('data', c => b += c)
  q.on('end', () => {
    got = new URLSearchParams(b)
    s.writeHead(200, { 'content-type': 'application/json' })
    s.end(JSON.stringify({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' }))
  })
}).listen(5888)

const env = {
  ...process.env,
  PORT: String(PORT),
  ALWAYS_OPEN: '1',
  STRIPE_SECRET_KEY: 'sk_test_x',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  STRIPE_API_BASE: 'http://localhost:5888',
  KITCHEN_PASSWORD: 'kitchen-pw',
  GERANT_PASSWORD: 'gerant-pw',
}
delete env.SUPABASE_URL
delete env.SUPABASE_SERVICE_ROLE_KEY

const srv = spawn('node', ['dev-server.js'], { env, stdio: 'ignore' })
srv.on('error', e => { console.error('Server failed to start:', e.message); process.exit(1) })
await sleep(1000)

// ─── Section 2: Core regression (existing tests) ──────────────────────────────
section('2. Core regression')

let r, j

// On-site order
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:senior', qty: 1, price: 1 }], customer: cust })
j = await r.json()
ok('On-site order created (201)', r.status === 201 && j.number === 1, `status=${r.status}`)

// Unknown item
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'hack', qty: 1 }], customer: cust })
ok('Unknown item rejected (400)', r.status === 400, `status=${r.status}`)

// Delivery minimum
r = await post('/api/orders', { type: 'livraison', payment: 'sur_place', items: [{ id: 'burgers:cheese', qty: 1 }], customer: cust })
ok('Delivery min 25€ enforced (400)', r.status === 400, `status=${r.status}`)

// Kitchen auth
r = await get('/api/kitchen')
ok('Kitchen without key = 401', r.status === 401, `status=${r.status}`)

// Catalog pricing
let L = await kit()
ok('Kitchen sees order at catalog price (1400 cts)', L.length === 1 && L[0].total === 1400, `total=${L[0]?.total}`)

// Online order + Stripe
r = await post('/api/orders', { type: 'emporter', payment: 'online', items: [{ id: 'pizzas:regina:mega', qty: 1 }, { id: 'boissons:maxi-1-5l', qty: 1 }], customer: { ...cust, phone: '0699999999', email: 'a@b.fr' } })
j = await r.json()
ok('Online order returns Stripe URL (201)', r.status === 201 && j.url?.includes('stripe'), `status=${r.status}`)
ok('Stripe amounts from catalog (1900 + 390)', got?.get('line_items[0][price_data][unit_amount]') === '1900' && got?.get('line_items[1][price_data][unit_amount]') === '390')

// Unpaid hidden from kitchen
ok('Unpaid order hidden from kitchen', (await kit()).length === 1)

// Webhook
const evt = a => JSON.stringify({ type: 'checkout.session.completed', data: { object: { metadata: { order_id: j.id }, payment_status: 'paid', amount_total: a, payment_intent: 'pi_1' } } })
const sign = (raw, secret = 'whsec_test') => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex')}` }

let raw = evt(2290)
r = await post('/api/stripe-webhook', raw, { 'stripe-signature': sign(raw, 'wrong') })
ok('Bad webhook signature rejected (400)', r.status === 400, `status=${r.status}`)

raw = evt(100)
await post('/api/stripe-webhook', raw, { 'stripe-signature': sign(raw) })
ok('Wrong amount not released', (await kit()).length === 1)

raw = evt(2290)
r = await post('/api/stripe-webhook', raw, { 'stripe-signature': sign(raw) })
await post('/api/stripe-webhook', raw, { 'stripe-signature': sign(raw) }) // retry
L = await kit()
ok('Valid webhook releases order, retry harmless', r.status === 200 && L.length === 2 && L[1].paid === true)

// Kitchen status flow
const paid = L.find(o => o.paid)
r = await post('/api/kitchen', { id: paid.id, status: 'ready' }, K)
ok('Cannot skip step new→ready (400)', r.status === 400, `status=${r.status}`)
r = await post('/api/kitchen', { id: paid.id, status: 'accepted' }, K)
ok('Accept order works', (await r.json()).status === 'accepted')

// Public order status
r = await get('/api/order-status?id=' + j.id)
ok('Public status fields minimal (id,number,paid,status)', Object.keys(await r.json()).sort().join() === 'id,number,paid,status')

// Rate limiting
for (let i = 0; i < 4; i++) r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { ...cust, phone: '0711111111' } })
ok('4th order same phone 30 min → 429', r.status === 429, `status=${r.status}`)

// Kitchen page served
r = await get('/cuisine')
ok('Kitchen page served', r.status === 200 && (await r.text()).includes('Écran cuisine'))

// ─── Section 3: Order types ───────────────────────────────────────────────────
section('3. Order types')

// sur_place without address
r = await post('/api/orders', { type: 'sur_place', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { name: 'TableTest', phone: '0612345000' }, tableNumber: '7' })
j = await r.json()
ok('sur_place accepted (no address needed) (201)', r.status === 201, `status=${r.status} body=${JSON.stringify(j)}`)

// Table number saved
L = await kit()
const tableOrder = L.find(o => o.customer?.address === 'Table 7')
ok('Table number stored in kitchen order (Table 7)', !!tableOrder, `addresses=${L.map(o => o.customer?.address).join(', ')}`)

// emporter accepted
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { name: 'Emporter', phone: '0612300000' } })
ok('emporter order accepted (201)', r.status === 201, `status=${r.status}`)

// livraison without address rejected
r = await post('/api/orders', { type: 'livraison', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 3 }], customer: { name: 'Noadr', phone: '0612399999' } })
ok('livraison without address → 400', r.status === 400, `status=${r.status}`)

// invalid type
r = await post('/api/orders', { type: 'unknown_type', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: cust })
ok('Invalid order type → 400', r.status === 400, `status=${r.status}`)

// ─── Section 4: Promo codes ───────────────────────────────────────────────────
section('4. Promo codes')

// Create a % promo via manager API
r = await post('/api/manager', { action: 'savePromo', data: { code: 'TEST10', discountType: 'percent', discountValue: 10, active: true } }, GK)
ok('Manager: savePromo % promo (200)', r.status === 200, `status=${r.status}`)

// Create a fixed promo
r = await post('/api/manager', { action: 'savePromo', data: { code: 'FIXED5', discountType: 'fixed', discountValue: 500, active: true } }, GK)
ok('Manager: savePromo fixed promo (200)', r.status === 200, `status=${r.status}`)

// Apply % promo — pizza regina mega = 1900 cts → 10% off = 1710
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'PromoTest', phone: '0600000001' }, promoCode: 'TEST10' })
j = await r.json()
ok('% promo order created (201)', r.status === 201, `status=${r.status} body=${JSON.stringify(j)}`)
L = await kit()
const promoOrder = L.find(o => o.customer?.name === 'PromoTest')
const expectedTotal = Math.round(1900 * 0.9)
ok(`% promo: total = ${expectedTotal} cts (10% off 1900)`, promoOrder?.total === expectedTotal, `total=${promoOrder?.total}`)
ok('% promo: discount recorded', promoOrder?.discount === Math.round(1900 * 0.1), `discount=${promoOrder?.discount}`)

// Apply fixed promo — pizza 1900 cts - 500 cts = 1400
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'FixedTest', phone: '0600000002' }, promoCode: 'FIXED5' })
j = await r.json()
ok('Fixed promo order created (201)', r.status === 201, `status=${r.status}`)
L = await kit()
const fixedOrder = L.find(o => o.customer?.name === 'FixedTest')
ok('Fixed promo: total = 1400 cts (1900 - 500)', fixedOrder?.total === 1400, `total=${fixedOrder?.total}`)

// Invalid promo code
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'BadPromo', phone: '0600000003' }, promoCode: 'FAKE99' })
ok('Invalid promo code → 400', r.status === 400, `status=${r.status}`)

// Deactivate promo via savePromo active:false
r = await post('/api/manager', { action: 'savePromo', data: { code: 'TEST10', discountType: 'percent', discountValue: 10, active: false } }, GK)
ok('Manager: deactivate promo (200)', r.status === 200, `status=${r.status}`)

// Deactivated promo rejected
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'DeadPromo', phone: '0600000004' }, promoCode: 'TEST10' })
ok('Deactivated promo → 400', r.status === 400, `status=${r.status}`)

// Delete promo
r = await post('/api/manager', { action: 'deletePromo', data: { code: 'FIXED5' } }, GK)
j = await r.json()
ok('Manager: deletePromo (200, code removed)', r.status === 200 && !j['FIXED5'], `status=${r.status} keys=${Object.keys(j).join(',')}`)

// Deleted promo rejected
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'DeletedPromo', phone: '0600000005' }, promoCode: 'FIXED5' })
ok('Deleted promo → 400', r.status === 400, `status=${r.status}`)

// ─── Section 5: Manager API ───────────────────────────────────────────────────
section('5. Manager API (/api/manager)')

// Unauthorized — no key
r = await get('/api/manager')
ok('Manager GET without key → 401', r.status === 401, `status=${r.status}`)

r = await post('/api/manager', { action: 'updateConfig', data: {} })
ok('Manager POST without key → 401', r.status === 401, `status=${r.status}`)

// Cross-auth isolation: kitchen key must NOT open gérant, gérant key must NOT open kitchen
r = await get('/api/manager', K)
ok('Kitchen key rejected by gérant API → 401', r.status === 401, `status=${r.status}`)

r = await get('/api/kitchen', GK)
ok('Gérant key rejected by kitchen API → 401', r.status === 401, `status=${r.status}`)

// Authorized GET with gérant key
r = await get('/api/manager', GK)
j = await r.json()
ok('Manager GET returns config + overrides + promos + sales + catalog (200)', r.status === 200 && 'config' in j && 'overrides' in j && 'promos' in j && 'sales' in j && 'catalog' in j, `status=${r.status} keys=${Object.keys(j).join(',')}`)

// updateConfig
r = await post('/api/manager', { action: 'updateConfig', data: { ribIban: 'FR7612345678901234567890123', ribBic: 'BNPAFRPP', ribHolder: 'Taco Pizza SARL' } }, GK)
j = await r.json()
ok('Manager: updateConfig saves RIB data', r.status === 200 && j.ribIban === 'FR7612345678901234567890123', `status=${r.status} iban=${j.ribIban}`)

// saveOverride — change price
r = await post('/api/manager', { action: 'saveOverride', data: { id: 'pizzas:regina:senior', price: 1299, outOfStock: false } }, GK)
ok('Manager: saveOverride price change (200)', r.status === 200, `status=${r.status}`)

// Check overridden price applied in new order
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:senior', qty: 1 }], customer: { name: 'Override', phone: '0600111222' } })
j = await r.json()
ok('Overridden price applied in order (201)', r.status === 201, `status=${r.status}`)
L = await kit()
const overrideOrder = L.find(o => o.customer?.name === 'Override')
ok('Menu override price 1299 cts used', overrideOrder?.total === 1299, `total=${overrideOrder?.total}`)

// saveOverride — mark out of stock
r = await post('/api/manager', { action: 'saveOverride', data: { id: 'pizzas:regina:mega', outOfStock: true } }, GK)
ok('Manager: mark item out of stock (200)', r.status === 200, `status=${r.status}`)

// Out of stock item rejected
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'pizzas:regina:mega', qty: 1 }], customer: { name: 'OOS', phone: '0600111333' } })
ok('Out-of-stock item → 400', r.status === 400, `status=${r.status}`)

// Restore stock
r = await post('/api/manager', { action: 'saveOverride', data: { id: 'pizzas:regina:mega', outOfStock: false } }, GK)
ok('Manager: restore stock (200)', r.status === 200, `status=${r.status}`)

// getSalesReport action
r = await post('/api/manager', { action: 'getSalesReport', data: { days: 1 } }, GK)
j = await r.json()
ok('Manager: getSalesReport returns sales array', r.status === 200 && Array.isArray(j.sales), `status=${r.status} type=${typeof j.sales}`)

// unknown action
r = await post('/api/manager', { action: 'doSomethingWeird' }, GK)
ok('Manager: unknown action → 400', r.status === 400, `status=${r.status}`)

// saveOverride with invalid item
r = await post('/api/manager', { action: 'saveOverride', data: { id: 'not:real:item', price: 999 } }, GK)
ok('Manager: saveOverride invalid item id → 400', r.status === 400, `status=${r.status}`)

// ─── Section 6: Manual closure ───────────────────────────────────────────────
section('6. Manual closure')

// Open a fresh restaurant (should already be open)
r = await post('/api/manager', { action: 'updateConfig', data: { manualClosed: false, closedReason: '' } }, GK)
ok('Set restaurant to open (200)', r.status === 200, `status=${r.status}`)

// Order accepted when open
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { name: 'BeforeClosed', phone: '0666000001' } })
ok('Order accepted when open (201)', r.status === 201, `status=${r.status}`)

// Close the restaurant
r = await post('/api/manager', { action: 'updateConfig', data: { manualClosed: true, closedReason: 'Congés en cours' } }, GK)
ok('Manual closure set (200)', r.status === 200, `status=${r.status}`)

// Order rejected when closed
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { name: 'AfterClosed', phone: '0666000002' } })
j = await r.json()
ok('Order rejected when manually closed (400)', r.status === 400, `status=${r.status}`)
ok('Closed reason in error message', j.error?.includes('Congés'), `error="${j.error}"`)

// getConfig reflects closed status (ALWAYS_OPEN=1 keeps open:true in test env, but manualClosed must be true)
r = await get('/api/config')
j = await r.json()
ok('GET /api/config reports manualClosed:true when closed', j.manualClosed === true, `manualClosed=${j.manualClosed}`)

// Re-open
r = await post('/api/manager', { action: 'updateConfig', data: { manualClosed: false } }, GK)
ok('Re-open restaurant (200)', r.status === 200, `status=${r.status}`)

// Order accepted again
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: 'desserts:brownies', qty: 1 }], customer: { name: 'AfterOpen', phone: '0666000003' } })
ok('Order accepted after re-open (201)', r.status === 201, `status=${r.status}`)

// ─── Section 7: Static pages ──────────────────────────────────────────────────
section('7. Static pages')

r = await get('/cuisine')
const cuisineHtml = await r.text()
ok('Kitchen screen served', r.status === 200 && cuisineHtml.includes('Écran cuisine'))
ok('Kitchen screen has NO Espace Gérant button', !cuisineHtml.includes('Espace Gérant'))
ok('Kitchen screen has NO Test du son button', !cuisineHtml.includes('Test du son'))
ok('Kitchen screen has NO "en direct (Supabase)" text', !cuisineHtml.includes('en direct') && !cuisineHtml.includes('Supabase)'))

r = await get('/gerant')
const gerantHtml = await r.text()
ok('Gérant screen served', r.status === 200)
ok('Gérant has password gate', gerantHtml.includes('password') || gerantHtml.includes('mot de passe') || gerantHtml.includes('Mot de passe'))
ok('Gérant screen has QR chevalet and custom products form', gerantHtml.includes('new-prod-form') && gerantHtml.includes('chevalet'))
ok('Gérant screen has NO "Superadmin" term', !gerantHtml.toLowerCase().includes('superadmin'))
ok('Gérant screen uses "Rapport de caisse" label (not old "Rapport Z & Ventes")', gerantHtml.includes('Rapport de caisse') && !gerantHtml.includes('Rapport Z &amp; Ventes'))
ok('Gérant screen has period selector buttons', gerantHtml.includes('period-btn') && gerantHtml.includes('data-days'))
ok('Gérant screen has "rapport Z" explanation text', gerantHtml.includes('rapport Z') || gerantHtml.includes('rapport de caisse'))

// ─── Section 8: Custom items (produits gérant) ────────────────────────────────
section('8. Custom items (produits gérant)')

// saveCustomItem
r = await post('/api/manager', { action: 'saveCustomItem', data: { name: 'Burger Spécial Maison', cat: 'Burgers', price: 1050, desc: 'Recette du chef' } }, GK)
j = await r.json()
ok('saveCustomItem created (200)', r.status === 200, `status=${r.status}`)
const customId = Object.keys(j).find(k => k.startsWith('custom:'))
ok('Custom item has custom: prefix id', !!customId, `keys=${Object.keys(j).join(',')}`)

// Custom item accepted in order
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: customId, qty: 1 }], customer: { name: 'CustomClient', phone: '0688877766' } })
ok('Custom item accepted in order (201)', r.status === 201, `status=${r.status}`)

// saveCustomItem — missing required field
r = await post('/api/manager', { action: 'saveCustomItem', data: { cat: 'Test' } }, GK)
ok('saveCustomItem missing name/price → 400', r.status === 400, `status=${r.status}`)

// deleteCustomItem
r = await post('/api/manager', { action: 'deleteCustomItem', data: { id: customId } }, GK)
j = await r.json()
ok('deleteCustomItem removed item (200)', r.status === 200 && !j[customId], `status=${r.status} keys=${Object.keys(j).join(',')}`)

// Deleted custom item rejected in new order
r = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items: [{ id: customId, qty: 1 }], customer: { name: 'DeletedClient', phone: '0688877755' } })
ok('Deleted custom item rejected in order (400)', r.status === 400, `status=${r.status}`)

// ─── Summary ──────────────────────────────────────────────────────────────────
section('9. Sauces, supplément viande, boisson 1 €, 3ème pizza offerte')
const lastOrder = async () => { const l = await kit(); return l.sort((a, b) => b.number - a.number)[0] }
let phoneN = 0
const ord = async (items, extra = {}) => { const rr = await post('/api/orders', { type: 'emporter', payment: 'sur_place', items, customer: { ...cust, phone: '06' + String(70000000 + ++phoneN) }, ...extra }); return { rr, o: await lastOrder() } }
let x = await ord([{ id: 'tacos:kebab', qty: 1, sauces: ['Harissa'], supp: { 'Kebab': 1 } }])
ok('Tacos + sauce + 1 supp viande = 850 + 50 (201)', x.rr.status === 201 && x.o.total === 900, `total=${x.o?.total}`)
ok('Sauce + viande choisie visibles dans le nom (cuisine/ticket)', /Harissa/.test(x.o.items[0].name) && /1× Kebab/.test(x.o.items[0].name), x.o?.items?.[0]?.name)
x = await ord([{ id: 'tacos:kebab', qty: 1, supp: { 'Kebab': 2, 'Merguez': 1 } }])
ok('Supp viande au choix : 2 Kebab + 1 Merguez = 850 + 3 × 50', x.o.total === 1000 && /2× Kebab/.test(x.o.items[0].name) && /1× Merguez/.test(x.o.items[0].name), `total=${x.o?.total} name=${x.o?.items?.[0]?.name}`)
x = await ord([{ id: 'tacos:kebab', qty: 2, sauces: ['Harissa'], supp: { 'Poulet': 1 } }])
ok('Supplément multiplié par la quantité (2 × 9,00 €)', x.o.total === 1800, `total=${x.o?.total}`)
x = await ord([{ id: 'burgers:cheese', qty: 1, supp: { 'Viande hachée': 1 } }])
ok('Burger + 1 supp viande = 650 + 50', x.o.total === 700, `total=${x.o?.total}`)
x = await ord([{ id: 'sandwichs:kebab', qty: 1, sauces: ['Samouraï'], supp: { 'Merguez': 2 } }])
ok('Sandwich + 2 supp viande = 800 + 100', x.o.total === 900, `total=${x.o?.total}`)
x = await ord([{ id: 'tacos:kebab', qty: 1, supp: { 'Licorne': 3, 'Kebab': 0, 'Poulet': -2 } }])
ok('Viande inconnue / quantité nulle ou négative ignorées', x.o.total === 850, `total=${x.o?.total}`)
x = await ord([{ id: 'tacos:kebab', qty: 1, supp: { 'Kebab': 999 } }])
ok('Quantité de supp plafonnée à 5 (850 + 250)', x.o.total === 1100, `total=${x.o?.total}`)
x = await ord([{ id: 'tacos:kebab', qty: 1, supp: true }])
ok('Ancien format supp:true : toujours facturé 50 c', x.o.total === 900, `total=${x.o?.total}`)
x = await ord([{ id: 'tacos:kebab', qty: 1, sauces: ['Sauce inventée'], supp: {} }])
ok('Sauce inconnue ignorée, prix inchangé', x.o.total === 850 && !/inventée/.test(x.o.items[0].name), `total=${x.o?.total}`)
x = await ord([{ id: 'paninis:jambon', qty: 1, supp: { 'Kebab': 2 }, sauces: ['Harissa'] }])
ok('Supp ignoré sur une catégorie sans option (panini 600)', x.o.total === 600, `total=${x.o?.total}`)
const { CATALOG: CAT } = await import('./shared/catalog.js')
const tex = ['chicken-wings', 'nuggets', 'calamars', 'onion-rings', 'tenders', 'mozza-sticks'].map(k => CAT['texmex:' + k])
ok('Tex-Mex : les 6 produits sont à 8 pièces (pas 10)', tex.every(i => /^8pcs/.test(i.desc)), tex.map(i => i.desc).join(' | '))
x = await ord([{ id: 'boissons:canettes-33cl', qty: 1 }])
ok('Canette 33cl seule = 1,50 €', x.o.total === 150 && !x.o.discount, `total=${x.o?.total} disc=${x.o?.discount}`)
x = await ord([{ id: 'boissons:canettes-33cl', qty: 3 }])
ok('3 canettes seules = 4,50 €', x.o.total === 450, `total=${x.o?.total}`)
x = await ord([{ id: 'boissons:canettes-33cl', qty: 1 }, { id: 'tacos:kebab', qty: 1 }])
ok('Canette + plat : canette à 1,00 € (850 + 100)', x.o.total === 950 && x.o.discount === 50, `total=${x.o?.total} disc=${x.o?.discount}`)
x = await ord([{ id: 'boissons:canettes-33cl', qty: 2 }, { id: 'desserts:brownies', qty: 1 }])
ok('2 canettes + dessert : 2 × 1,00 € (300 + 200)', x.o.total === 500, `total=${x.o?.total}`)
x = await ord([{ id: 'boissons:canettes-33cl', qty: 1 }, { id: 'boissons:maxi-1-5l', qty: 1 }])
ok('Canette + autre boisson seulement : reste 1,50 €', x.o.total === 150 + 390, `total=${x.o?.total}`)
x = await ord([{ id: 'boissons:canettes-33cl', qty: 1 }, { id: 'pizzas:miami:senior', qty: 3 }])
ok('Canette 1 € + 3ème pizza offerte cumulées (28 € + 1 €)', x.o.total === 2900 && x.o.discount === 1400 + 50, `total=${x.o?.total} disc=${x.o?.discount}`)
x = await ord([{ id: 'pizzas:miami:senior', qty: 3 }])
ok('3 pizzas Sénior : la 3ème offerte (2 × 14 €)', x.o.total === 2800 && x.o.discount === 1400, `total=${x.o?.total} disc=${x.o?.discount}`)
x = await ord([{ id: 'pizzas:miami:senior', qty: 2 }])
ok('2 pizzas Sénior : pas de réduction', x.o.total === 2800 && !x.o.discount, `total=${x.o?.total}`)
x = await ord([{ id: 'pizzas:miami:senior', qty: 2 }, { id: 'pizzas:classica:mega', qty: 1 }])
ok('Mix Sénior+Méga : la moins chère offerte (Sénior 14 €)', x.o.total === 3300 && x.o.discount === 1400, `total=${x.o?.total} disc=${x.o?.discount}`)
x = await ord([{ id: 'pizzas:regina:junior', qty: 3 }])
ok('Pizzas Junior non concernées par l’offre', x.o.total === 2700 && !x.o.discount, `total=${x.o?.total}`)
x = await ord([{ id: 'pizzas:regina:mega', qty: 6 }])
ok('6 pizzas Méga : 2 offertes (4 × 19 €)', x.o.total === 7600 && x.o.discount === 3800, `total=${x.o?.total}`)
r = await post('/api/orders', { type: 'emporter', payment: 'online', items: [{ id: 'pizzas:miami:senior', qty: 3 }], customer: { ...cust, phone: '0699990001', email: 'a@b.fr' } })
ok('Commande en ligne avec 3ème offerte → coupon Stripe créé', r.status === 201 && got?.get('discounts[0][coupon]') === 'cs_test_1', `status=${r.status} coupon=${got?.get('discounts[0][coupon]')}`)

srv.kill()
mock.close()

const total = totalPass + totalFails
console.log('\n' + '═'.repeat(60))
if (totalFails === 0) {
  console.log(`${GREEN}${BOLD}  ALL ${total} TESTS PASSED${RESET}`)
} else {
  console.log(`${RED}${BOLD}  ${totalFails} of ${total} TESTS FAILED${RESET}`)
}
console.log('═'.repeat(60))

process.exit(totalFails ? 1 : 0)
