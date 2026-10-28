import {createContext,useContext,useEffect,useState} from 'react'
import {CATALOG,RULES,eur,SAUCES,SUPP_CENTS,SUPP_MAX,MEATS,cleanSupp,hasOpts,optExtra,pizzaOffer,canetteDeal,hasFood,CANETTE_ID,getParisTime,DEFAULT_SCHEDULE} from '../shared/catalog.js'
import {RESTAURANT_CONFIG} from '../shared/restaurant.config.js'
const Ctx=createContext(null)
export const useCart=()=>useContext(Ctx)
const KEY='tp-cart'

const getPrice=(id,cfg)=>{
 const ov=cfg?.overrides?.[id]
 return (ov&&typeof ov.price==='number'&&ov.price>0)?ov.price:(CATALOG[id]?.price||cfg?.customItems?.[id]?.price||0)
}

const isOut=(id,cfg)=>!!cfg?.overrides?.[id]?.outOfStock
const isHidden=(id,cfg)=>!!cfg?.overrides?.[id]?.hidden


function buildClosedMsg(cfg){
 const reason=cfg?.closedReason
 if(reason)return reason
 try{
  const { dateStr, dayPart } = getParisTime(new Date())
  const activeSched = cfg?.schedule?.weekly ? cfg.schedule : DEFAULT_SCHEDULE
  if(activeSched && Array.isArray(activeSched.exceptions)){
   const exc = activeSched.exceptions.find(e=>e.date===dateStr)
   if(exc){
    if(exc.type==='closed') return exc.note || 'Fermé exceptionnellement aujourd’hui.'
    if(exc.type==='open' && exc.start && exc.end){
     return `Fermé · Ouverture exceptionnelle ${exc.start.replace(':','h')}–${exc.end.replace(':','h')}`
    }
   }
  }
  const d=activeSched?.weekly?.[dayPart]
  if(!d||d.open===false)return 'Fermé aujourd’hui.'
  const fmt=t=>t?.replace(':','h')||''
  const parts=[]
  if(d.lunchStart&&d.lunchEnd)parts.push(fmt(d.lunchStart)+'–'+fmt(d.lunchEnd))
  if(d.eveStart&&d.eveEnd)parts.push(fmt(d.eveStart)+'–'+fmt(d.eveEnd))
  return parts.length?'Fermé · Ouverture '+parts.join(' et '):'Fermé pour le moment.'
 }catch{return 'Fermé pour le moment.'}
}
export function CartProvider({children}){
 const[lines,setLines]=useState(()=>{
  try{
   return(JSON.parse(localStorage.getItem(KEY))||[])
    .filter(l=>CATALOG[l.id]||l.id.startsWith('custom:'))
    .map(l=>({
     ...l,
     u:l.u||l.id,
     sauces:Array.isArray(l.sauces)
      ? l.sauces
      : l.sauce
       ? [l.sauce]
       : [],
     supp:(l.supp&&typeof l.supp==='object')?l.supp:{}
    }))
  }catch{return[]}
 })
 const[open,setOpen]=useState(false),[cfg,setCfg]=useState(null)

 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(lines))}catch{}},[lines])

 useEffect(()=>{
  const refresh=()=>fetch('/api/config')
   .then(r=>r.ok?r.json():null)
   .then(data=>{
    if(!data)return
    setCfg(data)
    if(data?.customItems){
     setLines(l=>l.filter(a=>CATALOG[a.id]||(a.id.startsWith('custom:')&&!!data.customItems[a.id])))
    }
   })
   .catch(()=>{})
  refresh()
  const id=setInterval(refresh,60000)
  // Also refresh immediately when tab regains focus
  const onVis=()=>{if(document.visibilityState==='visible')refresh()}
  document.addEventListener('visibilitychange',onVis)
  return()=>{clearInterval(id);document.removeEventListener('visibilitychange',onVis)}
 },[])

 useEffect(()=>{
  document.body.style.overflow=open?'hidden':''
  const k=e=>e.key=='Escape'&&setOpen(false)
  addEventListener('keydown',k)
  return()=>removeEventListener('keydown',k)
 },[open])

 const add=id=>{
  if(isOut(id,cfg)||isHidden(id,cfg))return

  if(hasOpts(id)){
   const u=id+'#'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)

   setLines(l=>[
    ...l,
    {
     u,
     id,
     qty:1,
     note:'',
     sauces:[],
     supp:{}
    }
   ])

   return
  }

  setLines(l=>
   l.some(a=>a.u==id)
    ? l.map(a=>a.u==id?{...a,qty:Math.min(a.qty+1,30)}:a)
    : [
      ...l,
      {
       u:id,
       id,
       qty:1,
       note:'',
       sauces:[],
       supp:{}
      }
     ]
  )
 }

 const setQty=(u,q)=>setLines(l=>q<1?l.filter(a=>a.u!=u):l.map(a=>a.u==u?{...a,qty:Math.min(q,30)}:a))
 const setNote=(u,note)=>setLines(l=>l.map(a=>a.u==u?{...a,note}:a))
 const setOpt=(u,patch)=>setLines(l=>l.map(a=>a.u==u?{...a,...patch}:a))
 const unit=l=>getPrice(l.id,cfg)+optExtra(l.id,l)
 const subtotal=lines.reduce((s,l)=>s+unit(l)*l.qty,0),count=lines.reduce((s,l)=>s+l.qty,0)
 const offer=pizzaOffer(lines.map(l=>({id:l.id,qty:l.qty,price:getPrice(l.id,cfg)})))
 const dl=lines.map(l=>({id:l.id,qty:l.qty,price:getPrice(l.id,cfg),cat:(CATALOG[l.id]||cfg?.customItems?.[l.id])?.cat}))
 const drinkDeal=canetteDeal(dl)                                   // canette 1 € avec un plat
 const canetteAlone=lines.some(l=>l.id===CANETTE_ID)&&!hasFood(dl) // canette seule : 1,50 €
 const total=subtotal-offer-drinkDeal

 return <Ctx.Provider value={{lines,add,setQty,setNote,setOpt,unit,subtotal,offer,drinkDeal,canetteAlone,clear:()=>setLines([]),total,count,open,setOpen,cfg,enabled:!!cfg,getPrice,isOut,isHidden}}>{children}</Ctx.Provider>
}

