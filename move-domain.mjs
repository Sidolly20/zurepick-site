// Keeps every site file on the current brand: zurepick.com, the name ZurePick, the new logo and the public email.
// Runs inside "Update match data". Safe to leave in: it does nothing once everything is updated.
import fs from 'node:fs';
import path from 'node:path';

const host = ['sidolly20', 'github', 'io'].join('.'), repo = 'zurepick-site', next = 'zurepick.com';
const name = 'ZurePick', old = name + 's', user = ['Sidolly', '20'].join(''), mail = 'zurepick.official';
const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='zg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ff8a3d'/%3E%3Cstop offset='1' stop-color='%23f2400c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='17' fill='url(%23zg)'/%3E%3Cpath d='M15.5 13H49Q52.5 13 50.2 15.8L41.500 25.500Q38.500 21 32 21H15.5Q13 21 13 18.500V15.500Q13 13 15.500 13Z' fill='%23fff'/%3E%3Cpath d='M48.500 51H15Q11.500 51 13.800 48.200L22.500 38.500Q25.500 43 32 43H48.500Q51 43 51 45.500V48.500Q51 51 48.500 51Z' fill='%23fff'/%3E%3Ccircle cx='32' cy='32' r='8' fill='%23140f0c'/%3E%3Cpath d='M32.00 28.40 L35.42 30.89 L34.12 34.91 L29.88 34.91 L28.58 30.89Z' fill='%23fff'/%3E%3Cpath d='M32.00 28.60L32.00 24.00M35.23 30.95L39.61 29.53M34.00 34.75L36.70 38.47M30.00 34.75L27.30 38.47M28.77 30.95L24.39 29.53' stroke='%23fff' stroke-width='1.2'/%3E%3C/svg%3E";
const swaps = [
  [`https://${host}/${repo}`, `https://${next}`],
  [`https%3A%2F%2F${host}%2F${repo}`, `https%3A%2F%2F${next}`],
  [`${host}/${repo}`, next],
  [`${host}%2F${repo}`, next],
  [`href="/${repo}/`, 'href="/'],
  [`<i>Z</i>${old}</a>`, '<i aria-hidden="true"></i><span class="wm">Zure<b>Pick</b></span></a>'],
  [old, name],
  [`u='${user}',d='gmail.com'`, `u='${mail}',d='gmail.com'`],
  [`${user} [at] gmail`, `${mail} [at] gmail`],
];
const types = /\.(html|xml|txt|json|js|mjs|webmanifest)$/;
let changed = 0;
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name.startsWith('.') || f.name === 'node_modules' || f.name === 'move-domain.mjs') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { walk(p); continue; }
    if (!types.test(f.name)) continue;
    const before = fs.readFileSync(p, 'utf8');
    let out = swaps.reduce((s, [a, b]) => s.split(a).join(b), before);
    out = out.replace(/(<link rel="icon" type="image\/svg\+xml" href=")data:[^"]*(")/g, (m, a, b) => a + FAV + b);
    if (out !== before) { fs.writeFileSync(p, out); changed++; }
  }
};
walk('.');
console.log(`brand sync: updated ${changed} files`);
