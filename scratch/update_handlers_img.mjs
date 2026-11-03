import fs from 'node:fs';

let code = fs.readFileSync('lib/handlers.js', 'utf8');

// 1. In getConfig: return itemImages
code = code.replace(
  /customItems,(\r?\n\s+dbStatus:)/,
  `customItems,\n   itemImages:cfg.itemImages||{},\$1`
);

// 2. In managerApi GET: return itemImages
code = code.replace(
  /return send\(res,200,\{config,overrides,promos,sales,catalog:CATALOG,customItems,kitchenKey,gerantKey,dbStatus:getDbStatus\(\)\}\)/,
  `return send(res,200,{config,overrides,promos,sales,catalog:CATALOG,customItems,itemImages:config.itemImages||{},kitchenKey,gerantKey,dbStatus:getDbStatus()})`
);

// 3. In managerApi POST: increase readBody to 2e6 (2MB) for image data
code = code.replace(
  /const raw=await readBody\(req,50e3\)/,
  `const raw=await readBody(req,2e6)`
);

// 4. In managerApi saveOverride: handle img
const oldSaveOverride = `   if(action==='saveOverride'){
    const {id,price,outOfStock}=data||{}
    const customItems=await store.getCustomItems()
    const fullCatalog={...CATALOG,...customItems}
    if(!id||!fullCatalog[id])return send(res,400,{error:'invalid item id'})
    const patch={}
    if(price!==undefined)patch.price=price?+price:null
    if(outOfStock!==undefined)patch.outOfStock=!!outOfStock
    if(data?.hidden!==undefined)patch.hidden=!!data.hidden
    await store.saveMenuOverride(id,patch)
    return send(res,200,await store.getMenuOverrides())
   }`;

const newSaveOverride = `   if(action==='saveOverride'){
    const {id,price,outOfStock,img}=data||{}
    const customItems=await store.getCustomItems()
    const fullCatalog={...CATALOG,...customItems}
    if(!id||!fullCatalog[id])return send(res,400,{error:'invalid item id'})
    const patch={}
    if(price!==undefined)patch.price=price?+price:null
    if(outOfStock!==undefined)patch.outOfStock=!!outOfStock
    if(data?.hidden!==undefined)patch.hidden=!!data.hidden
    await store.saveMenuOverride(id,patch)
    if(img!==undefined){
     const cfg=await store.getConfigData()
     const itemImages={...(cfg.itemImages||{})}
     if(img){
      itemImages[id]=img
     }else{
      delete itemImages[id]
     }
     await store.updateConfigData({itemImages})
    }
    const updatedCfg=await store.getConfigData()
    return send(res,200,{overrides:await store.getMenuOverrides(),itemImages:updatedCfg.itemImages||{}})
   }`;

code = code.replace(/if\(action==='saveOverride'\)[\s\S]*?return send\(res,200,await store\.getMenuOverrides\(\)\)\r?\n\s+\}/, newSaveOverride.trim());

// 5. In managerApi saveCustomItem: pass img
code = code.replace(
  /const \{id,name,cat,price,desc\}=data\|\|\{\}/,
  `const {id,name,cat,price,desc,img}=data||{}`
);
code = code.replace(
  /await store\.saveCustomItem\(itemId,\{id:itemId,name:clean\(name,80\),cat:clean\(cat,40\)\|\|'Divers',price:\+price,desc:clean\(desc,150\)\}\)/,
  `await store.saveCustomItem(itemId,{id:itemId,name:clean(name,80),cat:clean(cat,40)||'Divers',price:+price,desc:clean(desc,150),img:img||''})`
);

fs.writeFileSync('lib/handlers.js', code, 'utf8');
console.log('Successfully updated lib/handlers.js');
