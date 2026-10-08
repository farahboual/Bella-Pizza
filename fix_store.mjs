import { readFileSync, writeFileSync } from 'fs'
let c = readFileSync('lib/store.js', 'utf8')

const old = [
  "   try{",
  "    const ovRows=await rest('menu_overrides?select=*')",
  "    if(Array.isArray(ovRows)){",
  "     ovRows.forEach(r=>{",
  "      if(r.id&&r.id.startsWith('custom:')&&r.price&&r.price>0){",
  "       const parts=r.id.split(':')",
  "       if(parts.length>=3){",
  "        const name=decodeURIComponent(parts[1]||'')",
  "        const cat=decodeURIComponent(parts[2]||'Divers')",
  "        const desc=decodeURIComponent(parts[3]||'')",
  "        res[r.id]={id:r.id,name,cat,price:r.price,desc}",
  "       }",
  "      }",
  "     })",
  "    }",
  "   }catch{}",
  "   return res",
  "  },"
].join('\n')

const neo = [
  "   try{",
  "    const ovRows=await rest('menu_overrides?select=*')",
  "    if(Array.isArray(ovRows)){",
  "     ovRows.forEach(r=>{",
  "      if(r.id&&r.id.startsWith('custom:')&&r.price&&r.price>0){",
  "       const parts=r.id.split(':')",
  "       // Encoded format: custom:TIMESTAMP:name:cat:desc (>=5 parts)",
  "       if(parts.length>=5){",
  "        const realId=parts[0]+':'+parts[1]",
  "        if(!res[realId]){",
  "         const name=decodeURIComponent(parts[2]||'')",
  "         const cat=decodeURIComponent(parts[3]||'Divers')",
  "         const desc=decodeURIComponent(parts.slice(4).join(':'))",
  "         res[realId]={id:realId,name,cat,price:r.price,desc}",
  "        }",
  "       }",
  "      }",
  "     })",
  "    }",
  "   }catch{}",
  "   return res",
  "  },"
].join('\n')

if (!c.includes(old)) { console.error('NOT FOUND in file'); process.exit(1) }
c = c.replace(old, neo)
writeFileSync('lib/store.js', c, 'utf8')
console.log('OK – getCustomItems fallback patched')
