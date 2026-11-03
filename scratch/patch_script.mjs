import fs from 'node:fs';

let lines = fs.readFileSync('public/gerant/index.html', 'utf8').split('\n');
const sIdx = lines.findIndex(l => l.includes("Optimisation et enregistrement de la photo..."));
console.log('sIdx:', sIdx);

if (sIdx !== -1) {
  const tryIdx = sIdx - 1;
  const errIdx = lines.findIndex((l, i) => i > sIdx && l.includes("Erreur lors du traitement de la photo"));
  const endIdx = errIdx + 1;
  console.log('Replacing from line', tryIdx, 'to', endIdx);
  const replacement = [
    ' try{',
    '  showToast(\'Optimisation de la photo...\')',
    '  const dataUrl=await compressImage(f)',
    '  showToast(\'Envoi au serveur...\')',
    '  const res=await api({action:\'saveOverride\',data:{id,img:dataUrl}})',
    '  if(res.ok){',
    '   const j=await res.json()',
    '   if(j.itemImages) itemImages=j.itemImages',
    '   else itemImages[id]=dataUrl',
    '   renderMenu($(\'#search-item\') ? $(\'#search-item\').value : \'\')',
    '   showToast(\'Photo mise à jour avec succès !\')',
    '  } else {',
    '   if(res.status===401){',
    '    showToast(\'Session expirée, reconnexion...\')',
    '    setTimeout(()=>{ location.reload() }, 1200)',
    '    return',
    '   }',
    '   const errBody=await res.json().catch(()=>({}))',
    '   const msg = errBody.error === \'too big\' ? \'Image trop volumineuse pour le serveur\' : (errBody.error || (\'Erreur serveur (\' + res.status + \')\'))',
    '   showToast(msg)',
    '  }',
    ' }catch(err){',
    '  console.error(err)',
    '  showToast(err.message || \'Erreur lors du traitement de la photo\')',
    ' }finally{',
    '  fileInput.value=\'\'',
    ' }'
  ];
  lines.splice(tryIdx, endIdx - tryIdx + 1, ...replacement);
  fs.writeFileSync('public/gerant/index.html', lines.join('\n'), 'utf8');
  console.log('SUCCESS: Replaced photo change handler!');
}
