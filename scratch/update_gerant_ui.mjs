import fs from 'node:fs';

let html = fs.readFileSync('public/gerant/index.html', 'utf8');

// 1. Add CSS for thumbnail and update .item-row
const extraCss = `
.item-thumb-box{
  width:52px;
  height:52px;
  border-radius:12px;
  overflow:hidden;
  position:relative;
  cursor:pointer;
  border:1.5px solid var(--line);
  background:#fff;
  flex-shrink:0;
  box-shadow:0 2px 8px rgba(40,35,31,0.06);
  display:block;
  margin:0;
}
.item-thumb-img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.item-thumb-overlay{
  position:absolute;
  inset:0;
  background:rgba(40,35,31,0.65);
  color:#fff;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  opacity:0;
  transition:opacity 0.15s ease;
  font-size:9.5px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.04em;
}
.item-thumb-box:hover .item-thumb-overlay{
  opacity:1;
}
.btn-reset-img:hover{
  text-decoration:none !important;
  opacity:0.8;
}
`;

html = html.replace('.items-table{display:grid;gap:8px}', extraCss + '\n.items-table{display:grid;gap:8px}');
html = html.replace(
  '.item-row{display:grid;grid-template-columns:1fr 130px 130px auto;',
  '.item-row{display:grid;grid-template-columns:52px 1fr 130px 130px auto;'
);
html = html.replace(
  '.item-row{grid-template-columns:1fr 1fr;gap:10px}',
  '.item-row{grid-template-columns:52px 1fr;gap:10px}'
);

// 2. Add photo upload field to new product form
const newProdPhotoHtml = `     <div class="form-group" style="grid-column:1/-1;margin:0">
      <label>Photo du produit (optionnel)</label>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
       <label class="btn ghost" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:8px 16px">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Choisir une photo</span>
        <input type="file" id="np-img-file" accept="image/*" style="display:none">
       </label>
       <div id="np-img-preview-wrap" style="display:none;align-items:center;gap:10px">
        <img id="np-img-preview" src="" style="width:52px;height:52px;border-radius:10px;object-fit:cover;border:1.5px solid var(--line)">
        <button type="button" id="np-img-clear" class="btn ghost" style="padding:6px 12px;font-size:12px;color:var(--mute)">Supprimer photo</button>
       </div>
      </div>
     </div>
`;

html = html.replace(
  '<div class="form-group" style="margin:0"><label>Description / Ingrédients</label><input type="text" id="np-desc" placeholder="Sauce maison, cheddar affiné, steak 150g..."></div>',
  `<div class="form-group" style="margin:0"><label>Description / Ingrédients</label><input type="text" id="np-desc" placeholder="Sauce maison, cheddar affiné, steak 150g..."></div>\n${newProdPhotoHtml}`
);

// 3. Declare itemImages & newProdImgDataUrl & compressImage in script
html = html.replace(
  "let key='',config={},overrides={},promos={},catalog={},customItems={},sales=[],kitchenKey=''",
  `let key='',config={},overrides={},promos={},catalog={},customItems={},sales=[],itemImages={},kitchenKey='',newProdImgDataUrl=''\n
function compressImage(file, maxW=640, maxH=640, quality=0.82){
 return new Promise((resolve, reject)=>{
  if(!file){ resolve(''); return }
  const reader=new FileReader()
  reader.onload=e=>{
   const img=new Image()
   img.onload=()=>{
    let w=img.width, h=img.height
    if(w>maxW || h>maxH){
     if(w>h){ h=Math.round((h*maxW)/w); w=maxW }
     else{ w=Math.round((w*maxH)/h); h=maxH }
    }
    const canvas=document.createElement('canvas')
    canvas.width=w
    canvas.height=h
    const ctx=canvas.getContext('2d')
    ctx.drawImage(img,0,0,w,h)
    resolve(canvas.toDataURL('image/jpeg',quality))
   }
   img.onerror=reject
   img.src=e.target.result
  }
  reader.onerror=reject
  reader.readAsDataURL(file)
 })
}`
);

