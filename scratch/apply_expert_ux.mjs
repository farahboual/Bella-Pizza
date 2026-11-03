import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// ─── 1. FIX HEADER: phone icon only on mobile, clean cart glow ───────────────
const oldHeader = `  return (
    <header id="hd">
      <a href="#top" aria-label={\`\${cfgB.name} — accueil\`}>
        <Logo />
      </a>

      {/* Clean luxury navigation */}
      <nav className="luxury-nav" aria-label="Navigation principale">
        <a href="#savoir-faire" className="luxury-nav-link">Savoir-Faire</a>
        <a href="#carte" className="luxury-nav-link">La Carte</a>
        <a href="#restaurant" className="luxury-nav-link">Livraison &amp; Accès</a>
        <a href="#restaurant" className="luxury-nav-link">Horaires</a>
      </nav>

      {/* Right actions: phone + luxury cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a className="luxury-phone-btn" href={TEL}>
          📞 {cfgC.phone}
        </a>
        <button
          className="luxury-cart-btn"
          onClick={() => openCart(true)}
          aria-label="Voir le panier"
        >
          <span>🛒</span>
          {count > 0 ? (
            <>
              <b>{count}</b>
              <span>{eur(total)}</span>
            </>
          ) : (
            <span>Panier</span>
          )}
        </button>
      </div>
    </header>
  )`;

const newHeader = `  return (
    <header id="hd">
      <a href="#top" aria-label={\`\${cfgB.name} — accueil\`}>
        <Logo />
      </a>

      {/* Clean luxury navigation */}
      <nav className="luxury-nav" aria-label="Navigation principale">
        <a href="#carte" className="luxury-nav-link">La Carte</a>
        <a href="#restaurant" className="luxury-nav-link">Livraison &amp; Accès</a>
        <a href="#restaurant" className="luxury-nav-link">Horaires</a>
      </nav>

      {/* Right actions: phone icon (desktop shows number, mobile icon only) + cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a className="luxury-phone-btn" href={TEL} aria-label={\`Appeler le \${cfgC.phone}\`}>
          <span className="phone-icon">📞</span>
          <span className="phone-number">{cfgC.phone}</span>
        </a>
        <button
          className={\`luxury-cart-btn\${count > 0 ? ' cart-has-items' : ''}\`}
          onClick={() => openCart(true)}
          aria-label="Voir le panier"
        >
          <span>🛒</span>
          {count > 0 ? (
            <>
              <b>{count}</b>
              <span>{eur(total)}</span>
            </>
          ) : (
            <span className="cart-empty-label">Panier</span>
          )}
        </button>
      </div>
    </header>
  )`;

if (!code.includes(oldHeader)) { console.error('Header not found'); process.exit(1); }
code = code.replace(oldHeader, newHeader);

// ─── 2. ADD MINIMAL HERO before Menu ─────────────────────────────────────────
// Insert MinimalHero component before Menu function
const beforeMenu = `// FoodCard (Uber Eats / Deliveroo style clean card)`;
const heroComponent = `function MinimalHero() {
  return (
    <section className="minimal-hero" id="top">
      <div
        className="minimal-hero-bg"
        style={{ backgroundImage: \`url(/client-assets/hero.jpg)\` }}
        aria-hidden="true"
      />
      <div className="minimal-hero-overlay" aria-hidden="true" />
      <div className="minimal-hero-content">
        <span className="minimal-hero-badge">
          <span className="dot-live" />
          Cuisine artisanale · Produits frais
        </span>
        <h1 className="minimal-hero-title">
          {cfgB.heroTitle || 'Le goût des'}{' '}
          <em>{cfgB.heroHighlight || 'bonnes choses.'}</em>
        </h1>
        <p className="minimal-hero-sub">{cfgB.tagline}</p>
        <div className="minimal-hero-actions">
          <a className="minimal-hero-cta" href="#carte">Voir la carte →</a>
          <a className="minimal-hero-tel" href={TEL}>📞 {cfgC.phone}</a>
        </div>
      </div>
    </section>
  )
}

// FoodCard (Uber Eats / Deliveroo style clean card)`;

