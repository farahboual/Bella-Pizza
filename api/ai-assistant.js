// api/ai-assistant.js
// AI assistant for the gérant panel — understands French natural language
// and executes actions (mark out of stock, change price, etc.) or answers
// questions about today's sales. Uses OpenRouter free models via fetch.
import crypto from 'node:crypto'
import { store } from '../lib/store.js'
import { CATALOG } from '../shared/catalog.js'
import { RESTAURANT_CONFIG } from '../shared/restaurant.config.js'

const env = process.env
const send = (res, code, obj) => {
  res.setHeader('cache-control', 'no-store')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  return res.status ? res.status(code).json(obj) : (res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }), res.end(JSON.stringify(obj)))
}

const safeEq = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

const readBody = async req => {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return req.body
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return new Promise((ok, ko) => {
    const b = []
    req.on('data', c => b.push(c))
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(b).toString())) } catch { ok({}) } })
    req.on('error', ko)
  })
}

// ── Build compact catalog list for the prompt ──────────────────────────────
function buildCatalogContext(catalog, overrides = {}) {
  return Object.entries(catalog)
    .filter(([, item]) => item && item.name)
    .slice(0, 60)
    .map(([id, item]) => {
      const ov = overrides[id] || {}
      const price = typeof ov.price === 'number' ? ov.price : item.price
      const status = ov.outOfStock ? '[Rupture]' : ov.hidden ? '[Masqué]' : '[Disponible]'
      return `ID:"${id}" | ${item.name} | ${(price / 100).toFixed(2)}€ | cat:${item.cat || '?'} | ${status}`
    })
    .join('\n')
}

// ── Build sales summary for the prompt ────────────────────────────────────
function buildSalesContext(sales = []) {
  if (!sales.length) return 'Aucune commande enregistrée aujourd\'hui pour le moment. CA: 0,00€.'
  const ca = sales.reduce((s, o) => s + (o.total || 0), 0)
  const itemCounts = {}
  let drinksCount = 0
  let dessertsCount = 0

  sales.forEach(o => (o.items || o.lines || []).forEach(l => {
    const name = l.name || l.id || ''
    const qty = l.qty || 1
    itemCounts[name] = (itemCounts[name] || 0) + qty
    const low = name.toLowerCase()
    if (low.includes('boisson') || low.includes('pellegrino') || low.includes('coca') || low.includes('tea')) drinksCount += qty
    if (low.includes('dessert') || low.includes('tiramisu') || low.includes('dolci')) dessertsCount += qty
  }))

  const top = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([n, q]) => `${n} (${q}x)`).join(', ')

  const pm = (ca / sales.length / 100).toFixed(2)
  return [
    `Commandes: ${sales.length} | CA: ${(ca / 100).toFixed(2)}€ | Panier moyen: ${pm}€`,
    `Attachement: ${drinksCount} boissons | ${dessertsCount} desserts vendus`,
    `Top ventes: ${top || 'N/A'}`
  ].join('\n')
}