export const AddBtn=({id})=>{
 const{add,enabled,isOut,cfg}=useCart(),[ok,setOk]=useState(false)
 const item=CATALOG[id]||cfg?.customItems?.[id]
 if(!enabled||!item)return null
 const out=isOut(id,cfg)
 if(out)return <span className="tag-out">Rupture</span>
 return <button className={'add'+(ok?' ok':'')} aria-label={`Ajouter ${item.name} au panier`} onClick={()=>{add(id);setOk(true);setTimeout(()=>setOk(false),900)}}>{ok?'✓':'+'}</button>
}

export const CartButton=()=>{
 const{count,enabled,setOpen}=useCart();if(!enabled)return null
 return <button className="cartbtn" aria-label={`Panier, ${count} article${count>1?'s':''}`} onClick={()=>setOpen(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>{count>0&&<b>{count}</b>}</button>
}

export const OrderBtn=({className='btn lime',children='Commander en ligne'})=>{const{enabled,setOpen}=useCart();return enabled?<button className={className} onClick={()=>setOpen(true)}>{children}</button>:null}

export const MobileBar=({tel})=>{const{enabled,count,total,setOpen}=useCart()
 return <div className="bar">{enabled?<button className="btn ink" onClick={()=>setOpen(true)}>{count?`Voir mon panier · ${eur(total)}`:'Commander en ligne'}</button>:<a className="btn ink" href={tel}>Appeler pour commander</a>}</div>
}

const UPSELL_CANDIDATES = [
  { id: 'boissons:canettes-33cl', name: 'Canette 33cl', icon: '🥤', fallbackPrice: 200 },
  { id: 'desserts:tiramisu', name: 'Tiramisu', icon: '🍰', fallbackPrice: 450 },
  { id: 'desserts:brownies', name: 'Brownie fondant', icon: '🍫', fallbackPrice: 300 },
  { id: 'desserts:glace-haagen-dazs', name: 'Häagen-Dazs', icon: '🍨', fallbackPrice: 390 }
]

export function CartDrawer(){
 const{lines,add,setQty,setNote,setOpt,unit,subtotal,offer:baseOffer,drinkDeal,canetteAlone,clear,total,count,open,setOpen,cfg,getPrice,isOut,isHidden}=useCart()
 const[type,setType]=useState('emporter'),[pay,setPay]=useState(''),[f,setF]=useState(()=>{try{const s=localStorage.getItem('tp_customer');if(s)return JSON.parse(s)}catch{}return{name:'',phone:'',email:'',address:'',postcode:''}}),[tableNumber,setTableNumber]=useState(''),[promoInput,setPromoInput]=useState(''),[appliedPromo,setAppliedPromo]=useState(null),[promoErr,setPromoErr]=useState(''),[note,setNoteAll]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[done,setDone]=useState(null)

 useEffect(()=>{
  const q=new URLSearchParams(location.search)
  const tbl=q.get('table')||q.get('t')
  if(tbl){
   setType('sur_place')
   setTableNumber(tbl)
  }
 },[])

 if(!open||!cfg)return null

 const payment=pay||(cfg.online?'online':'sur_place'),upd=k=>e=>{const val=e.target.value;setF(prev=>{const next={...prev,[k]:val};try{localStorage.setItem('tp_customer',JSON.stringify(next))}catch{}return next})}
 const offer=type==='emporter'?baseOffer:0
 const currentTotal=subtotal-offer-drinkDeal
 const short=type=='livraison'&&subtotal<RULES.deliveryMin,closed=!cfg.open

 let discount=0
 if(appliedPromo){
  if(appliedPromo.discountType==='percent'){
   discount=Math.round(currentTotal*(appliedPromo.discountValue/100))
  }else if(appliedPromo.discountType==='fixed'){
   discount=Math.min(currentTotal,appliedPromo.discountValue)
  }
 }

 const finalTotal=Math.max(0,currentTotal-discount)

 const applyPromo=()=>{
  setPromoErr('')
  const code=promoInput.trim().toUpperCase()
  if(!code){setAppliedPromo(null);return}
  const pr=cfg.promos?.[code]
  if(pr&&pr.active){
   setAppliedPromo(pr)
  }else{
   setAppliedPromo(null)
   setPromoErr('Code promo invalide ou expiré.')
  }
 }

 const submit=async e=>{
  e.preventDefault()
  setBusy(true)
  setErr('')

  try{
   const r=await fetch('/api/orders',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
     type,
     payment,

     // Changed from sauce to sauces
     items:lines.map(({id,qty,note,sauces,supp})=>({
      id,
      qty,
      note,
      sauces:Array.isArray(sauces)?sauces:[],
      supp
     })),

     customer:f,
     note,
     tableNumber,
     promoCode:appliedPromo?.code||''
    })
   })

   const j=await r.json()
   if(!r.ok)throw new Error(j.error||'Erreur, réessayez.')
   if(j.url){location.href=j.url;return}
   clear()
   setDone(j.number)
   if (j.id) {
    try {
     localStorage.setItem('tp_active_order', JSON.stringify({
      id: j.id,
      number: j.number,
      status: 'new',
      type,
      total: finalTotal,
      tableNumber
     }))
     window.dispatchEvent(new CustomEvent('order_placed'))
    } catch {}
   }
  }catch(x){
   setErr(x.message)
  }finally{
   setBusy(false)
  }
 }

 const close=()=>{setOpen(false);setDone(null)}

 return <div className="cart-ov" onClick={close}><aside className="cart" role="dialog" aria-modal="true" aria-label="Votre commande" onClick={e=>e.stopPropagation()}>
  <div className="cart-h"><h2>{done?'Merci !':'Votre commande'}</h2><div style={{display:'flex',gap:12,alignItems:'center'}}>{count>0&&!done&&<button type="button" onClick={clear} style={{background:'none',border:'none',color:'var(--mute)',fontSize:12,cursor:'pointer',textDecoration:'underline',padding:'4px 6px'}} title="Vider tout le panier">Vider</button>}<button className="x" onClick={close} aria-label="Fermer">×</button></div></div>

  {done?<div className="cart-b">
   <p className="big">Commande n° {done} envoyée.</p>
   <p>Le restaurant l’a reçue. {type=='livraison'?'Le livreur arrive dès que votre commande est prête.':type=='sur_place'?(tableNumber?`Votre commande sera servie à la Table n° ${tableNumber}.`:'Votre commande sera servie à votre table / comptoir.'):`Vous pouvez venir la récupérer au ${RESTAURANT_CONFIG?.contact?.address?.full || 'restaurant'}.`} Pensez à régler {type=='livraison'?'à la livraison':'sur place'}.</p>

   <div style={{background:'var(--bg)',padding:16,borderRadius:16,border:'1px solid var(--line)',margin:'12px 0',textAlign:'center'}}>
    <p style={{fontWeight:700,marginBottom:8}}>⭐ Satisfait de votre repas ?</p>
    <a href={RESTAURANT_CONFIG?.contact?.mapsUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn red" style={{fontSize:13,padding:'10px 16px',width:'100%'}}>Laissez-nous 5 étoiles sur Google Maps →</a>
   </div>

   <button className="btn red" onClick={()=>{close();window.dispatchEvent(new CustomEvent('order_placed'))}} style={{width:'100%',marginBottom:8}}>Suivre la préparation en direct ➔</button>
   <button className="btn ghost" onClick={close} style={{width:'100%'}}>Fermer</button>
  </div>

  :!count?<div className="cart-b"><p>Votre panier est vide. Ajoutez des plats avec le bouton <b>+</b> sur la carte.</p></div>

  :<form className="cart-b" onSubmit={submit}>
   <ul className="cl">

    {lines.map(l=>{
     const c=CATALOG[l.id]||cfg?.customItems?.[l.id]||{name:'Article'},price=unit(l)

     return <li key={l.u}>
      <div className="cl-t"><b>{c.name}</b><div style={{display:'flex',alignItems:'center',gap:8}}><span>{eur(price*l.qty)}</span><button type="button" className="cl-del" onClick={()=>setQty(l.u,0)} aria-label={`Supprimer ${c.name} du panier`} title="Supprimer cet article" style={{background:'none',border:'none',cursor:'pointer',padding:'4px',color:'var(--mute)',display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:6}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div></div>

      {hasOpts(l.id)&&
       <div className="cl-o" style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',margin:'6px 0'}}>

        {/* Multiple sauces */}
        <div style={{display:'flex',flexDirection:'column',gap:6,width:'100%'}}>
         <span style={{fontWeight:600}}>Sauces au choix :</span>

         <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {SAUCES.map(s=>{
           const selected=(l.sauces||[]).includes(s)

           return <label
            key={s}
            style={{
             display:'flex',
             alignItems:'center',
             gap:5,
             padding:'6px 9px',
             border:'1px solid var(--line)',
             borderRadius:10,
             cursor:'pointer'
            }}
           >
            <input
             type="checkbox"
             checked={selected}
             onChange={()=>{
              const sauces=l.sauces||[]

              setOpt(l.u,{
               sauces:selected
                ? sauces.filter(x=>x!==s)
                : [...sauces,s]
              })
             }}
            />
            {s}
           </label>
          })}
         </div>
        </div>

        {/* Supplément viande : le client choisit quelle viande et combien */}
        <div style={{display:'flex',flexDirection:'column',gap:6,width:'100%'}}>
         <span style={{fontWeight:600}}>Supp. viande +{eur(SUPP_CENTS)} chacun :</span>

         <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {MEATS.map(m=>{
           const supp=cleanSupp(l.supp),n=supp[m]||0
           const setN=q=>{
            const next={...supp}
            if(q<1)delete next[m];else next[m]=Math.min(q,SUPP_MAX)
            setOpt(l.u,{supp:next})
           }
           const btn={width:28,height:28,borderRadius:'50%',border:'1.5px solid var(--dark)',background:'none',fontSize:16,lineHeight:1,cursor:'pointer',padding:0}

           return <div
            key={m}
            style={{
             display:'flex',
             alignItems:'center',
             gap:6,
             padding:'4px 8px',
             border:n>0?'1.5px solid var(--dark)':'1px solid var(--line)',
             borderRadius:10,
             fontSize:14
            }}
           >
            <span>{m}</span>
            <button type="button" style={{...btn,opacity:n<1?.35:1}} disabled={n<1} onClick={()=>setN(n-1)} aria-label={`Retirer un supplément ${m}`}>−</button>
            <b aria-live="polite" style={{minWidth:14,textAlign:'center'}}>{n}</b>
            <button type="button" style={{...btn,opacity:n>=SUPP_MAX?.35:1}} disabled={n>=SUPP_MAX} onClick={()=>setN(n+1)} aria-label={`Ajouter un supplément ${m}`}>+</button>
           </div>
          })}
         </div>
        </div>

       </div>
      }

      <div className="cl-q">
       <button type="button" onClick={()=>setQty(l.u,l.qty-1)} aria-label="Retirer un">−</button>
       <span aria-live="polite">{l.qty}</span>
       <button type="button" onClick={()=>setQty(l.u,l.qty+1)} aria-label="Ajouter un">+</button>
       <input value={l.note} maxLength={120} onChange={e=>setNote(l.u,e.target.value)} placeholder="Précisions (sans oignon…)" aria-label={`Précisions pour ${c.name}`}/>
      </div>
     </li>
    })}

   </ul>

   {(()=>{
    const availableUpsells = UPSELL_CANDIDATES.filter(item => {
      if (isHidden && isHidden(item.id, cfg)) return false
      if (isOut && isOut(item.id, cfg)) return false
      return true
    })
    if (!availableUpsells.length) return null
    return (
      <div className="cart-upsell">
        <div className="cart-upsell-title">
          <span>✨ Envie d'une douceur ou d'une boisson fraîche ?</span>
        </div>
        <div className="cart-upsell-grid">
          {availableUpsells.map(u => {
            const inCart = lines.find(l => l.id === u.id)
            const price = (getPrice && getPrice(u.id, cfg)) || u.fallbackPrice
            return (
              <div key={u.id} className="cart-upsell-card">
                <div className="cart-upsell-info">
                  <span className="cart-upsell-name">{u.icon} {u.name}</span>
                  <span className="cart-upsell-price">{eur(price)}</span>
                </div>
                <button
                  type="button"
                  className={`cart-upsell-btn ${inCart ? 'added' : ''}`}
                  onClick={() => add(u.id)}
                >
                  {inCart ? `✓ Ajouté (${inCart.qty}) +` : '+ Ajouter'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
   })()}

   {offer>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>🍕 3ème pizza offerte : -{eur(offer)}</p>}
   {type!=='emporter'&&baseOffer>0&&<p className="note" style={{color:'var(--mute)'}}>ℹ️ L’offre 3ème pizza offerte est réservée aux commandes à emporter.</p>}
   {drinkDeal>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>🥤 Canette à 1 € avec votre plat : -{eur(drinkDeal)}</p>}
   {canetteAlone&&<p className="note">🥤 Canette seule : 1,50 €. Ajoutez un plat et elle passe à 1 €.</p>}

   <fieldset className="seg"><legend>Mode de commande</legend>{[['emporter','À emporter'],['livraison','Livraison'],['sur_place','Sur place']].filter(([v])=>RESTAURANT_CONFIG?.features?.[v==='emporter'?'takeaway':v==='livraison'?'delivery':'dineIn']!==false).map(([v,l])=><label key={v} className={type==v?'on':''}><input type="radio" name="type" checked={type==v} onChange={()=>setType(v)}/>{l}</label>)}</fieldset>

   {short&&<p className="warn">Livraison à partir de {eur(RULES.deliveryMin)} de commande (il manque {eur(RULES.deliveryMin-subtotal)}). Ou choisissez « À emporter » ou « Sur place ».</p>}

   {type==='sur_place'&&<label>Numéro de Table<input placeholder="Ex: Table 4" value={tableNumber} onChange={e=>setTableNumber(e.target.value)}/></label>}

   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6,marginBottom:2}}><span style={{fontWeight:800,fontSize:13.5}}>Vos coordonnées</span>{f.name&&<span style={{fontSize:11.5,color:'var(--green)',fontWeight:700}}>✓ Coordonnées mémorisées</span>}</div>
   <label>Nom<input required autoComplete="name" value={f.name} onChange={upd('name')}/></label>
   <label>Téléphone<input required type="tel" autoComplete="tel" value={f.phone} onChange={upd('phone')}/></label>
   <label>E-mail <small>(reçu de paiement, facultatif)</small><input type="email" autoComplete="email" value={f.email} onChange={upd('email')}/></label>

   {type=='livraison'&&
    <>
     <label>Adresse de livraison<input required autoComplete="street-address" value={f.address} onChange={upd('address')}/></label>
     <label>Code postal<input required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" value={f.postcode} onChange={upd('postcode')}/></label>
    </>
   }

   <label>Code Promo <small>(facultatif)</small>
    <div style={{display:'flex',gap:8}}>
     <input placeholder="Ex: WELCOME10" value={promoInput} onChange={e=>setPromoInput(e.target.value.toUpperCase())} style={{textTransform:'uppercase'}}/>
     <button type="button" className="btn ghost" onClick={applyPromo} style={{flex:'none',padding:'0 16px',borderRadius:12}}>Appliquer</button>
    </div>

    {appliedPromo&&<span style={{color:'var(--green)',fontSize:13,fontWeight:700}}>✓ Code {appliedPromo.code} appliqué ({appliedPromo.discountType==='percent'?`-${appliedPromo.discountValue}%`:`-${eur(appliedPromo.discountValue)}`})</span>}
    {promoErr&&<span style={{color:'var(--red)',fontSize:13,fontWeight:700}}>{promoErr}</span>}
   </label>

   <label>Message pour le restaurant <small>(facultatif)</small><textarea rows={2} maxLength={300} value={note} onChange={e=>setNoteAll(e.target.value)}/></label>

   <fieldset className="seg"><legend>Paiement</legend>
    {cfg.online&&<label className={payment=='online'?'on':''}><input type="radio" name="pay" checked={payment=='online'} onChange={()=>setPay('online')}/>Carte en ligne</label>}
    <label className={payment=='sur_place'?'on':''}><input type="radio" name="pay" checked={payment=='sur_place'} onChange={()=>setPay('sur_place')}/>{type=='livraison'?'À la livraison':'Sur place'}</label>
   </fieldset>

   {closed&&<p className="warn">{buildClosedMsg(cfg)}</p>}
   {err&&<p className="warn" role="alert">{err}</p>}

   <div className="cart-f">
    {(discount>0||offer>0||drinkDeal>0)&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--mute)'}}><span>Sous-total</span><span>{eur(subtotal)}</span></div>}
    {offer>0&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--green)'}}><span>3ème pizza offerte</span><span>-{eur(offer)}</span></div>}
    {drinkDeal>0&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--green)'}}><span>Canette à 1 € avec un plat</span><span>-{eur(drinkDeal)}</span></div>}
    {discount>0&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--green)'}}><span>Réduction</span><span>-{eur(discount)}</span></div>}
    <div className="tot"><span>Total</span><b>{eur(finalTotal)}</b></div>

    <button className="btn ink" disabled={busy||short||closed}>
     {busy?'Envoi…':payment=='online'?`Payer ${eur(finalTotal)}`:'Envoyer la commande'}
    </button>

    <p className="legal">Paiement par carte sécurisé par Stripe. Les prix sont en euros TTC. En commandant vous acceptez nos conditions de vente. Allergènes : demandez-nous la liste au {RESTAURANT_CONFIG?.contact?.phone}.</p>
   </div>

  </form>}
 </aside></div>
}

export function OrderBanner(){
 const{clear}=useCart(),[m,setM]=useState(null)

 useEffect(()=>{
  const q=new URLSearchParams(location.search),id=q.get('commande'),no=q.get('annule')
  if(!id&&!no)return

  history.replaceState(null,'',location.pathname+location.hash)

  if(no){
   setM({k:'warn',t:'Paiement annulé. Votre panier est conservé, vous pouvez réessayer.'})
   return
  }

  let n=0,stop=false
  setM({k:'ok',t:'Paiement reçu, confirmation en cours…'})

  const poll=async()=>{
   try{
    const res=await fetch('/api/order-status?id='+id)
    if(res.ok){
     const o=await res.json()
     if(o&&o.number&&o.status&&o.status!='pending'&&o.status!='cancelled'){
      clear()
      setM({k:'ok',t:`Merci ! Commande n° ${o.number} payée et envoyée au restaurant.`})
      return
     }
    }
   }catch{}

   if(!stop&&++n<30)
    setTimeout(poll,1500)
   else
    setM({k:'ok',t:`Paiement reçu. Confirmation en cours par le restaurant. En cas de question, contactez-nous au ${RESTAURANT_CONFIG?.contact?.phone}.`})
  }

  poll()

  return()=>{
   stop=true
  }
 },[])

 return m
  ? <div className={'obanner '+m.k} role="status">{m.t}<button onClick={()=>setM(null)} aria-label="Fermer">×</button></div>
  : null
}

