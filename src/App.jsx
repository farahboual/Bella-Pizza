import {useEffect,useRef,useState} from 'react'
import {motion,AnimatePresence,MotionConfig,useScroll,useTransform,useMotionValue,useSpring,useReducedMotion} from 'framer-motion'
import {pz,tom,cre,T,C,SZ,CATS,IM} from './data.js'
import pizzaImg from './assets/pizza.webp'
import basil from './assets/basil.webp'
import pepper1 from './assets/pepper1.webp'
import pepper2 from './assets/pepper2.webp'
import {CartProvider,CartButton,CartDrawer,AddBtn,OrderBtn,MobileBar,OrderBanner} from './cart.jsx'
import {slug,CATALOG} from '../shared/catalog.js'
const TEL='tel:+33241035787',NAV=[['offres','Offres'],['carte','La carte'],['livraison','Livraison'],['restaurant','Restaurant']]
const MAPS='https://www.google.com/maps/search/?api=1&query=Taco+Pizza+15+rue+de+Rouen+49400+Saumur'
const ease=[.2,.7,.2,1]
const Tilt=({children,className})=>{const rx=useMotionValue(0),ry=useMotionValue(0),a=useSpring(rx,{stiffness:120,damping:16}),b=useSpring(ry,{stiffness:120,damping:16})
 const mv=e=>{if(e.pointerType!='mouse')return;const r=e.currentTarget.getBoundingClientRect();ry.set(((e.clientX-r.left)/r.width-.5)*9);rx.set(-((e.clientY-r.top)/r.height-.5)*7)}
 return <motion.div className={className} style={{rotateX:a,rotateY:b,transformPerspective:1100,transformStyle:'preserve-3d'}} onPointerMove={mv} onPointerLeave={()=>{rx.set(0);ry.set(0)}} initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:.9,ease}}>{children}</motion.div>}
const Flt=({src,x,y,w,d,r,blur,dur,mx,my,flip})=>{const px=useTransform(mx,[-.5,.5],[-d,d]),py=useTransform(my,[-.5,.5],[-d*.6,d*.6])
 return <motion.img className="flt" src={src} alt="" aria-hidden="true" style={{left:x,top:y,width:w,x:px,y:py,filter:blur?`blur(${blur}px)`:undefined,scaleX:flip?-1:1}} initial={{opacity:0,scale:.6,rotate:r-30}} animate={{opacity:1,scale:1,rotate:[r,r+7,r]}} transition={{opacity:{duration:1,delay:.6},scale:{duration:1.2,delay:.6,ease},rotate:{duration:dur,repeat:Infinity,ease:'easeInOut'}}}/>}
const Reveal=({children,className,delay=0})=><motion.div className={className} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:.8,ease,delay}}>{children}</motion.div>
function useStatus(){const[s,set]=useState({o:null,t:'Horaires'});useEffect(()=>{
 const p=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
 const g=k=>p.find(x=>x.type==k).value,m=(+g('hour')%24)*60+ +g('minute'),sun=g('weekday').startsWith('dim');
 const lunch=!sun&&m>=660&&m<870,eve=m>=1080&&m<1380,o=lunch||eve;
 set({o,t:o?(lunch?'Ouvert · jusqu’à 14h30':'Ouvert · jusqu’à 23h'):(sun&&m<870?'Fermé · dimanche midi':m<660?'Fermé · ouvre à 11h':m<1080?(m<870?'Fermé':'Fermé · ouvre à 18h'):'Fermé · ouvre demain à 11h')})},[]);return s}