// ── System prompt ──────────────────────────────────────────────────────────
function buildSystemPrompt(catalog, overrides, sales, restaurantName) {
  return `Tu es le Directeur Stratégique d'Exploitation et de Rentabilité de "${restaurantName}", intégré au copilote de gestion.
Ton rôle est d'analyser la rentabilité, piloter les stocks en direct et conseiller le restaurateur comme un expert SaaS F&B de haut niveau.
Réponds TOUJOURS en français, de façon sobre, percutante, chiffrée et orientée optimisation de la marge et du panier moyen.

## CATALOGUE ACTUEL (ID | Nom | Prix | Catégorie | Disponibilité)
${buildCatalogContext(catalog, overrides)}

## SITUATION COMMERCIALE EN DIRECT
${buildSalesContext(sales)}

## ACTIONS EXÉCUTABLES
Tu peux déclencher directement ces actions ou répondre aux questions stratégiques :
- markOutOfStock: marquer un plat épuisé. Recommande systématiquement une alternative rentable dans reply.
- restoreItem: remettre un plat disponible.
- hideItem: masquer un plat de la carte en ligne.
- showItem: réactiver un plat sur la carte.
- updatePrice: réajuster un prix (indique l'impact sur le ticket moyen dans reply).
- closeNow: suspendre exceptionnellement les commandes en ligne (ex: coup de feu en cuisine).
- openNow: réouvrir le flux de commandes en direct.
- createPromo: créer un code promo tactique pour dynamiser un rush creux.
- query: salutations, politesse, analyse stratégique, chiffre d'affaires, panier moyen, top ventes, leviers d'optimisation.
- unknown: demande incomprise.

## FORMAT DE RÉPONSE OBLIGATOIRE (JSON STRICT)
{
  "intent": "markOutOfStock|restoreItem|hideItem|showItem|updatePrice|closeNow|openNow|createPromo|query|unknown",
  "params": {
    "itemId": "l'ID exact ou null",
    "itemName": "nom lisible ou null",
    "price": null,
    "promoCode": null,
    "discountType": null,
    "discountValue": null
  },
  "reply": "Ton analyse ou confirmation d'action en français, concise et orientée business (max 2 phrases).",
  "impact": "Indicateur stratégique court (ex: 'Alternative : Burratissima di Bella', 'Levier panier moyen', 'Protection cadence cuisine')",
  "confirm": false
}

RÈGLES ABSOLUES:
- RÈGLE FONDAMENTALE : ZÉRO ÉMOJIS. Aucun symbole cartoon (pas de robot, pizza, flamme, etc.). Ton professionnel, précis et élégant.
- Pour un message de salutation ou politesse ("bonjour", "salut", "merci", etc.), réponds chaleureusement en rappelant la situation commerciale du jour avec "intent": "query". Ne renvoie JAMAIS "unknown" pour une salutation.
- Pour updatePrice, closeNow, createPromo: mets "confirm": true (requiert validation du gérant).
- Pour markOutOfStock, restoreItem, hideItem, showItem, query: mets "confirm": false.
- Pour updatePrice: prix en centimes dans params.price (ex: 13€ → 1300).
- Pour les pizzas multi-tailles (medium-28cm, large-33cm, xxl-partage-40cm) : si la taille n'est pas spécifiée, utilise la taille medium-28cm (l'interface synchronise automatiquement toutes les déclinaisons).
- Reconnaissance intelligente : sois tolérant sur les noms ("Margherita" = "Pizza MARGHERITA DOP", "Regina" = "Pizza REGINA ROYALE", "4 fromages" = "Pizza 4 FORMAGGI RUSTICA", etc.).`
}

