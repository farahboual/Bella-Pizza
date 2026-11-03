import fs from 'fs';

let css = fs.readFileSync('src/extra.css', 'utf8');

// Replace minimal-hero definition with tighter seamless transitions
const oldMinimalHero = `.minimal-hero {
  position: relative;
  width: 100%;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}`;

const newMinimalHero = `.minimal-hero {
  position: relative;
  width: 100%;
  min-height: 68vh;
  padding: 110px 0 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #120F0D;
}`;

const oldOverlay = `.minimal-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(10, 8, 6, 0.72) 0%,
    rgba(18, 15, 13, 0.55) 50%,
    rgba(10, 8, 6, 0.82) 100%
  );
}`;

const newOverlay = `.minimal-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(18, 15, 13, 0.72) 0%,
    rgba(18, 15, 13, 0.42) 40%,
    rgba(18, 15, 13, 0.85) 75%,
    #120F0D 100%
  );
}

.minimal-hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(to bottom, transparent 0%, #120F0D 100%);
  pointer-events: none;
  z-index: 1;
}`;

css = css.replace(/\r\n/g, '\n');
css = css.replace(oldMinimalHero.replace(/\r\n/g, '\n'), newMinimalHero);
css = css.replace(oldOverlay.replace(/\r\n/g, '\n'), newOverlay);

// Also make menu section start right away without an abrupt top gap
const oldMenuPad = `.menu {
  background: #120F0D !important;
  color: #FAF7F2 !important;
  padding: 64px 0 96px !important;
  position: relative !important;
}`;

const newMenuPad = `.menu {
  background: #120F0D !important;
  color: #FAF7F2 !important;
  padding: 10px 0 96px !important;
  position: relative !important;
  margin-top: -30px !important;
}`;

css = css.replace(oldMenuPad.replace(/\r\n/g, '\n'), newMenuPad);

fs.writeFileSync('src/extra.css', css, 'utf8');
console.log('extra.css updated successfully!');
