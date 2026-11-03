import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Enrich MinimalHero with Trust Proof Pill (Google Rating + Handcrafted + Delivery time)
const oldHeroContent = `        <div className="minimal-hero-actions">
          <a className="minimal-hero-cta" href="#carte">Voir la carte →</a>
          <a className="minimal-hero-tel" href={TEL}>📞 {cfgC.phone}</a>
        </div>
      </div>
    </section>`;

const newHeroContent = `        <div className="minimal-hero-actions">
          <a className="minimal-hero-cta" href="#carte">Voir la carte →</a>
          <a className="minimal-hero-tel" href={TEL}>📞 {cfgC.phone}</a>
        </div>

        {/* Marketing Trust Proof Bar */}
        <div className="hero-trust-bar">
          <div className="trust-item">
            <span className="trust-star">★ 4.9</span>
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
            <span className="trust-text">Livraison 25–35 min</span>
          </div>
        </div>
      </div>
    </section>`;

code = code.replace(/\r\n/g, '\n');
code = code.replace(oldHeroContent.replace(/\r\n/g, '\n'), newHeroContent);

// 2. Add Best-Seller / Badge logic to FoodCard
const oldFoodCard = `  const cleanName = (n.includes(' ') && n === n.toUpperCase())
    ? n.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())
    : n

  return (
    <div className={'food-card-v' + (out ? ' food-card-out' : '')}>
      {img && !thumbErr ? (
        <div className="food-card-v-img">
          <img src={img} alt={cleanName} loading="lazy" onError={() => setThumbErr(true)} />
        </div>
      ) : (
        <div className="food-card-v-img food-card-v-img-placeholder" aria-hidden="true">
          <span>🍽️</span>
        </div>
      )}
      <div className="food-card-v-body">`;

const newFoodCard = `  const cleanName = (n.includes(' ') && n === n.toUpperCase())
    ? n.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())
    : n

  // Smart marketing highlight badges for video appeal
  const isBestSeller = cleanName.toLowerCase().includes('latina') || cleanName.toLowerCase().includes('margherita') || cleanName.toLowerCase().includes('bacon') || cleanName.toLowerCase().includes('double')
  const isChefsPick = cleanName.toLowerCase().includes('4 fromages') || cleanName.toLowerCase().includes('burrata') || cleanName.toLowerCase().includes('saumon')
  const badgeText = isBestSeller ? '⭐ Best-Seller' : (isChefsPick ? '✨ Coup de cœur' : null)

  return (
    <div className={'food-card-v' + (out ? ' food-card-out' : '')}>
      {badgeText && (
        <span className="food-badge-marketing">{badgeText}</span>
      )}
      {img && !thumbErr ? (
        <div className="food-card-v-img">
          <img src={img} alt={cleanName} loading="lazy" onError={() => setThumbErr(true)} />
        </div>
      ) : (
        <div className="food-card-v-img food-card-v-img-placeholder" aria-hidden="true">
          <span>🍽️</span>
        </div>
      )}
      <div className="food-card-v-body">`;

code = code.replace(oldFoodCard.replace(/\r\n/g, '\n'), newFoodCard);

// 3. Make the Sticky Header glassmorphism and animated
const oldHeaderNav = `<header id="hd">`;
const newHeaderNav = `<header id="hd" className={on ? 'hd-glass-scrolled' : ''}>`;
code = code.replace(oldHeaderNav, newHeaderNav);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx marketing enhancements applied!');
