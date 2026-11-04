import { OrderTracker } from './OrderTracker.jsx'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { pz, tom, cre, T, C, SZ, CATS } from './data.js'
import pizzaImg from './assets/pizza.webp'
import burgersImg from './assets/burgers.webp'
import tacosImg from './assets/tacos.webp'
import sandwichsImg from './assets/sandwichs.webp'
import saladesImg from './assets/salades.webp'
import { CartProvider, CartDrawer, AddBtn, MobileBar, useCart } from './cart.jsx'
import { slug, CATALOG, eur, getParisTime, DEFAULT_SCHEDULE, isInSlot } from '../shared/catalog.js'
import { RESTAURANT_CONFIG } from '../shared/restaurant.config.js'
import { LangProvider, useLang, LanguageToggle } from './i18n.jsx'
import { ItemModal } from './ItemModal.jsx'
import { CinematicManifesto } from './CinematicManifesto.jsx'

const cfgB = RESTAURANT_CONFIG.brand
const cfgC = RESTAURANT_CONFIG.contact
const cfgF = RESTAURANT_CONFIG.features
const cfgD = RESTAURANT_CONFIG.delivery
const cfgI = RESTAURANT_CONFIG.images || {}

const TEL = 'tel:' + cfgC.phoneRaw
const MAPS = cfgC.mapsUrl

// Default culinary photos bundled with the app
const CAT_IMG = { pizzas: pizzaImg, tacos: tacosImg, burgers: burgersImg, sandwichs: sandwichsImg, salades: saladesImg }

// Dynamic image resolvers for white-label clients
const getCatImg = (catId) => cfgI[catId] || CAT_IMG[catId] || pizzaImg
const getItemImg = (catId, itemSlug) => (cfgI.items && cfgI.items[itemSlug]) || getCatImg(catId)

function useStatus() {
  const [s, set] = useState({ o: null, t: 'Horaires' })
  const { cfg } = useCart()

  useEffect(() => {
    if (cfg?.forcedOpen) {
      set({ o: true, t: 'Ouvert · Service continu' })
      return
    }
    if (cfg?.manualClosed) {
      set({ o: false, t: cfg.closedReason || 'Fermé temporairement' })
      return
    }

    const { m, dateStr, dayPart } = getParisTime(new Date())
    const activeSched = cfg?.schedule?.weekly ? cfg.schedule : DEFAULT_SCHEDULE

    if (activeSched && Array.isArray(activeSched.exceptions)) {
      const exc = activeSched.exceptions.find(e => e.date === dateStr)
      if (exc) {
        if (exc.type === 'closed') {
          set({ o: false, t: cfg?.closedReason || exc.note || 'Fermé aujourd’hui' })
          return
        }
        if (exc.type === 'open') {
          const isOpen = isInSlot(m, exc.start || '11:00', exc.end || '23:00')
          const endLabel = (exc.end === '00:00' ? '00h00' : (exc.end || '23:00').replace(':', 'h'))
          const startLabel = (exc.start || '11:00').replace(':', 'h')
          set({
            o: isOpen,
            t: isOpen ? `Ouvert · jusqu’à ${endLabel}` : `Fermé · ouvre à ${startLabel}`
          })
          return
        }
      }
    }

    const dayConf = activeSched?.weekly?.[dayPart]
    if (!dayConf || dayConf.open === false) {
      set({ o: false, t: cfg?.closedReason || 'Fermé aujourd’hui' })
      return
    }

    const lStart = dayConf.lunchStart || '11:30'
    const lEnd = dayConf.lunchEnd || '14:30'
    const eStart = dayConf.eveStart || '18:30'
    const eEnd = dayConf.eveEnd || '23:00'

    const lunch = isInSlot(m, lStart, lEnd)
    const eve = isInSlot(m, eStart, eEnd)
    const extraSlots = Array.isArray(dayConf.extraSlots) ? dayConf.extraSlots : []
    const activeExtra = extraSlots.find(slot => isInSlot(m, slot.start, slot.end))
    const o = lunch || eve || Boolean(activeExtra)

    const formatHour = t => (t === '00:00' ? '00h00' : (t || '').replace(':', 'h'))
    const closingTime = lunch ? lEnd : (eve ? eEnd : (activeExtra?.end || eEnd))

    set({
      o,
      t: o ? `Ouvert · jusqu’à ${formatHour(closingTime)}` : `Fermé · ouvre à ${formatHour(lStart)}`
    })
  }, [cfg])

  return s
}

