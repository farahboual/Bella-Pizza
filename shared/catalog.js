// Single source of truth for orderable items + prices (in cents).
// The server recomputes every total from this file; the browser never decides the price.
import {pz,tom,cre,T,C,SZ,CATS} from './menuData.js'
const cents=s=>s?Math.round(parseFloat(s.replace(/[^\d,]/g,'').replace(',','.'))*100):null
export const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const eur=c=>(c/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})
export function buildCatalog(){
 const m={}
 const add=(id,name,desc,cat,price)=>{if(price)m[id]={id,name,desc:desc||'',cat,price}}
 SZ.forEach(([sz,p],i)=>{
  const all=[...pz(tom,T),...pz(cre,C),['LATINA','Sauce BBQ, fromage, viande hachée, merguez']]
  all.forEach(([n,d])=>add(`pizzas:${slug(n)}:${slug(sz)}`,`Pizza ${n} · ${sz}`,d,'Pizzas',cents(p)))
 })
 CATS.filter(c=>!c.pizza).forEach(c=>c.items.forEach(([n,d,p])=>
  add(`${c.id}:${slug(n)}`,`${c.t==='Boissons'?'':c.t.replace(/s$/,'')+' '}${n}`.trim(),d,c.t,cents(p||c.p))))
 return m
}
export const CATALOG=buildCatalog()
// Options choisies par le client (liste unique des sauces = celle du menu Tacos)
export const SAUCES=(CATS.find(c=>c.id==='tacos')||{}).sauces||[]
export const SUPP_CENTS=50
export const OPT_CATS=['tacos','burgers','sandwichs']
export const hasOpts=id=>OPT_CATS.includes(String(id).split(':')[0])
export const cleanOpts=(id,o)=>hasOpts(id)?{sauce:SAUCES.includes(o&&o.sauce)?o.sauce:'',supp:!!(o&&o.supp)}:{sauce:'',supp:false}
export const optExtra=(id,o)=>cleanOpts(id,o).supp?SUPP_CENTS:0
export const optLabel=(id,o)=>{const c=cleanOpts(id,o);return [c.sauce&&'sauce '+c.sauce,c.supp&&'supp. viande'].filter(Boolean).join(', ')}
// Offre : 2 pizzas Sénior ou Méga achetées = la 3ème offerte (la moins chère de chaque trio)
export const isOfferPizza=id=>/^pizzas:[^:]+:(senior|mega)$/.test(String(id))
export function pizzaOffer(lines){
 const u=[];lines.filter(l=>isOfferPizza(l.id)).forEach(l=>{for(let i=0;i<l.qty;i++)u.push(l.price)})
 u.sort((a,b)=>b-a)
 let free=0;for(let i=2;i<u.length;i+=3)free+=u[i]
 return free
}
// Business rules taken from the site/flyer text
export const RULES={deliveryMin:2500,deliveryFree:2500,tz:'Europe/Paris'}
export function isOpen(d=new Date()){
 const p=new Intl.DateTimeFormat('fr-FR',{timeZone:RULES.tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d)
 const g=k=>p.find(x=>x.type==k).value,m=(+g('hour')%24)*60+ +g('minute'),sun=g('weekday').startsWith('dim')
 return (!sun&&m>=660&&m<870)||(m>=1080&&m<1380)
}
export function totalOf(lines){return lines.reduce((s,l)=>s+CATALOG[l.id].price*l.qty,0)}