const Status=({id,style})=>{const s=useStatus();return <div className={'status '+(s.o==null?'':s.o?'o':'c')} id={id} style={style} role="status"><i/><span>{s.t}</span></div>}
const Logo=()=><><svg><use href="#mark"/></svg><b>TACO<span><br/>PIZZA</span></b></>
function Header(){
 const[on,setOn]=useState(false),[open,setOpen]=useState(false),[act,setAct]=useState('')
 useEffect(()=>{const f=()=>setOn(scrollY>40);f();addEventListener('scroll',f,{passive:true});
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setAct(e.target.id)),{rootMargin:'-45% 0px -50% 0px'});NAV.forEach(([id])=>io.observe(document.getElementById(id)));
  const k=e=>e.key=='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>{removeEventListener('scroll',f);removeEventListener('keydown',k);io.disconnect()}},[])
 useEffect(()=>{document.body.classList.toggle('menu-open',open)},[open])
 return <>
 <header id="hd" className={on?'on':''}>
  <a className="logo" href="#top" aria-label="Taco Pizza — accueil"><Logo/></a>
  <nav className="top" aria-label="Navigation">{NAV.map(([id,l])=><a key={id} href={'#'+id} className={act==id?'act':''}>{l}</a>)}</nav>
  <a className="btn lime hd-call" href={TEL}>02 41 03 57 87</a>
  <CartButton/>
  <button className="burger" aria-label="Menu" aria-expanded={open} onClick={()=>setOpen(!open)}><i/><i/></button>
 </header>
 <div className={'mnav'+(open?' on':'')} onClick={e=>e.target.closest('a')&&setOpen(false)}>
  <nav aria-label="Navigation mobile">{NAV.map(([id,l])=><a key={id} href={'#'+id}>{l}</a>)}</nav>
  <div className="mn-f"><p>15 rue de Rouen<br/>49400 Saumur</p><p className="mn-h">Ouvert 7j/7 · 11h à 14h30 et 18h à 23h<br/>Fermé dimanche midi</p></div>
 </div></>}
function Hero(){
 const rm=useReducedMotion(),mx=useMotionValue(0),my=useMotionValue(0),sx=useSpring(mx,{stiffness:90,damping:18}),sy=useSpring(my,{stiffness:90,damping:18})
 const rY=useTransform(sx,[-.5,.5],[-7,7]),rX=useTransform(sy,[-.5,.5],[5,-5])
 const{scrollY}=useScroll(),y=useTransform(scrollY,[0,700],[0,110]),sc=useTransform(scrollY,[0,700],[1,1.06])
 const mv=e=>{if(e.pointerType=='mouse'){mx.set(e.clientX/innerWidth-.5);my.set(e.clientY/innerHeight-.5)}}
 return <div className="hero" onPointerMove={mv}>
  <motion.div className="shot" style={{y,scale:sc}}>
   {!rm&&<div className="flts"><Flt src={basil} x="0%" y="-16%" w="19%" d={46} r={-18} dur={8} mx={sx} my={sy}/><Flt src={pepper1} x="-5%" y="64%" w="8%" d={90} r={20} blur={2} dur={6} mx={sx} my={sy}/><Flt src={pepper2} x="47%" y="-11%" w="6.5%" d={30} r={-25} dur={7} mx={sx} my={sy}/><Flt src={basil} x="70%" y="88%" w="12%" d={110} r={160} blur={3} dur={9} mx={sx} my={sy} flip/></div>}
   {!rm&&<div className="gshadow"><motion.i animate={{scaleX:[1,.9,1],opacity:[.9,.55,.9]}} transition={{duration:7,repeat:Infinity,ease:'easeInOut'}}/></div>}
   <motion.div style={{perspective:1000}} initial={{opacity:0,x:140,rotate:-16,scale:.9}} animate={{opacity:1,x:0,rotate:0,scale:1}} transition={{duration:1.7,ease}}>
    <motion.div animate={{y:[0,-12,0],rotate:[-1.4,1.4,-1.4]}} transition={{duration:7,repeat:Infinity,ease:'easeInOut'}}>
     <motion.img src={pizzaImg} alt="Pizza Taco Pizza" width="870" height="585" fetchpriority="high" style={{rotateX:rX,rotateY:rY}}/>
     {!rm&&<div className="vapor" aria-hidden="true">{[0,1,2].map(i=><motion.i key={i} style={{left:i*30+'%'}} initial={{opacity:0}} animate={{y:[40,-90],opacity:[0,.6,0],scaleX:[.8,1.6]}} transition={{duration:5,repeat:Infinity,ease:'easeOut',delay:1.8+i*1.6}}/>)}</div>}
    </motion.div>
   </motion.div>
  </motion.div>
  <div className="wrap">
   <Status style={{color:'var(--ink)',marginBottom:14}}/>
   <h1 className="h">Taco<em>Pizza</em></h1>
   <p className="sub">Pizzas · Tacos · Burgers</p>
   <div className="free"><b>25 €</b>Livraison gratuite dès 25 €</div>
   <div className="ctas"><OrderBtn className="btn lime"/><a className="btn ink" href={TEL}>Appeler pour commander</a><a className="btn ghost" href="#carte">Voir la carte</a></div>
  </div></div>}
