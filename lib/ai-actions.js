// lib/ai-actions.js
// Executes operational intents directly in the backend store
import { store } from './store.js'
import { CATALOG } from '../shared/catalog.js'

export async function executeAiActionDirect(intent, params = {}) {
  try {
    if (intent === 'markOutOfStock' || intent === 'restoreItem') {
      const isOut = intent === 'markOutOfStock'
      const id = params.itemId
      if (!id) return { ok: false, message: 'Identifiant du produit manquant' }

      const customItems = await store.getCustomItems().catch(() => ({}))
      const fullCatalog = { ...CATALOG, ...customItems }

      const parts = String(id).split(':')
      const targetIds = [id]
      if (parts[0] === 'pizzas' && parts[1]) {
        ['medium-28cm', 'large-33cm', 'xxl-partage-40cm'].forEach(sz => {
          const szId = `pizzas:${parts[1]}:${sz}`
          if (fullCatalog[szId] && !targetIds.includes(szId)) targetIds.push(szId)
        })
      }

      const overrides = await store.getMenuOverrides().catch(() => ({}))
      for (const tId of targetIds) {
        const ov = overrides[tId] || {}
        await store.saveMenuOverride(tId, { price: ov.price, outOfStock: isOut })
      }
      const label = params.itemName || 'Produit'
      return {
        ok: true,
        message: `${label} ${isOut ? 'marqué en rupture de stock' : 'remis en stock'}.`
      }
    }

    if (intent === 'hideItem' || intent === 'showItem') {
      const isHide = intent === 'hideItem'
      const id = params.itemId
      if (!id) return { ok: false, message: 'Identifiant du produit manquant' }
      await store.saveMenuOverride(id, { hidden: isHide })
      const label = params.itemName || 'Produit'
      return {
        ok: true,
        message: `${label} ${isHide ? 'masqué de la carte' : 'réactivé sur la carte'}.`
      }
    }

    if (intent === 'updatePrice') {
      const id = params.itemId
      const priceVal = params.price
      if (!id || !priceVal) return { ok: false, message: 'Produit ou tarif manquant' }
      const overrides = await store.getMenuOverrides().catch(() => ({}))
      const ov = overrides[id] || {}
      await store.saveMenuOverride(id, { price: priceVal, outOfStock: !!ov.outOfStock })
      const label = params.itemName || 'Produit'
      return {
        ok: true,
        message: `Tarif de ${label} mis à jour : ${(priceVal / 100).toFixed(2)} €.`
      }
    }

    if (intent === 'closeNow') {
      await store.updateConfigData({
        manualClosed: true,
        forcedOpen: false,
        openMode: 'closed',
        closedReason: 'Fermé temporairement par le gérant'
      })
      return {
        ok: true,
        message: 'Restaurant fermé en direct. Les commandes en ligne sont suspendues.'
      }
    }

    if (intent === 'openNow') {
      await store.updateConfigData({
        manualClosed: false,
        forcedOpen: true,
        openMode: 'forced_open',
        closedReason: ''
      })
      return {
        ok: true,
        message: 'Restaurant ouvert en direct. Les commandes en ligne sont activées.'
      }
    }

    if (intent === 'createPromo') {
      const code = String(params.promoCode || '').toUpperCase().trim()
      if (!code) return { ok: false, message: 'Code promo manquant' }
      const discountType = params.discountType || 'percent'
      const discountValue = +params.discountValue || 10
      await store.savePromo(code, {
        discountType,
        discountValue,
        active: true
      })
      return {
        ok: true,
        message: `Code promo ${code} activé avec une réduction de ${discountType === 'percent' ? discountValue + '%' : (discountValue / 100).toFixed(2) + ' €'}.`
      }
    }

    return { ok: false, message: `Action ${intent} inconnue` }
  } catch (err) {
    console.error('[AI Action Execution Error]:', err)
    return { ok: false, message: 'Erreur lors de l’exécution : ' + err.message }
  }
}

export function packActionCallback(intent, params = {}) {
  if (intent === 'closeNow') return 'act:c:closeNow'
  if (intent === 'openNow') return 'act:c:openNow'
  if (intent === 'createPromo') return `act:c:p:${params.promoCode || 'PROMO'}:${params.discountValue || 10}`
  if (intent === 'updatePrice') {
    const shortId = (params.itemId || '').replace('pizzas:', '').replace(':medium-28cm', '')
    return `act:c:pr:${shortId}:${params.price || 0}`
  }
  return `act:c:${intent}`
}

export function unpackActionCallback(data = '') {
  const parts = String(data).split(':')
  const isConfirm = parts[1] === 'c'
  const actionType = parts[2]
  if (!isConfirm) return { confirm: false }

  if (actionType === 'closeNow') return { confirm: true, intent: 'closeNow', params: {} }
  if (actionType === 'openNow') return { confirm: true, intent: 'openNow', params: {} }
  if (actionType === 'p') {
    return {
      confirm: true,
      intent: 'createPromo',
      params: { promoCode: parts[3], discountType: 'percent', discountValue: parseInt(parts[4] || '10', 10) }
    }
  }
  if (actionType === 'pr') {
    const baseSlug = parts[3]
    const itemId = baseSlug.includes(':') ? baseSlug : `pizzas:${baseSlug}:medium-28cm`
    return {
      confirm: true,
      intent: 'updatePrice',
      params: { itemId, price: parseInt(parts[4] || '0', 10) }
    }
  }
  return { confirm: true, intent: actionType, params: {} }
}