// 4. Update loadData to grab itemImages
html = html.replace(
  'customItems=j.customItems||{}',
  'customItems=j.customItems||{}\n  itemImages=j.itemImages||(config.itemImages)||{}'
);

// 5. Update renderMenu row template
const oldRenderRow = `  return \`<div class="item-row" data-id="\${id}" style="\${isHid?'opacity:.5':''}">
   <div>
    <div class="item-name">\${item.name} \${isCustom?'<span class="badge-custom">Créé par vous</span>':''}\${isHid?'<span class="badge-custom" style="background:#e5e7eb;color:#6b7280">Masqué</span>':''}</div>
    <div class="item-cat">\${item.cat||'Divers'}\${item.desc?\` · <i>\${item.desc}</i>\`:''}</div>
   </div>
   <div class="price-input-wrap"><input type="number" step="0.50" min="0" class="price-input" value="\${(currentPrice/100).toFixed(2)}"> €</div>
   <div><button class="btn \${isOut?'warn':'ghost'}" data-act="stock">\${isOut?'Rupture':'En stock'}</button></div>
   <div style="display:flex;gap:6px">
    <button class="btn \${isHid?'warn':'ghost'}" data-act="toggle-hide" title="\${isHid?'Remettre visible':'Masquer de la carte'}">\${isHid?'👁️ Visible':'🚫 Masquer'}</button>
    <button class="btn ink" data-act="save">Enregistrer</button>
    \${isCustom?'<button class="btn warn" data-act="del-custom" title="Supprimer ce produit" style="padding:10px 14px">🗑️</button>':''}
   </div>
  </div>\``;

const newRenderRow = `  const customImg = itemImages[id] || (isCustom && item.img)
  const defaultImg = item.img || (catalog[id] && catalog[id].img) || '/client-assets/pizza.jpg'
  const displayImg = customImg || defaultImg
  const hasCustomImg = !!customImg

  return \`<div class="item-row" data-id="\${id}" style="\${isHid?'opacity:.5':''}">
   <div>
    <label class="item-thumb-box" title="Cliquer pour changer la photo de cet article">
     <img src="\${displayImg}" alt="\${esc(item.name)}" class="item-thumb-img" onerror="this.src='/client-assets/pizza.jpg'">
     <div class="item-thumb-overlay">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      <span>Photo</span>
     </div>
     <input type="file" class="item-img-input" accept="image/*" style="display:none">
    </label>
   </div>
   <div>
    <div class="item-name">
     \${esc(item.name)}
     \${isCustom?'<span class="badge-custom">Créé par vous</span>':''}
     \${hasCustomImg?'<span class="badge-custom" style="background:#dcfce7;color:#15803d">Photo modifiée</span>':''}
     \${isHid?'<span class="badge-custom" style="background:#e5e7eb;color:#6b7280">Masqué</span>':''}
    </div>
    <div class="item-cat">
     \${esc(item.cat||'Divers')}\${item.desc?\` · <i>\${esc(item.desc)}</i>\`:''}
     \${hasCustomImg?\` · <button type="button" class="btn-reset-img" data-act="reset-img" style="background:none;border:none;padding:0;color:var(--red);text-decoration:underline;cursor:pointer;font-size:11px;font-weight:700">Rétablir photo par défaut</button>\`:''}
    </div>
   </div>
   <div class="price-input-wrap"><input type="number" step="0.50" min="0" class="price-input" value="\${(currentPrice/100).toFixed(2)}"> €</div>
   <div><button class="btn \${isOut?'warn':'ghost'}" data-act="stock">\${isOut?'Rupture':'En stock'}</button></div>
   <div style="display:flex;gap:6px;align-items:center">
    <button class="btn \${isHid?'warn':'ghost'}" data-act="toggle-hide" title="\${isHid?'Remettre visible':'Masquer de la carte'}">\${isHid?'👁️ Visible':'🚫 Masquer'}</button>
    <button class="btn ink" data-act="save">Enregistrer</button>
    \${isCustom?'<button class="btn warn" data-act="del-custom" title="Supprimer ce produit" style="padding:10px 14px">🗑️</button>':''}
   </div>
  </div>\``;

