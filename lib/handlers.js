// Business logic shared by the Vercel functions in /api and the local dev server.
import crypto from 'node:crypto'
import {CATALOG,RULES,isOpen,totalOf,eur,cleanOpts,optExtra,optLabel,pizzaOffer,canetteDeal} from '../shared/catalog.js'
import {RESTAURANT_CONFIG} from '../shared/restaurant.config.js'
import {store,persistent,getDbStatus} from './store.js'
const env=process.env
const ZONE=(env.DELIVERY_POSTCODES ? env.DELIVERY_POSTCODES.split(',') : (RESTAURANT_CONFIG?.delivery?.allowedPostcodes || [])).map(s=>s.trim()).filter(Boolean)
const ALWAYS_OPEN=env.ALWAYS_OPEN==='1'||env.ALWAYS_OPEN==='true'||env.NODE_ENV==='development'
const stripeKey=()=>(env.STRIPE_SECRET_KEY||'').trim().replace(/^[\'"]|[\'"]$/g,'')
const stripeOn=()=>!!stripeKey()
const STRIPE_API=()=>env.STRIPE_API_BASE||'https://api.stripe.com'

const send=(res,code,obj)=>{
 if(typeof res.status==='function'&&typeof res.json==='function'){
  res.setHeader('cache-control','no-store')
  return res.status(code).json(obj)
 }
 res.writeHead(code,{'content-type':'application/json;charset=utf-8','cache-control':'no-store'})
 res.end(JSON.stringify(obj))
}

const readBody=async(req,max=1e6)=>{
 if(req.body!==undefined&&req.body!==null){
  if(Buffer.isBuffer(req.body))return req.body
  if(typeof req.body==='string')return Buffer.from(req.body)
  if(typeof req.body==='object')return Buffer.from(JSON.stringify(req.body))
 }
 if(req.rawBody)return Buffer.isBuffer(req.rawBody)?req.rawBody:Buffer.from(req.rawBody)
 if(req.readableEnded)return Buffer.alloc(0)
 return new Promise((ok,ko)=>{
  const b=[];let n=0
  req.on('data',c=>{n+=c.length;if(n>max){ko(new Error('too big'));req.destroy()}else b.push(c)})
  req.on('end',()=>ok(Buffer.concat(b)))
  req.on('error',ko)
 })
}

const clean=(s,n=200)=>String(s??'').replace(/[\u0000-\u001f<>]/g,' ').trim().slice(0,n)
const safeEq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
const baseUrl=req=>(env.PUBLIC_URL||`${/^localhost/.test(req.headers?.host||'')?'http':'https'}://${req.headers?.host||'localhost'}`).replace(/\/$/,'')
const only=(method,fn)=>async(req,res)=>{
 if(req.method!==method){res.setHeader('allow',method);return send(res,405,{error:'method not allowed'})}
 try{await fn(req,res)}catch(e){console.error('API error:',e);if(!res.headersSent)send(res,e.code||500,{error:e.message||'Erreur serveur'})}}

export const getConfig=only('GET',async(req,res)=>{
 const cfg=await store.getConfigData()
 const overrides=await store.getMenuOverrides()
 const promos=await store.getPromos()
 const customItems=await store.getCustomItems()
 const isTimeOpen=isOpen(new Date(), cfg.schedule||cfg.hours)
 const isActuallyOpen=ALWAYS_OPEN||cfg.forcedOpen||(isTimeOpen&&!cfg.manualClosed)
 send(res,200,{
  open:isActuallyOpen,
  manualClosed:cfg.manualClosed,
  forcedOpen:cfg.forcedOpen,
  openMode:cfg.openMode,
  hours:cfg.hours,
  schedule:cfg.schedule,
  closedReason:cfg.closedReason,
  online:stripeOn(),
  overrides,
  promos,
  customItems,
  dbStatus:getDbStatus(),
  restaurant:RESTAURANT_CONFIG
 })
})

export const orderStatus=only('GET',async(req,res)=>{
 const id=new URL(req.url,'http://x').searchParams.get('id')||''
 let o=id&&await store.get(id)
 if(o&&o.status==='pending'&&o.stripeSession&&stripeKey()){
  try{
   const sr=await fetch(`${STRIPE_API()}/v1/checkout/sessions/${encodeURIComponent(o.stripeSession)}`,{headers:{authorization:`Bearer ${stripeKey()}`}})
   if(sr.ok){
    const sj=await sr.json()
    if(sj.payment_status==='paid'&&sj.amount_total===o.total){
     const up=await store.update(o.id,{paid:true,status:'new',stripePayment:sj.payment_intent},{paid:false,status:'pending'})
     if(up)o=up
    }
   }
  }catch(e){console.error('[Stripe Check Error]',e.message)}
 }
 if(!o)return send(res,404,{error:'not found'})
 send(res,200,{id:o.id,number:o.number,paid:o.paid,status:o.status})
})

async function validate(b){
 const err=m=>{const e=new Error(m);e.code=400;throw e}
 const cfg=await store.getConfigData()
 const overrides=await store.getMenuOverrides()
 const promos=await store.getPromos()
 const customItems=await store.getCustomItems()
 const fullCatalog={...CATALOG,...customItems}

 if(cfg.manualClosed)err(cfg.closedReason||'Le restaurant est fermé temporairement.')
 if(!ALWAYS_OPEN&&!cfg.forcedOpen&&!isOpen(new Date(), cfg.schedule||cfg.hours))err(cfg.closedReason||'Nous sommes fermés pour le moment. Commandes ouvertes selon nos horaires.')

 const type=['livraison','emporter','sur_place'].includes(b.type)?b.type:err('Choisissez un mode de commande (livraison, à emporter ou sur place).')
 const payment=b.payment==='online'?'online':'sur_place'
 if(payment==='online'&&!stripeOn())err('Le paiement en ligne n’est pas encore activé.')
 if(!Array.isArray(b.items)||!b.items.length||b.items.length>40)err('Panier vide.')

 const items=b.items.map(l=>{
  const c=fullCatalog[l.id],qty=Math.floor(+l.qty)
  if(!c||!(qty>=1&&qty<=30))err('Article invalide.')
  const ov=overrides[l.id]
  if(ov&&ov.outOfStock)err(`L'article "${c.name}" est actuellement en rupture de stock.`)
  const unitPrice=(ov&&typeof ov.price==='number'&&ov.price>0)?ov.price:c.price
  const o=cleanOpts(c.id,l),lab=optLabel(c.id,l)
  return{id:c.id,name:lab?`${c.name} (${lab})`:c.name,price:unitPrice+optExtra(c.id,l),qty,note:clean(l.note,120),sauces:o.sauces,supp:o.supp,base:unitPrice}
 })

 let subtotal=items.reduce((s,l)=>s+l.price*l.qty,0)
 const offer=pizzaOffer(items, type)
 // Canette 33cl à 1 € dès qu'il y a un plat dans la commande (1,50 € seule)
 const drinkDeal=canetteDeal(items.map(i=>({id:i.id,qty:i.qty,price:i.base,cat:fullCatalog[i.id]?.cat})))
 const auto=offer+drinkDeal
 let discount=auto
 const promoCode=clean(b.promoCode||'',30).toUpperCase()
 if(promoCode){
  const pr=promos[promoCode]
  if(pr&&pr.active){
   if(pr.discountType==='percent'){
    discount=auto+Math.round((subtotal-auto)*(pr.discountValue/100))
   }else if(pr.discountType==='fixed'){
    discount=auto+Math.min(subtotal-auto,pr.discountValue)
   }
  }else{
   err('Code promo invalide ou expiré.')
  }
 }
 const total=Math.max(0,subtotal-discount)

 const cu=b.customer||{}
 const customer={name:clean(cu.name,80),phone:clean(cu.phone,20).replace(/[^\d+]/g,''),email:clean(cu.email,120),address:clean(cu.address,160),postcode:clean(cu.postcode,10)}
 const tableNumber=clean(b.tableNumber||'',20)

 if(type==='sur_place'&&tableNumber){
  customer.address=`Table ${tableNumber}`
 }

 if(customer.name.length<2)err('Indiquez votre nom.')
 if(customer.phone.replace(/\D/g,'').length<10)err('Indiquez un num\u00e9ro de t\u00e9l\u00e9phone valide.')
 if(customer.email&&!/^\S+@\S+\.\S+$/.test(customer.email))err('E-mail invalide.')

 if(type==='livraison'){
  if(customer.address.length<5||!/^\d{5}$/.test(customer.postcode))err('Indiquez votre adresse et code postal.')
  if(subtotal<RULES.deliveryMin)err(`Minimum de commande en livraison : ${eur(RULES.deliveryMin)}.`)
  if(ZONE.length&&!ZONE.includes(customer.postcode))err('Cette adresse est hors de notre zone de livraison.')
 }
 return{type,payment,items:items.map(({base,...l})=>l),total,discount,customer,note:clean(b.note,300),tableNumber,promoCode}
}

async function stripeSession(o,base){
 const f=new URLSearchParams()
 f.set('mode','payment');f.set('locale','fr')
 f.set('success_url',`${base}/?commande=${o.id}`);f.set('cancel_url',`${base}/?annule=${o.id}`)
 f.set('client_reference_id',o.id);f.set('metadata[order_id]',o.id);f.set('payment_intent_data[metadata][order_id]',o.id)
 f.set('expires_at',String(Math.floor(Date.now()/1000)+31*60))
 if(o.customer.email)f.set('customer_email',o.customer.email)
 o.items.forEach((l,i)=>{f.set(`line_items[${i}][quantity]`,String(l.qty));f.set(`line_items[${i}][price_data][currency]`,'eur')
  f.set(`line_items[${i}][price_data][unit_amount]`,String(l.price));f.set(`line_items[${i}][price_data][product_data][name]`,l.name)})
 if(o.discount>0){
  const cf=new URLSearchParams({amount_off:String(o.discount),currency:'eur',duration:'once',max_redemptions:'1',name:'Réduction'})
  const cr=await fetch(`${STRIPE_API()}/v1/coupons`,{method:'POST',headers:{authorization:`Bearer ${stripeKey()}`,'content-type':'application/x-www-form-urlencoded'},body:cf})
  const cj=await cr.json();if(!cr.ok)throw new Error(cj.error?.message||'stripe coupon error')
  f.set('discounts[0][coupon]',cj.id)
 }
 const r=await fetch(`${STRIPE_API()}/v1/checkout/sessions`,{method:'POST',headers:{authorization:`Bearer ${stripeKey()}`,'content-type':'application/x-www-form-urlencoded'},body:f})
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'stripe error');return j
}

export const createOrder=only('POST',async(req,res)=>{
 let b
 try{
  if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)){
   b=req.body
  }else{
   const raw=await readBody(req,200e3)
   b=JSON.parse(raw.toString()||'{}')
  }
 }catch{return send(res,400,{error:'Requ\u00eate invalide.'})}
 let v;try{v=await validate(b)}catch(e){return send(res,e.code||400,{error:e.message})}

 try{
  if(await store.recentByPhone(v.customer.phone,Date.now()-30*60e3)>=3)
   return send(res,429,{error:`Trop de commandes récentes avec ce numéro. Appelez-nous au ${RESTAURANT_CONFIG?.contact?.phone||'le restaurant'}.`})
 }catch(e){console.warn('Rate check bypassed:',e.message)}

 const id=crypto.randomBytes(9).toString('hex')
 if(v.payment==='sur_place'){const o=await store.insert({id,status:'new',paid:false,...v});return send(res,201,{id:o.id,number:o.number})}
 const o=await store.insert({id,status:'pending',paid:false,...v})
 try{const s=await stripeSession(o,baseUrl(req));await store.update(o.id,{stripeSession:s.id});send(res,201,{id:o.id,url:s.url})}
 catch(e){await store.update(o.id,{status:'cancelled'});console.error('[Stripe Error]',e.message);send(res,502,{error:`Paiement Stripe indisponible : ${e.message||'erreur inconnue'}`})}
})

