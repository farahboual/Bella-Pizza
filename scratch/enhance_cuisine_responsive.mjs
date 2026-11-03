import fs from 'fs';

let cuisine = fs.readFileSync('public/cuisine/index.html', 'utf8');

// Inject enhanced mobile responsive styling for cuisine screen
const cuisineResponsiveCSS = `
/* Mobile Responsive Overhauls for Kitchen Display */
@media (max-width: 768px) {
  header {
    padding: 12px 14px !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }
  header h1 {
    font-size: 18px !important;
  }
  .st {
    font-size: 11px !important;
  }
  header > div:last-child {
    width: 100% !important;
    justify-content: space-between !important;
  }
  header .btn {
    padding: 8px 12px !important;
    font-size: 12px !important;
    flex: 1 !important;
  }
  main {
    grid-template-columns: 1fr !important;
    padding: 14px 10px !important;
    gap: 14px !important;
  }
  .o {
    padding: 16px 14px !important;
    border-radius: 18px !important;
  }
  .top b {
    font-size: 24px !important;
  }
  .acts {
    flex-direction: column !important;
  }
  .acts .btn {
    width: 100% !important;
    padding: 12px !important;
  }
  #f {
    padding: 28px 18px !important;
    border-radius: 22px !important;
  }
  #f h1 {
    font-size: 24px !important;
  }
}
</style>`;

cuisine = cuisine.replace('</style>', cuisineResponsiveCSS);
fs.writeFileSync('public/cuisine/index.html', cuisine, 'utf8');
console.log('Cuisine responsive enhancements applied!');
