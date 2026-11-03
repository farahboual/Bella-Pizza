import fs from 'fs';

// Clean cart.jsx
let cart = fs.readFileSync('src/cart.jsx', 'utf8');

// Upsell title
cart = cart.replace(
  `<span>✨ Envie d'une douceur ou d'une boisson fraîche ?</span>`,
  `<span>Suggestions gourmandes & boissons fraîches</span>`
);

// Upsell candidates icons in array
cart = cart.replace(
  `const UPSELL_CANDIDATES = [
  { id: 'boissons:canettes-33cl', name: 'Canette 33cl fraîche', icon: '🥤', fallbackPrice: 150 },
  { id: 'desserts:tiramisu', name: 'Tiramisu Maison', icon: '🍰', fallbackPrice: 450 },
  { id: 'desserts:brownies', name: 'Brownie Chocolat', icon: '🍫', fallbackPrice: 390 },
  { id: 'desserts:glace-haagen-dazs', name: 'Häagen-Dazs 100ml', icon: '🍨', fallbackPrice: 420 }
]`,
  `const UPSELL_CANDIDATES = [
  { id: 'boissons:canettes-33cl', name: 'Canette 33cl fraîche', icon: '', fallbackPrice: 150 },
  { id: 'desserts:tiramisu', name: 'Tiramisu Maison', icon: '', fallbackPrice: 450 },
  { id: 'desserts:brownies', name: 'Brownie Chocolat', icon: '', fallbackPrice: 390 },
  { id: 'desserts:glace-haagen-dazs', name: 'Häagen-Dazs 100ml', icon: '', fallbackPrice: 420 }
]`
);

// Notes and deals
cart = cart.replace(
  `{offer>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>🍕 3ème pizza offerte : -{eur(offer)}</p>}`,
  `{offer>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>3ème pizza offerte : -{eur(offer)}</p>}`
);

cart = cart.replace(
  `{type!=='emporter'&&baseOffer>0&&<p className="note" style={{color:'var(--mute)'}}>ℹ️ L’offre 3ème pizza offerte est réservée aux commandes à emporter.</p>}`,
  `{type!=='emporter'&&baseOffer>0&&<p className="note" style={{color:'var(--mute)'}}>L’offre 3ème pizza offerte est réservée aux commandes à emporter.</p>}`
);

cart = cart.replace(
  `{drinkDeal>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>🥤 Canette à 1 € avec votre plat : -{eur(drinkDeal)}</p>}`,
  `{drinkDeal>0&&<p className="note" style={{color:'var(--green)',fontWeight:700}}>Canette à 1 € avec votre plat : -{eur(drinkDeal)}</p>}`
);

cart = cart.replace(
  `{canetteAlone&&<p className="note">🥤 Canette seule : 1,50 €. Ajoutez un plat et elle passe à 1 €.</p>}`,
  `{canetteAlone&&<p className="note">Canette seule : 1,50 €. Passe à 1,00 € avec un plat.</p>}`
);

// Slot selector
cart = cart.replace(
  `<span style={{fontSize:11.5,color:'var(--mute)'}}>{slot === 'asap' ? '⚡ Immédiat (~25-35 min)' : \`⏰ Pour \${slot}\`}</span>`,
  `<span style={{fontSize:11.5,color:'var(--mute)'}}>{slot === 'asap' ? 'Immédiat (~25-35 min)' : \`Pour \${slot}\`}</span>`
);

// Clean OrderTracker.jsx
let tracker = fs.readFileSync('src/OrderTracker.jsx', 'utf8');

tracker = tracker.replace(
  `title: '👨‍🍳 En préparation en cuisine',`,
  `title: 'En préparation en cuisine',`
);

tracker = tracker.replace(
  `title: order.type === 'livraison' ? '🛵 En cours de livraison !' : '🛍️ Votre commande est prête !',`,
  `title: order.type === 'livraison' ? 'En cours de livraison' : 'Votre commande est prête !',`
);

tracker = tracker.replace(
  `title: '🎉 Commande terminée !',`,
  `title: 'Commande remise & terminée',`
);

tracker = tracker.replace(
  `{cleanWaPhone && (
              <a
                href={\`https://wa.me/\${cleanWaPhone}?text=\${waMsg}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="tracker-action-btn tracker-btn-wa"
              >
                💬 Écrire sur WhatsApp
              </a>
            )}`,
  `{cleanWaPhone && (
              <a
                href={\`https://wa.me/\${cleanWaPhone}?text=\${waMsg}\`}
                target="_blank"
                rel="noopener noreferrer"
                className="tracker-action-btn tracker-btn-wa"
              >
                Écrire sur WhatsApp
              </a>
            )}`
);

fs.writeFileSync('src/cart.jsx', cart, 'utf8');
fs.writeFileSync('src/OrderTracker.jsx', tracker, 'utf8');
console.log('cart.jsx and OrderTracker.jsx cleaned!');
