// api/telegram.js
// Telegram Bot Webhook endpoint for Bella Pizza AI Copilot
import crypto from 'node:crypto'
import { processAiAssistant } from './ai-assistant.js'
import { executeAiActionDirect, packActionCallback, unpackActionCallback } from '../lib/ai-actions.js'

const env = process.env

const send = (res, code, obj) => {
  res.setHeader('cache-control', 'no-store')
  res.setHeader('content-type', 'application/json; charset=utf-8')
  return res.status ? res.status(code).json(obj) : (res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }), res.end(JSON.stringify(obj)))
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

// ── Telegram Bot API client ─────────────────────────────────────────────────
async function tg(token, method, body = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return await res.json()
  } catch (err) {
    console.error(`[Telegram ${method} Error]:`, err)
    return { ok: false, error: err.message }
  }
}

const PERSISTENT_KEYBOARD = {
  keyboard: [
    [{ text: '📊 Bilan du service' }, { text: '⭐ Top ventes' }],
    [{ text: '⚡ Boost Rush soir' }, { text: '⚠️ Coup de feu (Pause)' }]
  ],
  resize_keyboard: true,
  is_persistent: true
}

export default async function handler(req, res) {
  const token = (env.TELEGRAM_BOT_TOKEN || '').trim()

  // ── GET: Webhook Setup & Status inspection ──────────────────────────────────
  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost')
    const wantsSetup = url.searchParams.get('setup') === '1'
    const wantsInfo = url.searchParams.get('info') === '1'

    if (!token) {
      return send(res, 200, {
        status: 'waiting_configuration',
        message: 'Variable TELEGRAM_BOT_TOKEN manquante dans Vercel.',
        instructions: [
          '1. Ouvrez Telegram et cherchez @BotFather',
          '2. Envoyez /newbot et suivez les instructions pour nommer votre bot',
          '3. Copiez le token reçu (ex: 123456789:ABCdef...)',
          '4. Ajoutez la variable d’environnement TELEGRAM_BOT_TOKEN dans Vercel',
          '5. Visitez /api/telegram?setup=1 pour connecter automatiquement le webhook'
        ]
      })
    }

    if (wantsInfo) {
      const info = await tg(token, 'getWebhookInfo')
      return send(res, 200, { webhookInfo: info })
    }

    if (wantsSetup) {
      const host = req.headers['x-forwarded-host'] || req.headers.host || ''
      const proto = req.headers['x-forwarded-proto'] || 'https'
      const webhookUrl = `${proto}://${host}/api/telegram`

      const payload = {
        url: webhookUrl,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      }
      if (env.TELEGRAM_SECRET_TOKEN) {
        payload.secret_token = env.TELEGRAM_SECRET_TOKEN.trim()
      }

      const result = await tg(token, 'setWebhook', payload)
      return send(res, 200, {
        setupSuccess: !!result.ok,
        webhookUrl,
        telegramResponse: result
      })
    }

    return send(res, 200, {
      status: 'active',
      hasToken: true,
      hasAdminLock: !!env.TELEGRAM_ADMIN_ID,
      tip: 'Pour lier ou réinitialiser le webhook, visitez /api/telegram?setup=1'
    })
  }

  // ── POST: Telegram Webhook updates ─────────────────────────────────────────
  if (req.method !== 'POST') {
    res.setHeader('allow', 'GET, POST')
    return send(res, 405, { error: 'method not allowed' })
  }

  if (!token) {
    return send(res, 200, { ok: false, error: 'TELEGRAM_BOT_TOKEN not set' })
  }

  // Verify secret token header if configured
  if (env.TELEGRAM_SECRET_TOKEN) {
    const providedSecret = req.headers['x-telegram-bot-api-secret-token'] || ''
    if (providedSecret !== env.TELEGRAM_SECRET_TOKEN.trim()) {
      return send(res, 403, { error: 'unauthorized secret token' })
    }
  }

  const update = await readBody(req)

  // ── Handle Callback Query (Inline Button Click) ─────────────────────────────
  if (update.callback_query) {
    const cb = update.callback_query
    const fromId = cb.from?.id
    const chatId = cb.message?.chat?.id
    const messageId = cb.message?.message_id
    const data = cb.data || ''

    const adminId = (env.TELEGRAM_ADMIN_ID || '').trim()
    if (adminId && String(fromId) !== adminId) {
      await tg(token, 'answerCallbackQuery', {
        callback_query_id: cb.id,
        text: 'Accès non autorisé.',
        show_alert: true
      })
      return send(res, 200, { ok: true })
    }

    const { confirm, intent, params } = unpackActionCallback(data)
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id })

    if (confirm && intent) {
      const execResult = await executeAiActionDirect(intent, params)
      await tg(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: `✅ <b>Action exécutée avec succès</b>\n${execResult.message}\n\n<i>Synchronisation immédiate sur le site client.</i>`,
        parse_mode: 'HTML'
      })
    } else {
      await tg(token, 'editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: `❌ <i>Opération ignorée par le gérant.</i>`,
        parse_mode: 'HTML'
      })
    }
    return send(res, 200, { ok: true })
  }

  // ── Handle Regular Messages ────────────────────────────────────────────────
  const msg = update.message
  if (!msg || !msg.text) {
    return send(res, 200, { ok: true })
  }

  const chatId = msg.chat?.id
  const fromId = msg.from?.id
  const rawText = (msg.text || '').trim()

  const adminId = (env.TELEGRAM_ADMIN_ID || '').trim()

  // Onboarding / Start command
  if (rawText === '/start' || rawText === '/aide' || rawText === '/help') {
    const lockStatus = adminId
      ? (String(fromId) === adminId ? '🔒 Accès sécurisé : Gérant identifié' : '⛔ Accès restreint')
      : '⚠️ Non verrouillé (configurez TELEGRAM_ADMIN_ID pour restreindre l’accès)'

    const welcome = [
      `👋 <b>Bienvenue sur le Copilote Telegram Bella Pizza !</b>`,
      ``,
      `Ce bot vous permet de piloter votre restaurant en direct depuis votre smartphone.`,
      ``,
      `📱 <b>Votre identifiant Telegram :</b> <code>${fromId}</code>`,
      `Statut : ${lockStatus}`,
      ``,
      `<b>Exemples de consignes :</b>`,
      `• « Bilan du service » ou « Audit du jour »`,
      `• « Quelles sont les meilleures ventes ? »`,
      `• « La Pizza Margherita DOP est épuisée »`,
      `• « Remets la Margherita en stock »`,
      `• « Crée un code promo SOIR10 à -10% »`,
      `• « Ferme le restaurant maintenant »`
    ].join('\n')

    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: welcome,
      parse_mode: 'HTML',
      reply_markup: PERSISTENT_KEYBOARD
    })
    return send(res, 200, { ok: true })
  }

  if (rawText === '/id' || rawText === '/myid') {
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: `Votre identifiant Telegram : <code>${fromId}</code>\n\nPour verrouiller le copilote à vous seul, ajoutez cette variable dans Vercel :\n<code>TELEGRAM_ADMIN_ID=${fromId}</code>`,
      parse_mode: 'HTML'
    })
    return send(res, 200, { ok: true })
  }

  // Check admin lock if configured
  if (adminId && String(fromId) !== adminId) {
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: `⛔ <b>Accès restreint</b>\nCe copilote est réservé au gérant du restaurant.\nVotre identifiant : <code>${fromId}</code>`,
      parse_mode: 'HTML'
    })
    return send(res, 200, { ok: true })
  }

  // Clean button emojis if selected via the persistent keyboard
  const cleanInput = rawText.replace(/^[📊⭐⚡⚠️✅❌]\s*/u, '').trim()

  // Process via AI Copilot engine
  const aiResult = await processAiAssistant(cleanInput)
  const { intent, params, reply, impact, confirm } = aiResult

  // Needs manual confirmation (price update, emergency close, promo creation)
  if (confirm && intent && intent !== 'query' && intent !== 'unknown') {
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirmer l’opération', callback_data: packActionCallback(intent, params) },
          { text: '❌ Ignorer', callback_data: `act:x:${intent}` }
        ]
      ]
    }

    const confirmText = [
      `<b>${reply}</b>`,
      impact ? `\n💡 <i>${impact}</i>` : '',
      `\n⚠️ <i>Confirmation requise avant application sur le site client.</i>`
    ].filter(Boolean).join('\n')

    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: confirmText,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    })
    return send(res, 200, { ok: true })
  }

  // Instant execution (out of stock, restore, hide, show, openNow)
  if (intent && intent !== 'query' && intent !== 'unknown' && !confirm) {
    const execResult = await executeAiActionDirect(intent, params)
    const successText = [
      `<b>${reply}</b>`,
      execResult.ok ? `✅ <i>${execResult.message}</i>` : `⚠️ <i>${execResult.message}</i>`,
      impact ? `\n💡 <i>${impact}</i>` : ''
    ].filter(Boolean).join('\n')

    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: successText,
      parse_mode: 'HTML',
      reply_markup: PERSISTENT_KEYBOARD
    })
    return send(res, 200, { ok: true })
  }

  // Strategic Query or Conversational answer
  const queryText = [
    reply,
    impact ? `\n\n💡 <b>Levier stratégique :</b> <i>${impact}</i>` : ''
  ].filter(Boolean).join('\n')

  await tg(token, 'sendMessage', {
    chat_id: chatId,
    text: queryText,
    reply_markup: PERSISTENT_KEYBOARD
  })

  return send(res, 200, { ok: true })
}
