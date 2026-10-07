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

const TEL='tel:+33241035787'
const MAPS='https://www.google.com/maps/search/?api=1&query=Taco+Pizza+15+rue+de+Rouen+49400+Saumur'
const NAV=[['offres','Offres'],['carte','La carte'],['livraison','Livraison'],['restaurant','Restaurant']]
const ease=[.2,.7,.2,1]

// Category images mapped by id
const CAT_IMG={pizzas:pizzaImg,tacos:tacosImg,burgers:burgersImg,sandwichs:sandwichsImg,salades:saladesImg}

function useStatus(){
  const[s,set]=useState({o:null,t:'Horaires'})
  useEffect(()=>{
    const p=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date())
    const g=k=>p.find(x=>x.type==k).value,m=(+g('hour')%24)*60+ +g('minute'),sun=g('weekday').startsWith('dim')
    const lunch=!sun&&m>=660&&m<870,eve=m>=1080&&m<1380,o=lunch||eve
    set({o,t:o?(lunch?'Ouvert · jusqu\u2019\u00e0 14h30':'Ouvert · jusqu\u2019\u00e0 23h'):(sun&&m<870?'Ferm\u00e9 · dimanche midi':m<660?'Ferm\u00e9 · ouvre \u00e0 11h':m<1080?(m<870?'Ferm\u00e9':'Ferm\u00e9 · ouvre \u00e0 18h'):'Ferm\u00e9 · ouvre demain \u00e0 11h')})
  },[])
  return s
}

const Status=({id,style,light})=>{const s=useStatus();return(
  <div className={'status '+(s.o==null?'':s.o?'o':'c')} id={id} style={style} role="status">
    <i/><span>{s.t}</span>
  </div>
)}

