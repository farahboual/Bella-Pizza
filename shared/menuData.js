const T = "Sauce tomate San Marzano AOP, mozzarella Fior di Latte, basilic frais";
const C = "Crème fraîche di bufala, mozzarella Fior di Latte";

// ── PIZZAS NAPOLITAINES ARTISANALES (6 Signatures) ──
const tom = "MARGHERITA DOP|Tomate San Marzano AOP, mozzarella Fior di Latte, basilic frais, huile d'olive vierge extra;REGINA ROYALE|Sauce tomate San Marzano, mozzarella Fior di Latte, champignons de Paris frais, jambon aux herbes, origan sauvage;DIAVOLA PICCANTE|Sauce tomate San Marzano, mozzarella Fior di Latte, spianata calabrese piquante, piments doux, origan;4 FORMAGGI RUSTICA|Sauce tomate, Fior di Latte, gorgonzola AOP, provolone affiné, copeaux de parmesan 24 mois;BURRATISSIMA DI BELLA|Base tomate San Marzano, burrata crémeuse des Pouilles 125g entière déposée minute, tomates confites, roquette, réduction balsamique;TARTUFO SUPREMA|Crème de truffe noire d'Italie, mozzarella Fior di Latte, champignons sautés, copeaux de parmesan 24 mois";
const cre = "";

const pz = (s, b) => s.split(";").map(x => { const [n, e] = x.split("|"); return [n, e || b] });

const SZ = [["Medium 28cm", "11,50 €", "+1,50 €"], ["Large 33cm", "15,50 €", "+2 €"], ["XXL Partage 40cm", "21,00 €", "+2,50 €"]];

const CATS = [
  { id: "pizzas", t: "Pizzas Napolitaines", pizza: 1 },
  {
    id: "burgers",
    t: "Smash Burgers Gourmets",
    notes: ["Steaks pur bœuf français smashés minute · Pain brioché au beurre toasté · Servi avec frites dorées maison"],
    sauces: ["Sauce Secrète Bella", "Mayo Truffe Noire", "Smoky Barbecue Miel", "Spicy Chili Doux", "Ciboulette Fraîche"],
    items: [
      ["Double Smash Cheese", "2 steaks smashés croustillants, double cheddar maturé 9 mois, pickles maison, sauce secrète Bella", "12,90 €"],
      ["Truffle Smash Burger", "2 steaks smashés, crème de truffe noire d'Italie, provolone fondu, oignons caramélisés", "14,90 €"],
      ["Smokey Bacon BBQ", "2 steaks smashés, bacon fumé au bois de hêtre croustillant, cheddar fondu, sauce barbecue au miel", "13,90 €"],
      ["Crispy Chicken Spicy", "Filet de poulet fermier pané maison ultra-croustillant, coleslaw frais, cheddar fondu, mayo piquante", "12,90 €"]
    ]
  },
  {
    id: "boissons",
    t: "Boissons & Mocktails",
    notes: ["Servies ultra-fraîches avec quartier de citron"],
    items: [
      ["San Pellegrino Limonata", "Citronnade italienne pétillante aux citrons de Sicile 33cl", "3,50 €"],
      ["San Pellegrino Aranciata Rossa", "Orange sanguine pétillante de Sicile 33cl", "3,50 €"],
      ["Coca-Cola Vintage Bouteille Verre", "33cl servi très frais", "3,00 €"],
      ["Fuze Tea Pêche Intense", "Thé noir infusé et pêche blanche 33cl", "3,00 €"]
    ]
  },
  {
    id: "desserts",
    t: "Dolci & Desserts Italiens",
    items: [
      ["Tiramisu Maison Tradizionale", "Recette originale au café expresso Illy, mascarpone aérien et cacao amer Valrhona", "5,50 €"],
      ["Pizza Choco-Noisette & Pistache", "Pâte à pizza napolitaine soufflée, Nutella fondant, éclats de pistaches de Bronte torréfiées", "6,50 €"]
    ]
  }
];

export { T, C, tom, cre, pz, SZ, CATS };
