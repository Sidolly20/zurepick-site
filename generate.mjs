// Fetches fixtures + odds from API-Football and writes data/YYYY-MM-DD.json for the static site.
// Free plan = 100 requests/day, so each run stops at MAX_CALLS and reuses odds it already saved.
import fs from 'node:fs';
const KEY = process.env.API_FOOTBALL_KEY;
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1); }
const BASE = process.env.API_BASE || 'https://v3.football.api-sports.io';
const TZ = process.env.TZ_NAME || 'Africa/Lagos', BK = process.env.ODDS_BOOKMAKER ?? '8', MAX = +process.env.MAX_CALLS || 22;
let calls = 0, remaining = 99;
const day = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));

async function api(path) {
  if (calls >= MAX || remaining < 3) return null;
  calls++;
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': KEY } });
  const rem = r.headers.get('x-ratelimit-requests-remaining'); if (rem !== null) remaining = +rem;
  if (!r.ok) { console.error('API error', r.status, path); return null; }
  const j = await r.json(), e = j.errors;
  if (e && (Array.isArray(e) ? e.length : Object.keys(e).length)) { console.error('API said:', JSON.stringify(e)); return null; }
  return j;
}

const WANT = { o: ['Match Winner', ['Home', 'Draw', 'Away']], dc: ['Double Chance', ['Home/Draw', 'Home/Away', 'Draw/Away']], ou: ['Goals Over/Under', ['Over 2.5', 'Under 2.5']], bt: ['Both Teams Score', ['Yes', 'No']] };
function oddsOf(item) {
  const out = {};
  for (const bk of item.bookmakers || []) for (const bet of bk.bets || []) for (const [k, [name, vals]] of Object.entries(WANT)) {
    if (bet.name !== name || out[k]) continue;
    const arr = vals.map((v) => Number(bet.values.find((x) => x.value === v)?.odd));
    if (arr.every((n) => n > 1)) out[k] = arr;
  }
  return out;
}

fs.mkdirSync('data', { recursive: true });
const file = (d) => `data/${d}.json`;
const read = (d) => { try { return JSON.parse(fs.readFileSync(file(d), 'utf8')); } catch { return null; } };
const dates = [-1, 0, 1].map(day);
for (const o of [2, 3, 4]) if (!read(day(o))) dates.push(day(o));

for (const d of dates) {
  const fx = await api(`/fixtures?date=${d}&timezone=${encodeURIComponent(TZ)}`);
  if (!fx) continue;
  const prev = new Map((read(d)?.matches || []).map((m) => [m.id, m]));
  const matches = (fx.response || []).map((x) => {
    const m = { id: x.fixture.id, d: x.fixture.date, lg: x.league.name, cn: x.league.country, lo: x.league.logo, h: x.teams.home.name, a: x.teams.away.name, st: x.fixture.status.short, el: x.fixture.status.elapsed, sc: [x.goals.home, x.goals.away] };
    const p = prev.get(m.id); if (p) for (const k of Object.keys(WANT)) if (p[k]) m[k] = p[k];
    return m;
  });
  const byId = new Map(matches.map((m) => [m.id, m]));
  const needOdds = d >= day(0) && matches.some((m) => m.st === 'NS' && !m.o);
  if (needOdds) {
    for (let page = 1; page < 40; page++) {
      let r = await api(`/odds?date=${d}&page=${page}&timezone=${encodeURIComponent(TZ)}${BK ? '&bookmaker=' + BK : ''}`);
      if (!r) break;
      for (const item of r.response || []) { const m = byId.get(item.fixture.id); if (m) Object.assign(m, oddsOf(item)); }
      if (!r.paging || r.paging.current >= r.paging.total) break;
    }
  }
  fs.writeFileSync(file(d), JSON.stringify({ date: d, updated: new Date().toISOString(), matches }));
  console.log(d, matches.length, 'matches');
}
for (const f of fs.readdirSync('data')) if (f.slice(0, 10) < day(-10)) fs.unlinkSync('data/' + f);
console.log('API calls used this run:', calls);
