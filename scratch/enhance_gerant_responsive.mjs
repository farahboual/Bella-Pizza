import fs from 'fs';

let gerant = fs.readFileSync('public/gerant/index.html', 'utf8');

const gerantResponsiveCSS = `
/* Enhanced Mobile Responsive for Manager Dashboard */
@media (max-width: 640px) {
  header {
    padding: 8px 12px !important;
    height: auto !important;
    min-height: 52px !important;
  }
  .app-sidebar {
    padding: 6px 8px !important;
  }
  .sidebar-nav {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .sidebar-nav::-webkit-scrollbar {
    display: none !important;
  }
  .sidebar-nav .tab {
    padding: 6px 10px !important;
    font-size: 11.5px !important;
  }
  .sidebar-nav .tab svg {
    width: 15px !important;
    height: 15px !important;
    min-width: 15px !important;
  }
  .app-main {
    padding: 12px 10px 48px !important;
  }
  .card {
    padding: 14px 14px !important;
    border-radius: 14px !important;
  }
  .card h2 {
    font-size: 16px !important;
  }
  .dash-stats-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
  .dash-stat-card {
    padding: 14px !important;
  }
  .sh-day-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
    padding: 10px !important;
  }
  .sh-day-times {
    width: 100% !important;
    justify-content: space-between !important;
    flex-wrap: wrap !important;
  }
  .sh-time-slot {
    flex: 1 !important;
    min-width: 130px !important;
  }
  .exc-form-grid {
    grid-template-columns: 1fr !important;
  }
  .btn {
    width: 100% !important;
  }
}
</style>`;

gerant = gerant.replace('</style>', gerantResponsiveCSS);
fs.writeFileSync('public/gerant/index.html', gerant, 'utf8');
console.log('Gerant responsive enhancements applied!');
