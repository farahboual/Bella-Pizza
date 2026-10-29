const T="Sauce tomate maison aux herbes, mozzarella fior di latte, ",C="Crème fraîche d'Isigny, mozzarella fior di latte, ";
const tom="BURRATISSIMA|Burrata crémeuse entière, roquette fraîche, tomates cerises, copeaux de parmesan, crème balsamique;PANAMERA|Crevettes sautées, saumon mariné, mozzarella di bufala, basilic frais, quartier de citron vert;THON DE PASSION|Thon germon mariné, poivrons marinés, tomates cerises confites, olives, basilic frais;4 FROMAGES TRAMONTO|Gorgonzola AOP, mozzarella fior di latte, parmesan affiné 24 mois, chèvre crémeux;CLASSICA|basilic frais, huile d'olive vierge, mozzarella fior di latte;REGINA|champignons de Paris frais, jambon blanc aux herbes, mozzarella;CALZONE (Soufflée)|jambon blanc, œuf bio, mozzarella fondante;CHORIZO|tomates cerises confites, chorizo ibérique, olives;VÉGÉTARIENNE|champignons, poivrons marinés, tomates fraîches, oignons, olives;ORIENTALE|merguez de bœuf/agneau, oignons, poivrons, œuf bio, olives";
const cre="SAVOYARDE|bacon croustillant, champignons de Paris, œuf bio;MONTAGNARDE|fromage à raclette affiné, bacon, pommes de terre;CARNIVORE|bœuf haché, merguez, jambon blanc, poulet mariné;TARTIFLETTE|lardons fumés, pommes grenailles, reblochon fermier AOP;MIEL|fromage de chèvre affiné, filet de miel de fleurs;CURRY|sauce curry douce maison, poulet rôti fermier";
const pz=(s,b)=>s.split(";").map(x=>{const[n,e]=x.split("|");return[n,e||b.replace(/, $/,"")]});
const SZ=[["Junior","9 €","+1 €"],["Sénior","14 €","+1,50 €"],["Méga","19 €","+2 €"]];
const P=(a)=>a.map(([n,d,p])=>[n,d,p]);
const CATS=[
  {id:"pizzas",t:"Pizzas Artisanales",pizza:1},
  {id:"burgers",t:"Burgers Gourmets",notes:["Pain brioché artisanal · Frites fraîches incluses","+1 € avec boisson fraîche 33cl"],items:[
    ["Cheese","Steak façon bouchère 150g, cheddar affiné, oignons caramélisés, sauce maison","9,50 €"],
    ["DB Cheese","2 Steaks façon bouchère, double cheddar affiné, sauce fumée maison","11,50 €"],
    ["Triple Cheese","3 Steaks façon bouchère, triple cheddar affiné, cornichons doux","13,50 €"],
    ["Fish","Filet de cabillaud pané croustillant, sauce tartare maison, cheddar","9,50 €"],
    ["Chicken","Filet de poulet croustillant mariné maison, cheddar fondu, sauce ciboulette","9,50 €"],
    ["Royal Chèvre","Steak boucher 150g, chèvre chaud au miel de fleurs, roquette, oignons rouges","12,00 €"],
    ["Royal Chicken","Poulet croustillant, galette de pomme de terre dorée, œuf au plat, cheddar","12,50 €"]
  ]},
  {id:"salades",t:"Salades & Bowls",h:"Nos salades fraîches maison",p:"8,50 €",items:[
    ["Pacifique","Mesclun croquant, saumon fumé d'Écosse, avocat frais, graines de sésame dorées","9,50 €"],
    ["Niçoise","Mesclun, thon germon, pommes grenailles, œufs mollets, olives taggiasche","8,50 €"],
    ["Chèvre chaud","Mesclun, toasts dorés au chèvre chaud, miel de fleurs, cerneaux de noix","9,00 €"],
    ["Exotique","Mesclun, crevettes marinées, avocat frais, mangue, sauce cocktail douce","9,50 €"],
    ["Campagnarde","Mesclun, pommes grenailles, effiloché de poulet fermier rôti, concombre, œuf mollet","9,00 €"]
  ]},
  {id:"texmex",t:"Entrées & Tapas",items:[
    ["Mozza sticks","8 pièces au cœur de mozzarella fondante + sauce dip au choix","7,50 €"],
    ["Chicken wings","8 pièces croustillantes marinées aux épices douces + sauce barbecue","8,50 €"],
    ["Tenders","6 aiguillettes de filet de poulet croustillant pané maison","8,50 €"],
    ["Calamars","Calamars dorés croustillants + quartier de citron et sauce tartare","8,00 €"],
    ["Onion rings","8 rondelles d'oignons dorées et croustillantes","6,00 €"],
    ["Frites","Frites fraîches maison dorées à souhait","3,50 €"],
    ["Potatoes","Pommes grenailles rôties aux herbes de Provence","4,00 €"]
  ]},
  {id:"desserts",t:"Desserts Maison",items:[
    ["Brownies","Brownie fondant chocolat noir 70% et éclats de noix de pécan","3,00 €"],
    ["Tiramisu","Tiramisu artisanal au café expresso et mascarpone onctueux","4,50 €"],
    ["Tarte citron ou pommes","Tartelette artisanale pur beurre","4,00 €"],
    ["Glace Häagen-Dazs","Pot individuel 95ml aux parfums gourmands","3,90 €"]
  ]},
  {id:"boissons",t:"Boissons Fraîches",notes:["Canette 33cl : 1 € avec un plat · 2,00 € seule"],items:[
    ["Canettes 33cl","Coca-Cola, Coca Zéro, San Pellegrino, Fuze Tea, Orangina","2,00 €"],
    ["Maxi 1,5L","Coca-Cola, Coca Zéro, Fanta, Ice Tea","3,90 €"],
    ["Maxi Oasis 2L","Oasis Tropical format familial","4,50 €"]
  ]}
];
export {T,C,tom,cre,pz,SZ,CATS}