function verifyStripe(raw,header){
 const secret=(env.STRIPE_WEBHOOK_SECRET||'').trim().replace(/^[\'"]|[\'"]$/g,'');if(!secret||!header)return false
 const p=Object.fromEntries(header.split(',').map(x=>x.split('=')));const t=+p.t
 if(!t||Math.abs(Date.now()/1000-t)>300||!p.v1)return false
 return safeEq(crypto.createHmac('sha256',secret).update(`${p.t}.`).update(raw).digest('hex'),p.v1)
}

export const stripeWebhook=only('POST',async(req,res)=>{
 const raw=await readBody(req)
 if(!verifyStripe(raw,req.headers['stripe-signature']))return send(res,400,{error:'bad signature'})
 const ev=JSON.parse(raw.toString()),s=ev.data?.object||{},id=s.metadata?.order_id||s.client_reference_id,o=id&&await store.get(id)
 if(o&&(ev.type==='checkout.session.completed'||ev.type==='checkout.session.async_payment_succeeded')&&s.payment_status==='paid'&&s.amount_total===o.total)
  await store.update(o.id,{paid:true,status:'new',stripePayment:s.payment_intent},{paid:false,status:'pending'})
 else if(o&&ev.type==='checkout.session.expired')await store.update(o.id,{status:'cancelled'},{status:'pending'})
 send(res,200,{received:true})
})

const authed=async req=>{
 const cfg=await store.getConfigData().catch(()=>({}))
 const p=cfg.kitchenPassword||env.KITCHEN_PASSWORD
 return !!p&&safeEq(req.headers['x-kitchen-key']||'',p)
}
const authedManager=async req=>{
 const cfg=await store.getConfigData().catch(()=>({}))
 const p=cfg.gerantPassword||env.GERANT_PASSWORD||env.KITCHEN_PASSWORD
 return !!p&&safeEq(req.headers['x-kitchen-key']||'',p)
}
const NEXT={new:'accepted',accepted:'ready',ready:'done'}

// Helper for sending SMS notifications on order status changes
async function triggerSmsNotification(o, newStatus){
 if(!o||!o.customer?.phone)return
 const smsText = newStatus === 'accepted'
  ? `${RESTAURANT_CONFIG?.brand?.name || 'Restaurant'} : Votre commande n°${o.number} est validée ! Préparation en cours (~20-30 min).`
  : newStatus === 'ready'
  ? `${RESTAURANT_CONFIG?.brand?.name || 'Restaurant'} : Votre commande n°${o.number} est ${o.type === 'livraison' ? 'en cours de livraison' : 'prête à être récupérée'} !`
  : null

 if(smsText){
  console.log(`[SMS Notification] Sending to ${o.customer.phone}: "${smsText}"`)
 }
}

export const kitchen=async(req,res)=>{
 try{
  if(!await authed(req))return send(res,401,{error:'unauthorized'})
  if(req.method==='GET'){
   const orders=await store.active(Date.now()-18*3600e3)
   const st=getDbStatus()
   return send(res,200,{orders,persistent:st.persistent,dbError:st.error})
  }
  if(req.method==='POST'){
   let payload
   try{
    if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)){
     payload=req.body
    }else{
     const raw=await readBody(req,20e3)
     payload=JSON.parse(raw.toString()||'{}')
    }
   }catch{return send(res,400,{error:'invalid'})}
   const {id,status}=payload||{},o=await store.get(String(id))
   if(!o||!Object.values(NEXT).includes(status)||NEXT[o.status]!==status)return send(res,400,{error:'invalid'})
   const updated = await store.update(o.id,{status},{status:o.status})||o
   triggerSmsNotification(updated, status).catch(err=>console.error('[SMS Error]',err))
   return send(res,200,updated)
  }
  res.setHeader('allow','GET, POST');send(res,405,{error:'method not allowed'})
 }catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:'Erreur serveur'})}
}

