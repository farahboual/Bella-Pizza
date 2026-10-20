import {useEffect,useRef,useState} from 'react'
import {motion,AnimatePresence,MotionConfig,useReducedMotion} from 'framer-motion'
import {pz,tom,cre,T,C,SZ,CATS} from './data.js'
import pizzaImg from './assets/pizza.webp'
import burgersImg from './assets/burgers.webp'
import tacosImg from './assets/tacos.webp'
import sandwichsImg from './assets/sandwichs.webp'
import saladesImg from './assets/salades.webp'
import {CartProvider,CartButton,CartDrawer,AddBtn,OrderBtn,MobileBar,OrderBanner,useCart} from './cart.jsx'
import {slug,CATALOG,eur} from '../shared/catalog.js'
import {RESTAURANT_CONFIG} from '../shared/restaurant.config.js'

const cfgB = RESTAURANT_CONFIG.brand
const cfgC = RESTAURANT_CONFIG.contact
const cfgF = RESTAURANT_CONFIG.features
const cfgD = RESTAURANT_CONFIG.delivery
const cfgS = RESTAURANT_CONFIG.schedule

const TEL = 'tel:' + cfgC.phoneRaw
const MAPS = cfgC.mapsUrl
const NAV = [
  ['offres','Offres'],
  ['carte','La carte'],
  ...(cfgF.delivery ? [['livraison','Livraison']] : []),
  ['restaurant','Restaurant']
]
const ease=[.2,.7,.2,1]

// Category images mapped by id
const CAT_IMG={pizzas:pizzaImg,tacos:tacosImg,burgers:burgersImg,sandwichs:sandwichsImg,salades:saladesImg}

function useStatus(){
  const[s,set]=useState({o:null,t:'Horaires'})
  const { cfg } = useCart()
  useEffect(()=>{
    if(cfg){
      if(cfg.forcedOpen){
        set({o:true,t:'Ouvert · Service continu'})
        return
      }
      if(cfg.manualClosed){
        set({o:false,t:cfg.closedReason||'Fermé temporairement'})
        return
      }
    }
    const p=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date())
    const g=k=>(p.find(x=>x.type===k)||{}).value||''
    const m=(+g('hour')%24)*60+ +g('minute')
    const rawWd=g('weekday').toLowerCase().slice(0,3)
    const DAY_MAP={mon:'lun',tue:'mar',wed:'mer',thu:'jeu',fri:'ven',sat:'sam',sun:'dim',lun:'lun',mar:'mar',mer:'mer',jeu:'jeu',ven:'ven',sam:'sam',dim:'dim'}
    const dayPart=DAY_MAP[rawWd]||rawWd

    const weekly=cfg?.schedule?.weekly
    const dayConf=weekly?weekly[dayPart]:null
    if(dayConf && dayConf.open===false){
      set({o:false,t:cfg?.closedReason||'Fermé aujourd’hui'})
      return
    }

    let lStart='11:00', lEnd='14:30', eStart='18:00', eEnd='23:00'
    if(dayConf){
      lStart=dayConf.lunchStart||lStart
      lEnd=dayConf.lunchEnd||lEnd
      eStart=dayConf.eveStart||eStart
      eEnd=dayConf.eveEnd||eEnd
    } else if(dayPart==='mer'||dayPart==='dim'){
      set({o:false,t:cfg?.closedReason||'Fermé aujourd’hui'})
      return
    } else if(dayPart==='ven'){
      eEnd='23:30'
    } else if(dayPart==='sam'){
      lEnd='15:00'; eEnd='23:30'
    }

    const [lh1,lm1]=lStart.split(':').map(Number)
    const [lh2,lm2]=lEnd.split(':').map(Number)
    const [eh1,em1]=eStart.split(':').map(Number)
    const [eh2,em2]=eEnd.split(':').map(Number)

    const lunch=m>=(lh1*60+lm1)&&m<(lh2*60+lm2)
    const eve=m>=(eh1*60+em1)&&m<(eh2*60+em2)
    const o=lunch||eve
    const lEndStr=lEnd.replace(':','h')
    const eEndStr=eEnd.replace(':','h')
    set({o,t:o?(lunch?`Ouvert · jusqu’à ${lEndStr}`:`Ouvert · jusqu’à ${eEndStr}`):(m<(lh1*60+lm1)?`Fermé · ouvre à ${lStart.replace(':','h')}`:m<(eh1*60+em1)?(m<(lh2*60+lm2)?'Fermé':`Fermé · ouvre à ${eStart.replace(':','h')}`):'Fermé · ouvre demain')})
  },[cfg])
  return s
}

