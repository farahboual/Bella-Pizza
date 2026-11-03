import { OrderTracker } from './OrderTracker.jsx'
import {useEffect,useRef,useState} from 'react'
import {motion,AnimatePresence,MotionConfig,useReducedMotion} from 'framer-motion'
import {pz,tom,cre,T,C,SZ,CATS} from './data.js'
import pizzaImg from './assets/pizza.webp'
import burgersImg from './assets/burgers.webp'
import tacosImg from './assets/tacos.webp'
import sandwichsImg from './assets/sandwichs.webp'
import saladesImg from './assets/salades.webp'
import {CartProvider,CartButton,CartDrawer,AddBtn,OrderBtn,MobileBar,OrderBanner,useCart} from './cart.jsx'
import {slug,CATALOG,eur,getParisTime,DEFAULT_SCHEDULE,isInSlot} from '../shared/catalog.js'
import {RESTAURANT_CONFIG} from '../shared/restaurant.config.js'
import {LangProvider, useLang, LanguageToggle} from './i18n.jsx'
import {ItemModal} from './ItemModal.jsx'

const cfgB = RESTAURANT_CONFIG.brand
const cfgC = RESTAURANT_CONFIG.contact
const cfgF = RESTAURANT_CONFIG.features
const cfgD = RESTAURANT_CONFIG.delivery
const cfgS = RESTAURANT_CONFIG.schedule
const cfgI = RESTAURANT_CONFIG.images || {}

const TEL = 'tel:' + cfgC.phoneRaw
const MAPS = cfgC.mapsUrl
const NAV = [
  ['carte','La carte'],
  ...(cfgF.delivery ? [['livraison','Livraison']] : []),
  ['restaurant','Restaurant']
]
const ease=[.2,.7,.2,1]

// Default culinary photos bundled with the app
const CAT_IMG={pizzas:pizzaImg,tacos:tacosImg,burgers:burgersImg,sandwichs:sandwichsImg,salades:saladesImg}

// Dynamic image resolvers for white-label clients
const getCatImg = (catId) => cfgI[catId] || CAT_IMG[catId] || pizzaImg
const getItemImg = (catId, itemSlug) => (cfgI.items && cfgI.items[itemSlug]) || getCatImg(catId)

