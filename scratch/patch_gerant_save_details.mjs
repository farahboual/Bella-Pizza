import fs from 'node:fs';

let lines = fs.readFileSync('public/gerant/index.html', 'utf8').split('\n');

const sIdx = lines.findIndex(l => l.includes("btn.dataset.act==='save-details'"));
console.log('save-details line:', sIdx);

if (sIdx !== -1) {
  // Find "showToast('Erreur lors de la sauvegarde')"
  const errIdx = lines.findIndex((l, i) => i > sIdx && l.includes("showToast('Erreur lors de la sauvegarde')"));
  if (errIdx !== -1) {
    const replacement = [
      '    if(res.status===401){',
      '     showToast(\'Session expirée, reconnexion...\')',
      '     setTimeout(()=>{ location.reload() }, 1200)',
      '     return',
      '    }',
      '    const errBody=await res.json().catch(()=>({}))',
      '    const msg = errBody.error || (\'Erreur serveur (\' + res.status + \')\')',
      '    showToast(msg)'
    ];
    lines.splice(errIdx, 1, ...replacement);
    console.log('✅ Replaced save-details error toast with detailed diagnostics');
  }
}

// Also check reset-details
const resetIdx = lines.findIndex(l => l.includes("btn.dataset.act==='reset-details'"));
if (resetIdx !== -1) {
  const returnIdx = lines.findIndex((l, i) => i > resetIdx && l.includes("return"));
  // before returnIdx, add else block if missing
  const hasElse = lines.slice(resetIdx, returnIdx).some(l => l.includes("} else {"));
  if (!hasElse) {
    // line before returnIdx is '   }'
    const insertIdx = returnIdx - 1;
    const elseBlock = [
      '   } else {',
      '    if(res.status===401){',
      '     showToast(\'Session expirée, reconnexion...\')',
      '     setTimeout(()=>{ location.reload() }, 1200)',
      '     return',
      '    }',
      '    const errBody=await res.json().catch(()=>({}))',
      '    showToast(errBody.error || (\'Erreur serveur (\' + res.status + \')\'))'
    ];
    lines.splice(insertIdx + 1, 0, ...elseBlock);
    console.log('✅ Added else block to reset-details');
  }
}

fs.writeFileSync('public/gerant/index.html', lines.join('\n'), 'utf8');
console.log('✅ public/gerant/index.html successfully updated');
