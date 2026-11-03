import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { eur } from '../shared/catalog.js'
import { useCart } from './cart.jsx'
import { useLang } from './i18n.jsx'

export const ItemModal = ({ item, onClose }) => {
  const { add } = useCart()
  const { t, lang } = useLang()

  const isPizza = item?.id?.startsWith('pizzas:')
  const isBurger = item?.id?.startsWith('burgers:')

  // Customization state
  const [crust, setCrust] = useState('classic') // 'classic' or 'cheesy' (+2.50)
  const [selectedSauces, setSelectedSauces] = useState(isBurger ? ['Sauce Secrète Bella'] : [])
  const [extras, setExtras] = useState({
    burrata: false,
    truffle: false,
    bacon: false
  })

  if (!item) return null

  const availableSauces = [
    'Sauce Secrète Bella',
    'Mayo Truffe Noire',
    'Smoky Barbecue Miel',
    'Spicy Chili Doux',
    'Ciboulette Fraîche'
  ]

  const crustExtra = crust === 'cheesy' ? 250 : 0
  const burrataExtra = extras.burrata ? 250 : 0
  const truffleExtra = extras.truffle ? 200 : 0
  const baconExtra = extras.bacon ? 150 : 0

  const basePrice = item.price || 0
  const totalPrice = basePrice + crustExtra + burrataExtra + truffleExtra + baconExtra

  const toggleSauce = (s) => {
    setSelectedSauces(prev => {
      if (prev.includes(s)) return prev.filter(x => x !== s)
      if (prev.length >= 2) return [prev[1], s]
      return [...prev, s]
    })
  }

  const toggleExtra = (key) => {
    setExtras(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirm = () => {
    // Generate human-readable note for the kitchen
    const notes = []
    if (isPizza && crust === 'cheesy') notes.push(lang === 'en' ? 'Stuffed crust (+2.50€)' : 'Croûte farcie (+2.50€)')
    if (selectedSauces.length > 0) notes.push((lang === 'en' ? 'Sauces: ' : 'Sauces : ') + selectedSauces.join(', '))
    if (extras.burrata) notes.push('+ Burratina (+2.50€)')
    if (extras.truffle) notes.push('+ Truffe (+2.00€)')
    if (extras.bacon) notes.push('+ Bacon (+1.50€)')

    add(item.id)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="item-modal-backdrop" onClick={onClose}>
        <motion.div
          className="item-modal-card"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header image & close */}
          <div className="item-modal-hero">
            {item.img && <img src={item.img} alt={item.name} className="item-modal-img" />}
            <div className="item-modal-overlay" />
            <button className="item-modal-close" onClick={onClose} aria-label={t('cartClose')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="item-modal-title-wrap">
              <span className="item-modal-badge">{isPizza ? t('catPizzas') : isBurger ? t('catBurgers') : 'Bella Pizza'}</span>
              <h2 className="item-modal-title">{item.name}</h2>
              {item.desc && <p className="item-modal-desc">{item.desc}</p>}
            </div>
          </div>

          <div className="item-modal-body">
            {/* Pizza Crust Choice */}
            {isPizza && (
              <div className="modal-section">
                <label className="modal-section-label">{t('modalChooseCrust')}</label>
                <div className="modal-options-grid">
                  <button
                    type="button"
                    className={`modal-option-btn ${crust === 'classic' ? 'active' : ''}`}
                    onClick={() => setCrust('classic')}
                  >
                    <span>{t('modalCrustClassic')}</span>
                    <span className="option-check">{crust === 'classic' ? '✓' : ''}</span>
                  </button>
                  <button
                    type="button"
                    className={`modal-option-btn ${crust === 'cheesy' ? 'active' : ''}`}
                    onClick={() => setCrust('cheesy')}
                  >
                    <span>{t('modalCrustCheesy')}</span>
                    <span className="option-check">{crust === 'cheesy' ? '✓' : ''}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sauces selection (Burger or Pizza dip) */}
            {(isBurger || isPizza) && (
              <div className="modal-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <label className="modal-section-label" style={{ margin: 0 }}>{t('modalSauces')}</label>
                  <span style={{ fontSize: 11, color: 'var(--mute)' }}>{selectedSauces.length} / 2</span>
                </div>
                <div className="modal-pills-row">
                  {availableSauces.map(s => {
                    const sel = selectedSauces.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`sauce-pill-animated ${sel ? 'active' : ''}`}
                        onClick={() => toggleSauce(s)}
                      >
                        {s} {sel && '✓'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gourmet Extras */}
            <div className="modal-section">
              <label className="modal-section-label">{t('modalExtras')}</label>
              <div className="modal-options-grid">
                <button
                  type="button"
                  className={`modal-option-btn ${extras.burrata ? 'active' : ''}`}
                  onClick={() => toggleExtra('burrata')}
                >
                  <span>{t('modalExtraBurrata')}</span>
                  <span className="option-check">{extras.burrata ? '✓' : '+'}</span>
                </button>
                <button
                  type="button"
                  className={`modal-option-btn ${extras.truffle ? 'active' : ''}`}
                  onClick={() => toggleExtra('truffle')}
                >
                  <span>{t('modalExtraTruffle')}</span>
                  <span className="option-check">{extras.truffle ? '✓' : '+'}</span>
                </button>
                <button
                  type="button"
                  className={`modal-option-btn ${extras.bacon ? 'active' : ''}`}
                  onClick={() => toggleExtra('bacon')}
                >
                  <span>{t('modalExtraBacon')}</span>
                  <span className="option-check">{extras.bacon ? '✓' : '+'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer with Dynamic Total & Add Button */}
          <div className="item-modal-footer">
            <div>
              <span className="modal-footer-sub">{t('modalTotal')}</span>
              <div className="modal-footer-price">{eur(totalPrice)}</div>
            </div>
            <button className="modal-confirm-btn" onClick={handleConfirm}>
              <span>{t('modalAddToCart')}</span>
              <span>→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
