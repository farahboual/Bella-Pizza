// Single source of truth for orderable items + prices (in cents).
// The server recomputes every total from this file; the browser never decides the price.
import {pz,tom,cre,T,C,SZ,CATS} from './menuData.js'
import {RESTAURANT_CONFIG} from './restaurant.config.js'
const cents=s=>s?Math.round(parseFloat(s.replace(/[^\d,]/g,'').replace(',','.'))*100):null
export const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const eur=c=>(c/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})
export function buildCatalog(){
 const m={}
 const catImgs=RESTAURANT_CONFIG?.images||{}
 const itemImgs=catImgs.items||{}
 const getImg=(catId,s)=>itemImgs[s]||catImgs[catId]||catImgs.pizzas||'/client-assets/pizza.jpg'
 const add=(id,name,desc,cat,price,img)=>{if(price)m[id]={id,name,desc:desc||'',cat,price,img:img||getImg(cat.toLowerCase(),slug(name))}}
 SZ.forEach(([sz,p],i)=>{
  const all=[...pz(tom,T),...(cre?pz(cre,C):[])].filter(([n])=>Boolean(n));
  all.forEach(([n,d])=>{
   const s=slug(n)
   add(`pizzas:${s}:${slug(sz)}`,`Pizza ${n} · ${sz}`,d,'Pizzas',cents(p),getImg('pizzas',s))
  })
 })
 CATS.filter(c=>!c.pizza).forEach(c=>c.items.forEach(([n,d,p])=>{
  const s=slug(n)
  add(`${c.id}:${s}`,`${c.t==='Boissons'?'':c.t.replace(/s$/,'')+' '}${n}`.trim(),d,c.t,cents(p||c.p),getImg(c.id,s))
 }))
 return m
}
export const CATALOG=buildCatalog()
// Options choisies par le client (liste unique des sauces = celle du menu Tacos)
export const SAUCES=(CATS.find(c=>c.id==='tacos')?.sauces) || ['Sauce Maison', 'Barbecue Fumé', 'Mayonnaise à l’ancienne', 'Ketchup Doux', 'Sauce Poivre', 'Sauce Blanche']
export const SUPP_CENTS=50
export const SUPP_MAX=5   // max. de portions par viande et par article
// Viandes proposables en supplément (= viandes du menu Tacos). Pour en ajouter/retirer : modifier la liste Tacos dans menuData.js
export const MEATS=((CATS.find(c=>c.id==='tacos')?.items)||[]).map(i=>i[0]).length ? ((CATS.find(c=>c.id==='tacos')?.items)||[]).map(i=>i[0]) : ['Steak Boucher', 'Poulet Rôti', 'Bacon Fumé', 'Chèvre Chaud']
const LEGACY_MEAT='Viande (à préciser)' // anciens paniers/navigateurs qui envoyaient supp:true
export const OPT_CATS=['tacos','burgers','sandwichs']
export const hasOpts=id=>OPT_CATS.includes(String(id).split(':')[0])
// supp = { 'Kebab': 2, 'Merguez': 1 } -> le client choisit quelle viande et combien
export const cleanSupp=s=>{
  if(s===true)return {[LEGACY_MEAT]:1}
  const out={}
  if(s&&typeof s==='object'&&!Array.isArray(s))
    MEATS.forEach(m=>{const n=Math.floor(+s[m]);if(n>=1)out[m]=Math.min(n,SUPP_MAX)})
  return out
}
export const suppCount=s=>Object.values(s||{}).reduce((a,b)=>a+b,0) // s = objet déjà nettoyé par cleanSupp
export const cleanOpts = (id, o) => hasOpts(id)
  ? {
      sauces: Array.isArray(o?.sauces)
        ? o.sauces.filter(s => SAUCES.includes(s))
        : [],
      supp: cleanSupp(o?.supp)
    }
  : {
      sauces: [],
      supp: {}
    }