// SVG logo
const Logo=()=>(
  <>
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#C41E17"/>
      <path d="M24 24V2A22 22 0 0 1 43.1 13Z" fill="#1A1511"/>
      <circle cx="15" cy="20" r="3.2" fill="#fff"/>
      <circle cx="29" cy="32" r="3.2" fill="#fff"/>
      <circle cx="14" cy="32" r="2.6" fill="rgba(255,255,255,.6)"/>
      <circle cx="33" cy="22" r="2.6" fill="rgba(255,255,255,.6)"/>
    </svg>
    <b>Taco<span>Pizza</span></b>
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
      <a className="logo" href="#top" aria-label="Taco Pizza — accueil"><Logo/></a>
      <nav className="top" aria-label="Navigation">
        {NAV.map(([id,l])=><a key={id} href={'#'+id} className={act==id?'act':''}>{l}</a>)}
      </nav>
      <a className="btn red hd-call" href={TEL}>02 41 03 57 87</a>
      <CartButton/>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)}><i/><i/></button>
    </header>
    <div className={'mnav'+(open?' on':'')} onClick={e=>e.target.closest('a')&&setOpen(false)}>
      <nav aria-label="Navigation mobile">
        {NAV.map(([id,l])=><a key={id} href={'#'+id}>{l}</a>)}
      </nav>
      <div className="mn-f">
        <p>15 rue de Rouen<br/>49400 Saumur</p>
        <p className="mn-h" style={{fontStyle:'italic',marginTop:10,color:'var(--mute)'}}>Ouvert 7j/7 · 11h à 14h30 et 18h à 23h<br/>Fermé dimanche midi</p>
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
        <p className="hero-tag">🍕 Fait maison chaque jour</p>
        <h1>Le goût du<em>fait maison !</em></h1>
        <p className="hero-desc">Des produits frais, des recettes généreuses et une équipe : vous régaler.</p>
        <div className="hero-badges">
          <span className="hero-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Livraison à domicile
          </span>
          <span className="hero-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18M3 15h18M12 3v18"/></svg>
            À emporter
          </span>
        </div>
        <div className="hero-ctas">
          <OrderBtn className="btn red">Commander maintenant →</OrderBtn>
          <a className="btn outline" href={TEL}>Appeler</a>
        </div>
      </motion.div>

      <motion.div className="hero-right" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} transition={{duration:1.1,ease}}>
        <img src={pizzaImg} alt="Pizza Taco Pizza fraîche" fetchpriority="high"/>
        <div className="hero-badge-float">
          <span>Livraison gratuite</span>
          dès 25 €
        </div>
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
    {id:'tacos',label:'Tacos',img:tacosImg},
    {id:'sandwichs',label:'Sandwichs',img:sandwichsImg},
    {id:'burgers',label:'Burgers',img:burgersImg},
    {id:'salades',label:'Salades',img:saladesImg},
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
          {items.map((it,i)=>(
            <motion.div key={it.id} className="item-card"
              initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}}
              transition={{duration:.6,delay:i*.08,ease}}>
              <img src={it.img} alt={it.name}/>
              <div className="item-body">
                <h4>{it.name}</h4>
                {it.desc&&<p>{it.desc}</p>}
              </div>
              <div className="item-footer">
                <span className="item-price">{eur(it.price)}</span>
                <AddBtn id={it.id}/>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Promo banner : Menu Duo
function PromoBanner(){
  return(
    <section className="promo">
      <div className="wrap">
        <div className="promo-inner">
          <div>
            <span className="promo-label">Le bon plan !</span>
            <h2>Menu Duo<strong>À partir de 25 €</strong></h2>
            <p className="promo-desc">1 Pizza Méga + 10 Wings + 1 Maxi Coca<br/>Offre à emporter · valable en commande en ligne</p>
            <OrderBtn className="btn lime">Commander maintenant →</OrderBtn>
          </div>
          <img className="promo-img" src={pizzaImg} alt="Menu Duo Taco Pizza"/>
        </div>
      </div>
    </section>
  )
}

// Menu section (carte)
const Row=({n,d,p,id})=>(
  <div className={'row'+(p?'':' np')}>
    <h4>{n}</h4>{d&&<p>{d}</p>}
    <div className="pcol">
      <motion.span key={p} className="pr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{p}</motion.span>
      {id&&<AddBtn id={id}/>}
    </div>
  </div>
)

function Pizzas({size,setSize}){
  const price=SZ[size][1]
  const Grp=({t,l,s})=><>
    <div className="grp" dangerouslySetInnerHTML={{__html:t}}/>
    {s&&<p className="note">{s}</p>}
    <div className="list">{l.map(([n,d])=><Row key={n} n={n} d={d} p={price} id={'pizzas:'+slug(n)+':'+slug(SZ[size][0])}/>)}</div>
  </>
  return(<>
    <div className="ph"><h3>Nos pizzas</h3></div>
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
                  {customList.map(it=>{
                    const liveP=getPrice(it.id,cfg)||it.price
                    const out=isOut(it.id,cfg)
                    return(
                      <div key={it.id} className={'row'+(out?' row-out':'')}>
                        <h4 style={out?{color:'var(--mute)'}:{}}>{it.name}</h4>
                        {(it.desc||it.cat)&&<p style={out?{color:'var(--mute)'}:{}}>{it.desc||it.cat}</p>}
                        <div className="pcol">
                          <motion.span key={liveP} className="pr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{eur(liveP)}</motion.span>
                          {out?<span className="tag-out">Rupture</span>:<AddBtn id={it.id}/>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ):c?.pizza?<Pizzas size={size} setSize={setSize}/>:<Generic c={c}/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

const Delivery=()=>(
  <section className="deliv" id="livraison">
    <div className="wrap">
      <div className="dcard">
        <h2>Livraison <span>gratuite dès 25&nbsp;€</span></h2>
        <motion.div className="dgrid" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <div><h4>À domicile &amp; au bureau</h4><p>Dès 25 € de commande</p></div>
          <div><h4>Zone limitée</h4><p>Minimum 25 €</p></div>
          <div><h4>Paiement</h4><p>CB, Mastercard, Visa<br/>Chèques déjeuner, tickets restaurant</p></div>
          <div><h4>Halal</h4><p>Logo affiché sur la carte</p></div>
        </motion.div>
        <details className="more">
          <summary>Conditions de livraison</summary>
          <p>Livraison gratuite à domicile et au bureau, à partir de 25 € de commande. Zone de livraison limitée. Minimum de commande 25 €. Paiement sur place à partir de 10 € (CB, Mastercard, Visa), carte acceptée en livraison à signaler à la commande. Par mesure de sécurité, nos livreurs n'ont pas plus de 15 € sur eux, merci de faire l'appoint.</p>
        </details>
        <div className="ctas" style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:32}}>
          <OrderBtn className="btn lime"/>
          <a className="btn ghost" style={{color:'#fff',borderColor:'rgba(255,255,255,.4)'}} href={TEL}>Appeler pour commander</a>
        </div>
      </div>
    </div>
  </section>
)

const Location=()=>(
  <section className="loc" id="restaurant">
    <div className="wrap lgrid">
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
        <Status id="status"/>
        <p className="addr">15 rue<br/>de Rouen<br/><span>49400 Saumur</span></p>
        <a className="tel" href={TEL}>02 41 03 57 87</a>
        <div className="ctas" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a className="btn red" href={MAPS} target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
          <a className="btn outline" href={TEL}>Appeler</a>
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:.1}}>
        <div className="hrs">
          <div><span>Ouvert 7j/7</span><span>11h à 14h30 et 18h à 23h</span></div>
          <div className="today"><span style={{color:'var(--red)'}}>Fermé</span><span>Dimanche midi</span></div>
        </div>
        <p className="lnote">Pâte fraîche maison.</p>
      </motion.div>
    </div>
  </section>
)

export default function App(){return(
  <CartProvider>
    <MotionConfig reducedMotion="user">
      <a href="#carte" className="skip">Aller à la carte</a>
      <Header/>
      <main id="top">
        <Hero/>
        <Strip/>
        <Categories/>
        <Bestsellers/>
        <PromoBanner/>
        <Menu/>
        <Delivery/>
        <Location/>
      </main>
      <footer>
        <div className="fi">
          <div className="logo"><Logo/></div>
          <p>Taco Pizza · 15 rue de Rouen, 49400 Saumur · 02 41 03 57 87</p>
          <details className="more">
            <summary>Mentions</summary>
            <p>Tarifs sous réserve d'erreurs typographiques ou de modifications ultérieures. Promotions valables jusqu'à l'édition d'un nouveau prospectus. Offres non cumulables. RCS Anger en cours. Ne pas jeter sur la voie publique. Photos non contractuelles. www.mangerbouger.fr — pour votre santé, pratiquez une activité physique régulière.</p>
          </details>
        </div>
      </footer>
      <MobileBar tel={TEL}/>
      <CartDrawer/><OrderBanner/>
    </MotionConfig>
  </CartProvider>
)}