// ── Hybrid Intent Fallback Resolver ─────────────────────────────────────────
function resolveIntentFallback(messageText, catalog = {}, sales = []) {
  const norm = String(messageText || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  const ca = (sales || []).reduce((s, o) => s + (o.total || 0), 0)
  const count = (sales || []).length
  const pm = count > 0 ? (ca / count / 100).toFixed(2) : '0,00'
  const caFormatted = (ca / 100).toFixed(2)

  // Strategic Playbook 1: Audit de rentabilité & performance
  if (norm.includes('audit') || norm.includes('rentabilit') || norm.includes('levier') || norm.includes('bilan') || norm.includes('perfor')) {
    if (count === 0) {
      return {
        intent: 'query',
        params: {},
        reply: "Bilan en temps réel : 0 commande enregistrée pour l'instant (0,00 €). Levier recommandé : activez une offre flash sur le panier moyen pour inciter aux commandes groupées dès l'ouverture du service.",
        impact: "Objectif : amorcer le volume de début de service",
        confirm: false
      }
    }
    return {
      intent: 'query',
      params: {},
      reply: `Bilan en temps réel : ${caFormatted} € sur ${count} commande(s), avec un panier moyen de ${pm} €. Levier prioritaire : pousser le taux d'attachement des desserts italiens et boissons pour viser un panier moyen supérieur à ${(parseFloat(pm) + 2.5).toFixed(2)} €.`,
      impact: "Optimisation de la marge nette",
      confirm: false
    }
  }

  // Strategic Playbook 2: Boost Rush du soir
  if (norm.includes('boost') || norm.includes('rush') || (norm.includes('dynamis') && norm.includes('soir'))) {
    return {
      intent: 'createPromo',
      params: { promoCode: 'RUSH15', discountType: 'percent', discountValue: 15 },
      reply: "Stratégie rush recommandée : activation du code RUSH15 (-15%) pour stimuler les prises de commande dès le début de service et lisser la charge en cuisine. Souhaitez-vous le déployer ?",
      impact: "Volume ciblé + lissage de la cadence",
      confirm: true
    }
  }

  // Strategic Playbook 3: Mode coup de feu / Anti-surcharge
  if (norm.includes('coup de feu') || norm.includes('surcharge') || norm.includes('debord') || (norm.includes('proteger') && norm.includes('cuisine'))) {
    return {
      intent: 'closeNow',
      params: {},
      reply: "Alerte cadence cuisine : pour protéger la qualité des cuissons et maîtriser les délais, souhaitez-vous suspendre temporairement les commandes en ligne le temps de désengorger le poste four ?",
      impact: "Protection qualité & maîtrise des délais",
      confirm: true
    }
  }

  // Top ventes / Meilleures ventes
  if (norm.includes('top vente') || norm.includes('meilleur') || norm.includes('plus vendu') || norm.includes('populaire')) {
    if (count === 0) {
      return {
        intent: 'query',
        params: {},
        reply: "Aucune commande enregistrée aujourd'hui pour le moment. Le palmarès des meilleures ventes se mettra à jour dès les premières commandes.",
        impact: "Palmarès des ventes",
        confirm: false
      }
    }
    const itemCounts = {}
    sales.forEach(o => (o.items || o.lines || []).forEach(l => {
      const name = l.name || l.id || ''
      const qty = l.qty || 1
      itemCounts[name] = (itemCounts[name] || 0) + qty
    }))
    const top = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 3)
      .map(([n, q]) => `${n} (${q}x)`).join(', ')
    return {
      intent: 'query',
      params: {},
      reply: top ? `Meilleures ventes du jour : ${top}.` : `Aujourd'hui, ${count} commande(s) pour un chiffre d'affaires de ${caFormatted} €.`,
      impact: "Palmarès des ventes",
      confirm: false
    }
  }

  // Promo code creation fallback
  if (norm.includes('promo') || norm.includes('reduction') || norm.includes('rabais') || (norm.includes('remise') && !norm.includes('remet'))) {
    const codeMatch = norm.match(/(?:code|promo)?\s*([a-z0-9_-]{3,15})/i)
    const pctMatch = norm.match(/(\d+)\s*%/i) || norm.match(/-(\d+)/i) || norm.match(/(\d+)\s*(?:euro|€)/i)
    let foundCode = ''
    const tokens = norm.split(/\s+/)
    for (const t of tokens) {
      const cleanT = t.replace(/[^a-z0-9]/gi, '').toUpperCase()
      if (cleanT.length >= 3 && cleanT.length <= 12 && !['CODE', 'PROMO', 'POUR', 'AVEC', 'CREE', 'CREER', 'FAIS', 'UN', 'UNE', 'DE', 'REMISE', 'RABAIS', 'REDUCTION'].includes(cleanT) && /\d/.test(cleanT)) {
        foundCode = cleanT
        break
      }
    }
    if (!foundCode) {
      for (const t of tokens) {
        const cleanT = t.replace(/[^a-z0-9]/gi, '').toUpperCase()
        if (cleanT.length >= 3 && cleanT.length <= 12 && !['CODE', 'PROMO', 'POUR', 'AVEC', 'CREE', 'CREER', 'FAIS', 'UN', 'UNE', 'DE', 'REMISE', 'RABAIS', 'REDUCTION'].includes(cleanT)) {
          foundCode = cleanT
          break
        }
      }
    }
    const finalCode = foundCode || (codeMatch ? codeMatch[1].toUpperCase() : 'FLASH10')
    const discount = pctMatch ? parseInt(pctMatch[1], 10) : 10
    return {
      intent: 'createPromo',
      params: { promoCode: finalCode, discountType: 'percent', discountValue: discount },
      reply: `Confirmez-vous la création du code promo ${finalCode} avec une réduction de ${discount}% ?`,
      impact: `Code promo -${discount}% immédiat`,
      confirm: true
    }
  }

  // CA & Sales queries fallback
  if (norm.includes('chiffre') || norm.includes(' ca') || norm.includes('ventes') || norm.includes('recette') || norm.includes('commandes')) {
    if (count === 0) {
      return {
        intent: 'query',
        params: {},
        reply: "Aucune commande enregistrée aujourd'hui pour le moment. Le chiffre d'affaires est de 0,00 €.",
        impact: "Activité du jour",
        confirm: false
      }
    }
    return {
      intent: 'query',
      params: {},
      reply: `Aujourd'hui, ${count} commande${count > 1 ? 's ont été enregistrées' : ' a été enregistrée'} pour un chiffre d'affaires total de ${caFormatted} € (panier moyen: ${pm} €).`,
      impact: "Activité du jour",
      confirm: false
    }
  }

  const isOutOfStock = norm.includes('epuis') || norm.includes('rupture') || norm.includes('plus de') || norm.includes('fini')
  const isRestore = norm.includes('retour') || norm.includes('remet') || norm.includes('en stock') || norm.includes('dispo')
  const isHide = norm.includes('masqu') || norm.includes('cach') || norm.includes('retir')
  const isShow = norm.includes('visib') || norm.includes('remontr')
  const isPrice = (norm.includes('prix') || norm.includes('pass') || norm.includes('met') || norm.includes(' a ')) && (norm.includes('€') || /\d+[\.,]?\d*\s*e/.test(norm) || /\d+[\.,]?\d*$/.test(norm))

  const aliases = [
    { match: ['margherita', 'margerita'], id: 'pizzas:margherita-dop:medium-28cm', name: 'Pizza MARGHERITA DOP' },
    { match: ['regina', 'reine'], id: 'pizzas:regina-royale:medium-28cm', name: 'Pizza REGINA ROYALE' },
    { match: ['diavola', 'piquante', 'diavolo'], id: 'pizzas:diavola-piccante:medium-28cm', name: 'Pizza DIAVOLA PICCANTE' },
    { match: ['4 fromage', 'quatre fromage', 'formaggi'], id: 'pizzas:4-formaggi-rustica:medium-28cm', name: 'Pizza 4 FORMAGGI RUSTICA' },
    { match: ['burrata', 'burratissima'], id: 'pizzas:burratissima-di-bella:medium-28cm', name: 'Pizza BURRATISSIMA DI BELLA' },
    { match: ['truffe', 'tartufo'], id: 'pizzas:tartufo-suprema:medium-28cm', name: 'Pizza TARTUFO SUPREMA' },
    { match: ['double smash', 'smash cheese'], id: 'burgers:double-smash-cheese', name: 'Double Smash Cheese' },
    { match: ['truffle smash'], id: 'burgers:truffle-smash-burger', name: 'Truffle Smash Burger' },
    { match: ['smokey bacon', 'bacon bbq'], id: 'burgers:smokey-bacon-bbq', name: 'Smokey Bacon BBQ' },
    { match: ['crispy chicken', 'chicken spicy'], id: 'burgers:crispy-chicken-spicy', name: 'Crispy Chicken Spicy' },
    { match: ['tiramisu'], id: 'desserts:tiramisu-maison-tradizionale', name: 'Tiramisu Maison' },
    { match: ['pizza choco', 'choco noisette'], id: 'desserts:pizza-choco-noisette-pistache', name: 'Pizza Choco-Noisette' },
    { match: ['san pellegrino', 'limonata'], id: 'boissons:san-pellegrino-limonata', name: 'San Pellegrino Limonata' },
    { match: ['aranciata'], id: 'boissons:san-pellegrino-aranciata-rossa', name: 'San Pellegrino Aranciata Rossa' },
    { match: ['coca', 'coke'], id: 'boissons:coca-cola-vintage-bouteille-verre', name: 'Coca-Cola Vintage' },
    { match: ['fuze tea', 'ice tea', 'the peche'], id: 'boissons:fuze-tea-peche-intense', name: 'Fuze Tea Pêche' },
  ]

  let matchedId = null
  let matchedItem = null

  for (const alias of aliases) {
    if (alias.match.some(m => norm.includes(m))) {
      matchedId = alias.id
      matchedItem = alias.name
      break
    }
  }

  if (matchedId) {
    if (isOutOfStock) {
      return {
        intent: 'markOutOfStock',
        params: { itemId: matchedId, itemName: matchedItem },
        reply: `${matchedItem} marquée en rupture de stock.`,
        confirm: false
      }
    }
    if (isRestore) {
      return {
        intent: 'restoreItem',
        params: { itemId: matchedId, itemName: matchedItem },
        reply: `${matchedItem} remise en stock.`,
        confirm: false
      }
    }
    if (isHide) {
      return {
        intent: 'hideItem',
        params: { itemId: matchedId, itemName: matchedItem },
        reply: `${matchedItem} masquée de la carte.`,
        confirm: false
      }
    }
    if (isShow) {
      return {
        intent: 'showItem',
        params: { itemId: matchedId, itemName: matchedItem },
        reply: `${matchedItem} réactivée sur la carte.`,
        confirm: false
      }
    }
    if (isPrice) {
      const priceMatch = norm.match(/(\d+[\.,]?\d*)\s*(?:€|euro|e)?/)
      if (priceMatch) {
        const val = parseFloat(priceMatch[1].replace(',', '.'))
        if (!isNaN(val) && val > 0) {
          const cents = Math.round(val * 100)
          return {
            intent: 'updatePrice',
            params: { itemId: matchedId, itemName: matchedItem, price: cents },
            reply: `Confirmez-vous le passage de ${matchedItem} à ${(cents / 100).toFixed(2)} € ?`,
            confirm: true
          }
        }
      }
    }
  }

  if (norm.includes('ferm') && (norm.includes('restaurant') || norm.includes('resto') || norm.includes('service') || norm.includes('maintenant'))) {
    return {
      intent: 'closeNow',
      params: {},
      reply: 'Confirmez-vous la fermeture immédiate du restaurant pour les commandes en ligne ?',
      confirm: true
    }
  }
  if (norm.includes('ouvr') && (norm.includes('restaurant') || norm.includes('resto') || norm.includes('service') || norm.includes('maintenant'))) {
    return {
      intent: 'openNow',
      params: {},
      reply: 'Le restaurant est maintenant ouvert en direct.',
      confirm: false
    }
  }

  // Catch-all for greetings and conversational messages — always respond warmly
  const greetings = ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou', 'yo', 'hey', 'bonne nuit', 're ', 're!', 'rebonjour']
  const isGreeting = greetings.some(g => norm.startsWith(g) || norm === g.trim()) || norm.length <= 20
  if (isGreeting) {
    const statusLine = count > 0
      ? `${count} commande${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''} aujourd'hui pour un CA de ${caFormatted} €`
      : 'Aucune commande enregistrée pour le moment'
    return {
      intent: 'query',
      params: {},
      reply: `Bonjour. ${statusLine}. Je suis prêt à gérer votre carte, vos prix ou vos promos — dites-moi ce dont vous avez besoin.`,
      confirm: false
    }
  }

  return null
}