const Strip=()=><div className="mq" aria-hidden="true"><div>{[0,1].map(k=>CATS.map(c=><span key={k+c.id}>{c.t}</span>))}</div></div>
const Offers=()=><section className="offers" id="offres"><div className="wrap">
 <h2 className="h sec-h">Les offres.</h2>
 <div className="bento">
  <Tilt className="tile big"><small>Offre à emporter<br/>2 pizzas Sénior ou Méga achetées</small><h3 className="h">La 3<sup style={{fontSize:'.4em'}}>ème</sup> offerte</h3></Tilt>
  {[['Solo','15','1 Pizza Junior + 5 Wings + 1 Boisson 33cl'],['Duo','25','2 Pizzas Junior + 8 Wings + 2 Boissons 33cl'],['Family','30','1 Pizza Méga + 10 Wings + 1 Maxi Coca']].map(([n,p,d])=><Tilt key={n} className={'tile'+(n=='Family'?' fam':'')}><p className="pk">Menu {n}</p><div><p className="pv">{p} €</p><p className="pd">{d}</p></div></Tilt>)}
 </div>
</div></section>
const Row=({n,d,p,id})=><div className={'row'+(p?'':' np')}><h4>{n}</h4>{d&&<p>{d}</p>}<div className="pcol"><motion.span key={p} className="pr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{p}</motion.span>{id&&<AddBtn id={id}/>}</div></div>
function Pizzas({size,setSize}){
 const price=SZ[size][1]
 const Grp=({t,l,s})=><><div className="grp" dangerouslySetInnerHTML={{__html:t}}/>{s&&<p className="note">{s}</p>}<div className="list">{l.map(([n,d])=><Row key={n} n={n} d={d} p={price} id={'pizzas:'+slug(n)+':'+slug(SZ[size][0])}/>)}</div></>
 return <>
  <div className="ph"><h3 className="h">Nos pizzas</h3></div>
  <div className="sizes" role="radiogroup" aria-label="Taille de la pizza">{SZ.map((s,i)=><button key={s[0]} className="sz" role="radio" aria-checked={i==size} onClick={()=>setSize(i)}>{i==size&&<motion.span layoutId="szbg" className="szbg" transition={{type:'spring',stiffness:420,damping:36}}/>}<span>{s[0]}</span><strong>{s[1]}</strong></button>)}</div>
  <Grp t="Base sauce tomate &amp; fromage" l={pz(tom,T)} s="Sur toutes les pizzas : sauce tomate, fromage + ingrédients"/>
  <Grp t="Base sauce crème fraîche &amp; fromage" l={pz(cre,C)} s="Sur toutes les pizzas : crème fraîche, fromage + ingrédients"/>
  <Grp t="Base sauce barbecue" l={[['LATINA','Sauce BBQ, fromage, viande hachée, merguez']]}/>
  <Tilt className="compose"><div><h4 className="h">Composez votre pizza</h4><p>À partir de la Classica : tomate, fromage + ingrédients</p></div><div className="cp">{SZ.map((s,i)=><div key={s[0]} className={i==size?'on':''}><span>{s[0]}</span><b>{s[2]}</b></div>)}</div></Tilt></>}
const Generic=({c})=><>
 <div className="ph"><h3 className="h">{c.t}</h3>{c.h&&<p>{c.h} · <b style={{fontFamily:'var(--d)',color:'var(--red)'}}>{c.p}</b></p>}</div>
 {IM[c.id]&&<div className="ban"><img src={IM[c.id]} alt="" loading="lazy"/></div>}
 {(c.notes||[]).map(n=><p className="note" key={n}>{n}</p>)}
 <div className="list">{c.items.map(i=><Row key={i[0]} n={i[0]} d={i[1]||''} p={i[2]||c.p} id={c.id+':'+slug(i[0])}/>)}</div>
 {c.sauces&&<><div className="grp">Sauces</div><div className="sauces">{c.sauces.map(s=><span key={s}>{s}</span>)}</div></>}</>
function Menu(){
 const[cat,setCat]=useState('pizzas'),[size,setSize]=useState(1),tabs=useRef()
 const pick=id=>{setCat(id);document.getElementById('t-'+id)?.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});const y=tabs.current.getBoundingClientRect().top+scrollY-80;if(scrollY>y+2)scrollTo({top:y,behavior:'smooth'})}
 const key=e=>{const k=CATS.findIndex(c=>c.id==cat),n=e.key=='ArrowRight'?Math.min(k+1,CATS.length-1):e.key=='ArrowLeft'?Math.max(k-1,0):k;if(n!=k){pick(CATS[n].id);document.getElementById('t-'+CATS[n].id).focus()}}
 const c=CATS.find(x=>x.id==cat)
 return <section className="menu" id="carte"><div className="wrap">
  <h2 className="h sec-h">La carte.</h2>
  <div className="tabs" role="tablist" aria-label="Catégories" ref={tabs} onKeyDown={key}>{CATS.map(x=><button key={x.id} id={'t-'+x.id} className="tab" role="tab" aria-selected={x.id==cat} onClick={()=>pick(x.id)}>{x.t}{x.id==cat&&<motion.span layoutId="ind" className="ind" transition={{type:'spring',stiffness:500,damping:38}}/>}</button>)}</div>
  <AnimatePresence mode="wait"><motion.div key={cat} className="panel" role="tabpanel" aria-labelledby={'t-'+cat} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.28,ease}}>{c.pizza?<Pizzas size={size} setSize={setSize}/>:<Generic c={c}/>}</motion.div></AnimatePresence>
 </div></section>}
