import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. In App.jsx, inject the global fixed background canvas:
const oldMain = `<main>
          <MinimalHero/>
          <Menu/>
          <RestaurantInfo/>
        </main>`;

const newMain = `<main className="app-main-canvas">
          {/* Global fixed full-viewport culinary photo that unifies the whole website */}
          <div className="global-page-photo-bg" aria-hidden="true" />
          <div className="global-nude-vignette" aria-hidden="true" />
          <MinimalHero/>
          <Menu/>
          <RestaurantInfo/>
        </main>`;

code = code.replace(oldMain, newMain);

// 2. Simplify MinimalHero so it doesn't have an isolated background box:
const oldHeroFunc = `function MinimalHero() {
  return (
    <section className="minimal-hero" id="top">
      <div
        className="minimal-hero-bg"
        style={{ backgroundImage: \`url(/client-assets/hero.jpg)\` }}
        aria-hidden="true"
      />
      <div className="minimal-hero-overlay" aria-hidden="true" />
      <div className="minimal-hero-content">`;

const newHeroFunc = `function MinimalHero() {
  return (
    <section className="minimal-hero" id="top">
      <div className="minimal-hero-content">`;

code = code.replace(oldHeroFunc, newHeroFunc);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx updated with global canvas structure!');