const Status=({id,style,light})=>{const s=useStatus();return(
  <div className={'status '+(s.o==null?'':s.o?'o':'c')} id={id} style={style} role="status">
    <i/><span>{s.t}</span>
  </div>
)}

// Logo
const Logo=()=>(
  <>
    <svg viewBox="0 0 48 48" aria-hidden="true" style={{width:38,height:38,flex:'none'}}>
      <rect width="48" height="48" rx="14" fill="var(--red)"/>
      <circle cx="24" cy="14" r="2.5" fill="#fff"/>
      <path d="M12 28C12 21.3726 17.3726 16 24 16C30.6274 16 36 21.3726 36 28H12Z" fill="#fff"/>
      <rect x="10" y="30" width="28" height="3" rx="1.5" fill="#fff"/>
      <path d="M21 35H27" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
      <b style={{fontSize:18,letterSpacing:'-0.02em'}}>{cfgB.name}</b>
      <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:'var(--red)',textTransform:'uppercase'}}>{cfgB.shortName||'RESTAURANT'}</span>
    </div>
  </>
)

function Header(){
  const[on,setOn]=useState(false),[open,setOpen]=useState(false),[act,setAct]=useState('')
  useEffect(()=>{
    const f=()=>setOn(scrollY>10);f()
    addEventListener('scroll',f,{passive:true})
    const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setAct(e.target.id)),{rootMargin:'-45% 0px -50% 0px'})
    NAV.forEach(([id])=>{const el=document.getElementById(id);if(el)io.observe(el)})
    const k=e=>e.key=='Escape'&&setOpen(false)
    addEventListener('keydown',k)
    return()=>{removeEventListener('scroll',f);removeEventListener('keydown',k);io.disconnect()}
  },[])
  useEffect(()=>{document.body.classList.toggle('menu-open',open)},[open])
  return(<>
    <header id="hd" style={on?{boxShadow:'0 4px 24px rgba(0,0,0,.12)'}:{}}>
      <a className="logo" href="#top" aria-label={`${cfgB.name} — accueil`}><Logo/></a>
      <nav className="top" aria-label="Navigation">
        {NAV.map(([id,l])=><a key={id} href={'#'+id} className={act==id?'act':''}>{l}</a>)}
      </nav>
      <a className="btn red hd-call" href={TEL}>{cfgC.phone}</a>
      <CartButton/>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)}><i/><i/></button>
    </header>
    <div className={'mnav'+(open?' on':'')} onClick={e=>e.target.closest('a')&&setOpen(false)}>
      <nav aria-label="Navigation mobile">
        {NAV.map(([id,l])=><a key={id} href={'#'+id}>{l}</a>)}
      </nav>
      <div className="mn-f">
        <p>{cfgC.address.street}<br/>{cfgC.address.postalCode} {cfgC.address.city}</p>
        <p className="mn-h" style={{fontStyle:'italic',marginTop:10,color:'var(--mute)'}}>{cfgS.displayText}</p>
      </div>
    </div>
  </>)
}

function Hero(){
  const rm=useReducedMotion()
  return(
    <div className="hero" id="top">
      <motion.div className="hero-left" initial={{opacity:0,x:-32}} animate={{opacity:1,x:0}} transition={{duration:.9,ease}}>
        <Status/>
        <p className="hero-tag">{cfgB.heroBadge}</p>
        <h1>{cfgB.heroTitle}<em>{cfgB.heroHighlight}</em></h1>
        <p className="hero-desc">{cfgB.subTagline}</p>
        <div className="hero-badges">
          {cfgF.delivery && (
            <span className="hero-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Livraison à domicile
            </span>
          )}
          {cfgF.takeaway && (
            <span className="hero-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18M3 15h18M12 3v18"/></svg>
              À emporter
            </span>
          )}
          {cfgF.dineIn && (
            <span className="hero-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Sur place
            </span>
          )}
        </div>
        <div className="hero-ctas">
          <OrderBtn className="btn red">Commander maintenant →</OrderBtn>
          <a className="btn outline" href={TEL}>Appeler</a>
        </div>
      </motion.div>

      <motion.div className="hero-right" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} transition={{duration:1.1,ease}}>
        <img src={pizzaImg} alt={cfgB.name} fetchpriority="high"/>
        {cfgB.badgeFloat && (
          <div className="hero-badge-float">
            <span>{cfgB.badgeFloat.title}</span>
            {cfgB.badgeFloat.subtitle}
          </div>
        )}
      </motion.div>
    </div>
  )
}

