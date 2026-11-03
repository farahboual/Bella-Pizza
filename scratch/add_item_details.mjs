import fs from 'node:fs';

// ── 1. lib/store.js ──────────────────────────────────────────────────────────
let code = fs.readFileSync('lib/store.js', 'utf8');

// Supabase: getConfigData – add itemDetails to return
code = code.replace(
  'itemImages:meta.itemImages||{},',
  'itemImages:meta.itemImages||{},\n     itemDetails:meta.itemDetails||{},'
);

// Supabase: updateConfigData – preserve itemDetails in JSON blob
code = code.replace(
  'const itemImages = patch.itemImages !== undefined ? patch.itemImages : (existing.itemImages || {})',
  'const itemImages = patch.itemImages !== undefined ? patch.itemImages : (existing.itemImages || {})\n   const itemDetails = patch.itemDetails !== undefined ? patch.itemDetails : (existing.itemDetails || {})'
);
code = code.replace(
  'JSON.stringify({ forcedOpen, hours, schedule, gerantPassword, kitchenPassword, itemImages })',
  'JSON.stringify({ forcedOpen, hours, schedule, gerantPassword, kitchenPassword, itemImages, itemDetails })'
);

// Memory: default config – add itemDetails
code = code.replace(
  'let memConfig={manualClosed:false,closedReason:\'\',forcedOpen:false,openMode:\'auto\',hours:null,schedule:DEFAULT_SCHEDULE,gerantPassword:\'\',kitchenPassword:\'\',itemImages:{},ribIban:\'\',ribBic:\'\',ribHolder:\'\',smsEnabled:false}',
  'let memConfig={manualClosed:false,closedReason:\'\',forcedOpen:false,openMode:\'auto\',hours:null,schedule:DEFAULT_SCHEDULE,gerantPassword:\'\',kitchenPassword:\'\',itemImages:{},itemDetails:{},ribIban:\'\',ribBic:\'\',ribHolder:\'\',smsEnabled:false}'
);

// Memory: updateConfigData – preserve itemDetails
code = code.replace(
  'const itemImages = p.itemImages !== undefined ? p.itemImages : (memConfig.itemImages || {})',
  'const itemImages = p.itemImages !== undefined ? p.itemImages : (memConfig.itemImages || {})\n   const itemDetails = p.itemDetails !== undefined ? p.itemDetails : (memConfig.itemDetails || {})'
);
code = code.replace(
  'Object.assign(memConfig, p, { manualClosed, forcedOpen, openMode, schedule, hours, closedReason, gerantPassword, kitchenPassword, itemImages })',
  'Object.assign(memConfig, p, { manualClosed, forcedOpen, openMode, schedule, hours, closedReason, gerantPassword, kitchenPassword, itemImages, itemDetails })'
);

fs.writeFileSync('lib/store.js', code, 'utf8');
console.log('✅ lib/store.js updated');

// ── 2. lib/handlers.js ───────────────────────────────────────────────────────
code = fs.readFileSync('lib/handlers.js', 'utf8');

// getConfig: return itemDetails
code = code.replace(
  'itemImages:cfg.itemImages||{},',
  'itemImages:cfg.itemImages||{},\n   itemDetails:cfg.itemDetails||{},'
);

// managerApi GET: return itemDetails
code = code.replace(
  'return send(res,200,{config,overrides,promos,sales,catalog:CATALOG,customItems,itemImages:config.itemImages||{},kitchenKey,gerantKey,dbStatus:getDbStatus()})',
  'return send(res,200,{config,overrides,promos,sales,catalog:CATALOG,customItems,itemImages:config.itemImages||{},itemDetails:config.itemDetails||{},kitchenKey,gerantKey,dbStatus:getDbStatus()})'
);

// managerApi POST: handle saveDetails action (insert before savePromo)
const saveDetailsAction = `   if(action==='saveDetails'){
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
   }
`;

code = code.replace(
  "   if(action==='savePromo'){",
  saveDetailsAction + "   if(action==='savePromo'){"
);

// managerApi saveOverride: also return itemDetails
code = code.replace(
  'return send(res,200,{overrides:await store.getMenuOverrides(),itemImages:updatedCfg.itemImages||{}})',
  'return send(res,200,{overrides:await store.getMenuOverrides(),itemImages:updatedCfg.itemImages||{},itemDetails:updatedCfg.itemDetails||{}})'
);

fs.writeFileSync('lib/handlers.js', code, 'utf8');
console.log('✅ lib/handlers.js updated');
