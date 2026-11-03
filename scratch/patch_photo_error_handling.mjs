import fs from 'node:fs';

let g = fs.readFileSync('public/gerant/index.html', 'utf8');

const oldChange = `  try{
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

const newChange = `  try{
   showToast('Optimisation de la photo...')
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
    const msg = errBody.error === 'too big' ? 'Image trop volumineuse pour le serveur' : (errBody.error || ('Erreur serveur (' + res.status + ')'))
    showToast(msg)
   }
  }catch(err){
   console.error(err)
   showToast(err.message || 'Erreur lors du traitement de la photo')
  }finally{
   fileInput.value=''
  }`;

g = g.replace(/\r\n/g, '\n');
if (!g.includes(oldChange)) {
  console.error('❌ oldChange block not found');
  process.exit(1);
}
g = g.replace(oldChange, newChange);
fs.writeFileSync('public/gerant/index.html', g, 'utf8');
console.log('✅ Photo upload error handling updated in public/gerant/index.html');
