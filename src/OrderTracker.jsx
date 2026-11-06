import { useState, useEffect, useRef } from 'react'
import { RESTAURANT_CONFIG } from '../shared/restaurant.config.js'
import { eur } from '../shared/catalog.js'
import { useLang } from './i18n.jsx'

const cfgB = RESTAURANT_CONFIG?.brand || {}
const cfgC = RESTAURANT_CONFIG?.contact || {}

// Format raw phone for wa.me link (+33142... -> 33142...)
const cleanWaPhone = (cfgC.phoneRaw || '').replace(/\D/g, '')

export function OrderTracker() {
  const { t, lang } = useLang()
  const [order, setOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_active_order')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  // Sync to localStorage
  const saveOrder = (data) => {
    setOrder(data)
    try {
      if (data) {
        localStorage.setItem('tp_active_order', JSON.stringify(data))
      } else {
        localStorage.removeItem('tp_active_order')
      }
    } catch {}
  }

  // Handle order_placed custom event from CartDrawer
  useEffect(() => {
    const handlePlaced = (e) => {
      try {
        const saved = localStorage.getItem('tp_active_order')
        if (saved) {
          setOrder(JSON.parse(saved))
          setOpen(true)
        }
      } catch {}
    }
    window.addEventListener('order_placed', handlePlaced)
    return () => window.removeEventListener('order_placed', handlePlaced)
  }, [])

  // Handle URL query ?commande=ID or ?annule=ID from Stripe
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const id = q.get('commande')
    const no = q.get('annule')
    if (!id && !no) return

    window.history.replaceState(null, '', window.location.pathname + window.location.hash)

    if (no) {
      alert('Paiement annulé. Votre commande n’a pas été débitée.')
      return
    }

    if (id) {
      // Fetch initial status and register
      fetch('/api/order-status?id=' + encodeURIComponent(id))
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j && j.number) {
            const newOrd = {
              id: j.id,
              number: j.number,
              status: j.status || 'new',
              paid: !!j.paid
            }
            saveOrder(newOrd)
            setOpen(true)
          }
        })
        .catch(() => {})
    }
  }, [])

  // Poll order status if active order is not completed
  useEffect(() => {
    if (!order?.id) return
    const activeStatuses = ['pending', 'new', 'accepted', 'ready']
    if (!activeStatuses.includes(order.status)) return

    const poll = async () => {
      try {
        const res = await fetch('/api/order-status?id=' + encodeURIComponent(order.id))
        if (res.ok) {
          const j = await res.json()
          if (j && j.status) {
            setOrder((prev) => {
              if (!prev || prev.status === j.status) return prev
              const updated = { ...prev, status: j.status, paid: !!j.paid, number: j.number || prev.number }
              try {
                localStorage.setItem('tp_active_order', JSON.stringify(updated))
              } catch {}
              // Small vibration feedback on phone when order moves to ready
              if (j.status === 'ready' && typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
              }
              return updated
            })
          }
        }
      } catch {}
    }

    timerRef.current = setInterval(poll, 3500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [order?.id, order?.status])

  if (!order) return null

  // Calculate progress step index:
  // 0: new, 1: accepted, 2: ready, 3: done
  const stepMap = { new: 0, accepted: 1, ready: 2, done: 3 }
  const currentStep = stepMap[order.status] ?? 0
  const isCancelled = order.status === 'cancelled'

  const progressPct = isCancelled ? 0 : currentStep === 0 ? 0 : currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100

  // Status badges & text
  const statusInfo = {
    pending: {
      title: lang === 'en' ? 'Verifying payment…' : 'Validation du paiement…',
      desc: lang === 'en' ? 'Your payment is being securely processed.' : 'Votre paiement est en cours de traitement sécurisé.',
      label: lang === 'en' ? 'Payment…' : 'Paiement…',
      badgeClass: 'orange'
    },
    new: {
      title: lang === 'en' ? 'Order received by restaurant!' : 'Commande reçue par le restaurant !',
      desc: lang === 'en' ? 'Your order has been sent to the kitchen and will be prepared shortly.' : 'Votre commande a été transmise en cuisine. Elle va être préparée dans un instant.',
      label: lang === 'en' ? 'Received' : 'Reçue',
      badgeClass: 'blue'
    },
    accepted: {
      title: lang === 'en' ? 'Preparation in the kitchen' : 'En préparation en cuisine',
      desc: lang === 'en' ? 'Our pizza chefs are crafting your order with fresh Italian ingredients.' : 'Nos cuisiniers préparent votre repas avec des ingrédients frais. Temps estimé : environ 20-30 min.',
      label: lang === 'en' ? 'Kitchen' : 'En cuisine',
      badgeClass: 'orange'
    },
    ready: {
      title: order.type === 'livraison' ? (lang === 'en' ? 'Out for delivery' : 'En cours de livraison') : (lang === 'en' ? 'Your order is ready!' : 'Votre commande est prête !'),
      desc:
        order.type === 'livraison'
          ? (lang === 'en' ? 'The courier is on their way to your address with your hot order.' : 'Le livreur est en route vers votre adresse avec votre repas bien chaud.')
          : order.type === 'sur_place'
          ? (lang === 'en' ? 'Your order is being served at your table!' : 'Votre commande arrive à votre table !')
          : (lang === 'en' ? 'You can pick up your order at the restaurant counter.' : 'Vous pouvez vous présenter au comptoir du restaurant pour la récupérer.'),
      label: order.type === 'livraison' ? (lang === 'en' ? 'Delivering' : 'En livraison') : (lang === 'en' ? 'Ready!' : 'Prête !'),
      badgeClass: 'green'
    },
    done: {
      title: lang === 'en' ? 'Order Completed' : 'Commande remise & terminée',
      desc: lang === 'en' ? `Enjoy your meal and thank you for ordering from ${cfgB.name || 'our restaurant'}!` : `Bon appétit et merci de votre commande chez ${cfgB.name || 'le restaurant'} !`,
      label: lang === 'en' ? 'Completed' : 'Terminée',
      badgeClass: 'green'
    },
    cancelled: {
      title: lang === 'en' ? 'Order Cancelled' : 'Commande annulée',
      desc: lang === 'en' ? 'This order was cancelled. Please contact the restaurant for more details.' : 'Cette commande a été annulée. N’hésitez pas à contacter le restaurant pour plus de détails.',
      label: lang === 'en' ? 'Cancelled' : 'Annulée',
      badgeClass: 'red'
    }
  }

  const currentInfo = statusInfo[order.status] || statusInfo.new
  const slotMatch = (order?.note || '').match(/\[Heure souhaitée:\s*([^\]]+)\]/i)
  const slotTime = slotMatch ? slotMatch[1] : null

  const waMessage = encodeURIComponent(
    `Bonjour, j'ai une question concernant ma commande #${order.number} chez ${cfgB.name || 'votre restaurant'} : `
  )
  const waUrl = cleanWaPhone ? `https://wa.me/${cleanWaPhone}?text=${waMessage}` : null

  return (
    <>
      {/* ── 1. Floating Live Pill (when minimized) ── */}
      {!open && (
        <div className="tracker-pill-container">
          <button
            className="tracker-pill"
            onClick={() => setOpen(true)}
            aria-label={`Suivre la commande #${order.number}`}
          >
            <span className="tracker-dot" />
            <span>
              <b>#{order.number}</b> · {currentInfo.label}
            </span>
            <span style={{ opacity: 0.75, fontSize: 11, marginLeft: 4 }}>Suivre ➔</span>
          </button>
          {['done', 'cancelled'].includes(order.status) && (
            <button
              className="tracker-pill-close"
              onClick={() => saveOrder(null)}
              aria-label="Fermer le suivi de commande"
              title="Fermer le suivi"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* ── 2. Full Live Tracking Modal ── */}
      {open && (
        <div className="tracker-overlay" onClick={() => setOpen(false)}>
          <div className="tracker-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            {/* Header */}
            <div className="tracker-head">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <h3>Commande #{order.number}</h3>
                  <span className="tracker-badge-live">
                    <span className="tracker-dot" style={{ width: 7, height: 7 }} /> En direct
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--mute)' }}>
                  {cfgB.name} {order.type ? `· ${order.type.toUpperCase()}` : ''}
                </div>
              </div>
              <button
                className="x"
                style={{ width: 36, height: 36, fontSize: 18 }}
                onClick={() => setOpen(false)}
                aria-label="Réduire"
                title="Réduire le suivi"
              >
                ✕
              </button>
            </div>

            {/* Stepper Timeline */}
            {!isCancelled && (
              <div className="tracker-stepper">
                <div className="tracker-stepper-line" />
                <div className="tracker-stepper-fill" style={{ width: `${progressPct}%` }} />

                <div className="tracker-steps">
                  <div className={`tracker-step ${currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : ''}`}>
                    <div className="tracker-step-icon">{currentStep > 0 ? '✓' : '1'}</div>
                    <span className="tracker-step-label">Reçue</span>
                  </div>

                  <div className={`tracker-step ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : ''}`}>
                    <div className="tracker-step-icon">{currentStep > 1 ? '✓' : '2'}</div>
                    <span className="tracker-step-label">Cuisine</span>
                  </div>

                  <div className={`tracker-step ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : ''}`}>
                    <div className="tracker-step-icon">{currentStep > 2 ? '✓' : '3'}</div>
                    <span className="tracker-step-label">{order.type === 'livraison' ? 'Livraison' : 'Prête'}</span>
                  </div>

                  <div className={`tracker-step ${currentStep === 3 ? 'completed' : ''}`}>
                    <div className="tracker-step-icon">4</div>
                    <span className="tracker-step-label">Servie</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Status Box */}
            <div className="tracker-status-box">
              <div className="tracker-status-title">{currentInfo.title}</div>
              <div className="tracker-status-desc">{currentInfo.desc}</div>
              {slotTime && (
                <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: 8, alignSelf: 'center' }}>
                  Heure souhaitée : {slotTime}
                </div>
              )}
              {order.paid && (
                <div style={{ fontSize: 11.5, color: '#15803d', fontWeight: 700, marginTop: 4 }}>
                  ✓ Commande payée en ligne
                </div>
              )}
            </div>

            {/* Google Reviews CTA if done */}
            {order.status === 'done' && cfgC.mapsUrl && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: 16, padding: 14, textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 6, color: '#92400e' }}>
                  Votre avis compte pour nous !
                </p>
                <a
                  href={cfgC.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn red"
                  style={{ fontSize: 12.5, padding: '8px 14px', width: '100%', display: 'inline-block' }}
                >
                  Laisser 5 étoiles sur Google Maps →
                </a>
              </div>
            )}

            {/* Actions: WhatsApp + Call */}
            <div className="tracker-cta-row">
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="tracker-btn-wa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 2C6.495 2 2 6.494 2 12.029c0 1.942.553 3.758 1.517 5.305L2 22l4.823-1.488a9.975 9.975 0 005.208 1.518h.004c5.534 0 10.029-4.494 10.029-10.029C22.064 6.494 17.569 2 12.031 2zm5.82 14.286c-.244.686-1.42 1.306-1.956 1.39-.516.082-1.188.118-3.414-.799-2.846-1.173-4.664-4.088-4.806-4.275-.143-.188-1.15-1.53-1.15-2.918 0-1.388.729-2.07 1.002-2.353.272-.284.594-.355.792-.355.198 0 .396.002.569.01.185.008.433-.07.677.517.248.598.843 2.07.917 2.222.074.152.124.33.025.528-.099.198-.148.322-.296.496-.149.174-.313.388-.446.52-.149.149-.304.31-.131.607.173.297.771 1.272 1.654 2.057 1.135 1.01 2.091 1.323 2.388 1.472.297.148.47.124.643-.075.174-.198.743-.867.94-1.164.198-.297.396-.248.668-.149.272.099 1.729.816 2.026.965.297.149.495.223.569.347.074.124.074.721-.17 1.407z" />
                  </svg>
                  Écrire sur WhatsApp
                </a>
              )}

              <a
                href={'tel:' + (cfgC.phoneRaw || '')}
                className="btn outline"
                style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {t('trackerCall')}
              </a>
            </div>

            {/* Bottom button: Minimize or New Order */}
            {['done', 'cancelled'].includes(order.status) ? (
              <button
                className="btn ink"
                style={{ width: '100%', marginTop: 4 }}
                onClick={() => {
                  saveOrder(null)
                  setOpen(false)
                }}
              >
                {t('trackerNewOrder')}
              </button>
            ) : (
              <button
                className="tracker-btn-minimize"
                onClick={() => setOpen(false)}
              >
                {t('trackerMinimize')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
