import fs from 'node:fs';

let html = fs.readFileSync('public/gerant/index.html', 'utf8');

// 1. Add Photo button to item actions
const oldActionButtons = `<div style="display:flex;gap:6px;align-items:center">
    <button class="btn \${isHid?'warn':'ghost'}" data-act="toggle-hide" title="\${isHid?'Remettre visible':'Masquer de la carte'}">\${isHid?'👁️ Visible':'🚫 Masquer'}</button>
    <button class="btn ink" data-act="save">Enregistrer</button>
    \${isCustom?'<button class="btn warn" data-act="del-custom" title="Supprimer ce produit" style="padding:10px 14px">🗑️</button>':''}
   </div>`;

const newActionButtons = `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
    <button type="button" class="btn ghost" data-act="trigger-photo" title="Changer la photo de ce plat" style="padding:8px 12px;font-size:12px;display:inline-flex;align-items:center;gap:5px">
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
     Photo
    </button>
    <button class="btn \${isHid?'warn':'ghost'}" data-act="toggle-hide" title="\${isHid?'Remettre visible':'Masquer de la carte'}">\${isHid?'👁️ Visible':'🚫 Masquer'}</button>
    <button class="btn ink" data-act="save">Enregistrer</button>
    \${isCustom?'<button class="btn warn" data-act="del-custom" title="Supprimer ce produit" style="padding:10px 14px">🗑️</button>':''}
   </div>`;

html = html.replace(oldActionButtons, newActionButtons);

// 2. In items-list onclick, handle thumbnail click & trigger-photo button
const oldOnclickStart = `if($('#items-list')) $('#items-list').onclick=async e=>{
 const btn=e.target.closest('button')
 if(!btn)return
 const row=btn.closest('.item-row')
 if(!row)return
 const id=row.dataset.id`;

const newOnclickStart = `if($('#items-list')) $('#items-list').onclick=async e=>{
 const thumbBox=e.target.closest('.item-thumb-box')
 if(thumbBox && !e.target.closest('button')){
  const r=thumbBox.closest('.item-row')
  const fi=r && r.querySelector('.item-img-input')
  if(fi) fi.click()
  return
 }
 const btn=e.target.closest('button')
 if(!btn)return
 const row=btn.closest('.item-row')
 if(!row)return
 const id=row.dataset.id
 if(btn.dataset.act==='trigger-photo'){
  const fi=row.querySelector('.item-img-input')
  if(fi) fi.click()
  return
 }`;

html = html.replace(oldOnclickStart, newOnclickStart);

fs.writeFileSync('public/gerant/index.html', html, 'utf8');
console.log('Successfully updated public/gerant/index.html with trigger-photo button');
