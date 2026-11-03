import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { eur } from '../shared/catalog.js'
import { useCart } from './cart.jsx'
import { useLang } from './i18n.jsx'

// Artisanal House Sauces with realistic visual culinary gradients & textures
const SAUCE_DATA = [
  {
    id: 'sauce-secrete',
    name: 'Sauce Secrète Bella',
    tag: 'Signature Maison',
    tagEn: 'House Signature',
    desc: 'Tomates San Marzano réduites, pointe d\'ail doux & origan sauvage',
    descEn: 'Slow-reduced San Marzano tomatoes, sweet garlic & wild oregano',
    gradient: 'radial-gradient(circle at 35% 35%, #DC3826 0%, #A31E12 60%, #6E1007 100%)',
    specks: true
  },
  {
    id: 'mayo-truffe',
    name: 'Mayo Truffe Noire',
    tag: 'Truffes d\'Italie',
    tagEn: 'Italian Truffles',
    desc: 'Mayonnaise soyeuse émulsionnée à l\'huile de truffe noire d\'Alba',
    descEn: 'Silky mayonnaise infused with Alba black truffle oil',
    gradient: 'radial-gradient(circle at 35% 35%, #FBF3DC 0%, #E6D4A5 55%, #C2AB6C 100%)',
    truffleFlecks: true
  },
  {
    id: 'smoky-bbq',
    name: 'Smoky Barbecue Miel',
    tag: 'Notes Fumées',
    tagEn: 'Smoked Wood',
    desc: 'Réduction fumée au bois de hêtre, miel de fleur d\'oranger & mélasse',
    descEn: 'Beechwood smoked glaze, orange blossom honey & gentle molasses',
    gradient: 'radial-gradient(circle at 35% 35%, #6B2412 0%, #3D1208 65%, #200803 100%)',
    honeyGleam: true
  },
  {
    id: 'spicy-chili',
    name: 'Spicy Chili Doux',
    tag: 'Piment de Calabre',
    tagEn: 'Calabrian Chili',
    desc: 'Piments calabrais marinés à froid, poivrons rouges doux & paprika',
    descEn: 'Cold-steeped Calabrian chilis, sweet peppers & smoked paprika',
    gradient: 'radial-gradient(circle at 35% 35%, #F04124 0%, #B81F0E 60%, #750F04 100%)',
    chiliFlecks: true
  },
  {
    id: 'ciboulette',
    name: 'Ciboulette Fraîche',
    tag: 'Fraîcheur Herbacée',
    tagEn: 'Garden Chives',
    desc: 'Crème légère fouettée, zeste de citron de Sorrente & ciboulette ciselée',
    descEn: 'Whipped light cream, Sorrento lemon zest & fresh garden chives',
    gradient: 'radial-gradient(circle at 35% 35%, #FCFAF2 0%, #EFE9D7 60%, #D8CDB6 100%)',
    chiveFlecks: true
  }
]

// Visual culinary ramekin component
const SauceRamekin = ({ sauce }) => (
  <div className="sauce-ramekin" aria-hidden="true">
    <div className="sauce-ramekin-rim" />
    <div className="sauce-ramekin-fill" style={{ background: sauce.gradient }}>
      <div className="sauce-ramekin-gloss" />
      {sauce.truffleFlecks && <div className="sauce-specks sauce-specks-truffle" />}
      {sauce.specks && <div className="sauce-specks sauce-specks-herbs" />}
      {sauce.chiliFlecks && <div className="sauce-specks sauce-specks-chili" />}
      {sauce.chiveFlecks && <div className="sauce-specks sauce-specks-chives" />}
      {sauce.honeyGleam && <div className="sauce-honey-gleam" />}
    </div>
  </div>
)