// Manager API for managing menu prices, stock status, promos, sales report, manual closures, and RIB bank details
export const managerApi=async(req,res)=>{
 try{
  if(!await authedManager(req))return send(res,401,{error:'unauthorized'})
  if(req.method==='GET'){
   const config=await store.getConfigData()
   const overrides=await store.getMenuOverrides()
   const promos=await store.getPromos()
   const customItems=await store.getCustomItems()
   const sales=await store.getSalesReport(Date.now()-24*3600e3)
    const kitchenKey=config.kitchenPassword||env.KITCHEN_PASSWORD||''
    const gerantKey=config.gerantPassword||env.GERANT_PASSWORD||env.KITCHEN_PASSWORD||''
    return send(res,200,{config,overrides,promos,sales,catalog:CATALOG,customItems,kitchenKey,gerantKey,dbStatus:getDbStatus()})
  }
  if(req.method==='POST'){
   let payload
   try{
    if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)){
     payload=req.body
    }else{
     const raw=await readBody(req,50e3)
     payload=JSON.parse(raw.toString()||'{}')
    }
   }catch{return send(res,400,{error:'invalid'})}

   const {action,data}=payload||{}
   if(action==='testDb'){
    try{
     await store.active(Date.now()-3600e3)
     return send(res,200,{ok:!getDbStatus().error,dbStatus:getDbStatus()})
    }catch(err){
     return send(res,200,{ok:false,dbStatus:{persistent:true,error:err.message}})
    }
   }
   if(action==='updateConfig'){
    await store.updateConfigData(data||{})
    return send(res,200,await store.getConfigData())
   }
   if(action==='saveOverride'){
    const {id,price,outOfStock}=data||{}
    const customItems=await store.getCustomItems()
    const fullCatalog={...CATALOG,...customItems}
    if(!id||!fullCatalog[id])return send(res,400,{error:'invalid item id'})
    const patch={}
    if(price!==undefined)patch.price=price?+price:null
    if(outOfStock!==undefined)patch.outOfStock=!!outOfStock
    if(data?.hidden!==undefined)patch.hidden=!!data.hidden
    await store.saveMenuOverride(id,patch)
    return send(res,200,await store.getMenuOverrides())
   }
   if(action==='savePromo'){
    const {code,discountType,discountValue,active}=data||{}
    if(!code)return send(res,400,{error:'code is required'})
    return send(res,200,await store.savePromo(code,{discountType,discountValue,active}))
   }
   if(action==='deletePromo'){
    const {code}=data||{}
    if(!code)return send(res,400,{error:'code is required'})
    return send(res,200,await store.deletePromo(code))
   }
   if(action==='saveCustomItem'){
    const {id,name,cat,price,desc}=data||{}
    if(!name||!price)return send(res,400,{error:'name and price are required'})
    const itemId=id||'custom:'+Date.now()
    await store.saveCustomItem(itemId,{id:itemId,name:clean(name,80),cat:clean(cat,40)||'Divers',price:+price,desc:clean(desc,150)})
    return send(res,200,await store.getCustomItems())
   }
   if(action==='deleteCustomItem'){
    const {id}=data||{}
    if(!id)return send(res,400,{error:'id is required'})
    await store.deleteCustomItem(id)
    return send(res,200,await store.getCustomItems())
   }
   if(action==='getSalesReport'){
    const days=data?.days||1
    const sinceMs=Date.now()-(days*24*3600e3)
    const sales=await store.getSalesReport(sinceMs)
    return send(res,200,{sales})
   }
   if(action==='cancelOrder'){
    const {id}=data||{}
    if(!id)return send(res,400,{error:'id required'})
    const o=await store.get(String(id))
    if(!o)return send(res,404,{error:'not found'})
    if(o.status==='cancelled')return send(res,200,{refunded:false,message:'already cancelled'})
    await store.update(o.id,{status:'cancelled'})
    let refunded=false
    if(o.paid&&o.stripePayment&&stripeKey()){
     try{
      const rf=new URLSearchParams({payment_intent:o.stripePayment,reason:'requested_by_customer'})
      const r=await fetch(`${STRIPE_API()}/v1/refunds`,{method:'POST',headers:{authorization:`Bearer ${stripeKey()}`,'content-type':'application/x-www-form-urlencoded'},body:rf})
      if(r.ok)refunded=true
      else{const e=await r.json();console.error('[Refund Error]',e.error?.message)}
     }catch(e){console.error('[Refund Error]',e.message)}
    }
    return send(res,200,{refunded,cancelled:true})
   }
   return send(res,400,{error:'unknown action'})
  }
  res.setHeader('allow','GET, POST');send(res,405,{error:'method not allowed'})
 }catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:'Erreur serveur'})}
}