function useStatus(){
  const[s,set]=useState({o:null,t:'Horaires'})
  const { cfg } = useCart()
  useEffect(()=>{
    if(cfg?.forcedOpen){
      set({o:true,t:'Ouvert · Service continu'})
      return
    }
    if(cfg?.manualClosed){
      set({o:false,t:cfg.closedReason||'Fermé temporairement'})
      return
    }

    const { m, dateStr, dayPart } = getParisTime(new Date())
    const activeSched = cfg?.schedule?.weekly ? cfg.schedule : DEFAULT_SCHEDULE

    // Check exceptions
    if(activeSched && Array.isArray(activeSched.exceptions)){
      const exc = activeSched.exceptions.find(e=>e.date===dateStr)
      if(exc){
        if(exc.type==='closed'){
          set({o:false,t:cfg?.closedReason||exc.note||'Fermé aujourd’hui'})
          return
        }
        if(exc.type==='open'){
          const isOpen = isInSlot(m, exc.start||'11:00', exc.end||'23:00')
          const endLabel = (exc.end === '00:00' ? '00h00' : (exc.end||'23:00').replace(':','h'))
          const startLabel = (exc.start||'11:00').replace(':','h')
          set({
            o: isOpen,
            t: isOpen ? `Ouvert · jusqu’à ${endLabel}` : `Fermé · ouvre à ${startLabel}`
          })
          return
        }
      }
    }

    const dayConf = activeSched?.weekly?.[dayPart]
    if(!dayConf || dayConf.open === false){
      set({o:false,t:cfg?.closedReason||'Fermé aujourd’hui'})
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

    const formatHour = t => (t === '00:00' ? '00h00' : (t||'').replace(':', 'h'))
    const closingTime = lunch ? lEnd : (eve ? eEnd : (activeExtra?.end || eEnd))

    set({
      o,
      t: o
        ? `Ouvert · jusqu’à ${formatHour(closingTime)}`
        : `Fermé · ouvre à ${formatHour(lStart)}`
    })
  },[cfg])
  return s
}
const Status=({id,style,light})=>{const s=useStatus();return(
  <div className={'status '+(s.o==null?'':s.o?'o':'c')} id={id} style={style} role="status">
    <i/><span>{s.t}</span>
  </div>
)}

// Logo (Authentic artisan lettermark monogram or custom client logo with auto-fallback)
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
          style={{ height: 46, width: 46, borderRadius: '50%', objectFit: 'cover', flex: 'none', border: '1.5px solid rgba(163, 83, 52, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        />
      ) : (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'var(--red, #A3785E)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: 20,
            flex: 'none'
          }}
          aria-hidden="true"
        >
          {(cfgB.name || 'T').charAt(0)}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span className="luxury-logo-title">{cfgB.name}</span>
        <span className="luxury-logo-sub">PIZZERIA · CUCINA</span>
      </div>
    </div>
  )
}
function Header(){
  const [on, setOn] = useState(false)
  const { count, total, setOpen: openCart } = useCart()
  const { t } = useLang()

  useEffect(() => {
    const f = () => setOn(scrollY > 10)
    f()
    addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])

  return (
    <header id="hd" className={on ? 'hd-glass-scrolled' : ''}>
      <a href="#top" aria-label={`${cfgB.name} — accueil`}>
        <Logo />
      </a>

      {/* Clean luxury navigation */}
      <nav className="luxury-nav" aria-label="Navigation principale">
        <a href="#carte" className="luxury-nav-link">{t('navCarte')}</a>
        <a href="#restaurant" className="luxury-nav-link">{t('navDelivery')}</a>
        <a href="#restaurant" className="luxury-nav-link">{t('navHours')}</a>
      </nav>

      {/* Right actions: Language toggle + phone + cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LanguageToggle />
        <a className="luxury-phone-btn" href={TEL} aria-label={`Appeler le ${cfgC.phone}`}>
          <span className="phone-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
          <span className="phone-number">{cfgC.phone}</span>
        </a>
        <button
          className={`luxury-cart-btn${count > 0 ? ' cart-has-items' : ''}`}
          onClick={() => openCart(true)}
          aria-label="Voir le panier"
        >
          <span className="cart-icon-svg" style={{display:'inline-flex',alignItems:'center'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></span>
          {count > 0 ? (
            <>
              <b>{count}</b>
              <span>{eur(total)}</span>
            </>
          ) : (
            <span className="cart-empty-label">Panier</span>
          )}
        </button>
      </div>
    </header>
  )
}
function CinematicHero(){
  const slides = [
    { id: 'pizza', name: 'Pizza Artisanale Napolitaine', img: '/client-assets/pizza.jpg', label: 'Pizzas' },
    { id: 'burger', name: 'Double Smash Burger Gourmet', img: '/client-assets/burgers.jpg', label: 'Burgers' },
    { id: 'salade', name: 'Salade Fraîcheur & Saumon', img: '/client-assets/salades.jpg', label: 'Salades' },
    { id: 'table', name: 'La Table Gourmande', img: '/client-assets/hero.jpg', label: 'La Table' }
  ]
  const [currentSlide, setCurrentSlide] = useState(0)

  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))
  const nextSlide = () => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))

  const active = slides[currentSlide]

  return (
    <section className="luxury-hero" id="top">
      <div className="luxury-hero-inner">
        <div className="luxury-hero-badge">
          <span className="dot-live" />
          <span>Cuisine artisanale &amp; produits frais</span>
        </div>

        <h1 className="luxury-hero-title">
          Fired to <em>Perfection</em>
        </h1>

        <p className="luxury-hero-desc">
          Pizzas cuites à la flamme, burgers d'exception &amp; recettes généreuses préparées chaque jour avec passion.
        </p>

        {/* Centerpiece Showcase Stage with arrows (Forno Nero reference) */}
        <div className="luxury-showcase-stage">
          <button className="luxury-slider-btn prev" onClick={prevSlide} aria-label="Plat précédent">
            ‹
          </button>

          <div className="luxury-photo-card">
            <img
              src={active.img}
              alt={active.name}
              key={active.id}
            />
            <div className="luxury-photo-overlay" />
            <div className="luxury-floating-pill">
              <strong>4.9 / 5</strong>
              <span>180+ avis clients vérifiés</span>
              <span style={{opacity:0.4}}>•</span>
              <span style={{color:'#D9B59F'}}>{active.name}</span>
            </div>
          </div>

          <button className="luxury-slider-btn next" onClick={nextSlide} aria-label="Plat suivant">
            ›
          </button>
        </div>

        {/* Slide Selector Pills */}
        <div className="luxury-slide-pills">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              className={`luxury-slide-tab ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Hero Actions */}
        <div className="luxury-actions-row">
          <a className="luxury-btn-primary" href="#carte">
            Commander en ligne →
          </a>
          <a className="luxury-btn-secondary" href={TEL}>
            {cfgC.phone}
          </a>
        </div>
      </div>
    </section>
  )
}


function ScrollytellingSection() {
  const containerRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const steps = [
    {
      num: '01',
      tag: 'Le Pétrissage & La Maturation',
      title: 'La Pâte & Le Temps',
      desc: 'Une farine italienne type 00 sélectionnée, de l’eau pure et du levain naturel. Une fermentation lente de 48 heures pour une digestibilité absolue et une texture alvéolée incomparable.',
      img: '/client-assets/story-1-dough.jpg'
    },
    {
      num: '02',
      tag: 'La Sélection Terroir',
      title: 'Les Ingrédients Nobles',
      desc: 'Tomates San Marzano AOP gorgées de soleil, mozzarella Fior di Latte d’Isigny onctueuse et basilic frais effeuillé minute pour libérer tous ses arômes.',
      img: '/client-assets/story-2-ingredients.jpg'
    },
    {
      num: '03',
      tag: 'La Flamme à 450°C',
      title: 'La Cuisson au Feu de Bois',
      desc: '90 secondes chrono sur pierre réfractaire incandescente. La pâte gonfle instantanément, se teinte d’alvéoles léopardées et développe ce parfum fumé signature.',
      img: '/client-assets/story-3-oven.jpg'
    },
    {
      num: '04',
      tag: 'L’Art de la Dégustation',
      title: 'Servie à la Perfection',
      desc: 'Un filet d’huile d’olive vierge extra pressée à froid, du parmesan 24 mois râpé minute et une texture croustillante et fondante prête à être savourée.',
      img: '/client-assets/story-4-plated.jpg'
    }
  ]

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return
      const scrolled = -rect.top
      const p = Math.max(0, Math.min(1, scrolled / scrollable))
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length))
      setActiveIdx(idx)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="scrolly-container" ref={containerRef} id="savoir-faire">
      <div className="scrolly-sticky-viewport">
        {/* Full-viewport Background Images (Crossfade & subtle scale) */}
        {steps.map((st, i) => (
          <div
            key={st.num}
            className={`scrolly-bg-layer ${i === activeIdx ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${st.img})`,
              opacity: i === activeIdx ? 1 : 0,
              transform: i === activeIdx ? 'scale(1.02)' : 'scale(1.08)'
            }}
          />
        ))}

        {/* Cinematic Vignette Overlay */}
        <div className="scrolly-overlay" />

        {/* Scrollytelling Content Overlay */}
        <div className="scrolly-content-wrap">
          <div className="scrolly-content-card">
            <div className="scrolly-tag-row">
              <span className="scrolly-num-pill">ÉTAPE {steps[activeIdx].num} / 04</span>
              <span className="scrolly-tag-text">{steps[activeIdx].tag}</span>
            </div>

            <h2 className="scrolly-title">{steps[activeIdx].title}</h2>
            <p className="scrolly-desc">{steps[activeIdx].desc}</p>

            {/* Step Progress indicators */}
            <div className="scrolly-progress-bars">
              {steps.map((s, idx) => (
                <div
                  key={s.num}
                  className={`scrolly-progress-dash ${idx === activeIdx ? 'active' : (idx < activeIdx ? 'completed' : '')}`}
                  onClick={() => {
                    if (!containerRef.current) return
                    const scrollable = containerRef.current.offsetHeight - window.innerHeight
                    const targetScroll = containerRef.current.offsetTop + (idx / steps.length) * scrollable
                    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
                  }}
                />
              ))}
            </div>

            {/* Scroll down prompt */}
            <div className="scrolly-scroll-cue">
              <span>{activeIdx === steps.length - 1 ? '↓ Découvrir la carte' : 'Faites défiler pour la suite ↓'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MinimalHero() {
  const { t } = useLang()
  return (
    <section className="minimal-hero" id="top">
      <div className="minimal-hero-content">
        <span className="minimal-hero-badge">
          <span className="dot-live" />
          {t('badgeHomemade')} · {t('badgeHalal')}
        </span>
        <h1 className="minimal-hero-title">
          {t('heroTitle')}{' '}
          <em>{t('heroHighlight')}</em>
        </h1>
        <p className="minimal-hero-sub">{t('heroSubtitle')}</p>
        <div className="minimal-hero-actions">
          <a className="minimal-hero-cta" href="#carte">{t('viewMenu')}</a>
          <a className="minimal-hero-tel" href={TEL}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}} aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{cfgC.phone}</a>
        </div>

        {/* Marketing Trust Proof Bar */}
        <div className="hero-trust-bar">
          <div className="trust-item">
            <span className="trust-star">4.9 / 5</span>
            <span className="trust-text">{t('badgeReviews')}</span>
          </div>
          <span className="trust-sep">•</span>
          <div className="trust-item">
            <span className="trust-subtle">72h Sourdough</span>
            <span className="trust-text">{t('badgeHomemade')}</span>
          </div>
          {cfgF.delivery && (
            <>
              <span className="trust-sep">•</span>
              <div className="trust-item">
                <span className="trust-subtle">{cfgC?.address?.city || 'Paris'}</span>
                <span className="trust-text">{t('deliveryNotice')}</span>
              </div>
            </>
          )}
          {cfgF.halalBadge && (
            <>
              <span className="trust-sep">•</span>
              <div className="trust-item">
                <span className="trust-subtle">Viandes</span>
                <span className="trust-text">{t('badgeHalal')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// FoodCard (Uber Eats / Deliveroo style clean card with customization click)
const FoodCard = ({ n, d, p, id, img, onSelect }) => {
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const { t } = useLang()
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

  // Optional marketing highlight badges
  const bList = RESTAURANT_CONFIG?.brand?.bestsellerItems || ['margherita', 'burrata', 'burger', 'tiramisu']
  const isBestSeller = bList.some(item => cleanName.toLowerCase().includes(item.toLowerCase()))
  const badgeText = isBestSeller ? t('badgeBestSeller') : null

  const liveImg = (id && cfg?.itemImages?.[id]) || (baseSlug && cfg?.itemImages?.[baseSlug]) || (id && cfg?.overrides?.[id]?.img) || img
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleCardClick = () => {
    if (out) return
    if (onSelect) {
      onSelect({ id, name: cleanName, desc: displayDesc, price: livePrice || (typeof p === 'number' ? p : 0), img: liveImg })
    }
  }

  return (
    <div
      className={'food-card-v' + (out ? ' food-card-out' : '')}
      onClick={handleCardClick}
      style={{ cursor: out ? 'default' : 'pointer' }}
    >
      {badgeText && (
        <span className="food-badge-marketing">{badgeText}</span>
      )}
      {liveImg && !thumbErr ? (
        <div className="food-card-v-img">
          <img
            src={liveImg}
            alt={cleanName}
            loading="lazy"
            onError={() => setThumbErr(true)}
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }}
          />
        </div>
      ) : (
        <div className="food-card-v-img food-card-v-img-placeholder" aria-hidden="true">
          <span style={{color:'var(--nude-accent,#A3785E)',opacity:0.4}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2v20"/><path d="M18 8a3 3 0 0 0 3-3V2h-6v3a3 3 0 0 0 3 3z"/><path d="M6 2v20"/><path d="M3 2v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2"/></svg></span>
        </div>
      )}
      <div className="food-card-v-body">
        <h4 className="food-card-v-title">{cleanName}</h4>
        {displayDesc && <p className="food-card-v-desc">{displayDesc}</p>}
        <div className="food-card-v-bottom" onClick={(e) => e.stopPropagation()}>
          <span className="food-card-v-price">{displayPrice}</span>
          {out ? (
            <span className="tag-out">Rupture</span>
          ) : (
            id && <AddBtn id={id} />
          )}
        </div>
      </div>
    </div>
  )
}

function Menu(){
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const { t } = useLang()
  const customList = Object.values(cfg?.customItems || {})
  const allCats = customList.length ? [{ id: 'special', t: 'Spécialités' }, ...CATS] : CATS
  const [cat, setCat] = useState('pizzas')
  const [size, setSize] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const bgImages = {
    pizzas: getItemImg('pizzas', 'pizza') || pizzaImg,
    burgers: getItemImg('burgers', 'burger') || burgersImg,
    salades: getItemImg('salades', 'salade') || saladesImg
  }
  const activeBgImg = bgImages[cat] || bgImages.pizzas

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

  return (
    <section className="menu luxury-menu-section" id="carte" style={{ '--menu-bg-img': `url(${activeBgImg})` }}>
      <div className="menu-bg-soft" aria-hidden="true" />
      <div className="wrap">
        {/* Search bar */}
        <div className="menu-search-wrap">
          <span className="menu-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="search"
            className="menu-search-input"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills (horizontal scroll) */}
        {!q && (
          <div className="cat-pills-bar" role="tablist">
            {allCats.map(x => (
              <button
                key={x.id}
                className={`cat-pill ${x.id === cat ? 'active' : ''}`}
                onClick={() => setCat(x.id)}
                role="tab"
                aria-selected={x.id === cat}
              >
                {getCatLabel(x.id)}
              </button>
            ))}
          </div>
        )}

        {/* Search results view */}
        {q ? (
          <div>
            <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
              {filteredItems.length} {t('modalCustomizeTitle').toLowerCase()}
            </div>
            {filteredItems.length === 0 ? (
              <p style={{ padding: 40, textAlign: 'center', color: 'var(--mute)' }}>{t('cartEmptySub')}</p>
            ) : (
              <div className="food-grid">
                {filteredItems.map(it => (
                  <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img || CAT_IMG[it.cat] || pizzaImg} onSelect={setSelectedItem} />
                ))}
              </div>
            )}
          </div>
        ) : cat === 'pizzas' ? (
          /* Pizzas category view */
          <div>
            {/* Pizza size switcher */}
            <div className="sizes" style={{ marginBottom: 20 }}>
              {SZ.map((s, i) => (
                <button key={s[0]} className="sz" role="radio" aria-checked={i === size} onClick={() => setSize(i)}>
                  {i === size && <motion.span layoutId="szbg" className="szbg" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <span>{s[0]}</span><strong>{s[1]}</strong>
                </button>
              ))}
            </div>

            <motion.div className="food-grid" key={"pizzas-"+size} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}>
              {pizzaList.map(it => (
                <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img} onSelect={setSelectedItem} />
              ))}
            </motion.div>
          </div>
        ) : (
          /* Generic category (burgers, desserts, boissons) */
          <div>
            {(activeCat?.notes || []).map(n => <p className="note" key={n} style={{ marginBottom: 12 }}>{n}</p>)}
            <motion.div className="food-grid" key={cat} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}>
              {(activeCat?.items || []).map(i => {
                const s = slug(i[0])
                return (
                  <FoodCard
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

      {/* 2026 Interactive Customization Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </section>
  )
}

function RestaurantInfo(){
  const { t } = useLang()
  return(
    <section className="storefront-info-section" id="restaurant">
      <div className="wrap">
        <div className="menu-header" style={{ marginBottom: 44 }}>
          <div className="menu-eyebrow">
            <span>{t('navDelivery')}</span>
          </div>
          <h2 className="menu-title">
            {cfgB.name}
          </h2>
          <p className="menu-subtitle">
            {t('heroSubtitle')}
          </p>
        </div>
        <div className="info-cards-grid">
          {/* Card 1: Livraison & Conditions */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></span>
              <div>
                <h3>{t('infoDeliveryTitle')}</h3>
                <p>{t('infoDeliverySub')}</p>
              </div>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span>{t('infoMinOrder')}</span>
                <strong>{eur(cfgD.minOrderCents)}</strong>
              </div>
              <div className="info-row">
                <span>{t('infoFee')}</span>
                <strong>{eur(cfgD.deliveryFeeCents)}</strong>
              </div>
              <div className="info-row highlight">
                <span>{t('infoFreeAbove')}</span>
                <strong>{eur(cfgD.freeDeliveryAboveCents)}</strong>
              </div>
              <div className="info-row">
                <span>{t('infoPayments')}</span>
                <span style={{textAlign:'right'}}>{t('infoPaymentsVal')}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Adresse & Contact */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>
              <div>
                <h3>{t('infoAddressTitle')}</h3>
                <p>{cfgB.name} · {cfgC?.address?.city || 'Paris'}</p>
              </div>
            </div>
            <div className="info-card-body">
              <p className="info-address-text">
                <strong>{cfgC.address.street}</strong><br/>
                {cfgC.address.postalCode} {cfgC.address.city}
              </p>
              <div className="info-contact-links">
                <a className="btn outline" href={TEL}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}} aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{cfgC.phone}</a>
                <a className="btn red" href={MAPS} target="_blank" rel="noopener">{t('infoDirections')}</a>
              </div>
            </div>
          </div>

          {/* Card 3: Horaires */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
              <div>
                <h3>{t('infoHoursTitle')}</h3>
                <p>{t('infoHoursSub')}</p>
              </div>
            </div>
            <div className="info-card-body">
              <div className="info-hours-list">
                <div className="info-hour-row">
                  <span>{t('dayMon')}</span>
                  <span className="closed-text">{t('statusClosed')}</span>
                </div>
                <div className="info-hour-row">
                  <span>{t('dayTueSun')}</span>
                  <span>11h30–14h30 &amp; 18h30–23h00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ModernFooter(){
  return(
    <footer className="modern-footer">
      <div className="wrap">
        <div className="modern-footer-inner">
          <div className="modern-footer-brand">
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <Logo/>
            </div>
            <p>{cfgB.name} · {cfgC.address.full}</p>
            <p style={{color:'var(--red)',fontWeight:700,marginTop:6,display:'inline-flex',alignItems:'center',gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {cfgC.phone}
            </p>
          </div>
          <div className="modern-footer-legal">
            <p style={{marginBottom:10}}>{cfgB.footerNote}</p>
            <p style={{opacity:0.7,fontSize:11}}>{cfgB.mentions}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default function App(){
  useEffect(()=>{
    if(RESTAURANT_CONFIG?.theme?.primaryColor){
      document.documentElement.style.setProperty('--red', RESTAURANT_CONFIG.theme.primaryColor)
    }
    if(RESTAURANT_CONFIG?.theme?.primaryHover){
      document.documentElement.style.setProperty('--red2', RESTAURANT_CONFIG.theme.primaryHover)
    }
    if(RESTAURANT_CONFIG?.brand?.name){
      document.title = `${RESTAURANT_CONFIG.brand.name} — ${RESTAURANT_CONFIG.brand.tagline || ''}`
    }
  },[])

  return(
    <LangProvider>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <a href="#carte" className="skip">Aller à la carte</a>
          <Header/>
          <main className="app-main-canvas">
            {/* Global fixed full-viewport culinary photo that unifies the whole website */}
            <div className="global-page-photo-bg" aria-hidden="true" />
            <div className="global-nude-vignette" aria-hidden="true" />
            <MinimalHero/>
            <Menu/>
            <RestaurantInfo/>
          </main>
          <ModernFooter/>
          <MobileBar tel={TEL}/>
          <CartDrawer/><OrderTracker/>
        </MotionConfig>
      </CartProvider>
    </LangProvider>
  )
}