// Pizza Extras
const PIZZA_EXTRAS = [
  {
    key: 'burrata',
    name: 'Burrata Crémeuse des Pouilles (125g)',
    nameEn: 'Whole Creamy Pugliese Burrata (125g)',
    desc: 'Cœur coulant de stracciatella crémeuse déposé au centre minute après cuisson.',
    descEn: 'Whole artisanal burrata with runny stracciatella heart placed fresh out of the oven.',
    price: 250,
    max: 2,
    badge: '125g AOP'
  },
  {
    key: 'truffle',
    name: 'Crème de Truffe Noire d\'Été',
    nameEn: 'Italian Black Summer Truffle Cream',
    desc: 'Truffes estivales d\'Ombrie pilées à l\'huile d\'olive extra-vierge.',
    descEn: 'Umbrian summer truffles mashed with extra virgin olive oil.',
    price: 200,
    max: 2,
    badge: 'Italie'
  },
  {
    key: 'bacon',
    name: 'Bacon Fumé au Bois de Hêtre',
    nameEn: 'Crispy Beechwood Smoked Bacon',
    desc: 'Poitrine artisanale croustillante tranchée fine et rôtie au feu de bois.',
    descEn: 'Thinly sliced artisan bacon crisped over beechwood fire.',
    price: 150,
    max: 2,
    badge: 'Fumé'
  },
  {
    key: 'parmesan',
    name: 'Roquette & Grana Padano DOP 24 Mois',
    nameEn: 'Wild Arugula & 24-Month Grana Padano',
    desc: 'Jeunes pousses fraîches et copeaux généreux de Grana Padano affiné.',
    descEn: 'Fresh peppery wild rocket with generous aged Grana Padano shavings.',
    price: 150,
    max: 2,
    badge: '24 Mois'
  }
]

// Burger Extras
const BURGER_EXTRAS = [
  {
    key: 'cheddar',
    name: 'Double Cheddar Affiné Fondu',
    nameEn: 'Double Melted Aged Cheddar',
    desc: 'Tranches épaisses de véritable cheddar maturé 9 mois, fondu à la cloche vapeur.',
    descEn: 'Thick slices of 9-month aged red cheddar melted under steam dome.',
    price: 100,
    max: 2,
    badge: '9 Mois'
  },
  {
    key: 'bacon',
    name: 'Bacon Fumé au Bois de Hêtre',
    nameEn: 'Crispy Beechwood Smoked Bacon',
    desc: 'Bacon artisanal croustillant doré à la plancha brûlante.',
    descEn: 'Crispy artisan bacon grilled on hot griddle.',
    price: 150,
    max: 2,
    badge: 'Fumé'
  },
  {
    key: 'smashSteak',
    name: 'Steak Pur Bœuf Smash Supplémentaire (120g)',
    nameEn: 'Extra Fresh Smash Beef Patty (120g)',
    desc: 'Pur bœuf frais français smashé minute, bords dentelés et croûte croustillante.',
    descEn: 'Fresh French beef smashed to order with lacy, caramelized crust.',
    price: 250,
    max: 2,
    badge: '120g Pur Bœuf'
  },
  {
    key: 'onions',
    name: 'Oignons Caramélisés au Balsamique',
    nameEn: 'Balsamic Caramelized Onions',
    desc: 'Oignons doux fondants compotés au vinaigre balsamique de Modène.',
    descEn: 'Slow-cooked sweet onions braised in Modena balsamic glaze.',
    price: 100,
    max: 2,
    badge: 'Modène'
  }
]