export const optExtra=(id,o)=>suppCount(cleanOpts(id,o).supp)*SUPP_CENTS
export const optLabel = (id, o) => {
  const c = cleanOpts(id, o)
  const supp = Object.entries(c.supp).map(([m, n]) => `${n}× ${m}`).join(', ')

  return [
    c.sauces.length > 0 && `sauces : ${c.sauces.join(', ')}`,
    supp && `supp. viande : ${supp}`
  ]
    .filter(Boolean)
    .join(', ')
}
// Offre : 2 pizzas Sénior ou Méga achetées = la 3ème offerte (la moins chère de chaque trio)
export const isOfferPizza=id=>/^pizzas:[^:]+:(senior|mega)$/.test(String(id))
export function pizzaOffer(lines, type = 'emporter'){
 if(RESTAURANT_CONFIG?.features?.pizzaDeals === false) return 0
 if(type && type !== 'emporter') return 0
 const u=[];lines.filter(l=>isOfferPizza(l.id)).forEach(l=>{for(let i=0;i<l.qty;i++)u.push(l.price)})
 u.sort((a,b)=>b-a)
 let free=0;for(let i=2;i<u.length;i+=3)free+=u[i]
 return free
}
// Canette 33cl : 1,50 € seule, 1,00 € dès qu'il y a au moins un plat (hors boisson) dans la commande
export const CANETTE_ID='boissons:canettes-33cl'
export const CANETTE_WITH_FOOD_CENTS=100
const isDrinkLine=l=>String(l.id).startsWith('boissons:')||String(l.cat||'').toLowerCase()==='boissons'
export const hasFood=lines=>lines.some(l=>!isDrinkLine(l))
// lines : [{id,qty,price,cat?}] -> remise totale en centimes
export function canetteDeal(lines){
 if(RESTAURANT_CONFIG?.features?.drinkDeals === false) return 0;
 if(!hasFood(lines))return 0
 return lines.filter(l=>l.id===CANETTE_ID).reduce((s,l)=>s+Math.max(0,l.price-CANETTE_WITH_FOOD_CENTS)*l.qty,0)
}
// Business rules taken from the site/flyer text
export const RULES={
 deliveryMin: RESTAURANT_CONFIG?.delivery?.minOrderCents ?? 2500,
 deliveryFree: RESTAURANT_CONFIG?.delivery?.freeDeliveryAboveCents ?? 2500,
 tz: 'Europe/Paris'
}
export const DEFAULT_SCHEDULE = RESTAURANT_CONFIG?.schedule || {
 weekly: {
  lun: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
  mar: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
  mer: { open: false, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
  jeu: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' },
  ven: { open: true, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:30' },
  sam: { open: true, lunchStart: '11:00', lunchEnd: '15:00', eveStart: '18:00', eveEnd: '23:30' },
  dim: { open: false, lunchStart: '11:00', lunchEnd: '14:30', eveStart: '18:00', eveEnd: '23:00' }
 },
 exceptions: []
}

export function getParisTime(d=new Date()){
 const p=new Intl.DateTimeFormat('en-US',{timeZone:RULES.tz,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d)
 const g=k=>(p.find(x=>x.type===k)||{}).value||''
 const hour=+g('hour')%24
 const minute=+g('minute')
 const m=hour*60+minute
 const dateStr=`${g('year')}-${g('month')}-${g('day')}`
 const rawWd=g('weekday').toLowerCase().slice(0,3)
 const DAY_MAP={mon:'lun',tue:'mar',wed:'mer',thu:'jeu',fri:'ven',sat:'sam',sun:'dim',lun:'lun',mar:'mar',mer:'mer',jeu:'jeu',ven:'ven',sam:'sam',dim:'dim'}
 const dayPart=DAY_MAP[rawWd]||rawWd
 return { hour, minute, m, dateStr, dayPart }
}

export function isInSlot(m, startStr, endStr){
 if(!startStr || !endStr) return false
 const [h1, m1] = startStr.split(':').map(Number)
 const [h2, m2] = endStr.split(':').map(Number)
 const t1 = h1 * 60 + m1
 let t2 = h2 * 60 + m2
 if(t2 === 0 && (h2 === 0 && m2 === 0)){
  t2 = 1440 // 00:00 midnight closing
 } else if(t2 < t1){
  return m >= t1 || m < t2
 }
 return m >= t1 && m < t2
}

export function isOpen(d=new Date(), schedule=null){
 const { m, dateStr, dayPart } = getParisTime(d)
 const activeSched = (schedule && schedule.weekly) ? schedule : DEFAULT_SCHEDULE

 // 1. Check Date Exceptions first (highest priority)
 if(activeSched && Array.isArray(activeSched.exceptions)){
  const exc=activeSched.exceptions.find(e=>e.date===dateStr)
  if(exc){
   if(exc.type==='closed') return false
   if(exc.type==='open'){
    return isInSlot(m, exc.start||'00:00', exc.end||'23:59')
   }
  }
 }

 // 2. Check Weekly Schedule
 if(activeSched && activeSched.weekly){
  const dayConf=activeSched.weekly[dayPart]
  if(dayConf){
   if(dayConf.open===false) return false
   const inLunch = isInSlot(m, dayConf.lunchStart, dayConf.lunchEnd)
   const inEve = isInSlot(m, dayConf.eveStart, dayConf.eveEnd)
   const inExtra = Array.isArray(dayConf.extraSlots) && dayConf.extraSlots.some(slot => isInSlot(m, slot.start, slot.end))
   return inLunch || inEve || inExtra
  }
 }

 // 3. Fallback for legacy schedule.hours
 if(schedule && schedule.lunchStart && schedule.lunchEnd){
  const inLunch = isInSlot(m, schedule.lunchStart, schedule.lunchEnd)
  const inEve = isInSlot(m, schedule.eveStart, schedule.eveEnd)
  return inLunch || inEve
 }

 return false
}
export function totalOf(lines){return lines.reduce((s,l)=>s+CATALOG[l.id].price*l.qty,0)}
