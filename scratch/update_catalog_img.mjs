import fs from 'node:fs';

let code = fs.readFileSync('shared/catalog.js', 'utf8');

const replacement = `export function buildCatalog(){
 const m={}
 const catImgs=RESTAURANT_CONFIG?.images||{}
 const itemImgs=catImgs.items||{}
 const getImg=(catId,s)=>itemImgs[s]||catImgs[catId]||catImgs.pizzas||'/client-assets/pizza.jpg'
 const add=(id,name,desc,cat,price,img)=>{if(price)m[id]={id,name,desc:desc||'',cat,price,img:img||getImg(cat.toLowerCase(),slug(name))}}
 SZ.forEach(([sz,p],i)=>{
  const all=[...pz(tom,T),...pz(cre,C),['LATINA','Sauce BBQ, fromage, viande hachée, merguez']]
  all.forEach(([n,d])=>{
   const s=slug(n)
   add(\`pizzas:\${s}:\${slug(sz)}\`,\`Pizza \${n} · \${sz}\`,d,'Pizzas',cents(p),getImg('pizzas',s))
  })
 })
 CATS.filter(c=>!c.pizza).forEach(c=>c.items.forEach(([n,d,p])=>{
  const s=slug(n)
  add(\`\${c.id}:\${s}\`,\`\${c.t==='Boissons'?'':c.t.replace(/s$/,'')+' '}\${n}\`.trim(),d,c.t,cents(p||c.p),getImg(c.id,s))
 }))
 return m
}`;

code = code.replace(/export function buildCatalog\(\)[\s\S]*?return m\r?\n\}/, replacement);
fs.writeFileSync('shared/catalog.js', code, 'utf8');
console.log('Successfully updated shared/catalog.js');
