import fs from 'fs';

let s = fs.readFileSync('shared/menuData.js', 'utf8');

const newTom = 'const tom="BURRATISSIMA|Burrata crémeuse entière, roquette fraîche, tomates cerises, copeaux de parmesan, crème balsamique;PANAMERA|Crevettes sautées, saumon mariné, mozzarella di bufala, basilic frais, quartier de citron vert;THON DE PASSION|Thon germon mariné, poivrons marinés, tomates cerises confites, olives, basilic frais;4 FROMAGES TRAMONTO|Gorgonzola AOP, mozzarella fior di latte, parmesan affiné 24 mois, chèvre crémeux;CLASSICA|basilic frais, huile d\'olive vierge, mozzarella fior di latte;REGINA|champignons de Paris frais, jambon blanc aux herbes, mozzarella;CALZONE (Soufflée)|jambon blanc, œuf bio, mozzarella fondante;CHORIZO|tomates cerises confites, chorizo ibérique, olives;VÉGÉTARIENNE|champignons, poivrons marinés, tomates fraîches, oignons, olives;ORIENTALE|merguez de bœuf/agneau, oignons, poivrons, œuf bio, olives";';
const newCre = 'const cre="SAVOYARDE|bacon croustillant, champignons de Paris, œuf bio;MONTAGNARDE|fromage à raclette affiné, bacon, pommes de terre;CARNIVORE|bœuf haché, merguez, jambon blanc, poulet mariné;TARTIFLETTE|lardons fumés, pommes grenailles, reblochon fermier AOP;MIEL|fromage de chèvre affiné, filet de miel de fleurs;CURRY|sauce curry douce maison, poulet rôti fermier";';

s = s.replace(/const tom="[^"]+";/, newTom);
s = s.replace(/const cre="[^"]+";/, newCre);

// Also let's update desserts to put Tiramisu Tramonto first
s = s.replace('["Brownies","Brownie fondant chocolat noir 70% et éclats de noix de pécan","3,00 €"],\n    ["Tiramisu","Tiramisu artisanal au café expresso et mascarpone onctueux","4,50 €"],', '["Tiramisu Maison Tramonto","Tiramisu artisanal au café expresso et mascarpone onctueux en bocal doré","4,50 €"],\n    ["Brownies","Brownie fondant chocolat noir 70% et éclats de noix de pécan","3,00 €"],');

fs.writeFileSync('shared/menuData.js', s, 'utf8');
console.log('menuData.js updated with Tramonto dishes!');