const Strip=()=>(
  <div className="mq" aria-hidden="true">
    <div>
      {[0,1].map(k=>CATS.map(c=><span key={k+c.id}>{c.t}</span>))}
    </div>
  </div>
)

// Category cards
function Categories(){
  const cats=[
    {id:'pizzas',label:'Pizzas',img:pizzaImg},
    {id:'burgers',label:'Burgers',img:burgersImg},
    {id:'salades',label:'Salades & Bowls',img:saladesImg},
    {id:'texmex',label:'Entrées & Tapas',img:sandwichsImg},
    {id:'desserts',label:'Desserts',img:tacosImg},
  ]
  const go=id=>{
    document.getElementById('carte')?.scrollIntoView({behavior:'smooth'})
    setTimeout(()=>{document.getElementById('t-'+id)?.click()},400)
  }
  return(
    <section className="cats" id="offres">
      <div className="wrap">
        <div className="sec-header">
          <h2 className="sec-title">Nos catégories</h2>
          <a className="sec-link" href="#carte">Voir toute la carte →</a>
        </div>
        <div className="cats-grid">
          {cats.map(c=>(
            <motion.button key={c.id} className="cat-card" onClick={()=>go(c.id)}
              initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}}
              transition={{duration:.6,ease}}>
              <img src={c.img} alt={c.label}/>
              <h3>{c.label}</h3>
              <span className="cat-add" aria-hidden="true">+</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

// Bestseller items (hardcoded popular picks from the catalog)
const PICKS=[
  {id:'pizzas:amalfi:senior',label:'Pizza Amalfi'},
  {id:'pizzas:classica:senior',label:'Taco Classique',catOverride:'tacos:kebab'},
  {id:'burgers:cheese',label:'Burger Bacon',catOverride:'burgers:db-cheese'},
  {id:'salades:nicoise',label:'Salade César',catOverride:'salades:campagnarde'},
]

function Bestsellers(){
  const {cfg,getPrice,isOut}=useCart()
  const items=CATS.flatMap(c=>
    (c.items||[]).slice(0,2).map(([n,d,p])=>{
      const id=`${c.id}:${slug(n)}`
      return CATALOG[id]?{id,name:CATALOG[id].name,price:CATALOG[id].price,desc:d,img:CAT_IMG[c.id]||pizzaImg}:null
    }).filter(Boolean)
  ).slice(0,4)

  if(!items.length)return null
  return(
    <section className="bestsellers">
      <div className="wrap">
        <div className="sec-header">
          <h2 className="sec-title">🔥 Nos incontournables</h2>
          <a className="sec-link" href="#carte">Voir toute la carte →</a>
        </div>
        <div className="items-grid">
          {items.map((it,i)=>{
            const livePrice=getPrice?getPrice(it.id,cfg):it.price
            const out=isOut?isOut(it.id,cfg):false
            return(
              <motion.div key={it.id} className={'item-card'+(out?' row-out':'')}
                initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}}
                transition={{duration:.6,delay:i*.08,ease}}>
                <img src={it.img} alt={it.name}/>
                <div className="item-body">
                  <h4>{it.name}</h4>
                  {it.desc&&<p>{it.desc}</p>}
                </div>
                <div className="item-footer">
                  <span className="item-price">{eur(livePrice||it.price)}</span>
                  <AddBtn id={it.id}/>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Promo banner : Menu Dégustation
function PromoBanner(){
  return(
    <section className="promo">
      <div className="wrap">
        <div className="promo-inner">
          <div>
            <span className="promo-label">Offre Découverte</span>
            <h2>Menu Dégustation<strong>À partir de 22 €</strong></h2>
            <p className="promo-desc">1 Plat au choix + 1 Entrée à partager + 2 Boissons fraîches<br/>Offre valable à emporter et en livraison</p>
            <OrderBtn className="btn lime">Commander maintenant →</OrderBtn>
          </div>
          <img className="promo-img" src={pizzaImg} alt="Menu Dégustation"/>
        </div>
      </div>
    </section>
  )
}

// Menu section (carte)
const Row=({n,d,p,id})=>{
  const {cfg,getPrice,isOut}=useCart()
  const livePrice=id&&getPrice?getPrice(id,cfg):null
  const displayPrice=livePrice?eur(livePrice):p
  const out=id&&isOut?isOut(id,cfg):false
  return(
    <div className={'row'+(p?'':' np')+(out?' row-out':'')}>
      <h4>{n}</h4>{d&&<p>{d}</p>}
      <div className="pcol">
        <motion.span key={displayPrice} className="pr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{displayPrice}</motion.span>
        {id&&<AddBtn id={id}/>}
      </div>
    </div>
  )
}

function Pizzas({size,setSize}){
  const price=SZ[size][1]
  const Grp=({t,l,s})=><>
    <div className="grp" dangerouslySetInnerHTML={{__html:t}}/>
    {s&&<p className="note">{s}</p>}
    <div className="list">{l.map(([n,d])=><Row key={n} n={n} d={d} p={price} id={'pizzas:'+slug(n)+':'+slug(SZ[size][0])}/>)}</div>
  </>
  return(<>
    <div className="ph"><h3>Nos pizzas</h3></div>
    {cfgF.pizzaDeals && <p className="note">🍕 Offre à emporter : 2 pizzas Sénior ou Méga achetées = la 3ème offerte (la moins chère), valable uniquement à emporter.</p>}
    <div className="sizes" role="radiogroup" aria-label="Taille de la pizza">
      {SZ.map((s,i)=>(
        <button key={s[0]} className="sz" role="radio" aria-checked={i==size} onClick={()=>setSize(i)}>
          {i==size&&<motion.span layoutId="szbg" className="szbg" transition={{type:'spring',stiffness:420,damping:36}}/>}
          <span>{s[0]}</span><strong>{s[1]}</strong>
        </button>
      ))}
    </div>
    <Grp t="Base sauce tomate &amp; fromage" l={pz(tom,T)} s="Sur toutes les pizzas : sauce tomate, fromage + ingrédients"/>
    <Grp t="Base sauce crème fraîche &amp; fromage" l={pz(cre,C)} s="Sur toutes les pizzas : crème fraîche, fromage + ingrédients"/>
    <Grp t="Base sauce barbecue" l={[['LATINA','Sauce BBQ, fromage, viande hachée, merguez']]}/>
    <motion.div className="compose" initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
      <div><h4>Composez votre pizza</h4><p>À partir de la Classica : tomate, fromage + ingrédients de votre choix</p></div>
      <div className="cp">{SZ.map((s,i)=>(
        <div key={s[0]} className={i==size?'on':''}>
          <span>{s[0]}</span><b>{s[2]}</b>
        </div>
      ))}</div>
    </motion.div>
  </>)
}

const Generic=({c})=><>
  <div className="ph">
    <h3>{c.t}</h3>
    {c.h&&<p>{c.h} · <b style={{fontFamily:'var(--d)',color:'var(--red)'}}>{c.p}</b></p>}
  </div>
  {CAT_IMG[c.id]&&<div className="ban"><img src={CAT_IMG[c.id]} alt="" loading="lazy"/></div>}
  {(c.notes||[]).map(n=><p className="note" key={n}>{n}</p>)}
  <div className="list">{c.items.map(i=><Row key={i[0]} n={i[0]} d={i[1]||''} p={i[2]||c.p} id={c.id+':'+slug(i[0])}/>)}</div>
  {c.sauces&&<><div className="grp">Sauces</div><div className="sauces">{c.sauces.map(s=><span key={s}>{s}</span>)}</div></>}
</>

function Menu(){
  const {cfg,getPrice,isOut}=useCart()
  const customList=Object.values(cfg?.customItems||{})
  const allCats=customList.length ? [{id:'special',t:'Spécialités'}, ...CATS] : CATS
  const[cat,setCat]=useState('pizzas'),[size,setSize]=useState(1),tabs=useRef()
  const pick=id=>{
    setCat(id)
    document.getElementById('t-'+id)?.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})
    const y=tabs.current.getBoundingClientRect().top+scrollY-120
    if(scrollY<y-2)scrollTo({top:y,behavior:'smooth'})
  }
  const key=e=>{
    const k=allCats.findIndex(c=>c.id==cat),n=e.key=='ArrowRight'?Math.min(k+1,allCats.length-1):e.key=='ArrowLeft'?Math.max(k-1,0):k
    if(n!=k){pick(allCats[n].id);document.getElementById('t-'+allCats[n].id).focus()}
  }
  const c=allCats.find(x=>x.id==cat)
  return(
    <section className="menu" id="carte">
      <div className="wrap">
        <div className="sec-header"><h2 className="sec-title">La carte.</h2></div>
        <div className="tabs" role="tablist" aria-label="Catégories" ref={tabs} onKeyDown={key}>
          {allCats.map(x=>(
            <button key={x.id} id={'t-'+x.id} className="tab" role="tab" aria-selected={x.id==cat} onClick={()=>pick(x.id)}>
              {x.t}{x.id==cat&&<motion.span layoutId="ind" className="ind" transition={{type:'spring',stiffness:500,damping:38}}/>}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cat} className="panel" role="tabpanel" aria-labelledby={'t-'+cat}
            initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            transition={{duration:.25,ease}}>
            {cat==='special'?(
              <>
                <div className="ph">
                  <h3>Spécialités &amp; Nouveautés</h3>
                  <p>Créations spéciales du chef</p>
                </div>
                <div className="list">
                  {customList.map(it=>(
                    <Row key={it.id} n={it.name} d={it.desc||it.cat} p={eur(it.price)} id={it.id}/>
                  ))}
                </div>
              </>
            ):c?.pizza?<Pizzas size={size} setSize={setSize}/>:<Generic c={c}/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

const Delivery=()=>{
  if(!cfgF.delivery) return null
  return(
    <section className="deliv" id="livraison">
      <div className="wrap">
        <div className="dcard">
          <h2>Livraison <span>{cfgB.badgeFloat ? `${cfgB.badgeFloat.title} ${cfgB.badgeFloat.subtitle}` : 'à domicile'}</span></h2>
          <motion.div className="dgrid" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <div><h4>À domicile &amp; au bureau</h4><p>Dès {eur(cfgD.minOrderCents)} de commande</p></div>
            <div><h4>Zone limitée</h4><p>Minimum {eur(cfgD.minOrderCents)}</p></div>
            <div><h4>Paiement</h4><p>CB, Mastercard, Visa<br/>Chèques déjeuner, tickets restaurant</p></div>
            {cfgF.halalBadge && <div><h4>Halal</h4><p>Viandes certifiées</p></div>}
          </motion.div>
          <details className="more">
            <summary>Conditions de livraison</summary>
            <p>{cfgD.conditionText}</p>
          </details>
          <div className="ctas" style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:32}}>
            <OrderBtn className="btn lime"/>
            <a className="btn ghost" style={{color:'#fff',borderColor:'rgba(255,255,255,.4)'}} href={TEL}>Appeler pour commander</a>
          </div>
        </div>
      </div>
    </section>
  )
}

const Location=()=>(
  <section className="loc" id="restaurant">
    <div className="wrap lgrid">
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
        <Status id="status"/>
        <p className="addr">{cfgC.address.street}<br/><span>{cfgC.address.postalCode} {cfgC.address.city}</span></p>
        <a className="tel" href={TEL}>{cfgC.phone}</a>
        <div className="ctas" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a className="btn red" href={MAPS} target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
          <a className="btn outline" href={TEL}>Appeler</a>
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}}>
        <div className="hrs">
          <div><span>Horaires</span><span>{cfgS.displayText}</span></div>
          <div className="today"><span style={{color:'var(--lime)'}}>Service</span><span>Sur place &amp; À emporter</span></div>
        </div>
        <p className="lnote">{cfgB.footerNote}</p>
      </motion.div>
    </div>
  </section>
)

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
          <Hero/>
          <Strip/>
          <Categories/>
          {cfgF.bestsellers && <Bestsellers/>}
          {cfgF.promoBanner && <PromoBanner/>}
          <Menu/>
          <Delivery/>
          <Location/>
        </main>
        <footer>
          <div className="fi">
            <div className="logo"><Logo/></div>
            <p>{cfgB.name} · {cfgC.address.full} · {cfgC.phone}</p>
            <details className="more">
              <summary>Mentions</summary>
              <p>{cfgB.mentions}</p>
            </details>
          </div>
        </footer>
        <MobileBar tel={TEL}/>
        <CartDrawer/><OrderBanner/>
      </MotionConfig>
    </CartProvider>
  )
}
