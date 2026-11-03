import fs from 'node:fs';

// 1. UPDATE lib/store.js
let storeCode = fs.readFileSync('lib/store.js', 'utf8').replace(/\r\n/g, '\n');

// Add resolution=merge-duplicates to config POST
storeCode = storeCode.replace(
  "await rest('config',{method:'POST',headers:ret,body:JSON.stringify({id:'main',...p})})",
  "await rest('config',{method:'POST',headers:{...ret,Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:'main',...p})})"
);
fs.writeFileSync('lib/store.js', storeCode, 'utf8');
console.log('✅ lib/store.js updated (safe upsert for config)');

// 2. UPDATE lib/handlers.js
let hCode = fs.readFileSync('lib/handlers.js', 'utf8').replace(/\r\n/g, '\n');

const oldSaveDetails = `   if(action==='saveDetails'){
    const {id,name,desc}=data||{}
    if(!id)return send(res,400,{error:'id is required'})
    const customItems=await store.getCustomItems()
    const fullCatalog={...CATALOG,...customItems}
    if(!fullCatalog[id]&&!customItems[id])return send(res,400,{error:'invalid item id'})
    // For custom items, update via saveCustomItem preserving price/img
    if(customItems[id]){
     const existing=customItems[id]
     const newName=name!==undefined?clean(name,80):existing.name
     const newDesc=desc!==undefined?clean(desc,200):existing.desc
     await store.saveCustomItem(id,{...existing,name:newName,desc:newDesc})
     return send(res,200,{customItems:await store.getCustomItems()})
    }
    // For catalog items: store overrides in itemDetails
    const cfg=await store.getConfigData()
    const itemDetails={...(cfg.itemDetails||{})}
    if(!itemDetails[id]) itemDetails[id]={}
    if(name!==undefined) itemDetails[id].name=clean(name,80)
    if(desc!==undefined) itemDetails[id].desc=clean(desc,200)
    // Apply to all pizza sizes if applicable
    const parts=String(id).split(':')
    if(parts[0]==='pizzas'&&parts[1]){
     const baseSlug=parts[1]
     ;['junior','senior','mega'].forEach(sz=>{
      const pid=\`pizzas:\${baseSlug}:\${sz}\`
      if(!itemDetails[pid]) itemDetails[pid]={}
      if(name!==undefined) itemDetails[pid].name=clean(name,80)
      if(desc!==undefined) itemDetails[pid].desc=clean(desc,200)
     })
    }
    // Remove entry if both cleared
    if(!itemDetails[id].name&&!itemDetails[id].desc) delete itemDetails[id]
    await store.updateConfigData({itemDetails})
    const updatedCfg=await store.getConfigData()
    return send(res,200,{itemDetails:updatedCfg.itemDetails||{}})
   }`;

const newSaveDetails = `   if(action==='saveDetails'){
    const {id,name,desc}=data||{}
    if(!id)return send(res,400,{error:'id is required'})
    const cleanId=decodeURIComponent(String(id||'')).trim()
    const rawCustomItems=await store.getCustomItems()
    const customObj=Array.isArray(rawCustomItems)
     ? Object.fromEntries(rawCustomItems.map(c=>[c.id,c]))
     : (rawCustomItems||{})
    const fullCatalog={...CATALOG,...customObj}
    const resolvedId=(fullCatalog[id]||customObj[id]) ? id : (fullCatalog[cleanId]||customObj[cleanId]) ? cleanId : null
    if(!resolvedId)return send(res,400,{error:'invalid item id: '+id})

    // For custom items, update via saveCustomItem preserving price/img
    if(customObj[resolvedId]){
     const existing=customObj[resolvedId]
     const newName=name!==undefined?clean(name,80):existing.name
     const newDesc=desc!==undefined?clean(desc,200):existing.desc
     await store.saveCustomItem(resolvedId,{...existing,name:newName,desc:newDesc})
     return send(res,200,{customItems:await store.getCustomItems()})
    }

    // For catalog items: store overrides in itemDetails
    const cfg=await store.getConfigData()
    const itemDetails={...(cfg.itemDetails||{})}
    if(!itemDetails[resolvedId]) itemDetails[resolvedId]={}
    if(name!==undefined) itemDetails[resolvedId].name=clean(name,80)
    if(desc!==undefined) itemDetails[resolvedId].desc=clean(desc,200)

    // Apply to all pizza sizes and baseSlug if applicable
    const parts=String(resolvedId).split(':')
    if(parts[0]==='pizzas'&&parts[1]){
     const baseSlug=parts[1]
     if(!itemDetails[baseSlug]) itemDetails[baseSlug]={}
     if(name!==undefined) itemDetails[baseSlug].name=clean(name,80)
     if(desc!==undefined) itemDetails[baseSlug].desc=clean(desc,200)
     ;['junior','senior','mega'].forEach(sz=>{
      const pid=\`pizzas:\${baseSlug}:\${sz}\`
      if(!itemDetails[pid]) itemDetails[pid]={}
      if(name!==undefined) itemDetails[pid].name=clean(name,80)
      if(desc!==undefined) itemDetails[pid].desc=clean(desc,200)
     })
    }

    // Clean up empty entries on reset
    if(!itemDetails[resolvedId].name&&!itemDetails[resolvedId].desc) delete itemDetails[resolvedId]
    if(parts[0]==='pizzas'&&parts[1]){
     const baseSlug=parts[1]
     if(itemDetails[baseSlug]&&!itemDetails[baseSlug].name&&!itemDetails[baseSlug].desc) delete itemDetails[baseSlug]
     ;['junior','senior','mega'].forEach(sz=>{
      const pid=\`pizzas:\${baseSlug}:\${sz}\`
      if(itemDetails[pid]&&!itemDetails[pid].name&&!itemDetails[pid].desc) delete itemDetails[pid]
     })
    }

    await store.updateConfigData({itemDetails})
    const updatedCfg=await store.getConfigData()
    return send(res,200,{itemDetails:updatedCfg.itemDetails||{}})
   }`;

