const fs = require('fs');
let src = fs.readFileSync('src/cart.jsx', 'utf8');

const OLD = [
  " useEffect(()=>{",
  "  fetch('/api/config')",
  "   .then(r=>r.ok?r.json():null)",
  "   .then(data=>{",
  "    setCfg(data)",
  "    if(data?.customItems){",
  "     setLines(l=>l.filter(a=>CATALOG[a.id]||(a.id.startsWith('custom:')&&!!data.customItems[a.id])))",
  "    }",
  "   })",
  "   .catch(()=>setCfg(null))",
  " },[])"
].join('\n');

const NEW = [
  " useEffect(()=>{",
  "  const refresh=()=>fetch('/api/config')",
  "   .then(r=>r.ok?r.json():null)",
  "   .then(data=>{",
  "    if(!data)return",
  "    setCfg(data)",
  "    if(data?.customItems){",
  "     setLines(l=>l.filter(a=>CATALOG[a.id]||(a.id.startsWith('custom:')&&!!data.customItems[a.id])))",
  "    }",
  "   })",
  "   .catch(()=>{})",
  "  refresh()",
  "  const id=setInterval(refresh,60000)",
  "  return()=>clearInterval(id)",
  " },[])"
].join('\n');

if (!src.includes(OLD)) {
  console.log('OLD block NOT FOUND');
  process.exit(1);
}

src = src.replace(OLD, NEW);
fs.writeFileSync('src/cart.jsx', src);
console.log('DONE — 60s polling added to /api/config fetch');
