// Business logic shared by the Vercel functions in /api and the local dev server.
import crypto from 'node:crypto'
import {CATALOG,RULES,isOpen,totalOf,eur} from '../shared/catalog.js'
import {store,persistent} from './store.js'
const env=process.env
const ZONE=(env.DELIVERY_POSTCODES||'').split(',').map(s=>s.trim()).filter(Boolean)
const ALWAYS_OPEN=env.ALWAYS_OPEN==='1'
const stripeOn=()=>!!env.STRIPE_SECRET_KEY
const STRIPE_API=()=>env.STRIPE_API_BASE||'https://api.stripe.com'

const send=(res,code,obj)=>{res.writeHead(code,{'content-type':'application/json;charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(obj))}
const readBody=(req,max=1e6)=>new Promise((ok,ko)=>{const b=[];let n=0;req.on('data',c=>{n+=c.length;if(n>max){ko(new Error('too big'));req.destroy()}else b.push(c)});req.on('end',()=>ok(Buffer.concat(b)));req.on('error',ko)})
const clean=(s,n=200)=>String(s??'').replace(/[\u0000-\u001f<>]/g,' ').trim().slice(0,n)
const safeEq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
const baseUrl=req=>(env.PUBLIC_URL||`${/^localhost/.test(req.headers.host||'')?'http':'https'}://${req.headers.host}`).replace(/\/$/,'')
const only=(method,fn)=>async(req,res)=>{
 if(req.method!==method){res.setHeader('allow',method);return send(res,405,{error:'method not allowed'})}
 try{await fn(req,res)}catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:'Erreur serveur'})}}

export const getConfig=only('GET',async(req,res)=>send(res,200,{open:ALWAYS_OPEN||isOpen(),online:stripeOn()}))

export const orderStatus=only('GET',async(req,res)=>{
 const o=await store.get(new URL(req.url,'http://x').searchParams.get('id')||'')
 o?send(res,200,{id:o.id,number:o.number,status:o.status,paid:o.paid}):send(res,404,{error:'not found'})})

function validate(b){
 const err=m=>{const e=new Error(m);e.code=400;throw e}
 if(!ALWAYS_OPEN&&!isOpen())err('Nous sommes fermés pour le moment. Commandes ouvertes 11h–14h30 et 18h–23h (fermé dimanche midi).')
 const type=b.type==='livraison'?'livraison':b.type==='emporter'?'emporter':err('Choisissez livraison ou à emporter.')
 const payment=b.payment==='online'?'online':b.payment==='sur_place'?'sur_place':err('Choisissez un mode de paiement.')
 if(payment==='online'&&!stripeOn())err('Le paiement en ligne n’est pas encore activé.')
 if(!Array.isArray(b.items)||!b.items.length||b.items.length>40)err('Panier vide.')
 const items=b.items.map(l=>{const c=CATALOG[l.id],qty=Math.floor(+l.qty);if(!c||!(qty>=1&&qty<=30))err('Article invalide.')
  return{id:c.id,name:c.name,price:c.price,qty,note:clean(l.note,120)}})
 const total=totalOf(items),cu=b.customer||{}
 const customer={name:clean(cu.name,80),phone:clean(cu.phone,20).replace(/[^\d+]/g,''),email:clean(cu.email,120),address:clean(cu.address,160),postcode:clean(cu.postcode,10)}
 if(customer.name.length<2)err('Indiquez votre nom.')
 if(customer.phone.replace(/\D/g,'').length<10)err('Indiquez un numéro de téléphone valide.')
 if(customer.email&&!/^\S+@\S+\.\S+$/.test(customer.email))err('E-mail invalide.')
 if(type==='livraison'){
  if(customer.address.length<5||!/^\d{5}$/.test(customer.postcode))err('Indiquez votre adresse et code postal.')
  if(total<RULES.deliveryMin)err(`Minimum de commande en livraison : ${eur(RULES.deliveryMin)}.`)
  if(ZONE.length&&!ZONE.includes(customer.postcode))err('Cette adresse est hors de notre zone de livraison.')}
 return{type,payment,items,total,customer,note:clean(b.note,300)}}

