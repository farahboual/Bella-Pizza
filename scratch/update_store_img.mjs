import fs from 'node:fs';

let code = fs.readFileSync('lib/store.js', 'utf8');

// 1. In supabase().getConfigData: return itemImages
code = code.replace(
  /kitchenPassword:meta\.kitchenPassword\|\|'',(\r?\n\s+ribIban:)/,
  `kitchenPassword:meta.kitchenPassword||'',\n    itemImages:meta.itemImages||{},\$1`
);

// 2. In supabase().updateConfigData: preserve & save itemImages in JSON
code = code.replace(
  /const closedReason = patch\.closedReason !== undefined \? patch\.closedReason : \(existing\.closedReason \|\| ''\)/,
  `const closedReason = patch.closedReason !== undefined ? patch.closedReason : (existing.closedReason || '')\n   const itemImages = patch.itemImages !== undefined ? patch.itemImages : (existing.itemImages || {})`
);
code = code.replace(
  /JSON\.stringify\(\{\s*forcedOpen,\s*hours,\s*schedule,\s*gerantPassword,\s*kitchenPassword\s*\}\)/,
  `JSON.stringify({ forcedOpen, hours, schedule, gerantPassword, kitchenPassword, itemImages })`
);

// 3. In supabase().getCustomItems: attach img
code = code.replace(
  /async getCustomItems\(\)\{([\s\S]*?)const res=\{\}/,
  `async getCustomItems(){\n   const cfgData = await this.getConfigData().catch(()=>({}))\n   const itemImgs = cfgData.itemImages || {}\n   const res={}`
);
code = code.replace(
  /rows\.forEach\(r=>\{res\[r\.id\]=\{id:r\.id,name:r\.name,cat:r\.cat\|\|'Divers',price:r\.price,desc:r\.desc\|\|''\}\}\)/,
  `rows.forEach(r=>{res[r.id]={id:r.id,name:r.name,cat:r.cat||'Divers',price:r.price,desc:r.desc||'',img:itemImgs[r.id]||r.img||''}})`
);
code = code.replace(
  /res\[realId\]=\{id:realId,name,cat,price:r\.price,desc\}/,
  `res[realId]={id:realId,name,cat,price:r.price,desc,img:itemImgs[realId]||''}`
);

// 4. In supabase().saveCustomItem & deleteCustomItem: save & delete itemImages
code = code.replace(
  /async saveCustomItem\(id,item\)\{/,
  `async saveCustomItem(id,item){\n   if(item.img){\n    const cfgData=await this.getConfigData().catch(()=>({}))\n    const itemImages={...(cfgData.itemImages||{})}\n    itemImages[id]=item.img\n    await this.updateConfigData({itemImages})\n   }`
);
code = code.replace(
  /async deleteCustomItem\(id\)\{/,
  `async deleteCustomItem(id){\n   const cfgData=await this.getConfigData().catch(()=>({}))\n   if(cfgData.itemImages&&cfgData.itemImages[id]){\n    const itemImages={...cfgData.itemImages}\n    delete itemImages[id]\n    await this.updateConfigData({itemImages})\n   }`
);

// 5. In memory():
code = code.replace(
  /let memConfig=\{manualClosed:false,closedReason:'',forcedOpen:false,openMode:'auto',hours:null,schedule:DEFAULT_SCHEDULE,gerantPassword:'',kitchenPassword:'',ribIban:'',ribBic:'',ribHolder:'',smsEnabled:false\}/,
  `let memConfig={manualClosed:false,closedReason:'',forcedOpen:false,openMode:'auto',hours:null,schedule:DEFAULT_SCHEDULE,gerantPassword:'',kitchenPassword:'',itemImages:{},ribIban:'',ribBic:'',ribHolder:'',smsEnabled:false}`
);
code = code.replace(
  /Object\.assign\(memConfig, p, \{ manualClosed, forcedOpen, openMode, schedule, hours, closedReason, gerantPassword, kitchenPassword \}\)/,
  `const itemImages = p.itemImages !== undefined ? p.itemImages : (memConfig.itemImages || {})\n   Object.assign(memConfig, p, { manualClosed, forcedOpen, openMode, schedule, hours, closedReason, gerantPassword, kitchenPassword, itemImages })`
);
code = code.replace(
  /memCustomItems\[id\]=\{id,name:item\.name,cat:item\.cat\|\|'Divers',price:\+item\.price,desc:item\.desc\|\|''\}/,
  `memCustomItems[id]={id,name:item.name,cat:item.cat||'Divers',price:+item.price,desc:item.desc||'',img:item.img||''}\n   if(item.img){ if(!memConfig.itemImages) memConfig.itemImages={}; memConfig.itemImages[id]=item.img }`
);
code = code.replace(
  /delete memCustomItems\[id\](\r?\n\s+delete memOverrides\[id\])/,
  `delete memCustomItems[id]\$1\n   if(memConfig.itemImages) delete memConfig.itemImages[id]`
);

fs.writeFileSync('lib/store.js', code, 'utf8');
console.log('Successfully updated lib/store.js');
