import fs from 'node:fs';

let html = fs.readFileSync('public/gerant/index.html', 'utf8');

// 1. Add CSS for .item-edit-panel if not already present
const cssAnchor = `.item-row:hover{background:#fff5f4}`;
const newCss = `.item-row:hover{background:#fff5f4}
.item-edit-panel{display:none;grid-column:1/-1;margin-top:8px}
.item-edit-panel.open{display:block}
.item-edit-panel-inner{background:#fffdf5;border:1.5px solid #fde68a;border-radius:12px;padding:14px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.04)}
.edit-field-label{display:block;font-size:11px;font-weight:800;color:var(--mute);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
.edit-field-input{width:100%;font:500 13px var(--font);padding:8px 10px;border-radius:8px;border:1.5px solid var(--line);background:#fff;color:var(--dark);box-sizing:border-box}
textarea.edit-field-input{resize:vertical;min-height:54px}`;

if (html.includes(cssAnchor) && !html.includes('.item-edit-panel{')) {
  html = html.replace(cssAnchor, newCss);
  console.log('✅ Added CSS for .item-edit-panel');
}

// 2. Replace lines in renderMenu using split('\n')
const lines = html.split('\n');

// Find line where "const customImg = itemImages[id]" is
const startLineIdx = lines.findIndex(l => l.includes('const customImg = itemImages[id]'));
// Find line where ").join('')" is after startLineIdx
const endLineIdx = lines.findIndex((l, idx) => idx > startLineIdx && l.includes("}).join('')"));

if (startLineIdx === -1 || endLineIdx === -1) {
  console.error('❌ Could not find line indexes for renderMenu item template:', { startLineIdx, endLineIdx });
  process.exit(1);
}

console.log(`Found template from line ${startLineIdx} to ${endLineIdx}`);

const newTemplateLines = [
  '  const customImg = itemImages[id] || (isCustom && item.img)',
  '  const defaultImg = item.img || (catalog[id] && catalog[id].img) || \'/client-assets/pizza.jpg\'',
  '  const displayImg = customImg || defaultImg',
  '  const hasCustomImg = !!customImg',
  '  const liveDetails = itemDetails[id] || {}',
  '  const displayName = liveDetails.name || item.name',
  '  const displayDesc = liveDetails.desc !== undefined ? liveDetails.desc : (item.desc || \'\')',
  '  const hasDetailOverride = !!(liveDetails.name || (liveDetails.desc !== undefined && liveDetails.desc !== (item.desc || \'\')))',
  '',
  '  return `<div class="item-row" data-id="${id}" style="${isHid?\'opacity:.5\':\'\'}">',
  '   <div>',
  '    <label class="item-thumb-box" title="Cliquer pour changer la photo de cet article">',
  '     <img src="${displayImg}" alt="${esc(displayName)}" class="item-thumb-img" onerror="this.src=\'/client-assets/pizza.jpg\'">',
  '     <div class="item-thumb-overlay">',
  '      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  '      <span>Photo</span>',
  '     </div>',
  '     <input type="file" class="item-img-input" accept="image/*" style="display:none">',
  '    </label>',
  '   </div>',
  '   <div>',
  '    <div class="item-name">',
  '     ${esc(displayName)}',
  '     ${isCustom?\'<span class="badge-custom">Créé par vous</span>\':\'\'}',
  '     ${hasCustomImg?\'<span class="badge-custom" style="background:#dcfce7;color:#15803d">Photo modifiée</span>\':\'\'}',
  '     ${hasDetailOverride?\'<span class="badge-custom" style="background:#fef9c3;color:#854d0e">Détails modifiés</span>\':\'\'}',
  '     ${isHid?\'<span class="badge-custom" style="background:#e5e7eb;color:#6b7280">Masqué</span>\':\'\'}',
  '    </div>',
  '    <div class="item-cat">',
  '     ${esc(item.cat||\'Divers\')}${displayDesc?` · <i>${esc(displayDesc)}</i>`: \'\'}',
  '     ${hasCustomImg?` · <button type="button" class="btn-reset-img" data-act="reset-img" style="background:none;border:none;padding:0;color:var(--red);text-decoration:underline;cursor:pointer;font-size:11px;font-weight:700">Rétablir photo par défaut</button>`:\'\'}',
  '    </div>',
  '   </div>',
  '   <div class="price-input-wrap"><input type="number" step="0.50" min="0" class="price-input" value="${(currentPrice/100).toFixed(2)}"> €</div>',
  '   <div><button class="btn ${isOut?\'warn\':\'ghost\'}" data-act="stock">${isOut?\'Rupture\':\'En stock\'}</button></div>',
  '   <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">',
  '    <button type="button" class="btn ghost" data-act="trigger-photo" title="Changer la photo de ce plat" style="padding:8px 12px;font-size:12px;display:inline-flex;align-items:center;gap:5px">',
  '     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  '     Photo',
  '    </button>',
  '    <button type="button" class="btn ghost" data-act="edit-details" style="padding:8px 12px;font-size:12px;display:inline-flex;align-items:center;gap:5px" title="Modifier le nom et la description">',
  '     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  '     Modifier',
  '    </button>',
  '    <button class="btn ${isHid?\'warn\':\'ghost\'}" data-act="toggle-hide" title="${isHid?\'Remettre visible\':\'Masquer de la carte\'}">${isHid?\'👁️ Visible\':\'🚫 Masquer\'}</button>',
  '    <button class="btn ink" data-act="save">Enregistrer</button>',
  '    ${isCustom?\'<button class="btn warn" data-act="del-custom" title="Supprimer ce produit" style="padding:10px 14px">🗑️</button>\':\'\'}',
  '   </div>',
  '   <div class="item-edit-panel" data-edit-for="${id}">',
  '    <div class="item-edit-panel-inner">',
  '     <label class="edit-field-label">Nom du plat</label>',
  '     <input class="edit-name-input edit-field-input" value="${esc(displayName)}" placeholder="Nom du plat" maxlength="80">',
  '     <label class="edit-field-label" style="margin-top:10px">Description / Ingrédients</label>',
  '     <textarea class="edit-desc-input edit-field-input" placeholder="Description ou liste d\'ingrédients..." maxlength="200" rows="2">${esc(displayDesc)}</textarea>',
  '     <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">',
  '      <button data-act="save-details" class="btn ink">✓ Enregistrer</button>',
  '      <button data-act="cancel-edit" class="btn ghost">Annuler</button>',
  '      ${hasDetailOverride?\'<button data-act="reset-details" class="btn ghost" style="color:var(--red)">↩ Rétablir original</button>\':\'\'}',
  '     </div>',
  '    </div>',
  '   </div>',
  '  </div>`'
];