export const ItemModal = ({ item, onClose }) => {
  const { add } = useCart()
  const { t, lang } = useLang()

  const isPizza = item?.id?.startsWith('pizzas:')
  const isBurger = item?.id?.startsWith('burgers:')

  // Customization state
  const [crust, setCrust] = useState('classic') // 'classic' or 'cheesy' (+2.50)
  const [selectedSauces, setSelectedSauces] = useState(isBurger ? ['Sauce Secrète Bella'] : [])
  const [extras, setExtras] = useState({})
  const [specialNote, setSpecialNote] = useState('')

  if (!item) return null

  const activeExtrasConfig = isPizza ? PIZZA_EXTRAS : isBurger ? BURGER_EXTRAS : []

  const crustExtra = isPizza && crust === 'cheesy' ? 250 : 0
  const extrasTotal = activeExtrasConfig.reduce((acc, opt) => {
    const qty = extras[opt.key] || 0
    return acc + qty * opt.price
  }, 0)

  const basePrice = item.price || 0
  const totalPrice = basePrice + crustExtra + extrasTotal

  const toggleSauce = (sName) => {
    setSelectedSauces(prev => {
      if (prev.includes(sName)) {
        return prev.filter(x => x !== sName)
      }
      if (prev.length >= 2) {
        // Smooth smart swap: keep the most recent and append new choice
        return [prev[1], sName]
      }
      return [...prev, sName]
    })
  }

  const changeExtraQty = (key, delta, max) => {
    setExtras(prev => {
      const current = prev[key] || 0
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [key]: next }
    })
  }

  const handleConfirm = () => {
    const noteParts = []

    if (isPizza) {
      if (crust === 'cheesy') {
        noteParts.push(lang === 'en' ? 'Stuffed crust Ricotta (+2.50€)' : 'Croûte farcie Ricotta (+2,50€)')
      }
    }

    if (selectedSauces.length > 0) {
      noteParts.push((lang === 'en' ? 'Sauces: ' : 'Sauces : ') + selectedSauces.join(', '))
    }

    // Append extra ingredients
    activeExtrasConfig.forEach(opt => {
      const qty = extras[opt.key] || 0
      if (qty > 0) {
        const optTitle = lang === 'en' ? opt.nameEn : opt.name
        noteParts.push(`+${qty}× ${optTitle} (+${(opt.price * qty / 100).toFixed(2)}€)`)
      }
    })

    if (specialNote.trim()) {
      noteParts.push(`Note: ${specialNote.trim()}`)
    }

    const compiledNote = noteParts.join(' · ')

    // Build supp map for burger backend compatibility if needed
    const suppPayload = {}
    if (isBurger && extras.bacon) suppPayload['Bacon Fumé'] = extras.bacon
    if (isBurger && extras.smashSteak) suppPayload['Steak Boucher'] = extras.smashSteak

    add(item.id, {
      note: compiledNote,
      sauces: selectedSauces,
      supp: suppPayload
    })

    onClose()
  }

  return (
    <AnimatePresence>
      <div className="item-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <motion.div
          className="item-modal-card"
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="item-modal-drag-indicator" aria-hidden="true">
            <span className="item-modal-drag-bar" />
          </div>

          {/* Left / Hero Column: Cinematic visual + Provenance info */}
          <div className="item-modal-hero">
            {item.img && (
              <img
                src={item.img}
                alt={item.name}
                className="item-modal-img"
                loading="eager"
              />
            )}
            <div className="item-modal-overlay" />

            <button
              className="item-modal-close"
              onClick={onClose}
              aria-label={t('cartClose')}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="item-modal-title-wrap">
              <span className="item-modal-badge">
                {isPizza
                  ? (lang === 'en' ? 'Artisanal Neapolitan Pizza' : 'Pizza Napolitaine Artisanale')
                  : isBurger
                    ? (lang === 'en' ? 'Gourmet Smash Burger' : 'Smash Burger Gourmet')
                    : 'Bella Pizza'}
              </span>
              <h2 className="item-modal-title">{item.name}</h2>
              {item.desc && <p className="item-modal-desc">{item.desc}</p>}
            </div>

            {/* Desktop Provenance Pillars */}
            <div className="item-modal-desktop-notes" aria-hidden="true">
              <div className="modal-note-item">
                <span className="modal-note-dot" />
                <span>{isPizza ? 'Four napolitain à 485°C' : 'Smashed minute sur plancha'}</span>
              </div>
              <div className="modal-note-item">
                <span className="modal-note-dot" />
                <span>{isPizza ? 'Maturation lente 48 heures' : 'Pur bœuf français sélectionné'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Flow & Action Bar */}
          <div className="item-modal-right-col">
            {/* Scrollable Customization Flow */}
            <div className="item-modal-scroll-body">

            {/* SECTION 1: Pizza Crust Selection */}
            {isPizza && (
              <section className="modal-custom-section" aria-labelledby="crust-heading">
                <div className="modal-section-header">
                  <div className="modal-section-title-row">
                    <span className="modal-section-step">1</span>
                    <h3 id="crust-heading" className="modal-section-heading">
                      {t('modalChooseCrust')}
                    </h3>
                  </div>
                  <span className="modal-section-subtitle">
                    {lang === 'en' ? 'Handcrafted dough recipe' : 'Recette de pâte artisanale'}
                  </span>
                </div>

                <div className="modal-crust-grid">
                  {/* Classic Crust */}
                  <div
                    className={`modal-choice-card ${crust === 'classic' ? 'is-active' : ''}`}
                    onClick={() => setCrust('classic')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setCrust('classic')}
                  >
                    <div className="modal-choice-visual">
                      <div className="crust-badge-icon classic">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9"/>
                          <path d="M12 7v5l3 3"/>
                        </svg>
                      </div>
                    </div>
                    <div className="modal-choice-info">
                      <div className="modal-choice-header">
                        <h4 className="modal-choice-title">{t('modalCrustClassic')}</h4>
                        <span className="modal-choice-tag free">{t('free')}</span>
                      </div>
                      <p className="modal-choice-desc">{t('modalCrustClassicDesc')}</p>
                    </div>
                    <div className="modal-choice-radio">
                      <span className={`radio-dot ${crust === 'classic' ? 'checked' : ''}`} />
                    </div>
                  </div>

                  {/* Stuffed Cheesy Crust */}
                  <div
                    className={`modal-choice-card ${crust === 'cheesy' ? 'is-active' : ''}`}
                    onClick={() => setCrust('cheesy')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setCrust('cheesy')}
                  >
                    <div className="modal-choice-visual">
                      <div className="crust-badge-icon cheesy">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                          <path d="M8 12c1.5 2 6.5 2 8 0"/>
                        </svg>
                      </div>
                    </div>
                    <div className="modal-choice-info">
                      <div className="modal-choice-header">
                        <h4 className="modal-choice-title">{t('modalCrustCheesy')}</h4>
                        <span className="modal-choice-tag premium">+2,50 €</span>
                      </div>
                      <p className="modal-choice-desc">{t('modalCrustCheesyDesc')}</p>
                    </div>
                    <div className="modal-choice-radio">
                      <span className={`radio-dot ${crust === 'cheesy' ? 'checked' : ''}`} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: Visual Artisanal Sauces */}
            <section className="modal-custom-section" aria-labelledby="sauces-heading">
              <div className="modal-section-header">
                <div className="modal-section-title-row">
                  <span className="modal-section-step">{isPizza ? '2' : '1'}</span>
                  <h3 id="sauces-heading" className="modal-section-heading">
                    {t('modalSaucesTitle')}
                  </h3>
                </div>
                <div className="modal-sauce-counter-pill">
                  <span>{selectedSauces.length} / 2</span>
                  <small>
                    {selectedSauces.length === 2
                      ? (lang === 'en' ? 'Max reached' : 'Maximum atteint')
                      : (lang === 'en' ? 'complimentary' : 'offertes')}
                  </small>
                </div>
              </div>
              <p className="modal-section-guide">
                {lang === 'en'
                  ? 'Select up to 2 house emulsion sauces prepared daily in our kitchen.'
                  : 'Sélectionnez jusqu\'à 2 émulsions artisanales préparées chaque jour en cuisine.'}
              </p>

              <div className="modal-sauces-list">
                {SAUCE_DATA.map(s => {
                  const isSelected = selectedSauces.includes(s.name)
                  return (
                    <motion.div
                      key={s.id}
                      className={`modal-sauce-tile ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => toggleSauce(s.name)}
                      whileTap={{ scale: 0.98 }}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleSauce(s.name)}
                    >
                      <SauceRamekin sauce={s} />

                      <div className="modal-sauce-text">
                        <div className="modal-sauce-title-row">
                          <h4 className="modal-sauce-name">{s.name}</h4>
                          <span className="modal-sauce-tag">{lang === 'en' ? s.tagEn : s.tag}</span>
                        </div>
                        <p className="modal-sauce-desc">{lang === 'en' ? s.descEn : s.desc}</p>
                      </div>

                      <div className="modal-sauce-action">
                        <span className="modal-sauce-price-tag">
                          {isSelected ? (lang === 'en' ? 'Included' : 'Inclus') : '+'}
                        </span>
                        <div className={`modal-sauce-checkbox ${isSelected ? 'active' : ''}`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>

            {/* SECTION 3: Gourmet Supplements & Extra Ingredients */}
            {activeExtrasConfig.length > 0 && (
              <section className="modal-custom-section" aria-labelledby="extras-heading">
                <div className="modal-section-header">
                  <div className="modal-section-title-row">
                    <span className="modal-section-step">{isPizza ? '3' : '2'}</span>
                    <h3 id="extras-heading" className="modal-section-heading">
                      {t('modalExtrasTitle')}
                    </h3>
                  </div>
                  <span className="modal-section-subtitle">
                    {lang === 'en' ? 'Chef\'s selection of noble ingredients' : 'Ingrédients nobles sélectionnés'}
                  </span>
                </div>
                <p className="modal-section-guide">
                  {lang === 'en'
                    ? 'Enhance your dish with extra portions prepared fresh to order.'
                    : 'Sublimez votre recette avec des portions fraîches ajoutées à la minute.'}
                </p>

                <div className="modal-extras-grid">
                  {activeExtrasConfig.map(opt => {
                    const count = extras[opt.key] || 0
                    const isSelected = count > 0

                    return (
                      <div
                        key={opt.key}
                        className={`modal-extra-card ${isSelected ? 'is-selected' : ''}`}
                      >
                        <div className="modal-extra-info">
                          <div className="modal-extra-header">
                            <h4 className="modal-extra-name">{lang === 'en' ? opt.nameEn : opt.name}</h4>
                            <span className="modal-extra-badge">{opt.badge}</span>
                          </div>
                          <p className="modal-extra-desc">{lang === 'en' ? opt.descEn : opt.desc}</p>
                          <div className="modal-extra-price-line">
                            <span className="modal-extra-unit-price">+{eur(opt.price)}</span>
                            {isSelected && (
                              <span className="modal-extra-subtotal">
                                Total portion: +{eur(opt.price * count)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Quantity Stepper */}
                        <div className="modal-extra-stepper">
                          <button
                            type="button"
                            className={`stepper-btn minus ${count === 0 ? 'disabled' : ''}`}
                            onClick={() => changeExtraQty(opt.key, -1, opt.max)}
                            disabled={count === 0}
                            aria-label={`Diminuer portion de ${opt.name}`}
                          >
                            −
                          </button>
                          <span className={`stepper-count ${count > 0 ? 'has-qty' : ''}`}>
                            {count}
                          </span>
                          <button
                            type="button"
                            className={`stepper-btn plus ${count >= opt.max ? 'disabled' : ''}`}
                            onClick={() => changeExtraQty(opt.key, 1, opt.max)}
                            disabled={count >= opt.max}
                            aria-label={`Ajouter portion de ${opt.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* SECTION 4: Chef Instructions */}
            <section className="modal-custom-section" aria-labelledby="notes-heading">
              <div className="modal-section-header">
                <div className="modal-section-title-row">
                  <span className="modal-section-step">{isPizza ? '4' : '3'}</span>
                  <h3 id="notes-heading" className="modal-section-heading">
                    {t('modalChefNote')}
                  </h3>
                </div>
              </div>
              <div className="modal-chef-input-wrap">
                <textarea
                  className="modal-chef-textarea"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value.slice(0, 100))}
                  placeholder={t('modalChefNotePlaceholder')}
                  rows={2}
                  maxLength={100}
                />
                <span className="modal-chef-counter">{specialNote.length} / 100</span>
              </div>
            </section>

          </div>

            {/* Sticky Bottom Summary & Action Bar (NEVER overlaps content) */}
            <div className="item-modal-footer">
              <div className="modal-footer-price-col">
                <div className="modal-footer-breakdown">
                  <span className="modal-footer-base">{t('modalBasePrice')} {eur(basePrice)}</span>
                  {totalPrice > basePrice && (
                    <span className="modal-footer-extras-pill">
                      +{eur(totalPrice - basePrice)} {t('modalExtrasPrice')}
                    </span>
                  )}
                </div>
                <div className="modal-footer-total-row">
                  <span className="modal-footer-total-label">{t('modalTotalCustom')} :</span>
                  <span className="modal-footer-total-val">{eur(totalPrice)}</span>
                </div>
              </div>

              <motion.button
                type="button"
                className="modal-confirm-btn"
                onClick={handleConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t('modalAddToCart')}</span>
                <span className="btn-divider" />
                <span className="btn-price">{eur(totalPrice)}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
