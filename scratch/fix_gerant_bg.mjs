import fs from 'fs';

let gerant = fs.readFileSync('public/gerant/index.html', 'utf8');

// Replace the body::before and body::after and reset .app-layout background
const oldBgBlock = `body{
  font:14.5px/1.4 var(--font);
  background:var(--bg);
  color:var(--dark);
  -webkit-font-smoothing:antialiased;
}

/* Global Full-Page Culinary Photo Background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image: url('/client-assets/hero.jpg');
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;
  opacity: 0.75;
  filter: saturate(1.15) brightness(0.92);
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(244, 239, 235, 0.45) 0%,
    rgba(244, 239, 235, 0.60) 40%,
    rgba(244, 239, 235, 0.78) 100%
  );
  backdrop-filter: blur(8px);
}`;

const newBgBlock = `body{
  font:14.5px/1.4 var(--font);
  background:transparent !important;
  color:var(--dark);
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}

/* Global Full-Page Culinary Photo Background */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image: url('/client-assets/hero.jpg');
  background-size: cover;
  background-position: center 25%;
  background-repeat: no-repeat;
  opacity: 0.88;
  filter: saturate(1.15) brightness(0.94);
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(244, 239, 235, 0.25) 0%,
    rgba(244, 239, 235, 0.42) 40%,
    rgba(244, 239, 235, 0.65) 100%
  );
  backdrop-filter: blur(5px);
}`;

gerant = gerant.replace(/\r\n/g, '\n');
gerant = gerant.replace(oldBgBlock.replace(/\r\n/g, '\n'), newBgBlock);

// Remove opaque backgrounds from .app-layout and #gate
gerant = gerant.replace(
  `.app-layout{display:flex;min-height:calc(100vh - 56px);width:100%;background:var(--bg)}`,
  `.app-layout{display:flex;min-height:calc(100vh - 56px);width:100%;background:transparent !important;}`
);
gerant = gerant.replace(
  `#gate{position:fixed;inset:0;z-index:50;background:var(--bg);display:grid;place-items:center;padding:24px}`,
  `#gate{position:fixed;inset:0;z-index:50;background:rgba(244, 239, 235, 0.65);backdrop-filter:blur(8px);display:grid;place-items:center;padding:24px}`
);

fs.writeFileSync('public/gerant/index.html', gerant, 'utf8');
console.log('Fixed gerant background photo transparency!');
