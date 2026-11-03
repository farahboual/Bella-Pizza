import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove bgChoice and simplify background image map to directly follow 'cat'
const oldBgLogic = `  const [bgChoice, setBgChoice] = useState('auto')

  const bgImages = {
    pizzas: getItemImg('pizzas', 'pizza') || pizzaImg,
    burgers: getItemImg('burgers', 'burger') || burgersImg,
    salades: getItemImg('salades', 'salade') || saladesImg
  }
  const effectiveBgKey = bgChoice === 'auto'
    ? (cat === 'burgers' ? 'burgers' : cat === 'salades' ? 'salades' : 'pizzas')
    : bgChoice
  const activeBgImg = bgImages[effectiveBgKey] || bgImages.pizzas`;

const newBgLogic = `  const bgImages = {
    pizzas: getItemImg('pizzas', 'pizza') || pizzaImg,
    burgers: getItemImg('burgers', 'burger') || burgersImg,
    salades: getItemImg('salades', 'salade') || saladesImg
  }
  const activeBgImg = bgImages[cat] || bgImages.pizzas`;

code = code.replace(/\r\n/g, '\n');
const oldBgLogicNorm = oldBgLogic.replace(/\r\n/g, '\n');
const newBgLogicNorm = newBgLogic.replace(/\r\n/g, '\n');

if (!code.includes(oldBgLogicNorm)) {
  console.error('Could not locate oldBgLogic');
  process.exit(1);
}
code = code.replace(oldBgLogicNorm, newBgLogicNorm);

// 2. Remove separate ambiance switcher toolbar completely
const oldSwitcher = `        {/* Background switcher & ambiance control */}
        <div className="menu-ambiance-bar" role="toolbar" aria-label="Ambiance culinaire de fond">
          <span className="ambiance-label">✨ Fond d’ambiance :</span>
          <div className="ambiance-pills">
            {[
              { id: 'auto', label: '⚡ Auto (synchro carte)' },
              { id: 'pizzas', label: '🍕 Pizzas' },
              { id: 'burgers', label: '🍔 Burgers' },
              { id: 'salades', label: '🥗 Salades' }
            ].map(b => (
              <button
                key={b.id}
                type="button"
                className={\`ambiance-pill \${bgChoice === b.id ? 'active' : ''}\`}
                onClick={() => setBgChoice(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>\n\n`;

const oldSwitcherNorm = oldSwitcher.replace(/\r\n/g, '\n');
if (!code.includes(oldSwitcherNorm)) {
  console.error('Could not locate oldSwitcher');
  process.exit(1);
}
code = code.replace(oldSwitcherNorm, '');

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Successfully simplified: menu category buttons now directly control both dishes and background image!');