code = code.replace(beforeMenu, heroComponent);

// ─── 3. ADD MinimalHero to App render ────────────────────────────────────────
code = code.replace(
  `        <main id="top">
          <Menu/>`,
  `        <main>
          <MinimalHero/>
          <Menu/>`
);

// ─── 4. VERTICAL FOOD CARD with big photo on top ─────────────────────────────
const oldFoodCard = `  return (
    <div className={'food-card' + (out ? ' food-card-out' : '')}>
      <div className="food-card-body">
        <div>
          <h4 className="food-card-title">{cleanName}</h4>
          {d && <p className="food-card-desc">{d}</p>}
        </div>
        <div className="food-card-bottom">
          <span className="food-card-price">{displayPrice}</span>
          {out ? (
            <span className="tag-out">Rupture</span>
          ) : (
            id && <AddBtn id={id} />
          )}
        </div>
      </div>
      {img && !thumbErr && (
        <div className="food-card-thumb">
          <img src={img} alt={cleanName} loading="lazy" onError={() => setThumbErr(true)} />
        </div>
      )}
    </div>
  )`;

const newFoodCard = `  return (
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
      <div className="food-card-v-body">
        <h4 className="food-card-v-title">{cleanName}</h4>
        {d && <p className="food-card-v-desc">{d}</p>}
        <div className="food-card-v-bottom">
          <span className="food-card-v-price">{displayPrice}</span>
          {out ? (
            <span className="tag-out">Rupture</span>
          ) : (
            id && <AddBtn id={id} />
          )}
        </div>
      </div>
    </div>
  )`;

if (!code.includes(oldFoodCard)) { console.error('FoodCard not found'); process.exit(1); }
code = code.replace(oldFoodCard, newFoodCard);

// ─── 5. ANIMATED food-grid wrapper (key on cat triggers re-mount animation) ──
// Wrap each food-grid div with an AnimatePresence + motion.div keyed on cat
const oldGrid1 = `            <div className="food-grid">
              {pizzaList.map(it => (
                <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img} />
              ))}
            </div>`;
const newGrid1 = `            <motion.div className="food-grid" key={"pizzas-"+size} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}>
              {pizzaList.map(it => (
                <FoodCard key={it.id} n={it.n} d={it.d} p={it.p} id={it.id} img={it.img} />
              ))}
            </motion.div>`;
code = code.replace(oldGrid1, newGrid1);

const oldGrid2 = `          <div className="food-grid">
            {customList.map(it => (
              <FoodCard key={it.id} n={it.name} d={it.desc || it.cat} p={eur(it.price)} id={it.id} img={it.img || getItemImg('special', slug(it.name))} />
            ))}
          </div>`;
const newGrid2 = `          <motion.div className="food-grid" key="special" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}>
            {customList.map(it => (
              <FoodCard key={it.id} n={it.name} d={it.desc || it.cat} p={eur(it.price)} id={it.id} img={it.img || getItemImg('special', slug(it.name))} />
            ))}
          </motion.div>`;
code = code.replace(oldGrid2, newGrid2);

const oldGrid3 = `            <div className="food-grid">
              {(activeCat?.items || []).map(i => {
                const s = slug(i[0])
                return (
                  <FoodCard
                    key={i[0]}
                    n={i[0]}
                    d={i[1] || ''}
                    p={i[2] || activeCat.p}
                    id={activeCat.id + ':' + s}
                    img={getItemImg(activeCat.id, s)}
                  />
                )
              })}
            </div>`;
const newGrid3 = `            <motion.div className="food-grid" key={cat} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease:[.16,1,.3,1]}}>
              {(activeCat?.items || []).map(i => {
                const s = slug(i[0])
                return (
                  <FoodCard
                    key={i[0]}
                    n={i[0]}
                    d={i[1] || ''}
                    p={i[2] || activeCat.p}
                    id={activeCat.id + ':' + s}
                    img={getItemImg(activeCat.id, s)}
                  />
                )
              })}
            </motion.div>`;
code = code.replace(oldGrid3, newGrid3);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx updated successfully!');
