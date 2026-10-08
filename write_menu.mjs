// Write corrected menuData.js with clean UTF-8 content.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(process.cwd(), '..');

const lines = [
  'const T="Sauce tomate, fromage, ",C="Crème fraîche, fromage, ";',
  'const tom="CLASSICA|;REGINA|champignons, jambon;CAMPIONE|viande hachée, champignons;MIAMI|jambon, œuf;NAPOLITAINE|anchois, câpres, olives;CALZONE (Soufflée)|jambon, œuf;HAWAÏENNE|jambon, ananas;NEPTUNE|thon, olives, œuf;CHORIZO|tomates fraîches, chorizo, olives;SPÉCIALE|jambon, oignons, poivrons, chèvre;FRUITS DE MER|fruits de mer, persillade;3 JAMBONS|jambon, chorizo, lardons;EXTRÊME|viande hachée, chorizo;BOLOGNAISE|viande hachée, P.de terre, oignons;4 FROMAGES|parmesan, bleu, brie, chèvre;VÉGÉTARIENNE|champignons, poivrons, tomates fraîches, oignons, olives;CHEESE BURGER|viande hachée, merguez, œuf;BOURSIN|viande hachée, boursin;MEXICAINE|merguez, viande hachée, poivrons;FAJITAS|poulet, ail, oignons, poivrons;INDIENNE|viande hachée, poulet crème fraîche;PAYSANNE|lardons, champignons, œuf;4 SAISONS|jambon, artichauts, poivrons, champignons, olives;ORIENTALE|merguez, oignons, poivrons, œuf, olives";',
  'const cre="SAVOYARDE|bacon, champignons, œuf;FERMIÈRE|jambon, pomme de terre, champignons, œuf;MONTAGNARDE|raclette, bacon, pommes de terre;CARNIVORE|viande hachée, merguez, jambon, poulet, chorizo;CAMPAGNARDE|poulet, champignons;PARISIENNE|jambon, pomme de terre;REINE BLANCHE|jambon, champignons;CHICKEN|poulet, pomme de terre, œuf;GORFA|viande hachée, oignons, chèvre;ROMANA|saumon fumé, citron;TARTIFLETTE|lardons, P. de terre, reblochon;BLANCHE NEIGE|gorgonzola, brie, parmesan, chèvre;MIEL|chèvre, miel;CURRY|sauce curry, poulet rôti";',
  'const pz=(s,b)=>s.split(";").map(x=>{const[n,e]=x.split("|");return[n,e||b.replace(/, $/,"")]});',
  'const SZ=[["Junior","9 €","+1 €"],["Sénior","14 €","+1,50 €"],["Méga","19 €","+2 €"]];',
  'const P=(a)=>a.map(([n,d,p])=>[n,d,p]);',
  'const slug=s=>s.normalize("NFD").replace(/[àáâãäåèéêëìíîïòóôõöùúûüýÿÀÉÈÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸ]/g,c=>{const m={"àáâãäå":"a","èéêë":"e","ìíîï":"i","òóôõö":"o","ùúûüýÿ":"u","ÀÉÈÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸ":"E"};return m[c.toLowerCase()]||c;}).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-$/g,"");',
  'const addOnsFor=c=>{',
  '  const list=[];',
  '  if(c.sauces) c.sauces.forEach(s=>list.push({id:"sauces:"+c.id+":"+slug(s),label:"Sauce "+s,price:c.saucePrice||"0,50 €",multiple:true}));',
  '  if(c.supp) list.push({id:"supp:"+c.id+":viande",label:c.supp+" ajoutée",price:c.suppPrice||"0,50 €"});',
  '  if(c.boisson) list.push({id:"boisson:"+c.id,label:c.boissonLabel||"Boisson 33cl",price:c.boissonPrice||"1,00 €"});',
  '  return list;',
  '};',
  'const CATS=[',
  ' {id:"pizzas",t:"Pizzas",pizza:1,offer:{sizes:["Sénior","Méga"],label:"Achetez 2 pizzas Sénior ou Méga → la 3ème gratuite"}},',
  ' {id:"tacos",t:"Tacos",h:"1 viande au choix",p:"8,50 €",supp:"Viande",sauces:["Algérienne","Harissa","Curry","Ketchup","Mayonnaise","Blanche","Barbecue","Samouraï"],boisson:true,boissonLabel:"Boisson 33cl",suppPrice:"0,50 €",saucePrice:"0,50 €",boissonPrice:"1,00 €",notes:["+1 € boisson 33cl"]},',
  ' {id:"burgers",t:"Burgers",supp:"Viande",sauces:["Algérienne","Harissa","Curry","Ketchup","Mayonnaise","Blanche","Barbecue","Samouraï"],boisson:true,boissonLabel:"Boisson 33cl",suppPrice:"0,50 €",saucePrice:"0,50 €",boissonPrice:"1,00 €",notes:[]},',
  ' {id:"sandwichs",t:"Sandwichs",supp:"Viande",sauces:["Algérienne","Harissa","Curry","Ketchup","Mayonnaise","Blanche","Barbecue","Samouraï"],boisson:true,boissonLabel:"Boisson 33cl",suppPrice:"0,50 €",saucePrice:"0,50 €",boissonPrice:"1,00 €",notes:[]},',
  ' {id:"paninis",t:"Paninis",h:"Nos paninis",p:"6,00 €",notes:["+1 € boisson 33cl"],items:[["3 Fromages"],["Jambon"],["Poulet"],["Saumon"],["Kebab"],["Thon"]]},',
  ' {id:"zapwich",t:"Zapwich",h:"Nos zapwich",p:"7,00 €",notes:["Servis avec sauce tomate OU crème fraîche","+1 € boisson 33cl"],items:[["Zap’ Merguez"],["Zap’ Steak"],["Zap’ Thon"],["Zap’ Poulet"],["Zap’ Jambon"],["Zap’ Saumon"],["Zap’ 3 Fromages"]]},',
  ' {id:"salades",t:"Salades",h:"Nos salades",p:"6,00 €",items:[["Pacifique","Salade, tomates, saumon fumé, avocat"],["Niçoise","Salade, tomates, thon, pomme de terre, maïs"],["Chèvre chaud","Salade, tomates, chèvre chaud sur toast, lardons"],["Exotique","Salade, tomates, sauce cocktail, avocat, crevettes, maïs"],["Campagnarde","Salade, tomates, pommes de terre, poulet, concombre, œuf"]]},',
  ' {id:"texmex",t:"Tex-Mex",items:[["Chicken wings","10pcs + sauce","9,00 €"],["Nuggets","10pcs + sauce","9,00 €"],["Calamars","10pcs + sauce","9,00 €"],["Onion rings","10pcs + sauce","9,00 €"],["Tenders","10pcs + sauce","9,00 €"],["Mozza sticks","10pcs + sauce","9,00 €"],["Frites","+ sauce","2,00 €"],["Potatoes","+ sauce","3,00 €"]]},',
  ' {id:"desserts",t:"Desserts",items:[["Brownies","","3,00 €"],["Tarte citron ou pommes","","3,00 €"],["Tiramisu","Demandez nos parfums disponibles","3,00 €"],["Glace Häagen-Dazs","95ml","3,00 €"]]},',
  ' {id:"boissons",t:"Boissons",items:[["Canettes 33cl","Coca, Fanta, Tropico, Schweppes, Ice Tea, Oasis, Perrier, 7Up Mojito","1,50 €"],["Maxi 1,5L","Coca-Cola, Coca Zéro, Fanta, Ice Tea, Orangina","3,90 €"],["Maxi Oasis 2L","","3,90 €"]]}',
  '];',
  'export {T,C,tom,cre,pz,SZ,CATS,addOnsFor};',
];

const f = path.join(ROOT, 'shared', 'menuData.js');
fs.writeFileSync(f, lines.join('\n') + '\n', 'utf8');
console.log('wrote', fs.statSync(f).size, 'bytes');
console.log('sha1', crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex'));
