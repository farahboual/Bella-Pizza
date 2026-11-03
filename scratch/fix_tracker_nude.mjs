import fs from 'fs';

// 1. Clean OrderTracker.jsx emojis
let tracker = fs.readFileSync('src/OrderTracker.jsx', 'utf8');

// Replace stepper icons
tracker = tracker.replace(
  `<div className="tracker-step-icon">{currentStep > 0 ? '✓' : '📝'}</div>`,
  `<div className="tracker-step-icon">{currentStep > 0 ? '✓' : '1'}</div>`
);

tracker = tracker.replace(
  `<div className="tracker-step-icon">{currentStep > 1 ? '✓' : '👨‍🍳'}</div>`,
  `<div className="tracker-step-icon">{currentStep > 1 ? '✓' : '2'}</div>`
);

tracker = tracker.replace(
  `<div className="tracker-step-icon">{currentStep > 2 ? '✓' : order.type === 'livraison' ? '🛵' : '🛍️'}</div>`,
  `<div className="tracker-step-icon">{currentStep > 2 ? '✓' : '3'}</div>`
);

tracker = tracker.replace(
  `<div className="tracker-step-icon">✨</div>`,
  `<div className="tracker-step-icon">4</div>`
);

// Replace remaining emojis
tracker = tracker.replace(
  `⏰ Heure souhaitée : {slotTime}`,
  `Heure souhaitée : {slotTime}`
);

tracker = tracker.replace(
  `⭐ Votre avis compte pour nous !`,
  `Votre avis compte pour nous !`
);

tracker = tracker.replace(
  `📞 Appeler le resto`,
  `Appeler le restaurant`
);

fs.writeFileSync('src/OrderTracker.jsx', tracker, 'utf8');

// 2. Clean extra.css - Override OrderTracker dark theme with warm Nude Beige theme
let css = fs.readFileSync('src/extra.css', 'utf8');

const nudeTrackerTheme = `
/* ===================================================================
   NUDE WARM ORDER TRACKER THEME (MATCHES SITE LUXURY AESTHETIC)
   =================================================================== */

.tracker-overlay {
  background: rgba(40, 35, 31, 0.55) !important;
  backdrop-filter: blur(8px) !important;
}

.tracker-modal {
  background: #FAF7F2 !important;
  color: var(--nude-text, #28231F) !important;
  border: 1px solid rgba(163, 120, 94, 0.2) !important;
  box-shadow: 0 24px 64px rgba(40, 35, 31, 0.25) !important;
  border-radius: 24px !important;
}

.tracker-head {
  border-bottom: 1px solid rgba(163, 120, 94, 0.15) !important;
  color: var(--nude-text, #28231F) !important;
}

.tracker-head h3 {
  font-family: 'Playfair Display', Georgia, serif !important;
  font-weight: 800 !important;
  color: var(--nude-text, #28231F) !important;
}

.tracker-badge-live {
  background: rgba(163, 120, 94, 0.12) !important;
  color: var(--nude-accent, #A3785E) !important;
  border: 1px solid rgba(163, 120, 94, 0.25) !important;
}

.tracker-badge-live .tracker-dot {
  background: var(--nude-accent, #A3785E) !important;
}

.tracker-stepper-line {
  background: rgba(163, 120, 94, 0.18) !important;
}

.tracker-stepper-fill {
  background: var(--nude-accent, #A3785E) !important;
}

.tracker-step-icon {
  background: #FFFFFF !important;
  border: 2px solid rgba(163, 120, 94, 0.3) !important;
  color: #8c8275 !important;
  font-weight: 700 !important;
}

.tracker-step.completed .tracker-step-icon {
  background: var(--nude-accent, #A3785E) !important;
  border-color: var(--nude-accent, #A3785E) !important;
  color: #FFFFFF !important;
}

.tracker-step.current .tracker-step-icon {
  background: #FFFFFF !important;
  border-color: var(--nude-accent, #A3785E) !important;
  color: var(--nude-accent, #A3785E) !important;
  box-shadow: 0 0 0 6px rgba(163, 120, 94, 0.2) !important;
}

.tracker-step-label {
  color: #8c8275 !important;
}

.tracker-step.completed .tracker-step-label,
.tracker-step.current .tracker-step-label {
  color: var(--nude-text, #28231F) !important;
  font-weight: 700 !important;
}

.tracker-status-box {
  background: #FFFFFF !important;
  border: 1px solid rgba(163, 120, 94, 0.18) !important;
  box-shadow: 0 4px 14px rgba(40, 35, 31, 0.04) !important;
  color: var(--nude-text, #28231F) !important;
}

.tracker-status-title {
  color: var(--nude-text, #28231F) !important;
  font-family: 'Playfair Display', Georgia, serif !important;
  font-size: 1.15rem !important;
}

.tracker-status-desc {
  color: #6b6357 !important;
}

.tracker-pill {
  background: rgba(244, 239, 235, 0.95) !important;
  color: var(--nude-text, #28231F) !important;
  border: 1px solid rgba(163, 120, 94, 0.25) !important;
  box-shadow: 0 8px 24px rgba(40, 35, 31, 0.15) !important;
  backdrop-filter: blur(12px) !important;
}

.tracker-pill b {
  color: var(--nude-accent, #A3785E) !important;
}

.tracker-pill .tracker-dot {
  background: var(--nude-accent, #A3785E) !important;
}

.tracker-modal .btn.ink {
  background: var(--nude-accent, #A3785E) !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 99px !important;
  box-shadow: 0 4px 14px rgba(163, 120, 94, 0.35) !important;
}

.tracker-modal .btn.outline {
  border: 1.5px solid rgba(163, 120, 94, 0.3) !important;
  color: var(--nude-text, #28231F) !important;
  background: #FFFFFF !important;
  border-radius: 99px !important;
}
`;

css += '\n' + nudeTrackerTheme;
fs.writeFileSync('src/extra.css', css, 'utf8');

console.log('OrderTracker.jsx cleaned & extra.css nude theme applied!');
