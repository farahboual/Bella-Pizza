import fs from 'fs';

// 1. Update public/cuisine/index.html
let cuisine = fs.readFileSync('public/cuisine/index.html', 'utf8');

const cuisineBgCSS = `
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
    rgba(244, 239, 235, 0.40) 0%,
    rgba(244, 239, 235, 0.55) 40%,
    rgba(244, 239, 235, 0.75) 100%
  );
  backdrop-filter: blur(8px);
}
`;

cuisine = cuisine.replace('header h1, #f h1, .top b{', cuisineBgCSS + '\nheader h1, #f h1, .top b{');
fs.writeFileSync('public/cuisine/index.html', cuisine, 'utf8');

// 2. Update public/gerant/index.html
let gerant = fs.readFileSync('public/gerant/index.html', 'utf8');

const gerantBgCSS = `
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
}
`;

gerant = gerant.replace('h1, h2, .sh-page-title {', gerantBgCSS + '\nh1, h2, .sh-page-title {');
fs.writeFileSync('public/gerant/index.html', gerant, 'utf8');

console.log('Background photo added to cuisine and gerant pages!');
