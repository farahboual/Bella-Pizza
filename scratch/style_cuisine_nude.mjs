import fs from 'fs';

let cuisine = fs.readFileSync('public/cuisine/index.html', 'utf8');

// 1. Add Google Fonts (Playfair Display + Plus Jakarta Sans)
cuisine = cuisine.replace(
  `<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">`,
  `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">`
);

// 2. Overwrite root variables and body styling to match Nude Beige Luxury
const oldRoot = `:root{--bg:#F5F2EB;--white:#ffffff;--red:#A3785E;--red2:#8B5E45;--dark:#28231F;--mute:#78716A;--line:rgba(40,35,31,.1);--green:#166534;--green-bg:#dcfce7;--font:'Nunito',system-ui,sans-serif}
*{box-sizing:border-box;margin:0}body{font:15px/1.4 var(--font);background:var(--bg);color:var(--dark);-webkit-font-smoothing:antialiased}`;

const newRoot = `:root{
  --bg:#F4EFEB;
  --white:#FAF7F2;
  --card-bg:rgba(255, 255, 255, 0.82);
  --red:#A3785E;
  --red2:#8B5E45;
  --dark:#28231F;
  --mute:rgba(40, 35, 31, 0.65);
  --line:rgba(163, 120, 94, 0.18);
  --green:#15803d;
  --green-bg:#dcfce7;
  --font:'Plus Jakarta Sans', system-ui, sans-serif;
  --serif:'Playfair Display', Georgia, serif;
}
*{box-sizing:border-box;margin:0}
body{
  font:14.5px/1.4 var(--font);
  background:var(--bg);
  color:var(--dark);
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
header h1, #f h1, .top b{
  font-family:var(--serif) !important;
}
header{
  background:rgba(244, 239, 235, 0.92) !important;
  backdrop-filter:blur(16px);
  border-bottom:1px solid var(--line) !important;
}
.o{
  background:var(--card-bg) !important;
  backdrop-filter:blur(14px);
  border:1px solid var(--line) !important;
  border-radius:20px !important;
  box-shadow:0 8px 24px rgba(40, 35, 31, 0.06) !important;
}
.o.new{
  border-color:var(--red) !important;
  box-shadow:0 12px 32px -6px rgba(163, 120, 94, 0.28) !important;
}
ul{
  background:rgba(255, 255, 255, 0.6) !important;
  border:1px solid var(--line) !important;
}
.cust{
  background:rgba(255, 255, 255, 0.6) !important;
  border:1px solid var(--line) !important;
}
#f{
  background:var(--card-bg) !important;
  backdrop-filter:blur(20px);
  border:1px solid var(--line) !important;
  box-shadow:0 24px 60px rgba(40, 35, 31, 0.15) !important;
}`;

cuisine = cuisine.replace(oldRoot, newRoot);

fs.writeFileSync('public/cuisine/index.html', cuisine, 'utf8');
console.log('Cuisine styling updated to match Nude Beige luxury storefront!');
