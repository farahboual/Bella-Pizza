import fs from 'node:fs';

let code = fs.readFileSync('lib/handlers.js', 'utf8');

const oldBlock = `    if(img!==undefined){
     const cfg=await store.getConfigData()
     const itemImages={...(cfg.itemImages||{})}
     if(img){
      itemImages[id]=img
     }else{
      delete itemImages[id]
     }
     await store.updateConfigData({itemImages})
    }`;

const newBlock = `    if(img!==undefined){
     const cfg=await store.getConfigData()
     const itemImages={...(cfg.itemImages||{})}
     const parts=String(id).split(':')
     const baseSlug=parts[1]||parts[0]
     if(img){
      itemImages[id]=img
      if(baseSlug) itemImages[baseSlug]=img
      if(parts[0]==='pizzas'&&baseSlug){
       itemImages[\`pizzas:\${baseSlug}:junior\`]=img
       itemImages[\`pizzas:\${baseSlug}:senior\`]=img
       itemImages[\`pizzas:\${baseSlug}:mega\`]=img
      }
     }else{
      delete itemImages[id]
      if(baseSlug) delete itemImages[baseSlug]
      if(parts[0]==='pizzas'&&baseSlug){
       delete itemImages[\`pizzas:\${baseSlug}:junior\`]
       delete itemImages[\`pizzas:\${baseSlug}:senior\`]
       delete itemImages[\`pizzas:\${baseSlug}:mega\`]
      }
     }
     await store.updateConfigData({itemImages})
    }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('lib/handlers.js', code, 'utf8');
console.log('Successfully enhanced handlers photo logic');
