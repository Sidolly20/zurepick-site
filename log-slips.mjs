// Records every slip leg the site shows (2, 3 and 5 odds), so Telegram results can grade it later.
// Runs in update.yml before build-pages.mjs. Each leg is kept the first time it appears, so replacements are logged too.
import fs from 'node:fs';
import { combos } from './render.js';

const TZ = 'Africa/Lagos', FILE = 'data/slip-log.json', KEEP_DAYS = 60;
const dayOf = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t);
const day = (o = 0) => dayOf(Date.now() + o * 864e5);
const load = (d) => { try { return JSON.parse(fs.readFileSync(`data/${d}.json`, 'utf8')).matches || []; } catch { return []; } };

let log = { legs: [] };
try { log = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const seen = new Set(log.legs.map((x) => x.key));
const now = Date.now();
const ms = [...load(day()), ...load(day(1))];
let added = 0;
for (const c of combos(ms, now, true)) {
  for (const x of c.legs) {
    const key = `${c.target}|${x.m.id}|${x.k}|${x.i}`;
    if (seen.has(key)) continue;
    seen.add(key); added++;
    log.legs.push({ key, target: c.target, id: x.m.id, date: dayOf(Date.parse(x.m.d)), k: x.k, i: x.i, od: x.od, c: x.c, added: new Date(now).toISOString() });
  }
}
const oldest = day(-KEEP_DAYS);
log.legs = log.legs.filter((x) => x.date >= oldest);
fs.writeFileSync(FILE, JSON.stringify(log));
console.log(`slip log: ${added} new leg(s), ${log.legs.length} kept`);