async function stripeSession(o,base){
 const f=new URLSearchParams()
 f.set('mode','payment');f.set('locale','fr')
 f.set('success_url',`${base}/?commande=${o.id}`);f.set('cancel_url',`${base}/?annule=${o.id}`)
 f.set('client_reference_id',o.id);f.set('metadata[order_id]',o.id);f.set('payment_intent_data[metadata][order_id]',o.id)
 f.set('expires_at',String(Math.floor(Date.now()/1000)+31*60))
 if(o.customer.email)f.set('customer_email',o.customer.email)
 o.items.forEach((l,i)=>{f.set(`line_items[${i}][quantity]`,String(l.qty));f.set(`line_items[${i}][price_data][currency]`,'eur')
  f.set(`line_items[${i}][price_data][unit_amount]`,String(l.price));f.set(`line_items[${i}][price_data][product_data][name]`,l.name)})
 const r=await fetch(`${STRIPE_API()}/v1/checkout/sessions`,{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded'},body:f})
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'stripe error');return j}

export const createOrder=only('POST',async(req,res)=>{
 let b;try{b=JSON.parse((await readBody(req,200e3)).toString())}catch{return send(res,400,{error:'Requête invalide.'})}
 let v;try{v=validate(b)}catch(e){return send(res,e.code||500,{error:e.message})}
 // anti-spam: a fake order would ring the kitchen alarm
 if(await store.recentByPhone(v.customer.phone,Date.now()-30*60e3)>=3)return send(res,429,{error:'Trop de commandes récentes avec ce numéro. Appelez-nous au 02 41 03 57 87.'})
 const id=crypto.randomBytes(9).toString('hex')
 if(v.payment==='sur_place'){const o=await store.insert({id,status:'new',paid:false,...v});return send(res,201,{id:o.id,number:o.number})}
 const o=await store.insert({id,status:'pending',paid:false,...v})
 try{const s=await stripeSession(o,baseUrl(req));await store.update(o.id,{stripeSession:s.id});send(res,201,{id:o.id,url:s.url})}
 catch(e){await store.update(o.id,{status:'cancelled'});console.error('stripe:',e.message);send(res,502,{error:'Paiement indisponible, réessayez ou choisissez « payer sur place ».'})}})

function verifyStripe(raw,header){
 const secret=env.STRIPE_WEBHOOK_SECRET;if(!secret||!header)return false
 const p=Object.fromEntries(header.split(',').map(x=>x.split('=')));const t=+p.t
 if(!t||Math.abs(Date.now()/1000-t)>300||!p.v1)return false
 return safeEq(crypto.createHmac('sha256',secret).update(`${p.t}.`).update(raw).digest('hex'),p.v1)}

export const stripeWebhook=only('POST',async(req,res)=>{
 const raw=await readBody(req)
 if(!verifyStripe(raw,req.headers['stripe-signature']))return send(res,400,{error:'bad signature'})
 const ev=JSON.parse(raw.toString()),s=ev.data?.object||{},id=s.metadata?.order_id||s.client_reference_id,o=id&&await store.get(id)
 if(o&&(ev.type==='checkout.session.completed'||ev.type==='checkout.session.async_payment_succeeded')&&s.payment_status==='paid'&&s.amount_total===o.total)
  await store.update(o.id,{paid:true,status:'new',stripePayment:s.payment_intent},{paid:false,status:'pending'}) // no-op if already processed
 else if(o&&ev.type==='checkout.session.expired')await store.update(o.id,{status:'cancelled'},{status:'pending'})
 send(res,200,{received:true})})

// Kitchen API: header  x-kitchen-key: <KITCHEN_PASSWORD>
const authed=req=>!!env.KITCHEN_PASSWORD&&safeEq(req.headers['x-kitchen-key']||'',env.KITCHEN_PASSWORD)
const NEXT={new:'accepted',accepted:'ready',ready:'done'}
export const kitchen=async(req,res)=>{
 try{
  if(!authed(req))return send(res,401,{error:'unauthorized'})
  if(req.method==='GET')return send(res,200,{orders:await store.active(Date.now()-18*3600e3),persistent})
  if(req.method==='POST'){
   const {id,status}=JSON.parse((await readBody(req,20e3)).toString()||'{}'),o=await store.get(String(id))
   if(!o||!Object.values(NEXT).includes(status)||NEXT[o.status]!==status)return send(res,400,{error:'invalid'})
   return send(res,200,await store.update(o.id,{status},{status:o.status})||o)}
  res.setHeader('allow','GET, POST');send(res,405,{error:'method not allowed'})
 }catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:'Erreur serveur'})}}
