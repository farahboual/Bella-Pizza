// Write corrected shared/catalog.js with clean UTF-8 content.
import fs from 'node:fs';

const lines = [
  '// Single source of truth for orderable items + prices (in cents).',
  '// The server recomputes every total from this file; the browser never decides the price.',
  "import {pz,tom,cre,T,C,SZ,CATS,addOnsFor,slug} from './menuData.js'",
  "const cents=s=>s?Math.round(parseFloat(String(s).replace(/[^0-9,]/g,'').replace(',','.'))*100):null",
  "export const eur=c=>(c/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})",
  'export function buildCatalog(){',
  ' const m={}',
  ' const add=(id,name,desc,cat,price)=>{if(price)m[id]={id,name,desc:desc||'',cat,price}}',
  ' SZ.forEach(([sz,p],i)=>{',
  "  const all=[...pz(tom,T),...pz(cre,C),['LATINA','Sauce BBQ, fromage, viande hachée, merguez']]",
  '  all.forEach(([n,d])=>add(`pizzas:${slug(n)}:${slug(sz)}`,`Pizza ${n} · ${sz}`,d,\'Pizzas\',cents(p)))',
  ' })',
  ' CATS.filter(c=>!c.pizza).forEach(c=>{',
  '   c.items.forEach(([n,d,p])=>add(`${c.id}:${slug(n)}`,`${c.t===\'Boissons\'?\'\':c.t.replace(/s$/,\'\')+\' \'+n}`.trim(),d,c.t,cents(p||c.p)))',
  "   const ap=c.t==='Boissons'?'':c.t.replace(/s$/,'')",
  '   addOnsFor(c).forEach(a=>add(a.id,`${ap} · ${a.label}`,`Option pour ${c.t}`,\'Options\',cents(a.price)))',
  ' })',
  " add('pizzas:offer:3eme','Pizza 3ème gratuite','Offre : 2 pizzas Sénior ou Méga → 3ème gratuite','Options',0)",
  ' return m',
  '}',
  "export const CATALOG=buildCatalog()",
  '// Business rules taken from the site/flyer text',
  "export const RULES={deliveryMin:2500,deliveryFree:2500,tz:'Europe/Paris'}",
  'export function isOpen(d=new Date()){',
  " const p=new Intl.DateTimeFormat('fr-FR',{timeZone:RULES.tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d)",
  " const g=k=>p.find(x=>x.type==k).value,m=(+g('hour')%24)*60+ +g('minute'),sun=g('weekday').startsWith('dim')",
  ' return (!sun&&m>=660&&m<870)||(m>=1080&&m<1380)',
  '}',
  "export function totalOf(lines){return lines.reduce((s,l)=>s+CATALOG[l.id].price*l.qty,0)}",
  '}',
];

fs.writeFileSync('shared/catalog.js', lines.join('\n') + '\n', 'utf8');
console.log('wrote catalog.js', fs.statSync('shared/catalog.js').size, 'bytes');
