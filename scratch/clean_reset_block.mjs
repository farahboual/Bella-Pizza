import fs from 'node:fs';

let lines = fs.readFileSync('public/gerant/index.html', 'utf8').split('\n');

const sIdx = lines.findIndex(l => l.includes("btn.dataset.act==='reset-details'"));
const eIdx = lines.findIndex((l, i) => i > sIdx && l.includes("btn.dataset.act==='del-custom'"));

console.log('sIdx:', sIdx, 'eIdx:', eIdx);

const cleanBlock = [
  '  if(btn.dataset.act===\'reset-details\'){',
  '   if(!confirm(\'Rétablir le nom et la description originaux ?\')) return',
  '   showToast(\'Rétablissement des détails originaux...\')',
  '   const res=await api({action:\'saveDetails\',data:{id,name:\'\',desc:\'\'}})',
  '   if(res.ok){',
  '    const j=await res.json()',
  '    if(j.itemDetails) itemDetails=j.itemDetails',
  '    if(j.customItems) customItems=j.customItems',
  '    renderMenu($(\'#search-item\')?$(\'#search-item\').value:\'\')',
  '    showToast(\'Détails originaux rétablis\')',
  '   } else {',
  '    if(res.status===401){',
  '     showToast(\'Session expirée, reconnexion...\')',
  '     setTimeout(()=>{ location.reload() }, 1200)',
  '     return',
  '    }',
  '    const errBody=await res.json().catch(()=>({}))',
  '    showToast(errBody.error || (\'Erreur serveur (\' + res.status + \')\'))',
  '   }',
  '   return',
  '  }'
];

lines.splice(sIdx, eIdx - sIdx, ...cleanBlock);
fs.writeFileSync('public/gerant/index.html', lines.join('\n'), 'utf8');
console.log('✅ reset-details block cleaned up');
