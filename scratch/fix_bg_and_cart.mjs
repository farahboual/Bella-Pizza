import fs from 'fs';

let css = fs.readFileSync('src/extra.css', 'utf8');

// 1. Boost background visibility: high opacity, crisp photo, transparent vignette
const oldBgBlock = `.global-page-photo-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url('/client-assets/hero.jpg');
  background-size: cover;
  background-position: center 25%;
  background-repeat: no-repeat;
  opacity: 0.28;
  filter: saturate(1.1);
  transform: scale(1.02);
}

/* 2. Warm Nude & Soft Blur Scrim across the entire scroll */
.global-nude-vignette {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 20%, rgba(244, 239, 235, 0.45) 0%, rgba(244, 239, 235, 0.88) 60%, #F4EFEB 100%);
  backdrop-filter: blur(8px);
}`;

const newBgBlock = `.global-page-photo-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url('/client-assets/hero.jpg');
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;
  opacity: 0.85; /* Clearly visible photo: pizza, burger, fries & cola */
  filter: saturate(1.15) brightness(0.92);
  transform: scale(1.01);
}

/* 2. Subtle atmospheric tint that keeps the photo vivid while ensuring high readability */
.global-nude-vignette {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(244, 239, 235, 0.25) 0%,
    rgba(244, 239, 235, 0.40) 40%,
    rgba(244, 239, 235, 0.65) 100%
  );
}`;

css = css.replace(/\r\n/g, '\n');
css = css.replace(oldBgBlock.replace(/\r\n/g, '\n'), newBgBlock);

// 2. Add full Nude Warm Styling for the Cart Drawer (.cart-ov, .cart, .cl li, inputs, etc.)
const cartNudeStyles = `

/* ===================================================================
   NUDE WARM CART DRAWER STYLING (MATCHES NUDE BEIGE THEME)
   =================================================================== */

.cart-ov {
  background: rgba(40, 35, 31, 0.5) !important;
  backdrop-filter: blur(10px) !important;
}

.cart {
  background: #FAF7F2 !important;
  color: var(--nude-text, #28231F) !important;
  border-left: 1px solid rgba(163, 120, 94, 0.2) !important;
  box-shadow: -16px 0 50px rgba(40, 35, 31, 0.25) !important;
}

.cart-h {
  background: rgba(255, 255, 255, 0.6) !important;
  border-bottom: 1px solid rgba(163, 120, 94, 0.15) !important;
  color: var(--nude-text, #28231F) !important;
}

.cart-h h2 {
  font-family: 'Playfair Display', Georgia, serif !important;
  font-weight: 800 !important;
  color: var(--nude-text, #28231F) !important;
}

.x {
  border: 1.5px solid rgba(40, 35, 31, 0.2) !important;
  background: rgba(255, 255, 255, 0.8) !important;
  color: var(--nude-text, #28231F) !important;
}

.x:hover {
  background: #fff !important;
  border-color: var(--nude-accent, #A3785E) !important;
}

.cl li {
  background: #FFFFFF !important;
  border: 1px solid rgba(163, 120, 94, 0.15) !important;
  color: var(--nude-text, #28231F) !important;
  box-shadow: 0 4px 14px rgba(40, 35, 31, 0.05) !important;
  border-radius: 16px !important;
}

.cl-t b {
  color: var(--nude-text, #28231F) !important;
}

.cl-t span {
  color: var(--nude-accent, #A3785E) !important;
}

.cl-del {
  color: rgba(40, 35, 31, 0.4) !important;
}

.cl-del:hover {
  color: #ef4444 !important;
}

.cl-q > button {
  border: 1.5px solid rgba(40, 35, 31, 0.2) !important;
  color: var(--nude-text, #28231F) !important;
  background: rgba(244, 239, 235, 0.6) !important;
}

.cl-q > button:hover {
  background: #fff !important;
  border-color: var(--nude-accent, #A3785E) !important;
}

.cl-q input {
  background: #FAF7F2 !important;
  border: 1px solid rgba(163, 120, 94, 0.2) !important;
  color: var(--nude-text, #28231F) !important;
}

.cart form label, .cart fieldset legend {
  color: var(--nude-text, #28231F) !important;
  font-weight: 700 !important;
}

.cart input[type=text], .cart input:not([type=radio]):not(.cl-q input), .cart textarea, .cart select {
  background: #FFFFFF !important;
  border: 1.5px solid rgba(163, 120, 94, 0.2) !important;
  color: var(--nude-text, #28231F) !important;
  border-radius: 12px !important;
}

.cart input:focus, .cart textarea:focus, .cart select:focus {
  outline: none !important;
  border-color: var(--nude-accent, #A3785E) !important;
  box-shadow: 0 0 14px rgba(163, 120, 94, 0.25) !important;
}

.seg label {
  border: 1.5px solid rgba(163, 120, 94, 0.22) !important;
  background: rgba(255, 255, 255, 0.7) !important;
  color: var(--nude-text, #28231F) !important;
}

.seg label.on {
  background: var(--nude-accent, #A3785E) !important;
  color: #FFFFFF !important;
  border-color: var(--nude-accent, #A3785E) !important;
}

.cart-f {
  background: #FAF7F2 !important;
  border-top: 1px solid rgba(163, 120, 94, 0.15) !important;
}

.tot {
  color: var(--nude-text, #28231F) !important;
}

.tot b {
  color: var(--nude-accent, #A3785E) !important;
}
`;

css += cartNudeStyles;

fs.writeFileSync('src/extra.css', css, 'utf8');
console.log('extra.css updated: visible background + nude cart drawer!');
