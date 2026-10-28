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
          style={{ height: 42, width: 'auto', borderRadius: 8, objectFit: 'contain', flex: 'none' }}
        />
      ) : (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
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
          {(cfgB.name || 'A').charAt(0)}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span className="luxury-logo-title">{cfgB.name}</span>
        <span className="luxury-logo-sub">{cfgB.shortName || 'RESTAURANT'}</span>
      </div>
    </div>
  )
}
function Header(){
  const [on, setOn] = useState(false)
  const { count, total, setOpen: openCart } = useCart()

  useEffect(() => {
    const f = () => setOn(scrollY > 10)
    f()
    addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])

  return (
    <header id="hd">
      <a href="#top" aria-label={`${cfgB.name} — accueil`}>
        <Logo />
      </a>

      {/* Clean luxury navigation */}
      <nav className="luxury-nav" aria-label="Navigation principale">
        <a href="#carte" className="luxury-nav-link">La Carte</a>
        <a href="#restaurant" className="luxury-nav-link">Livraison &amp; Accès</a>
        <a href="#restaurant" className="luxury-nav-link">Horaires</a>
      </nav>

      {/* Right actions: phone + luxury cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a className="luxury-phone-btn" href={TEL}>
          📞 {cfgC.phone}
        </a>
        <button
          className="luxury-cart-btn"
          onClick={() => openCart(true)}
          aria-label="Voir le panier"
        >
          <span>🛒</span>
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
function CinematicHero(){
  const slides = [
    { id: 'pizza', name: 'Pizza Artisanale Napolitaine', img: '/client-assets/pizza.jpg', label: '🍕 Pizzas' },
    { id: 'burger', name: 'Double Smash Burger Gourmet', img: '/client-assets/burgers.jpg', label: '🍔 Burgers' },
    { id: 'salade', name: 'Salade Fraîcheur & Saumon', img: '/client-assets/salades.jpg', label: '🥗 Salades' },
    { id: 'table', name: 'La Table Gourmande', img: '/client-assets/hero.jpg', label: '✨ La Table' }
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
              <strong>★ 4.9</strong>
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
            📞 {cfgC.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

// FoodCard (Uber Eats / Deliveroo style clean card)
const FoodCard = ({ n, d, p, id, img }) => {
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const [thumbErr, setThumbErr] = useState(false)
  if (id && isHidden && isHidden(id, cfg)) return null
  const livePrice = id && getPrice ? getPrice(id, cfg) : null
  const displayPrice = livePrice ? eur(livePrice) : p
  const out = id && isOut ? isOut(id, cfg) : false

  const cleanName = (n.includes(' ') && n === n.toUpperCase())
    ? n.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : n

  return (
    <div className={'food-card' + (out ? ' food-card-out' : '')}>
      <div className="food-card-body">
        <div>
          <h4 className="food-card-title">{cleanName}</h4>
          {d && <p className="food-card-desc">{d}</p>}
        </div>
        <div className="food-card-bottom">
          <span className="food-card-price">{displayPrice}</span>
          {out ? (
            <span className="tag-out">Rupture</span>
          ) : (
            id && <AddBtn id={id} />
          )}
        </div>
      </div>
      {img && !thumbErr && (
        <div className="food-card-thumb">
          <img src={img} alt={cleanName} loading="lazy" onError={() => setThumbErr(true)} />
        </div>
      )}
    </div>
  )
}

function Menu(){
  const { cfg, getPrice, isOut, isHidden } = useCart()
  const customList = Object.values(cfg?.customItems || {})
  const allCats = customList.length ? [{ id: 'special', t: 'Spécialités' }, ...CATS] : CATS
  const [cat, setCat] = useState('pizzas')
  const [size, setSize] = useState(1)
  const [search, setSearch] = useState('')

  const pizzaPrice = SZ[size][1]
  const pizzaList = [
    ...pz(tom, T).map(([n, d]) => {
      const s = slug(n)
      return { n, d, p: pizzaPrice, id: 'pizzas:' + s + ':' + slug(SZ[size][0]), cat: 'pizzas', img: getItemImg('pizzas', s) }
    }),
    ...pz(cre, C).map(([n, d]) => {
      const s = slug(n)
      return { n, d, p: pizzaPrice, id: 'pizzas:' + s + ':' + slug(SZ[size][0]), cat: 'pizzas', img: getItemImg('pizzas', s) }
    }),
    { n: 'Latina', d: 'Sauce BBQ, fromage, viande hachée, merguez', p: pizzaPrice, id: 'pizzas:latina:' + slug(SZ[size][0]), cat: 'pizzas', img: getItemImg('pizzas', 'latina') }
  ]

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
      img: it.img || getItemImg('special', slug(it.name))
    }))
  ]

  const q = search.trim().toLowerCase()
  const filteredItems = q
    ? allItems.filter(it => it.n.toLowerCase().includes(q) || it.d.toLowerCase().includes(q))
    : null

  const activeCat = allCats.find(x => x.id === cat)

  return (
    <section className="menu" id="carte" style={{ paddingTop: 36 }}>
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
            placeholder="Rechercher une pizza, un burger, un ingrédient..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Promo banner strip */}
        {cfgF.pizzaDeals && !q && (
          <div className="offer-strip-clean">
            <span className="badge">Offre</span>
            <span>🍕 2 pizzas achetées = la 3ème offerte à emporter</span>
          </div>
        )}

        {/* Category Pills (horizontal scroll) */}
        {!q && (
          <div className="cat-pills-bar" role="tablist">
            {allCats.map(x => {
              const icon = x.id === 'pizzas' ? '🍕 ' : x.id === 'burgers' ? '🍔 ' : x.id === 'salades' ? '🥗 ' : x.id === 'texmex' ? '🍗 ' : x.id === 'desserts' ? '🍰 ' : x.id === 'boissons' ? '🥤 ' : '✨ '
              return (
                <button
                  key={x.id}
                  className={`cat-pill ${x.id === cat ? 'active' : ''}`}
                  onClick={() => setCat(x.id)}
                  role="tab"
                  aria-selected={x.id === cat}
                >
                  {icon}{x.t}
                </button>
              )
            })}
          </div>
        )}

        {/* Search results view */}
        {q ? (
          <div>
            <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
              Résultats pour « {search} » ({filteredItems.length})
            </div>
            {filteredItems.length === 0 ? (
              <p style={{ padding: 40, textAlign: 'center', color: 'var(--mute)' }}>Aucun plat ne correspond à votre recherche.</p>
            ) : (
              <div className="food-grid">
                {filteredItems.map(it => (
                  <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img || CAT_IMG[it.cat] || pizzaImg} />
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

            <div className="food-grid">
              {pizzaList.map(it => (
                <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img} />
              ))}
            </div>
          </div>
        ) : cat === 'special' ? (
          /* Custom chef items */
          <div className="food-grid">
            {customList.map(it => (
              <FoodCard key={it.id} n={it.name} d={it.desc || it.cat} p={eur(it.price)} id={it.id} img={it.img || getItemImg('special', slug(it.name))} />
            ))}
          </div>
        ) : (
          /* Generic category (burgers, salades, texmex, desserts, boissons) */
          <div>
            {(activeCat?.notes || []).map(n => <p className="note" key={n} style={{ marginBottom: 12 }}>{n}</p>)}
            <div className="food-grid">
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
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function RestaurantInfo(){
  return(
    <section className="storefront-info-section" id="restaurant">
      <div className="wrap">
        <div className="info-cards-grid">
          {/* Card 1: Livraison & Conditions */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🚲</span>
              <div>
                <h3>Livraison</h3>
                <p>À domicile ou au bureau</p>
              </div>
            </div>
            <div className="info-card-body">
              <div className="info-row">
                <span>Minimum de commande</span>
                <strong>{eur(cfgD.minOrderCents)}</strong>
              </div>
              <div className="info-row">
                <span>Frais de livraison</span>
                <strong>{eur(cfgD.deliveryFeeCents)}</strong>
              </div>
              <div className="info-row highlight">
                <span>Livraison offerte</span>
                <strong>dès {eur(cfgD.freeDeliveryAboveCents)}</strong>
              </div>
              <div className="info-row">
                <span>Moyens de paiement</span>
                <span style={{textAlign:'right'}}>CB, Visa, Mastercard, Tickets resto</span>
              </div>
            </div>
          </div>

          {/* Card 2: Adresse & Contact */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">📍</span>
              <div>
                <h3>Adresse &amp; Contact</h3>
                <p>{cfgB.name} · Paris</p>
              </div>
            </div>
            <div className="info-card-body">
              <p className="info-address-text">
                <strong>{cfgC.address.street}</strong><br/>
                {cfgC.address.postalCode} {cfgC.address.city}
              </p>
              <div className="info-contact-links">
                <a className="btn outline" href={TEL}>📞 {cfgC.phone}</a>
                <a className="btn red" href={MAPS} target="_blank" rel="noopener">🗺️ Google Maps</a>
              </div>
            </div>
          </div>

          {/* Card 3: Horaires */}
          <div className="info-card">
            <div className="info-card-header">
              <span className="info-card-icon">🕒</span>
              <div>
                <h3>Horaires d’ouverture</h3>
                <p>Service du midi &amp; du soir</p>
              </div>
            </div>
            <div className="info-card-body">
              <div className="info-hours-list">
                <div className="info-hour-row">
                  <span>Lundi</span>
                  <span className="closed-text">Fermé</span>
                </div>
                <div className="info-hour-row">
                  <span>Mardi – Jeudi</span>
                  <span>11h30–14h30 &amp; 18h30–23h00</span>
                </div>
                <div className="info-hour-row">
                  <span>Vendredi – Samedi</span>
                  <span>11h30–15h00 &amp; 18h30–23h30</span>
                </div>
                <div className="info-hour-row">
                  <span>Dimanche</span>
                  <span>11h30–15h00 &amp; 18h30–00h00</span>
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
            <p style={{color:'var(--red)',fontWeight:700,marginTop:6}}>📞 {cfgC.phone}</p>
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
    <CartProvider>
      <MotionConfig reducedMotion="user">
        <a href="#carte" className="skip">Aller à la carte</a>
        <Header/>
        <main id="top">
          <CinematicHero/>
          <Menu/>
          <RestaurantInfo/>
        </main>
        <ModernFooter/>
        <MobileBar tel={TEL}/>
        <CartDrawer/><OrderTracker/>
      </MotionConfig>
    </CartProvider>
  )
}