function extractJson(str) {
  if (!str) return null
  const cleaned = str.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {}

  const firstBrace = str.indexOf('{')
  const lastBrace = str.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(str.substring(firstBrace, lastBrace + 1))
    } catch {}
  }
  return null
}

// ── Core processing function usable by both /api/ai-assistant and managerApi ──
export async function processAiAssistant(messageText) {
  const message = String(messageText || '').trim().slice(0, 500)
  if (!message) {
    return {
      intent: 'unknown',
      params: {},
      reply: 'Consigne vide. Veuillez formuler une demande pour le copilote.',
      confirm: false
    }
  }

  // Load live context
  const [overrides, promos, customItems, sales] = await Promise.all([
    store.getMenuOverrides().catch(() => ({})),
    store.getPromos().catch(() => ({})),
    store.getCustomItems().catch(() => ({})),
    store.getSalesReport(Date.now() - 24 * 3600e3).catch(() => []),
  ])

  const catalog = { ...CATALOG, ...customItems }
  const restaurantName = RESTAURANT_CONFIG?.brand?.name || 'le restaurant'

  const openrouterKey = (env.OPENROUTER_API_KEY || '').trim()
  if (!openrouterKey) {
    const fallback = resolveIntentFallback(message, catalog, sales)
    if (fallback) return fallback
    return {
      intent: 'query',
      params: {},
      reply: "La clé API OpenRouter (OPENROUTER_API_KEY) n'est pas encore configurée dans vos variables d'environnement Vercel. Ajoutez-la dans votre tableau de bord Vercel pour activer le copilote.",
      missingKey: true,
      confirm: false
    }
  }
  const systemPrompt = buildSystemPrompt(catalog, overrides, sales, restaurantName)

  const configuredModel = (env.OPENROUTER_MODEL || '').trim()
  const modelCandidates = configuredModel
    ? [configuredModel]
    : [
        'openrouter/free',
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'nvidia/nemotron-3.5-lightning:free',
        'meta-llama/llama-3.1-8b-instruct'
      ]

  let orRes = null
  let lastErr = ''

  for (const model of modelCandidates) {
    try {
      const payload = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }

      let resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/farahboual/Bella-Pizza',
          'X-Title': `${restaurantName} AI Assistant`,
        },
        body: JSON.stringify(payload)
      })

      // If the model rejects response_format, retry without it
      if (resp.status === 400) {
        const errPeek = await resp.clone().text().catch(() => '')
        if (errPeek.includes('response_format') || errPeek.includes('json_object')) {
          delete payload.response_format
          resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openrouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://github.com/farahboual/Bella-Pizza',
              'X-Title': `${restaurantName} AI Assistant`,
            },
            body: JSON.stringify(payload)
          })
        }
      }

      if (resp.ok) {
        orRes = resp
        break
      } else {
        lastErr = await resp.text().catch(() => '')
        console.warn(`[AI Assistant] Model ${model} returned ${resp.status}: ${lastErr.slice(0, 120)}`)
      }
    } catch (err) {
      lastErr = err.message
      console.warn(`[AI Assistant] Model ${model} network error: ${err.message}`)
    }
  }

  if (!orRes) {
    console.error('[AI Assistant] All models failed. Last error:', lastErr.slice(0, 300))
    const fallback = resolveIntentFallback(message, catalog, sales)
    if (fallback) {
      return fallback
    }
    return {
      intent: 'query',
      params: {},
      reply: "Le copilote est temporairement en mode restreint. Vous pouvez utiliser les boutons d'action ci-dessus pour piloter le restaurant en direct.",
      confirm: false
    }
  }

  try {
    const orJson = await orRes.json()
    const rawContent = orJson.choices?.[0]?.message?.content || ''

    let parsed = extractJson(rawContent)

    if (!parsed || !parsed.intent || parsed.intent === 'unknown') {
      const fallback = resolveIntentFallback(message, catalog, sales)
      if (fallback) {
        return fallback
      }
    }

    if (!parsed) {
      const trimmedText = rawContent.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim()
      if (trimmedText && !trimmedText.startsWith('<') && !trimmedText.startsWith('{') && !trimmedText.startsWith('Error')) {
        return {
          intent: 'query',
          params: {},
          reply: trimmedText.slice(0, 350),
          confirm: false
        }
      }
      console.error('[AI Assistant] Failed to parse LLM response:', rawContent.slice(0, 300))
      const fallback = resolveIntentFallback(message, catalog, sales)
      if (fallback) return fallback
      return {
        intent: 'unknown',
        params: {},
        reply: 'Je n\'ai pas bien compris cette consigne. Vous pouvez me demander par exemple : "Audit du jour", "Margherita épuisée", ou "Créer un code promo".',
        confirm: false
      }
    }

    const validIntents = ['markOutOfStock', 'restoreItem', 'hideItem', 'showItem', 'updatePrice', 'closeNow', 'openNow', 'createPromo', 'query', 'unknown']
    if (!validIntents.includes(parsed.intent)) {
      const fallback = resolveIntentFallback(message, catalog, sales)
      if (fallback) return fallback
      parsed.intent = 'unknown'
    }

    return {
      intent: parsed.intent || 'unknown',
      params: parsed.params || {},
      reply: String(parsed.reply || 'Ordre reçu.').slice(0, 300),
      impact: parsed.impact ? String(parsed.impact).slice(0, 100) : null,
      confirm: !!parsed.confirm
    }

  } catch (err) {
    console.error('[AI Assistant] Processing error:', err)
    const fallback = resolveIntentFallback(message, catalog, sales)
    if (fallback) return fallback
    return {
      intent: 'query',
      params: {},
      reply: "Une perturbation temporaire est survenue. Vous pouvez continuer d'utiliser les boutons d'action ci-dessus.",
      confirm: false
    }
  }
}

// ── HTTP handler for direct POST to /api/ai-assistant ─────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    return send(res, 405, { error: 'method not allowed' })
  }

  try {
    const cfg = await store.getConfigData().catch(() => ({}))
    const expectedKey = cfg.gerantPassword || env.GERANT_PASSWORD || env.KITCHEN_PASSWORD || ''
    const providedKey = req.headers['x-kitchen-key'] || ''
    if (expectedKey && !safeEq(providedKey, expectedKey)) {
      return send(res, 401, { error: 'unauthorized' })
    }

    const body = await readBody(req)
    const result = await processAiAssistant(body.message)
    return send(res, 200, result)

  } catch (e) {
    console.error('[AI Assistant] Fatal:', e)
    return send(res, 500, { error: 'Erreur serveur' })
  }
}
