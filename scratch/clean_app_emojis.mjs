import fs from 'fs';

// 1. Clean App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Header phone icon & cart
app = app.replace(
  `<span className="phone-icon">📞</span>`,
  `<span className="phone-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>`
);

app = app.replace(
  `<span>🛒</span>`,
  `<span className="cart-icon-svg" style={{display:'inline-flex',alignItems:'center'}}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 7h12l-1 12H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg></span>`
);

// Minimal Hero actions
app = app.replace(
  `<a className="minimal-hero-tel" href={TEL}>📞 {cfgC.phone}</a>`,
  `<a className="minimal-hero-tel" href={TEL}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}} aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{cfgC.phone}</a>`
);

// Hero trust bar
app = app.replace(
  `            <span className="trust-star">★ 4.9</span>
            <span className="trust-text">180+ avis Google</span>
          </div>
          <span className="trust-sep">•</span>
          <div className="trust-item">
            <span>🔥</span>
            <span className="trust-text">Pâte maturée 48h</span>
          </div>
          <span className="trust-sep">•</span>
          <div className="trust-item">
            <span>⚡</span>
            <span className="trust-text">Livraison 25–35 min</span>`,
  `            <span className="trust-star">★ 4.9</span>
            <span className="trust-text">Avis Google vérifiés</span>
          </div>
          <span className="trust-sep">•</span>
          <div className="trust-item">
            <span className="trust-subtle">Fait maison</span>
            <span className="trust-text">Pâte maturée 48h</span>
          </div>
          <span className="trust-sep">•</span>
          <div className="trust-item">
            <span className="trust-subtle">Express</span>
            <span className="trust-text">Livraison 25–35 min</span>`
);

// Badges on food cards
app = app.replace(
  `const badgeText = isBestSeller ? '⭐ Best-Seller' : (isChefsPick ? '✨ Coup de cœur' : null)`,
  `const badgeText = isBestSeller ? 'Best-seller' : (isChefsPick ? 'Sélection du Chef' : null)`
);

// Placeholder food card
app = app.replace(
  `<span>🍽️</span>`,
  `<span style={{color:'var(--nude-accent,#A3785E)',opacity:0.4}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2v20"/><path d="M18 8a3 3 0 0 0 3-3V2h-6v3a3 3 0 0 0 3 3z"/><path d="M6 2v20"/><path d="M3 2v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2"/></svg></span>`
);

// Offer strip
app = app.replace(
  `<span>🍕 2 pizzas achetées = la 3ème offerte à emporter</span>`,
  `<span>2 pizzas achetées = la 3ème offerte à emporter</span>`
);

// Category pill icons -> clean typography
app = app.replace(
  `const icon = x.id === 'pizzas' ? '🍕 ' : x.id === 'burgers' ? '🍔 ' : x.id === 'salades' ? '🥗 ' : x.id === 'texmex' ? '🍗 ' : x.id === 'desserts' ? '🍰 ' : x.id === 'boissons' ? '🥤 ' : '✨ '`,
  `const icon = ''`
);

// Info cards icons
app = app.replace(
  `<span className="info-card-icon">🚲</span>`,
  `<span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></span>`
);

app = app.replace(
  `<span className="info-card-icon">📍</span>`,
  `<span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>`
);

app = app.replace(
  `<a className="btn outline" href={TEL}>📞 {cfgC.phone}</a>`,
  `<a className="btn outline" href={TEL}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}} aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{cfgC.phone}</a>`
);

app = app.replace(
  `<a className="btn red" href={MAPS} target="_blank" rel="noopener">🗺️ Google Maps</a>`,
  `<a className="btn red" href={MAPS} target="_blank" rel="noopener">Itinéraire Google Maps</a>`
);

app = app.replace(
  `<span className="info-card-icon">🕒</span>`,
  `<span className="info-card-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>`
);

fs.writeFileSync('src/App.jsx', app, 'utf8');
console.log('App.jsx cleaned!');