const Delivery=()=><section className="deliv" id="livraison"><div className="wrap"><div className="dcard">
 <h2 className="h">Livraison <span>gratuite dès 25&nbsp;€</span></h2>
 <Reveal className="dgrid"><div><h4>À domicile &amp; au bureau</h4><p>Dès 25 € de commande</p></div><div><h4>Zone limitée</h4><p>Minimum 25 €</p></div><div><h4>Paiement</h4><p>CB, Mastercard, Visa<br/>Chèques déjeuner, tickets restaurant</p></div><div><h4>Halal</h4><p>Logo affiché sur la carte</p></div></Reveal>
 <details className="more"><summary>Conditions de livraison</summary><p>Livraison gratuite à domicile et au bureau, à partir de 25 € de commande. Zone de livraison limitée. Minimum de commande 25 €. Paiement sur place à partir de 10 € (CB, Mastercard, Visa), carte acceptée en livraison à signaler à la commande. Par mesure de sécurité, nos livreurs n’ont pas plus de 15 € sur eux, merci de faire l’appoint.</p></details>
 <div className="ctas" style={{marginTop:36}}><OrderBtn className="btn ink"/><a className="btn lime" href={TEL}>Appeler pour commander</a></div>
</div></div></section>
const Location=()=><section className="loc" id="restaurant"><div className="wrap lgrid">
 <Reveal><Status id="status"/><p className="addr">15 rue<br/>de Rouen<br/><span>49400 Saumur</span></p><a className="tel" href={TEL}>02 41 03 57 87</a>
  <div className="ctas" style={{margin:0}}><a className="btn ink" href={MAPS} target="_blank" rel="noopener">Ouvrir dans Google Maps</a><a className="btn ghost" href={TEL}>Appeler</a></div></Reveal>
 <Reveal delay={.1}><div className="hrs"><div><span>Ouvert 7j/7</span><span>11h à 14h30 et 18h à 23h</span></div><div className="today"><span>Fermé</span><span>Dimanche midi</span></div></div><p className="lnote">Pâte fraîche maison.</p></Reveal>
</div></section>
export default function App(){return <CartProvider><MotionConfig reducedMotion="user">
 <svg width="0" height="0" style={{position:'absolute'}}><symbol id="mark" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#C6F432"/><path d="M24 24 L24 2 A22 22 0 0 1 43.1 13 Z" fill="#0F100C"/><circle cx="24" cy="24" r="17" fill="none" stroke="#0F100C" strokeWidth="1.6" strokeDasharray="1 4.2" strokeLinecap="round"/><g fill="#0F100C"><circle cx="15" cy="20" r="3.2"/><circle cx="29" cy="32" r="3.2"/><circle cx="14" cy="32" r="2.6"/><circle cx="33" cy="22" r="2.6"/></g></symbol></svg>
 <a href="#carte" className="skip">Aller à la carte</a><Header/>
 <main id="top"><Hero/><Strip/><Offers/><Menu/><Delivery/><Location/></main>
 <footer><div className="fi"><div className="logo"><Logo/></div><p>Taco Pizza · 15 rue de Rouen, 49400 Saumur · 02 41 03 57 87</p>
  <details className="more"><summary>Mentions</summary><p>Tarifs sous réserve d’erreurs typographiques ou de modifications ultérieures. Promotions valables jusqu’à l’édition d’un nouveau prospectus. Offres non cumulables. RCS Anger en cours. Ne pas jeter sur la voie publique. Photos non contractuelles. www.mangerbouger.fr — pour votre santé, pratiquez une activité physique régulière.</p></details></div></footer>
 <MobileBar tel={TEL}/>
 <CartDrawer/><OrderBanner/>
</MotionConfig></CartProvider>}
