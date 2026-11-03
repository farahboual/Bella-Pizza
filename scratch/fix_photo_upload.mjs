import fs from 'node:fs';

// 1. UPDATE lib/handlers.js
let h = fs.readFileSync('lib/handlers.js', 'utf8');

// Increase readBody limit from 2e6 to 5e6
h = h.replace('const raw=await readBody(req,2e6)', 'const raw=await readBody(req,5e6)');

// De-duplicate pizza base64 storage
const oldPizzaImgBlock = `      if(img){
       itemImages[id]=img
       if(baseSlug) itemImages[baseSlug]=img
       if(parts[0]==='pizzas'&&baseSlug){
        itemImages[\`pizzas:\${baseSlug}:junior\`]=img
        itemImages[\`pizzas:\${baseSlug}:senior\`]=img
        itemImages[\`pizzas:\${baseSlug}:mega\`]=img
       }
      }else{`;

const newPizzaImgBlock = `      if(img){
       itemImages[id]=img
       if(baseSlug) itemImages[baseSlug]=img
       // For pizzas, clean up legacy duplicate sub-size keys to drastically save storage and bandwidth
       if(parts[0]==='pizzas'&&baseSlug){
        delete itemImages[\`pizzas:\${baseSlug}:junior\`]
        delete itemImages[\`pizzas:\${baseSlug}:senior\`]
        delete itemImages[\`pizzas:\${baseSlug}:mega\`]
       }
      }else{`;

// Normalize \r\n for replace
h = h.replace(/\r\n/g, '\n');
if (h.includes(oldPizzaImgBlock)) {
  h = h.replace(oldPizzaImgBlock, newPizzaImgBlock);
  console.log('✅ De-duplicated pizza images in handlers.js');
} else {
  console.log('⚠️ oldPizzaImgBlock not found directly, checking variations...');
}

fs.writeFileSync('lib/handlers.js', h, 'utf8');
console.log('✅ lib/handlers.js updated');

// 2. UPDATE public/gerant/index.html
let g = fs.readFileSync('public/gerant/index.html', 'utf8');
g = g.replace(/\r\n/g, '\n');

// A. Improve compressImage (480x480, 0.72 quality, webp/jpeg fallback, format validation)
const oldCompress = `function compressImage(file, maxW=640, maxH=640, quality=0.82){
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
}`;

const newCompress = `function compressImage(file, maxW=480, maxH=480, quality=0.72){
 return new Promise((resolve, reject)=>{
  if(!file){ resolve(''); return }
  if(file.type && !file.type.startsWith('image/')){
   reject(new Error('Fichier invalide : veuillez sélectionner une image (JPG, PNG, WebP)'))
   return
  }
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
    let dataUrl=''
    try {
     dataUrl=canvas.toDataURL('image/webp', quality)
     if(!dataUrl || !dataUrl.startsWith('data:image/webp')){
      dataUrl=canvas.toDataURL('image/jpeg', quality)
     }
    } catch {
     dataUrl=canvas.toDataURL('image/jpeg', quality)
    }
    resolve(dataUrl)
   }
   img.onerror=()=>{
    reject(new Error('Format non reconnu. Pour les photos iPhone, assurez-vous d\\'exporter en JPG standard.'))
   }
   img.src=e.target.result
  }
  reader.onerror=()=>reject(new Error('Erreur de lecture du fichier'))
  reader.readAsDataURL(file)
 })
}`;

if (g.includes(oldCompress)) {
  g = g.replace(oldCompress, newCompress);
  console.log('✅ compressImage function enhanced');
} else {
  console.log('⚠️ oldCompress not found in index.html');
}

// B. Resolve baseSlug image in renderMenu so pizzas share the image without duplication
const oldCustomImg = `  const customImg = itemImages[id] || (isCustom && item.img)
  const defaultImg = item.img || (catalog[id] && catalog[id].img) || '/client-assets/pizza.jpg'
  const displayImg = customImg || defaultImg
  const hasCustomImg = !!customImg`;

const newCustomImg = `  const parts = String(id).split(':')
  const baseSlug = parts[1] || ''
  const customImg = itemImages[id] || (baseSlug && itemImages[baseSlug]) || (isCustom && item.img)
  const defaultImg = item.img || (catalog[id] && catalog[id].img) || '/client-assets/pizza.jpg'
  const displayImg = customImg || defaultImg
  const hasCustomImg = !!(itemImages[id] || (baseSlug && itemImages[baseSlug]))`;

if (g.includes(oldCustomImg)) {
  g = g.replace(oldCustomImg, newCustomImg);
  console.log('✅ renderMenu baseSlug resolver updated');
}

// C. Improve items-list.onchange photo handler with detailed diagnostics and auto-reconnect
const oldPhotoChange = `  try{
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
  }`;

const newPhotoChange = `  try{
   showToast('Compression & optimisation de la photo...')
   const dataUrl=await compressImage(f)
   showToast('Envoi au serveur...')
   const res=await api({action:'saveOverride',data:{id,img:dataUrl}})
   if(res.ok){
    const j=await res.json()
    if(j.itemImages) itemImages=j.itemImages
    else itemImages[id]=dataUrl
    renderMenu($('#search-item') ? $('#search-item').value : '')
    showToast('Photo mise à jour avec succès !')
   } else {
    if(res.status===401){
     showToast('Session expirée, reconnexion...')
     setTimeout(()=>{ location.reload() }, 1200)
     return
    }
    const errBody=await res.json().catch(()=>({}))
    const msg = errBody.error === 'too big' ? 'Image trop volumineuse pour le serveur' : (errBody.error || \`Erreur serveur (\${res.status})\`)
    showToast(msg)
   }
  }catch(err){
   console.error(err)
   showToast(err.message || 'Erreur lors du traitement de la photo')
  }finally{
   fileInput.value=''
  }`;

if (g.includes(oldPhotoChange)) {
  g = g.replace(oldPhotoChange, newPhotoChange);
  console.log('✅ items-list.onchange error handling enhanced');
}

// D. Improve reset-img handler
const oldResetImg = `    const res=await api({action:'saveOverride',data:{id,img:null}})
    if(res.ok){
     const j=await res.json()
     if(j.itemImages) itemImages=j.itemImages
     else delete itemImages[id]
     renderMenu($('#search-item') ? $('#search-item').value : '')
     showToast('Photo par défaut rétablie')
    }`;

const newResetImg = `    showToast('Rétablissement de la photo...')
    const res=await api({action:'saveOverride',data:{id,img:null}})
    if(res.ok){
     const j=await res.json()
     if(j.itemImages) itemImages=j.itemImages
     else {
      delete itemImages[id]
      const p=String(id).split(':')
      if(p[1]) delete itemImages[p[1]]
     }
     renderMenu($('#search-item') ? $('#search-item').value : '')
     showToast('Photo par défaut rétablie')
    }`;

if (g.includes(oldResetImg)) {
  g = g.replace(oldResetImg, newResetImg);
  console.log('✅ reset-img handler enhanced');
}

fs.writeFileSync('public/gerant/index.html', g, 'utf8');
console.log('✅ public/gerant/index.html updated');
