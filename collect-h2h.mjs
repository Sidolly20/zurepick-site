// Head-to-head history from football-data.org (free key). Each upcoming pairing is fetched once, then reused for weeks.
import fs from 'node:fs';
import { teamKey } from './teams.mjs';
const env = (k, d) => process.env[k] ?? d, BASE = () => env('FOOTBALL_DATA_BASE', 'https://api.football-data.org/v4'), KEY = env('FOOTBALL_DATA_KEY', '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'data/h2h.json', MAX = +env('H2H_PER_RUN', 10), DAYS = +env('H2H_DAYS', 3), PAUSE = +env('H2H_PAUSE_MS', 6500), TTL = 45 * 864e5;
if (!KEY) { console.log('H2H: FOOTBALL_DATA_KEY missing, skipped'); process.exit(0); }
async function get(p, retry = true) {
  const r = await fetch(BASE() + p, { headers: { 'X-Auth-Token': KEY }, signal: AbortSignal.timeout(20000) });
  if (r.status === 429 && retry) { await sleep(+env('H2H_RETRY_MS', 65000)); return get(p, false); }
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p.split('?')[0]);
  return r.json();
}
const pairKey = (a, b) => [teamKey(a), teamKey(b)].sort().join('|');
let cache = {}; try { cache = JSON.parse(fs.readFileSync(F, 'utf8')); } catch {}
const day = (o) => new Date(Date.now() + o * 864e5).toISOString().slice(0, 10);
let todo = [];
try {
  const sched = await get(`/matches?dateFrom=${day(0)}&dateTo=${day(DAYS)}`);
  for (const m of sched.matches || []) {
    const h = m.homeTeam?.name, a = m.awayTeam?.name; if (!h || !a || !m.id) continue;
    const k = pairKey(h, a), e = cache[k]; if (e && Date.now() - e.t < TTL) continue;
    if (!todo.some((x) => x.k == k)) todo.push({ k, id: m.id, h, a, d: m.utcDate });
  }
} catch (e) { console.log('H2H: could not load the schedule:', e.message); process.exit(0); }
todo.sort((x, y) => Date.parse(x.d) - Date.parse(y.d));
let ok = 0, fail = 0;
for (const x of todo.slice(0, MAX)) {
  try {
    const j = await get(`/matches/${x.id}/head2head?limit=10`);
    const list = (j.matches || []).filter((m) => m.score?.fullTime?.home != null).map((m) => [String(m.utcDate || '').slice(0, 10), m.homeTeam?.name, m.awayTeam?.name, m.score.fullTime.home, m.score.fullTime.away]).sort((p, q) => q[0].localeCompare(p[0])).slice(0, 10);
    cache[x.k] = { t: Date.now(), names: [x.h, x.a], list }; ok++;
  } catch (e) { fail++; console.log('H2H', x.h, 'v', x.a, e.message); if (/HTTP 40[13]/.test(e.message)) break; }
  await sleep(PAUSE);
}
fs.mkdirSync('data', { recursive: true }); fs.writeFileSync(F, JSON.stringify(cache));
console.log(`H2H: ${ok} fetched, ${fail} failed, ${Object.keys(cache).length} pairs stored, ${Math.max(0, todo.length - MAX)} waiting`);