if (!hCode.includes(oldSaveDetails)) {
  console.error('❌ oldSaveDetails block not found in lib/handlers.js');
  process.exit(1);
}
hCode = hCode.replace(oldSaveDetails, newSaveDetails);
fs.writeFileSync('lib/handlers.js', hCode, 'utf8');
console.log('✅ lib/handlers.js updated (robust item id lookup + baseSlug details)');

// 3. UPDATE public/gerant/index.html
let gCode = fs.readFileSync('public/gerant/index.html', 'utf8').replace(/\r\n/g, '\n');

// A. Look up baseSlug in renderMenu for liveDetails
const oldLiveDetails = '  const liveDetails = itemDetails[id] || {}';
const newLiveDetails = '  const liveDetails = itemDetails[id] || (baseSlug && itemDetails[baseSlug]) || {}';
if (gCode.includes(oldLiveDetails)) {
  gCode = gCode.replace(oldLiveDetails, newLiveDetails);
  console.log('✅ Updated liveDetails baseSlug lookup in renderMenu');
}

// B. Improve save-details & reset-details error handling
const oldSaveDetailsClient = `   if(btn.dataset.act==='save-details'){
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
   }`;

const newSaveDetailsClient = `   if(btn.dataset.act==='save-details'){
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
     if(res.status===401){
      showToast('Session expirée, reconnexion...')
      setTimeout(()=>{ location.reload() }, 1200)
      return
     }
     const errBody=await res.json().catch(()=>({}))
     const msg = errBody.error || ('Erreur serveur (' + res.status + ')')
     showToast(msg)
    }
    return
   }`;

if (gCode.includes(oldSaveDetailsClient)) {
  gCode = gCode.replace(oldSaveDetailsClient, newSaveDetailsClient);
  console.log('✅ Updated save-details client error handling');
}

// C. Improve reset-details error handling
const oldResetDetailsClient = `   if(btn.dataset.act==='reset-details'){
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
   }`;

const newResetDetailsClient = `   if(btn.dataset.act==='reset-details'){
    if(!confirm('Rétablir le nom et la description originaux ?')) return
    showToast('Rétablissement des détails originaux...')
    const res=await api({action:'saveDetails',data:{id,name:'',desc:''}})
    if(res.ok){
     const j=await res.json()
     if(j.itemDetails) itemDetails=j.itemDetails
     if(j.customItems) customItems=j.customItems
     renderMenu($('#search-item')?$('#search-item').value:'')
     showToast('Détails originaux rétablis')
    } else {
     if(res.status===401){
      showToast('Session expirée, reconnexion...')
      setTimeout(()=>{ location.reload() }, 1200)
      return
     }
     const errBody=await res.json().catch(()=>({}))
     showToast(errBody.error || ('Erreur serveur (' + res.status + ')'))
    }
    return
   }`;

if (gCode.includes(oldResetDetailsClient)) {
  gCode = gCode.replace(oldResetDetailsClient, newResetDetailsClient);
  console.log('✅ Updated reset-details client error handling');
}

fs.writeFileSync('public/gerant/index.html', gCode, 'utf8');
console.log('✅ public/gerant/index.html updated successfully');
