import {createContext,useContext,useEffect,useState} from 'react'
import {CATALOG,RULES,eur} from '../shared/catalog.js'
const Ctx=createContext(null),useCart=()=>useContext(Ctx)
const KEY='tp-cart'

const getPrice=(id,cfg)=>{
 const ov=cfg?.overrides?.[id]
 return (ov&&typeof ov.price==='number'&&ov.price>0)?ov.price:(CATALOG[id]?.price||0)
}

const isOut=(id,cfg)=>!!cfg?.overrides?.[id]?.outOfStock

export function CartProvider({children}){
 const[lines,setLines]=useState(()=>{try{return(JSON.parse(localStorage.getItem(KEY))||[]).filter(l=>CATALOG[l.id])}catch{return[]}})
 const[open,setOpen]=useState(false),[cfg,setCfg]=useState(null)
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(lines))}catch{}},[lines])
 useEffect(()=>{fetch('/api/config').then(r=>r.ok?r.json():null).then(setCfg).catch(()=>setCfg(null))},[])
 useEffect(()=>{document.body.style.overflow=open?'hidden':'';const k=e=>e.key=='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[open])

 const add=id=>{
  if(isOut(id,cfg))return
  setLines(l=>l.some(a=>a.id==id)?l.map(a=>a.id==id?{...a,qty:Math.min(a.qty+1,30)}:a):[...l,{id,qty:1,note:''}])
 }
 const setQty=(id,q)=>setLines(l=>q<1?l.filter(a=>a.id!=id):l.map(a=>a.id==id?{...a,qty:Math.min(q,30)}:a))
 const setNote=(id,note)=>setLines(l=>l.map(a=>a.id==id?{...a,note}:a))
 const total=lines.reduce((s,l)=>s+getPrice(l.id,cfg)*l.qty,0),count=lines.reduce((s,l)=>s+l.qty,0)
 return <Ctx.Provider value={{lines,add,setQty,setNote,clear:()=>setLines([]),total,count,open,setOpen,cfg,enabled:!!cfg,getPrice,isOut}}>{children}</Ctx.Provider>
}

export const AddBtn=({id})=>{
 const{add,enabled,isOut,cfg}=useCart(),[ok,setOk]=useState(false)
 if(!enabled||!CATALOG[id])return null
 const out=isOut(id,cfg)
 if(out)return <span className="tag-out">Rupture</span>
 return <button className={'add'+(ok?' ok':'')} aria-label={`Ajouter ${CATALOG[id].name} au panier`} onClick={()=>{add(id);setOk(true);setTimeout(()=>setOk(false),900)}}>{ok?'✓':'+'}</button>
}

export const CartButton=()=>{
 const{count,enabled,setOpen}=useCart();if(!enabled)return null
 return <button className="cartbtn" aria-label={`Panier, ${count} article${count>1?'s':''}`} onClick={()=>setOpen(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>{count>0&&<b>{count}</b>}</button>
}

export const OrderBtn=({className='btn lime',children='Commander en ligne'})=>{const{enabled,setOpen}=useCart();return enabled?<button className={className} onClick={()=>setOpen(true)}>{children}</button>:null}

export const MobileBar=({tel})=>{const{enabled,count,total,setOpen}=useCart()
 return <div className="bar">{enabled?<button className="btn ink" onClick={()=>setOpen(true)}>{count?`Voir mon panier · ${eur(total)}`:'Commander en ligne'}</button>:<a className="btn ink" href={tel}>Appeler pour commander</a>}</div>}

export function CartDrawer(){
 const{lines,setQty,setNote,clear,total,count,open,setOpen,cfg,getPrice}=useCart()
 const[type,setType]=useState('emporter'),[pay,setPay]=useState(''),[f,setF]=useState({name:'',phone:'',email:'',address:'',postcode:''}),[tableNumber,setTableNumber]=useState(''),[promoInput,setPromoInput]=useState(''),[appliedPromo,setAppliedPromo]=useState(null),[promoErr,setPromoErr]=useState(''),[note,setNoteAll]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[done,setDone]=useState(null)

 useEffect(()=>{
  const q=new URLSearchParams(location.search)
  const tbl=q.get('table')||q.get('t')
  if(tbl){
   setType('sur_place')
   setTableNumber(tbl)
  }
 },[])

 if(!open||!cfg)return null

 const payment=pay||(cfg.online?'online':'sur_place'),upd=k=>e=>setF({...f,[k]:e.target.value})
 const short=type=='livraison'&&total<RULES.deliveryMin,closed=!cfg.open

 let discount=0
 if(appliedPromo){
  if(appliedPromo.discountType==='percent'){
   discount=Math.round(total*(appliedPromo.discountValue/100))
  }else if(appliedPromo.discountType==='fixed'){
   discount=Math.min(total,appliedPromo.discountValue)
  }
 }
 const finalTotal=Math.max(0,total-discount)

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

 const submit=async e=>{e.preventDefault();setBusy(true);setErr('')
  try{const r=await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type,payment,items:lines.map(({id,qty,note})=>({id,qty,note})),customer:f,note,tableNumber,promoCode:appliedPromo?.code||''})}),j=await r.json()
   if(!r.ok)throw new Error(j.error||'Erreur, réessayez.')
   if(j.url){location.href=j.url;return}
   clear();setDone(j.number)}catch(x){setErr(x.message)}finally{setBusy(false)}}

 const close=()=>{setOpen(false);setDone(null)}
 return <div className="cart-ov" onClick={close}><aside className="cart" role="dialog" aria-modal="true" aria-label="Votre commande" onClick={e=>e.stopPropagation()}>
  <div className="cart-h"><h2>{done?'Merci !':'Votre commande'}</h2><button className="x" onClick={close} aria-label="Fermer">×</button></div>
  {done?<div className="cart-b"><p className="big">Commande n° {done} envoyée.</p><p>Le restaurant l’a reçue. {type=='livraison'?'Le livreur arrive dès que votre commande est prête.':type=='sur_place'?(tableNumber?`Votre commande sera servie à la Table n° ${tableNumber}.`:'Votre commande sera servie à votre table / comptoir.'):'Vous pouvez venir la récupérer au 15 rue de Rouen.'} Pensez à régler {type=='livraison'?'à la livraison':'sur place'}.</p><button className="btn ink" onClick={close}>Fermer</button></div>
  :!count?<div className="cart-b"><p>Votre panier est vide. Ajoutez des plats avec le bouton <b>+</b> sur la carte.</p></div>
  :<form className="cart-b" onSubmit={submit}>
   <ul className="cl">{lines.map(l=>{const c=CATALOG[l.id],price=getPrice(l.id,cfg);return <li key={l.id}><div className="cl-t"><b>{c.name}</b><span>{eur(price*l.qty)}</span></div>
    <div className="cl-q"><button type="button" onClick={()=>setQty(l.id,l.qty-1)} aria-label="Retirer un">−</button><span aria-live="polite">{l.qty}</span><button type="button" onClick={()=>setQty(l.id,l.qty+1)} aria-label="Ajouter un">+</button>
    <input value={l.note} maxLength={120} onChange={e=>setNote(l.id,e.target.value)} placeholder="Précisions (sauces, boisson, sans oignon…)" aria-label={`Précisions pour ${c.name}`}/></div></li>})}</ul>
   <fieldset className="seg"><legend>Mode de commande</legend>{[['emporter','À emporter'],['livraison','Livraison'],['sur_place','Sur place']].map(([v,l])=><label key={v} className={type==v?'on':''}><input type="radio" name="type" checked={type==v} onChange={()=>setType(v)}/>{l}</label>)}</fieldset>
   {short&&<p className="warn">Livraison à partir de {eur(RULES.deliveryMin)} de commande (il manque {eur(RULES.deliveryMin-total)}). Ou choisissez « À emporter » ou « Sur place ».</p>}
   {type==='sur_place'&&<label>Numéro de Table<input placeholder="Ex: Table 4" value={tableNumber} onChange={e=>setTableNumber(e.target.value)}/></label>}
   <label>Nom<input required autoComplete="name" value={f.name} onChange={upd('name')}/></label>
   <label>Téléphone<input required type="tel" autoComplete="tel" value={f.phone} onChange={upd('phone')}/></label>
   <label>E-mail <small>(reçu de paiement, facultatif)</small><input type="email" autoComplete="email" value={f.email} onChange={upd('email')}/></label>
   {type=='livraison'&&<><label>Adresse de livraison<input required autoComplete="street-address" value={f.address} onChange={upd('address')}/></label><label>Code postal<input required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" value={f.postcode} onChange={upd('postcode')}/></label></>}
   
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
    <label className={payment=='sur_place'?'on':''}><input type="radio" name="pay" checked={payment=='sur_place'} onChange={()=>setPay('sur_place')}/>{type=='livraison'?'À la livraison':'Sur place'}</label></fieldset>
   {closed&&<p className="warn">{cfg.closedReason||'Nous sommes fermés pour le moment. Commandes ouvertes 11h–14h30 et 18h–23h (fermé dimanche midi).'}</p>}
   {err&&<p className="warn" role="alert">{err}</p>}
   <div className="cart-f">
    {discount>0&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--mute)'}}><span>Sous-total</span><span>{eur(total)}</span></div>}
    {discount>0&&<div className="tot" style={{fontSize:'1.1rem',color:'var(--green)'}}><span>Réduction</span><span>-{eur(discount)}</span></div>}
    <div className="tot"><span>Total</span><b>{eur(finalTotal)}</b></div>
    <button className="btn ink" disabled={busy||short||closed}>{busy?'Envoi…':payment=='online'?`Payer ${eur(finalTotal)}`:'Envoyer la commande'}</button>
    <p className="legal">Paiement par carte sécurisé par Stripe. Les prix sont en euros TTC. En commandant vous acceptez nos conditions de vente. Allergènes : demandez-nous la liste au 02 41 03 57 87.</p></div>
  </form>}
 </aside></div>}

export function OrderBanner(){
 const{clear}=useCart(),[m,setM]=useState(null)
 useEffect(()=>{const q=new URLSearchParams(location.search),id=q.get('commande'),no=q.get('annule');if(!id&&!no)return
  history.replaceState(null,'',location.pathname+location.hash)
  if(no){setM({k:'warn',t:'Paiement annulé. Votre panier est conservé, vous pouvez réessayer.'});return}
  let n=0,stop=false;setM({k:'ok',t:'Paiement reçu, confirmation en cours…'})
  const poll=async()=>{try{const o=await(await fetch('/api/order-status?id='+id)).json()
   if(o.status!='pending'&&o.status!='cancelled'){clear();setM({k:'ok',t:`Merci ! Commande n° ${o.number} payée et envoyée au restaurant.`});return}}catch{}
   if(!stop&&++n<20)setTimeout(poll,1500);else setM({k:'ok',t:'Paiement reçu. Si vous ne recevez pas d’appel, contactez-nous au 02 41 03 57 87.'})}
  poll();return()=>{stop=true}},[])
 return m?<div className={'obanner '+m.k} role="status">{m.t}<button onClick={()=>setM(null)} aria-label="Fermer">×</button></div>:null}
