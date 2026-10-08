import { readFileSync, writeFileSync } from 'fs'

// ── cart.jsx: purge deleted custom items when cfg loads ───────────────────────
let cart = readFileSync('src/cart.jsx', 'utf8')

const cfgEffectOld = `useEffect(()=>{fetch('/api/config').then(r=>r.ok?r.json():null).then(setCfg).catch(()=>setCfg(null))},[])`
const cfgEffectNew = `useEffect(()=>{fetch('/api/config').then(r=>r.ok?r.json():null).then(data=>{setCfg(data);if(data?.customItems){setLines(l=>l.filter(a=>CATALOG[a.id]||(a.id.startsWith('custom:')&&!!data.customItems[a.id])))}}).catch(()=>setCfg(null))},[])`

if (!cart.includes(cfgEffectOld)) { console.error('cfg effect not found in cart.jsx'); process.exit(1) }
cart = cart.replace(cfgEffectOld, cfgEffectNew)
console.log('✓ cart.jsx: deleted custom items purged from cart when config loads')

writeFileSync('src/cart.jsx', cart, 'utf8')

// ── App.jsx: fix Spécialités tab ──────────────────────────────────────────────
let app = readFileSync('src/App.jsx', 'utf8')

// The Menu function uses useCart() at the top — we need to destructure getPrice and isOut there too
// Currently: const {cfg}=useCart()
const menuHookOld = `  const {cfg}=useCart()`
const menuHookNew = `  const {cfg,getPrice,isOut}=useCart()`

if (!app.includes(menuHookOld)) { console.error('Menu useCart hook not found'); process.exit(1) }
app = app.replace(menuHookOld, menuHookNew)
console.log('✓ App.jsx: Menu() now destructures getPrice, isOut from useCart')

// Fix Spécialités custom items rendering: use live price + rupture badge
// Current:  {customList.map(it=>(
//             <Row key={it.id} n={it.name} d={it.desc||it.cat} p={eur(it.price)} id={it.id}/>
//           ))}
const specialOld = `                  {customList.map(it=>(
                    <Row key={it.id} n={it.name} d={it.desc||it.cat} p={eur(it.price)} id={it.id}/>
                  ))}`
const specialNew = `                  {customList.map(it=>{
                    const liveP=getPrice(it.id,cfg)||it.price
                    const out=isOut(it.id,cfg)
                    return(
                      <div key={it.id} className={'row'+(out?' row-out':'')}>
                        <h4 style={out?{color:'var(--mute)'}:{}}>{it.name}</h4>
                        {(it.desc||it.cat)&&<p style={out?{color:'var(--mute)'}:{}}>{it.desc||it.cat}</p>}
                        <div className="pcol">
                          <motion.span key={liveP} className="pr" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{eur(liveP)}</motion.span>
                          {out?<span className="tag-out">Rupture</span>:<AddBtn id={it.id}/>}
                        </div>
                      </div>
                    )
                  })}`

if (!app.includes(specialOld)) { console.error('Spécialités rendering not found'); process.exit(1) }
app = app.replace(specialOld, specialNew)
console.log('✓ App.jsx: Spécialités tab uses live price + rupture badge')

writeFileSync('src/App.jsx', app, 'utf8')
console.log('All patches applied!')