html = html.replace(oldRenderRow, newRenderRow);

// 6. Add event listeners for new product image & item photo change
const photoHandlers = `
// NEW PRODUCT PHOTO SELECTION & CLEAR
if($('#np-img-file')) $('#np-img-file').onchange=async e=>{
 const f=e.target.files && e.target.files[0]
 if(!f) return
 try{
  showToast('Optimisation de la photo...')
  newProdImgDataUrl=await compressImage(f)
  $('#np-img-preview').src=newProdImgDataUrl
  $('#np-img-preview-wrap').style.display='flex'
  showToast('Photo prête !')
 }catch(err){
  console.error(err)
  showToast('Erreur lors du chargement de la photo')
 }
}
if($('#np-img-clear')) $('#np-img-clear').onclick=()=>{
 newProdImgDataUrl=''
 $('#np-img-file').value=''
 $('#np-img-preview-wrap').style.display='none'
}
`;

html = html.replace('// NEW PRODUCT CREATION & CANCEL', photoHandlers + '\n// NEW PRODUCT CREATION & CANCEL');

// 7. Update new product submit: include img
html = html.replace(
  "const res=await api({action:'saveCustomItem',data:{name,cat,price,desc}})",
  "const res=await api({action:'saveCustomItem',data:{name,cat,price,desc,img:newProdImgDataUrl}})"
);
html = html.replace(
  "$('#new-prod-form').reset()",
  "$('#new-prod-form').reset()\n   newProdImgDataUrl=''\n   if($('#np-img-preview-wrap')) $('#np-img-preview-wrap').style.display='none'"
);

// 8. Add item-level photo change & reset handlers
const itemPhotoEvents = `
// ITEM PHOTO CHANGE ON FILE INPUT
if($('#items-list')) $('#items-list').onchange=async e=>{
 const fileInput=e.target.closest('.item-img-input')
 if(!fileInput) return
 const row=fileInput.closest('.item-row')
 if(!row) return
 const id=row.dataset.id
 const f=fileInput.files && fileInput.files[0]
 if(!f) return
 try{
  showToast('Optimisation et enregistrement de la photo...')
  const dataUrl=await compressImage(f)
  const res=await api({action:'saveOverride',data:{id,img:dataUrl}})
  if(res.ok){
   const j=await res.json()
   if(j.itemImages) itemImages=j.itemImages
   else itemImages[id]=dataUrl
   renderMenu($('#search-item') ? $('#search-item').value : '')
   showToast('Photo mise à jour avec succès !')
  } else {
   showToast('Erreur lors de l\\'enregistrement')
  }
 }catch(err){
  console.error(err)
  showToast('Erreur lors du traitement de la photo')
 }
}
`;

html = html.replace('// MENU ITEMS LIST ACTIONS (STOCK, PRICE, DELETE)', itemPhotoEvents + '\n// MENU ITEMS LIST ACTIONS (STOCK, PRICE, DELETE)');

// 9. Add reset-img act handling inside items-list onclick
const resetImgAct = `  if(btn.dataset.act==='reset-img'){
   if(!confirm('Rétablir la photo par défaut pour cet article ?')) return
   const res=await api({action:'saveOverride',data:{id,img:null}})
   if(res.ok){
    const j=await res.json()
    if(j.itemImages) itemImages=j.itemImages
    else delete itemImages[id]
    renderMenu($('#search-item') ? $('#search-item').value : '')
    showToast('Photo par défaut rétablie')
   }
  }`;

html = html.replace(
  "if(btn.dataset.act==='del-custom'){",
  resetImgAct + "\n  if(btn.dataset.act==='del-custom'){"
);

fs.writeFileSync('public/gerant/index.html', html, 'utf8');
console.log('Successfully updated public/gerant/index.html');
