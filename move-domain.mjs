// Rewrites the old GitHub address to the new domain in every site file.
// Runs inside "Update match data". Safe to leave in: it does nothing once everything is updated.
import fs from 'node:fs';
import path from 'node:path';

const host = ['sidolly20', 'github', 'io'].join('.'), repo = 'zurepick-site', next = 'zurepick.com';
const swaps = [
  [`https://${host}/${repo}`, `https://${next}`],
  [`https%3A%2F%2F${host}%2F${repo}`, `https%3A%2F%2F${next}`],
  [`${host}/${repo}`, next],
  [`${host}%2F${repo}`, next],
  [`href="/${repo}/`, 'href="/'],
];
const types = /\.(html|xml|txt|json|js|mjs|webmanifest)$/;
let changed = 0;
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name.startsWith('.') || f.name === 'node_modules' || f.name === 'move-domain.mjs') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { walk(p); continue; }
    if (!types.test(f.name)) continue;
    const old = fs.readFileSync(p, 'utf8');
    const out = swaps.reduce((s, [a, b]) => s.split(a).join(b), old);
    if (out !== old) { fs.writeFileSync(p, out); changed++; }
  }
};
walk('.');
console.log(`move-domain: updated ${changed} files`);
