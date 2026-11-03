import fs from 'fs';

let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Slice pizzaList to 5
const oldPizzaPattern = /const pizzaList = \[\r?\n[\s\S]*?\{ n: 'Latina'[\s\S]*?\}\r?\n\s*\]/;
if (!oldPizzaPattern.test(code)) {
  console.error("Couldn't find pizzaList pattern!");
  process.exit(1);
}

code = code.replace(oldPizzaPattern, (match) => {
  return match + '.slice(0, 5)';
});

// 2. Add bgChoice state & background images map
const targetState = "  const [search, setSearch] = useState('')";
const replacementState = `  const [search, setSearch] = useState('')
  const [bgChoice, setBgChoice] = useState('auto')

  const bgImages = {
    pizzas: getItemImg('pizzas', 'pizza') || pizzaImg,
    burgers: getItemImg('burgers', 'burger') || burgersImg,
    salades: getItemImg('salades', 'salade') || saladesImg
  }
  const effectiveBgKey = bgChoice === 'auto'
    ? (cat === 'burgers' ? 'burgers' : cat === 'salades' ? 'salades' : 'pizzas')
    : bgChoice
  const activeBgImg = bgImages[effectiveBgKey] || bgImages.pizzas`;

code = code.replace(targetState, replacementState);

// 3. Update <section className="menu" id="carte">
const targetSection = '<section className="menu" id="carte">';
const replacementSection = `<section className="menu luxury-menu-section" id="carte" style={{ '--menu-bg-img': \`url(\${activeBgImg})\` }}>
      <div className="menu-bg-soft" aria-hidden="true" />`;

code = code.replace(targetSection, replacementSection);

// 4. Add the luxury background switcher control right above or next to Category Pills
const targetPills = '{/* Category Pills (horizontal scroll) */}';
const switcherMarkup = `{/* Background switcher & ambiance control */}
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
        </div>

        {/* Category Pills (horizontal scroll) */}`;

code = code.replace(targetPills, switcherMarkup);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx successfully updated!');
