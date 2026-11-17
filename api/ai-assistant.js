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
  if (!sales.length) return 'Aucune commande enregistrée aujourd\'hui.'
  const ca = sales.reduce((s, o) => s + o.total, 0)
  const itemCounts = {}
  sales.forEach(o => (o.items || o.lines || []).forEach(l => {
    const name = l.name || l.id
    itemCounts[name] = (itemCounts[name] || 0) + (l.qty || 1)
  }))
  const top = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 5)
    .map(([n, q]) => `${n} (${q}x)`).join(', ')
  const last3 = sales.slice(0, 3).map(o =>
    `#${o.number} ${o.customer?.name || 'Client'} — ${(o.total / 100).toFixed(2)}€`
  ).join(' | ')
  const byType = {
    livraison: sales.filter(o => o.type === 'livraison').length,
    emporter: sales.filter(o => o.type === 'emporter').length,
    sur_place: sales.filter(o => o.type === 'sur_place').length,
  }
  return [
    `Commandes: ${sales.length} | CA: ${(ca / 100).toFixed(2)}€ | Panier moyen: ${(ca / sales.length / 100).toFixed(2)}€`,
    `Répartition: Livraison ${byType.livraison} | À emporter ${byType.emporter} | Sur place ${byType.sur_place}`,
    `Top ventes: ${top || 'N/A'}`,
    `Dernières commandes: ${last3}`
  ].join('\n')
}

// ── System prompt ──────────────────────────────────────────────────────────
function buildSystemPrompt(catalog, overrides, sales, restaurantName) {
  return `Tu es l'assistant d'exploitation de "${restaurantName}", intégré dans l'espace gérant.
Tu aides le gérant pendant le service en exécutant des actions et en répondant à ses questions.
Réponds TOUJOURS en français, de façon courte et directe comme un collègue.

## MENU ACTUEL (ID | Nom | Prix | Catégorie | Disponibilité)
${buildCatalogContext(catalog, overrides)}

## COMMANDES DU JOUR
${buildSalesContext(sales)}

## ACTIONS DISPONIBLES
Tu peux exécuter ces actions. Pour identifier un item, trouve l'ID exact dans le menu ci-dessus en matchant le nom mentionné par le gérant.

- markOutOfStock: marquer un item épuisé (ex: "la calzone est épuisée", "plus de margherita")  
- restoreItem: remettre un item disponible (ex: "remet la calzone", "la margherita est de retour")
- hideItem: masquer un item du menu (ex: "cache le tiramisu", "retire le tiramisu du menu")
- showItem: remettre un item visible (ex: "remets le tiramisu")
- updatePrice: changer le prix d'un item (ex: "mets la margherita à 13€", "le burger passe à 14.50")
- closeNow: fermer le restaurant maintenant (ex: "ferme le resto", "on ferme")
- openNow: ouvrir le restaurant maintenant (ex: "ouvre le resto", "on ouvre")
- createPromo: créer un code promo (ex: "crée un code LUNDI20 à -20%", "promo PIZZA10 de 10%")
- query: répondre à une question sur les ventes, le menu, etc.
- unknown: tu n'as pas compris la demande

## FORMAT DE RÉPONSE OBLIGATOIRE
Réponds UNIQUEMENT avec ce JSON valide, sans texte avant ni après:
{
  "intent": "markOutOfStock|restoreItem|hideItem|showItem|updatePrice|closeNow|openNow|createPromo|query|unknown",
  "params": {
    "itemId": "l'ID exact du menu ci-dessus (ou null si non applicable)",
    "itemName": "le nom lisible de l'item (ou null)",
    "price": null,
    "promoCode": null,
    "discountType": null,
    "discountValue": null
  },
  "reply": "Ta réponse courte en français pour le gérant (1-2 phrases max)",
  "confirm": false
}

RÈGLES STRICTES:
- Pour updatePrice, closeNow, createPromo: mets "confirm": true (actions importantes nécessitant confirmation)
- Pour markOutOfStock, restoreItem, hideItem, showItem, query: mets "confirm": false
- Pour updatePrice: mets le prix en centimes dans params.price (ex: 13€ → 1300)
- Pour createPromo: discountType = "percent" ou "fixed", discountValue = nombre
- Si l'item n'est pas trouvé dans le menu, dis-le dans reply et mets intent = "unknown"
- reply doit être court, sobre et direct — pas de formules de politesse superflues
- N'utilise JAMAIS d'émojis dans tes réponses. Aucun symbole cartoon, reste professionnel.`
}

// ── Hybrid Intent Fallback Resolver ─────────────────────────────────────────
function resolveIntentFallback(messageText, catalog = {}, sales = []) {
  const norm = String(messageText || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // CA & Sales queries fallback
  if (norm.includes('chiffre') || norm.includes(' ca') || norm.includes('ventes') || norm.includes('recette') || norm.includes('commandes')) {
    const ca = (sales || []).reduce((s, o) => s + (o.total || 0), 0)
    const count = (sales || []).length
    if (count === 0) {
      return {
        intent: 'query',
        params: {},
        reply: "Aucune commande enregistrée aujourd'hui pour le moment. Le chiffre d'affaires est de 0,00 €.",
        confirm: false
      }
    }
    return {
      intent: 'query',
      params: {},
      reply: `Aujourd'hui, ${count} commande${count > 1 ? 's ont été enregistrées' : ' a été enregistrée'} pour un chiffre d'affaires total de ${(ca / 100).toFixed(2)} €.`,
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

  const openrouterKey = (env.OPENROUTER_API_KEY || '').trim()
  if (!openrouterKey) {
    return {
      intent: 'query',
      params: {},
      reply: "La clé API OpenRouter (OPENROUTER_API_KEY) n'est pas encore configurée dans vos variables d'environnement Vercel. Ajoutez-la dans votre tableau de bord Vercel pour activer le copilote.",
      missingKey: true,
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
    return {
      intent: 'query',
      params: {},
      reply: "Le service IA OpenRouter est temporairement saturé ou indisponible. Veuillez réessayer dans un instant.",
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
      return {
        intent: 'unknown',
        params: {},
        reply: 'Je n\'ai pas pu interpréter cette consigne. Essayez de reformuler (ex: "La Pizza Margherita est épuisée").',
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
      confirm: !!parsed.confirm
    }

  } catch (err) {
    console.error('[AI Assistant] Network error:', err)
    return {
      intent: 'query',
      params: {},
      reply: "Erreur de connexion avec OpenRouter : " + err.message,
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
