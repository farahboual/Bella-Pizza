import fs from 'node:fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// In FoodCard: add liveImg check
code = code.replace(
  /const badgeText = isBestSeller \? 'Best-seller' : \(isChefsPick \? 'Sélection du Chef' : null\)/,
  `const badgeText = isBestSeller ? 'Best-seller' : (isChefsPick ? 'Sélection du Chef' : null)\n\n  const baseSlug = id ? (id.split(':')[1] || '') : ''\n  const liveImg = (id && cfg?.itemImages?.[id]) || (baseSlug && cfg?.itemImages?.[baseSlug]) || (id && cfg?.overrides?.[id]?.img) || img`
);

code = code.replace(
  /\{img && !thumbErr \? \(\r?\n\s+<div className="food-card-v-img">\r?\n\s+<img src=\{img\}/,
  `{liveImg && !thumbErr ? (\n        <div className="food-card-v-img">\n          <img src={liveImg}`
);

// In Menu(): customList image fallback
code = code.replace(
  /img: it\.img \|\| getItemImg\('special', slug\(it\.name\)\)/,
  `img: it.img || (cfg?.itemImages && cfg.itemImages[it.id]) || getItemImg('special', slug(it.name))`
);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Successfully updated src/App.jsx');
