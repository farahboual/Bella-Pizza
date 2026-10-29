const T="Sauce tomate maison, mozzarella Fior di Latte, ";
const C="Crème fraîche, mozzarella Fior di Latte, ";

// Pizzas Classiques – sauce tomate
const tom="MARGHERITA|Tomate pelée, mozzarella Fior di Latte, huile d'olive, basilic frais;REGINA|Tomate pelée, mozzarella Fior di Latte, champignons frais, jambon, origan;POLLO|Crème fraîche, mozzarella Fior di Latte, émincé de poulet, oignons, champignons, parmesan;4 FORMAGGI|Tomate pelée, mozzarella Fior di Latte, gorgonzola, brie, stracciatella di burrata, persil;ORIENTAL|Tomate pelée, mozzarella Fior di Latte, merguez, poivrons, oignons, olives, oeuf;VÉGÉTARIENNE|Tomate pelée, mozzarella Fior di Latte, champignons, poivron, artichauts, roquette, tomate cerise;BOURSIN|Crème Boursin, mozzarella Fior di Latte, viande hachée, oeuf;MEXICAINE|Tomate pelée, mozzarella Fior di Latte, merguez, viande hachée, oeuf;PEPPERONI|Tomate pelée, mozzarella Fior di Latte, pepperoni, gorgonzola;REALTO|Tomate pelée, mozzarella Fior di Latte, merguez, chorizo, poivron, oignon, chèvre;INDIENNE|Crème fraîche, mozzarella Fior di Latte, poulet curry, sauce curry, oignon;4 SEASONS|Tomate pelée, mozzarella, artichaut, poivrons, olives, champignon, jambon, origan;THONO|Tomate pelée, mozzarella Fior di Latte, thon, poivrons, câpres, oignons, olives";

// Pizzas Signature du Chef – crème ou sauce spéciale
const cre="BURRATISSIMA|Burrata crémeuse entière, roquette fraîche, tomates cerises, copeaux de parmesan, crème balsamique;TRAMONTO|Sauce Beach (tomate, persillade), mozzarella Fior di Latte, crevettes royales, mix fruit de mer;FOR LIFE|Tomate pelée, mozzarella Fior di Latte, merguez, chorizo, jambon, viande hachée, sauce barbecue;CHARCUTERIE|Tomate pelée, mozzarella Fior di Latte, chorizo, jambon, lardons;PANAMERA|Crevettes sautées, saumon mariné, mozzarella di bufala, basilic frais, quartier de citron vert;CALZONE (Soufflée)|Tomate pelée, mozzarella, champignons, jambon, origan, oeuf (servie avec salade)";

const pz=(s,b)=>s.split(";").map(x=>{const[n,e]=x.split("|");return[n,e||b.replace(/, $/,"")]});
const SZ=[["Junior","9 €","+1 €"],["Sénior","14 €","+1,50 €"],["Méga","19 €","+2 €"]];
const P=(a)=>a.map(([n,d,p])=>[n,d,p]);
const CATS=[
  {id:"pizzas",t:"Pizzas Artisanales",pizza:1},
  {id:"pates",t:"Les Pâtes",notes:["Penne ou Spaghetti au choix selon la recette"],items:[
    ["Carbonara (Penne)","Lardons, jaunes d'œufs, parmesan","11,90 €"],
    ["4 Formaggi (Pâte au choix)","Brie, gorgonzola, parmesan, emmental","12,50 €"],
    ["Bolognaise (Spaghetti)","Sauce tomate maison, viande hachée, oignons, ail, herbes","11,90 €"],
    ["Pâte Saumon (Penne)","Crème, saumon, herbes fraîches, touche de citron","13,90 €"],
    ["Spaghetti Fruit de Mer","Sauce Beach, crevettes royales, mix fruit de mer, piment, basilic frais","15,90 €"],
    ["Forestière (Penne)","Crème, parmesan, poulet, champignons","12,90 €"],
    ["Pâte Curry (Penne)","Sauce curry, parmesan, poulet curry","12,90 €"]
  ]},
  {id:"gratins",t:"Gratins & Spécialités",items:[
    ["Gratin Fondant Savoyard","Viande au choix (lardons, poulet, chorizo, jambon, viande hachée, merguez), pommes de terre fondantes, crème fraîche, emmental et parmesan","10,90 €"],
    ["Le Gratin du Chef","Pâte penne, crème maison, jambon de dinde, mozzarella, emmental gratiné","10,50 €"],
    ["Panuozzo","Huile d'olive, stracciatella di burrata, tomate cerise, roquette, parmesan, sauce pisto — jambon de dinde, jambon fumé, bacon, chorizo ou saucisson","11,90 €"],
    ["Petite Salade","Laitue verte, tomate cerise, concombre, parmesan","3,00 €"]
  ]},
  {id:"salades",t:"Salades & Bowls",h:"Nos salades fraîches maison",p:"8,50 €",items:[
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
