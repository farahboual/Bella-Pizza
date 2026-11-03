import fs from 'fs';
let s = fs.readFileSync('src/cart.jsx', 'utf8');
const searchStr = `           </div>
          })}
         </div>
        </div>
            <span>{m}</span>`;
console.log('Search match:', s.includes(searchStr));
if (s.includes(searchStr)) {
  const badBlock = `            <span>{m}</span>
            <button type="button" style={{...btn,opacity:n<1?.35:1}} disabled={n<1} onClick={()=>setN(n-1)} aria-label={\`Retirer un supplément \${m}\`}>−</button>
            <b aria-live="polite" style={{minWidth:14,textAlign:'center'}}>{n}</b>
            <button type="button" style={{...btn,opacity:n>=SUPP_MAX?.35:1}} disabled={n>=SUPP_MAX} onClick={()=>setN(n+1)} aria-label={\`Ajouter un supplément \${m}\`}>+</button>
           </div>
          })}
         </div>
        </div>`;
  s = s.replace(badBlock, '');
  fs.writeFileSync('src/cart.jsx', s, 'utf8');
  console.log('Removed duplicate block successfully!');
} else {
  // Let's print out what is there
  const idx = s.indexOf('<span>{m}</span>');
  console.log('idx:', idx);
  console.log('snippet:', JSON.stringify(s.slice(idx - 100, idx + 200)));
}