lines.splice(startLineIdx, endLineIdx - startLineIdx, ...newTemplateLines);
html = lines.join('\n');
console.log('✅ Replaced renderMenu template lines successfully');

// 3. Add detail actions to items-list onclick handler
const actionAnchor = "  if(btn.dataset.act==='del-custom'){";
const newActions = ` if(btn.dataset.act==='edit-details'){
  const panel=row.querySelector('.item-edit-panel')
  if(panel) panel.classList.toggle('open')
  return
 }
 if(btn.dataset.act==='cancel-edit'){
  const panel=row.querySelector('.item-edit-panel')
  if(panel) panel.classList.remove('open')
  return
 }
 if(btn.dataset.act==='save-details'){
  const panel=row.querySelector('.item-edit-panel')
  const nameVal=panel.querySelector('.edit-name-input').value.trim()
  const descVal=panel.querySelector('.edit-desc-input').value.trim()
  showToast('Enregistrement des détails...')
  const res=await api({action:'saveDetails',data:{id,name:nameVal,desc:descVal}})
  if(res.ok){
   const j=await res.json()
   if(j.itemDetails) itemDetails=j.itemDetails
   if(j.customItems) customItems=j.customItems
   panel.classList.remove('open')
   renderMenu($('#search-item')?$('#search-item').value:'')
   showToast('Détails mis à jour avec succès !')
  } else {
   showToast('Erreur lors de la sauvegarde')
  }
  return
 }
 if(btn.dataset.act==='reset-details'){
  if(!confirm('Rétablir le nom et la description originaux ?')) return
  const res=await api({action:'saveDetails',data:{id,name:'',desc:''}})
  if(res.ok){
   const j=await res.json()
   if(j.itemDetails) itemDetails=j.itemDetails
   if(j.customItems) customItems=j.customItems
   renderMenu($('#search-item')?$('#search-item').value:'')
   showToast('Détails originaux rétablis')
  }
  return
 }
  if(btn.dataset.act==='del-custom'){`;

if (!html.includes('data-act="edit-details"') && html.includes(actionAnchor)) {
  html = html.replace(actionAnchor, newActions);
  console.log('✅ Added detail actions to onclick handler');
}

fs.writeFileSync('public/gerant/index.html', html, 'utf8');
console.log('✅ public/gerant/index.html saved successfully');
