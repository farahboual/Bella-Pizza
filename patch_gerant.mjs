import { readFileSync, writeFileSync } from 'fs'
let c = readFileSync('public/gerant/index.html', 'utf8')

// ── 1. Tab button label ──────────────────────────────────────────────────────
c = c.replace(
  'data-tab="sales" role="tab">Rapport Z &amp; Ventes</button>',
  'data-tab="sales" role="tab">Rapport de caisse</button>'
)
console.log('✓ Tab label')

// ── 2. Heading block (exact content extracted from file) ─────────────────────
const oldHeading = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">\n    <h2>Rapport Z &amp; Statistiques des Ventes</h2>\n    <button id="export-csv-btn" class="btn ghost">📥 Exporter en CSV</button>\n   </div>\n   '
const newHeading = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:8px">\n    <h2>Rapport de caisse</h2>\n    <button id="export-csv-btn" class="btn ghost">📥 Exporter en CSV</button>\n   </div>\n   <p style="color:var(--mute);font-size:14px;margin-bottom:20px;line-height:1.5">Le <strong>rapport Z</strong> est le récapitulatif de clôture de caisse : il totalise toutes les ventes et encaissements sur la période sélectionnée. En restauration, le « Z » désigne le rapport final de la journée remettant les compteurs à zéro.</p>\n   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">\n    <button class="btn ink period-btn active" data-days="1">Aujourd\'hui</button>\n    <button class="btn ghost period-btn" data-days="7">7 derniers jours</button>\n    <button class="btn ghost period-btn" data-days="30">30 derniers jours</button>\n   </div>\n   '
if (!c.includes(oldHeading)) { console.error('HEADING not found'); process.exit(1) }
c = c.replace(oldHeading, newHeading)
console.log('✓ Heading block')

// ── 3. CSV export JS ─────────────────────────────────────────────────────────
// Find exact start/end of the onclick handler
const csvStart = c.indexOf("$('#export-csv-btn').onclick=()=>{")
const csvEnd = c.indexOf('\n}\n', csvStart) + 3  // include the closing brace + newline
const oldCsv = c.slice(csvStart, csvEnd)
console.log('CSV snippet found:', csvStart, '→', csvEnd)

const newCsv = `let currentPeriodDays=1

document.querySelectorAll('.period-btn').forEach(b=>{
 b.onclick=async()=>{
  document.querySelectorAll('.period-btn').forEach(x=>{x.className='btn ghost period-btn'})
  b.className='btn ink period-btn active'
  currentPeriodDays=+b.dataset.days
  const r=await api({action:'getSalesReport',data:{days:currentPeriodDays}})
  if(r.ok){const j=await r.json();sales=j.sales||[];renderSales()}
 }
})

$('#export-csv-btn').onclick=()=>{
 if(!sales.length){alert('Aucune vente à exporter');return}
 const today=new Date().toLocaleDateString('fr-FR')
 const ca=sales.reduce((s,o)=>s+o.total,0)
 const eur2=v=>(v/100).toFixed(2).replace('.',',')
 const typeLabel=t=>t==='livraison'?'Livraison':t==='emporter'?'À emporter':'Sur place'
 const payLabel=o=>o.paid?'Payé en ligne':'À encaisser'
 const fmtItems=o=>(o.items||[]).map(i=>\`\${i.qty}x \${i.name}\`).join(' | ')
 const periodLabel=currentPeriodDays===1?"Aujourd'hui":currentPeriodDays===7?'7 derniers jours':'30 derniers jours'
 const statusLabel=s=>s==='cancelled'?'Annulée':s==='ready'?'Prête':s==='accepted'?'En préparation':'Nouvelle'

 const headerLines=[
  '"TACO PIZZA \u2013 Rapport de caisse"',
  \`"Période :","","\${periodLabel}"\`,
  \`"Date d'export :","","\${today}"\`,
  \`"CA Total :","\${eur2(ca)} \u20ac"\`,
  \`"Nombre de commandes :","\${sales.length}"\`,
  \`"Livraisons :","\${sales.filter(o=>o.type==='livraison').length}"\`,
  \`"À emporter / Sur place :","\${sales.filter(o=>o.type!=='livraison').length}"\`,
  ''
 ]

 const cols=['N° Commande','Date','Heure','Mode','Table','Client','Téléphone','Adresse','Code Postal','Articles','Sous-total (€)','Code Promo','Réduction (€)','TOTAL (€)','Paiement','Statut']
 const dataRows=sales.map(o=>{
  const d=new Date(o.createdAt)
  const subtotal=o.total+(o.discount||0)
  return[
   o.number,
   d.toLocaleDateString('fr-FR'),
   d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
   typeLabel(o.type),
   o.tableNumber||'',
   o.customer?.name||'',
   o.customer?.phone||'',
   o.customer?.address||'',
   o.customer?.zip||'',
   fmtItems(o),
   eur2(subtotal),
   o.promoCode||'',
   o.discount?eur2(o.discount):'0,00',
   eur2(o.total),
   payLabel(o),
   statusLabel(o.status)
  ].map(x=>\`"\${String(x).replace(/"/g,'""')}"\`).join(',')
 })

 const csv='\\uFEFF'+headerLines.join('\\n')+'\\n'+cols.map(x=>\`"\${x}"\`).join(',')+'\\n'+dataRows.join('\\n')
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
 const link=document.createElement('a')
 link.href=URL.createObjectURL(blob)
 link.download=\`Rapport_TacoPizza_\${new Date().toISOString().slice(0,10)}.csv\`
 link.click()
}
`

c = c.slice(0, csvStart) + newCsv + c.slice(csvEnd)
console.log('✓ CSV export improved')

writeFileSync('public/gerant/index.html', c, 'utf8')
console.log('✓ gerant/index.html saved')