const Logo = () => {
  const [err, setErr] = useState(false)
  const showCustom = Boolean(cfgB.logoUrl && !err)

  return (
    <div className="luxury-logo-link">
      {showCustom ? (
        <img
          src={cfgB.logoUrl}
          alt={cfgB.name}
          onError={() => setErr(true)}
          style={{ height: 44, width: 44, borderRadius: '50%', objectFit: 'cover', flex: 'none', border: '1px solid var(--line)' }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--red)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            fontSize: 20,
            flex: 'none'
          }}
          aria-hidden="true"
        >
          {(cfgB.name || 'B').charAt(0)}
        </div>
      )}
      <div>
        <span className="luxury-logo-title">{cfgB.name}</span>
        <span className="luxury-logo-sub">PIZZERIA · CUCINA</span>
      </div>
    </div>
  )
}

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { count, total, setOpen: openCart } = useCart()
  const { t } = useLang()

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <header id="hd" style={{ boxShadow: scrolled ? '0 4px 20px rgba(24, 21, 19, 0.06)' : 'none' }}>
      <a href="#top" aria-label={`${cfgB.name} — accueil`}>
        <Logo />
      </a>

      <nav className="luxury-nav" aria-label="Navigation principale">
        <a href="#carte" className="luxury-nav-link">{t('navCarte')}</a>
        <a href="#savoir-faire" className="luxury-nav-link">{t('navDelivery')}</a>
        <a href="#savoir-faire" className="luxury-nav-link">{t('navHours')}</a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LanguageToggle />
        <a className="luxury-phone-btn" href={TEL} aria-label={`Appeler le ${cfgC.phone}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>{cfgC.phone}</span>
        </a>
        <button
          className={`luxury-cart-btn${count > 0 ? ' cart-has-items' : ''}`}
          onClick={() => openCart(true)}
          aria-label="Voir la commande"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>
          </svg>
          {count > 0 ? (
            <>
              <b>{count}</b>
              <span>{eur(total)}</span>
            </>
          ) : (
            <span>Panier</span>
          )}
        </button>
      </div>
    </header>
  )
}

function AtelierHero() {
  const { t } = useLang()
  const status = useStatus()

  return (
    <section className="atelier-hero" id="top" aria-label="Présentation">
      {/* Provenance top-bar */}
      <div className="atelier-hero-topbar" aria-hidden="true">
        <span>Farine Tipo 00 — Naples</span>
        <span className="topbar-dot" />
        <span>Fermentation 48h</span>
        <span className="topbar-dot" />
        <span>Tomate San Marzano DOP</span>
        <span className="topbar-dot" />
        <span>Four à bois 485°C</span>
        <span className="topbar-dot" />
        <span>{cfgC?.address?.city || 'Paris'}</span>
      </div>

      {/* Cinematic full-bleed hero */}
      <div className="atelier-hero-cinematic">
        <img
          src="/client-assets/hero.jpg"
          alt="Pizza napolitaine artisanale Bella Pizza"
          loading="eager"
          className="atelier-hero-parallax-img"
        />
        {/* Layered cinematic overlays for depth */}
        <div className="atelier-hero-scrim-top" aria-hidden="true" />
        <div className="atelier-hero-cinematic-overlay" aria-hidden="true" />
        <div className="atelier-hero-scrim-bottom" aria-hidden="true" />

        <div className="atelier-hero-cinematic-content">
          {/* Refined live status badge */}
          <motion.div
            className="atelier-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="dot-live" />
            <span>{status.t}</span>
          </motion.div>

          {/* Editorial headline */}
          <motion.h1
            className="atelier-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('heroTitle')}
            <em>{t('heroHighlight')}</em>
          </motion.h1>

          {/* Subline */}
          <motion.p
            className="atelier-hero-desc"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="atelier-hero-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.52 }}
          >
            <a className="btn burgundy" href="#carte">
              {t('orderOnline')} →
            </a>
            <a className="btn hero-outline" href={TEL}>
              {t('callToOrder')} — {cfgC.phone}
            </a>
          </motion.div>

          {/* Inline cinematic provenance ribbon inside the hero */}
          <motion.div
            className="atelier-hero-inline-ribbon"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="hero-ribbon-item">
              <strong>485°C</strong>
              <span>Four à bois</span>
            </div>
            <div className="hero-ribbon-sep" />
            <div className="hero-ribbon-item">
              <strong>48h</strong>
              <span>Fermentation</span>
            </div>
            <div className="hero-ribbon-sep" />
            <div className="hero-ribbon-item">
              <strong>DOP</strong>
              <span>San Marzano</span>
            </div>
            <div className="hero-ribbon-sep" />
            <div className="hero-ribbon-item">
              <strong>100%</strong>
              <span>Fait Main</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Editorial Dish Component — supports featured (full-width) variant
const AtelierDish = ({ n, d, p, id, img, onSelect, featured = false }) => {
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const { lang } = useLang()
  const [thumbErr, setThumbErr] = useState(false)
  if (id && isHidden && isHidden(id, cfg)) return null

  const livePrice = id && getPrice ? getPrice(id, cfg) : null
  const displayPrice = livePrice ? eur(livePrice) : p
  const out = id && isOut ? isOut(id, cfg) : false

  const baseSlug = id ? (id.split(':')[1] || '') : ''
  const liveDetails = (id && cfg?.itemDetails?.[id]) || (baseSlug && cfg?.itemDetails?.[baseSlug]) || {}
  const rawName = liveDetails.name || n
  const cleanName = (rawName.includes(' ') && rawName === rawName.toUpperCase())
    ? rawName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : rawName
  const displayDesc = liveDetails.desc !== undefined ? liveDetails.desc : d

  const liveImg = (id && cfg?.itemImages?.[id]) || (baseSlug && cfg?.itemImages?.[baseSlug]) || (id && cfg?.overrides?.[id]?.img) || img

  const isCustomizable = id?.startsWith('pizzas:') || id?.startsWith('burgers:') || id?.startsWith('tacos:') || id?.startsWith('sandwichs:')
  const actionLabel = isCustomizable
    ? (lang === 'en' ? 'Customize' : 'Personnaliser')
    : (lang === 'en' ? 'Select' : 'Choisir')

  const handleClick = () => {
    if (out) return
    if (onSelect) {
      onSelect({
        id,
        name: cleanName,
        desc: displayDesc,
        price: livePriceOrNumber(id, p, getPrice, cfg),
        img: liveImg
      })
    }
  }

  if (featured) {
    // Full-width featured dish — used as section opener
    return (
      <motion.div
        className="atelier-dish-featured"
        onClick={handleClick}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        style={{ opacity: out ? 0.6 : 1 }}
      >
        <div className="atelier-dish-featured-img">
          {liveImg && !thumbErr ? (
            <img src={liveImg} alt={cleanName} loading="lazy" onError={() => setThumbErr(true)} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--limestone)' }} />
          )}
          {out && <span className="atelier-dish-out-badge">Rupture</span>}
        </div>
        <div className="atelier-dish-featured-content">
          <div>
            <h3 className="atelier-dish-featured-name">{cleanName}</h3>
            {displayDesc && <p className="atelier-dish-featured-desc">{displayDesc}</p>}
          </div>
          <div className="atelier-dish-featured-footer">
            <span className="atelier-dish-featured-price">{displayPrice}</span>
            {!out && (
              <span className="atelier-dish-action-cue">
                <span>{actionLabel}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="atelier-dish-item"
      onClick={handleClick}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      style={{ opacity: out ? 0.6 : 1 }}
    >
      <div className="atelier-dish-thumb">
        {liveImg && !thumbErr ? (
          <img
            src={liveImg}
            alt={cleanName}
            loading="lazy"
            onError={() => setThumbErr(true)}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--limestone)' }} />
        )}
      </div>

      <div className="atelier-dish-details">
        <div className="atelier-dish-header">
          <h3 className="atelier-dish-name">{cleanName}</h3>
          {displayDesc && <p className="atelier-dish-desc">{displayDesc}</p>}
        </div>

        <div className="atelier-dish-bottom">
          <span className="atelier-dish-price">{displayPrice}</span>
          {out ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mute)' }}>Rupture</span>
          ) : (
            <span className="atelier-dish-action-cue">
              <span>{actionLabel}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function Menu() {
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const { t } = useLang()
  const customList = Object.values(cfg?.customItems || {})
  const allCats = customList.length ? [{ id: 'special', t: 'Spécialités' }, ...CATS] : CATS
  const [cat, setCat] = useState('pizzas')
  const [size, setSize] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const pizzaPrice = SZ[size][1]
  const pizzaList = [
    ...pz(tom, T).map(([n, d]) => {
      const s = slug(n)
      return { n, d, p: pizzaPrice, id: 'pizzas:' + s + ':' + slug(SZ[size][0]), cat: 'pizzas', img: getItemImg('pizzas', s) }
    }),
    ...pz(cre, C).map(([n, d]) => {
      const s = slug(n)
      return { n, d, p: pizzaPrice, id: 'pizzas:' + s + ':' + slug(SZ[size][0]), cat: 'pizzas', img: getItemImg('pizzas', s) }
    })
  ].filter(p => Boolean(p.n))

  const allItems = [
    ...pizzaList,
    ...CATS.filter(c => c.id !== 'pizzas').flatMap(c =>
      (c.items || []).map(i => {
        const s = slug(i[0])
        return {
          n: i[0],
          d: i[1] || '',
          p: i[2] || c.p,
          id: c.id + ':' + s,
          cat: c.id,
          img: getItemImg(c.id, s)
        }
      })
    ),
    ...customList.map(it => ({
      n: it.name,
      d: it.desc || it.cat,
      p: eur(it.price),
      id: it.id,
      cat: 'special',
      img: it.img || (cfg?.itemImages && cfg.itemImages[it.id]) || getItemImg('special', slug(it.name))
    }))
  ]

  const q = search.trim().toLowerCase()
  const filteredItems = q
    ? allItems.filter(it => it.n.toLowerCase().includes(q) || it.d.toLowerCase().includes(q))
    : null

  const activeCat = allCats.find(x => x.id === cat)

  const getCatLabel = (cid) => {
    if (cid === 'pizzas') return t('catPizzas')
    if (cid === 'burgers') return t('catBurgers')
    if (cid === 'boissons') return t('catBoissons')
    if (cid === 'desserts') return t('catDesserts')
    return cid
  }

  // Signature Hero Dish: The spotlight pizza
  const spotlightPizza = pizzaList[0]
  const otherPizzas = pizzaList.slice(1)

  return (
    <section className="atelier-menu-section" id="carte">
      {/* Sticky Menu Controls */}
      <div className="atelier-menu-controls">
        <div className="wrap">
          <div className="atelier-controls-inner">
            <div className="atelier-cat-nav" role="tablist">
              {allCats.map(x => (
                <button
                  key={x.id}
                  className={`atelier-cat-btn ${x.id === cat ? 'active' : ''}`}
                  onClick={() => setCat(x.id)}
                  role="tab"
                  aria-selected={x.id === cat}
                  style={{ position: 'relative' }}
                >
                  {x.id === cat && (
                    <motion.span
                      layoutId="active-cat-bg"
                      className="atelier-cat-active-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 2 }}>{getCatLabel(x.id)}</span>
                </button>
              ))}
            </div>

            <div className="atelier-search-box">
              <span className="atelier-search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        {/* Search Results */}
        {q ? (
          <div>
            <div style={{ marginBottom: 24, fontSize: 16, fontWeight: 600 }}>
              {filteredItems.length} {t('modalCustomizeTitle').toLowerCase()}
            </div>
            {filteredItems.length === 0 ? (
              <p style={{ padding: 60, textAlign: 'center', color: 'var(--mute)' }}>{t('cartEmptySub')}</p>
            ) : (
              <div className="atelier-dish-grid">
                {filteredItems.map(it => (
                  <AtelierDish
                    key={it.id}
                    n={it.n}
                    d={it.d}
                    p={it.p}
                    id={it.id}
                    img={it.img || CAT_IMG[it.cat] || pizzaImg}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}
          </div>
        ) : cat === 'pizzas' ? (
          <div>
            {/* Pizza Size Selector */}
            <div className="atelier-size-row">
              {SZ.map((s, i) => (
                <button
                  key={s[0]}
                  className={`atelier-size-pill ${i === size ? 'active' : ''}`}
                  onClick={() => setSize(i)}
                  type="button"
                  style={{ position: 'relative' }}
                >
                  {i === size && (
                    <motion.span
                      layoutId="active-size-bg"
                      className="atelier-size-active-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 2 }}>{s[0]}</span>
                  <strong style={{ position: 'relative', zIndex: 2 }}>{s[1]}</strong>
                </button>
              ))}
            </div>

            {/* Signature Spotlight Hero (Burratissima or Margherita) */}
            {spotlightPizza && (
              <div
                className="atelier-signature-spotlight"
                onClick={() => setSelectedItem({
                  id: spotlightPizza.id,
                  name: spotlightPizza.n,
                  desc: spotlightPizza.d,
                  price: livePriceOrNumber(spotlightPizza.id, spotlightPizza.p, getPrice, cfg),
                  img: spotlightPizza.img || '/client-assets/pizza.jpg'
                })}
              >
                <div className="atelier-spotlight-img">
                  <img
                    src={spotlightPizza.img || '/client-assets/pizza.jpg'}
                    alt={spotlightPizza.n}
                    loading="lazy"
                  />
                  <span className="atelier-spotlight-badge">Création Signature</span>
                </div>
                <div className="atelier-spotlight-content">
                  <span className="atelier-spotlight-eyebrow">Pièce Maîtresse de l'Atelier</span>
                  <h3 className="atelier-spotlight-title">{spotlightPizza.n}</h3>
                  <p className="atelier-spotlight-desc">{spotlightPizza.d}</p>
                  <div className="atelier-spotlight-footer" onClick={(e) => e.stopPropagation()}>
                    <span className="atelier-spotlight-price">{spotlightPizza.p}</span>
                    <button
                      className="btn red"
                      onClick={() => setSelectedItem({
                        id: spotlightPizza.id,
                        name: spotlightPizza.n,
                        desc: spotlightPizza.d,
                        price: livePriceOrNumber(spotlightPizza.id, spotlightPizza.p, getPrice, cfg),
                        img: spotlightPizza.img || '/client-assets/pizza.jpg'
                      })}
                    >
                      Personnaliser →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Pizzas in Editorial Grid — every 4th item is full-width featured */}
            <motion.div
              key={`pizzas-${size}`}
              className="atelier-dish-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {otherPizzas.map((it, idx) =>
                idx % 4 === 3 ? (
                  <div key={it.id} className="atelier-dish-grid-full">
                    <AtelierDish
                      n={it.n}
                      d={it.d}
                      p={it.p}
                      id={it.id}
                      img={it.img}
                      onSelect={setSelectedItem}
                      featured
                    />
                  </div>
                ) : (
                  <AtelierDish
                    key={it.id}
                    n={it.n}
                    d={it.d}
                    p={it.p}
                    id={it.id}
                    img={it.img}
                    onSelect={setSelectedItem}
                  />
                )
              )}
            </motion.div>
          </div>
        ) : (
          /* Burgers, Boissons, Desserts */
          <div>
            {cat === 'burgers' && (
              <div className="atelier-editorial-intro">
                <div className="atelier-editorial-intro-label">Notre sélection</div>
                <h2 className="atelier-editorial-intro-title">Smash Burgers d'Exception</h2>
                <p className="atelier-editorial-intro-desc">
                  Bœuf frais smashé à la commande sur plancha brûlante — pain brioché beurré toasté minute, sauces artisanales maison.
                </p>
                <div className="atelier-editorial-intro-rule" aria-hidden="true" />
              </div>
            )}

            <motion.div
              key={cat}
              className="atelier-dish-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {(activeCat?.items || []).map(i => {
                const s = slug(i[0])
                return (
                  <AtelierDish
                    key={i[0]}
                    n={i[0]}
                    d={i[1] || ''}
                    p={i[2] || activeCat.p}
                    id={activeCat.id + ':' + s}
                    img={getItemImg(activeCat.id, s)}
                    onSelect={setSelectedItem}
                  />
                )
              })}
            </motion.div>
          </div>
        )}
      </div>

      {/* Interactive Customization Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </section>
  )
}

function livePriceOrNumber(id, rawPriceStr, getPrice, cfg) {
  if (id && getPrice) {
    const p = getPrice(id, cfg)
    if (typeof p === 'number') return p
  }
  if (typeof rawPriceStr === 'number') return rawPriceStr
  if (typeof rawPriceStr === 'string') {
    const num = parseFloat(rawPriceStr.replace(',', '.').replace(/[^\d.]/g, ''))
    return isNaN(num) ? 0 : Math.round(num * 100)
  }
  return 0
}

function AtelierInfoSection() {
  const { t } = useLang()

  return (
    <section className="atelier-info-section" id="savoir-faire">
      <div className="wrap">
        <div className="atelier-info-header">
          <h2>{cfgB.name} · Paris 2e</h2>
          <p>L'exigence du fait maison, la rigueur de l'artisanat italien et un accueil chaleureux au quotidien.</p>
        </div>

        <div className="atelier-info-triad">
          {/* Col 1: Livraison */}
          <div className="atelier-info-col">
            <div className="atelier-col-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
            <h3 className="atelier-col-title">{t('infoDeliveryTitle')}</h3>
            <p className="atelier-col-sub">{t('infoDeliverySub')}</p>
            <div className="atelier-col-list">
              <div className="atelier-col-row">
                <span>{t('infoMinOrder')}</span>
                <strong>{eur(cfgD.minOrderCents)}</strong>
              </div>
              <div className="atelier-col-row">
                <span>{t('infoFee')}</span>
                <strong>{eur(cfgD.deliveryFeeCents)}</strong>
              </div>
              <div className="atelier-col-row highlight">
                <span>{t('infoFreeAbove')}</span>
                <strong>{eur(cfgD.freeDeliveryAboveCents)}</strong>
              </div>
            </div>
          </div>

          {/* Col 2: Adresse */}
          <div className="atelier-info-col">
            <div className="atelier-col-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="atelier-col-title">{t('infoAddressTitle')}</h3>
            <p className="atelier-col-sub">{cfgB.name} · {cfgC?.address?.city || 'Paris'}</p>
            <div className="atelier-col-list">
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(244, 239, 232, 0.85)' }}>
                <strong>{cfgC.address.street}</strong><br />
                {cfgC.address.postalCode} {cfgC.address.city}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <a className="btn red" href={TEL} style={{ padding: '8px 14px', fontSize: 13 }}>
                  {cfgC.phone}
                </a>
                <a className="btn outline" href={MAPS} target="_blank" rel="noopener" style={{ padding: '8px 14px', fontSize: 13 }}>
                  {t('infoDirections')}
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Horaires */}
          <div className="atelier-info-col">
            <div className="atelier-col-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="atelier-col-title">{t('infoHoursTitle')}</h3>
            <p className="atelier-col-sub">{t('infoHoursSub')}</p>
            <div className="atelier-col-list">
              <div className="atelier-col-row">
                <span>{t('dayMon')}</span>
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{t('statusClosed')}</span>
              </div>
              <div className="atelier-col-row">
                <span>{t('dayTueSun')}</span>
                <span style={{ textAlign: 'right', fontWeight: 600 }}>11h30–14h30<br/>18h30–23h00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AtelierFooter() {
  return (
    <footer className="atelier-footer">
      <div className="wrap">
        <div className="atelier-footer-inner">
          <div className="atelier-footer-brand">
            <h4>{cfgB.name}</h4>
            <p>{cfgB.tagline}</p>
            <p style={{ marginTop: 8, opacity: 0.8 }}>{cfgC.address.full}</p>
          </div>
          <div className="atelier-footer-contact">
            <p>Téléphone : <strong style={{ color: '#fff' }}>{cfgC.phone}</strong></p>
            <p>Horaires : Mardi au Dimanche (11h30–14h30 &amp; 18h30–23h00)</p>
          </div>
        </div>
        <div className="atelier-footer-legal">
          <span>{cfgB.footerNote}</span>
          <span>{cfgB.mentions}</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  useEffect(() => {
    if (RESTAURANT_CONFIG?.theme?.primaryColor) {
      document.documentElement.style.setProperty('--red', RESTAURANT_CONFIG.theme.primaryColor)
    }
    if (RESTAURANT_CONFIG?.theme?.primaryHover) {
      document.documentElement.style.setProperty('--red2', RESTAURANT_CONFIG.theme.primaryHover)
    }
    if (RESTAURANT_CONFIG?.brand?.name) {
      document.title = `${RESTAURANT_CONFIG.brand.name} — ${RESTAURANT_CONFIG.brand.tagline || ''}`
    }
  }, [])

  return (
    <LangProvider>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <a href="#carte" className="skip">Aller à la carte</a>
          <Header />
          <main>
            <AtelierHero />
            <CinematicManifesto />
            <Menu />
            <AtelierInfoSection />
          </main>
          <AtelierFooter />
          <MobileBar tel={TEL} />
          <CartDrawer />
          <OrderTracker />
        </MotionConfig>
      </CartProvider>
    </LangProvider>
  )
}
