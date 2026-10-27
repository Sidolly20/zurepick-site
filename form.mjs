// Team form (last 5 results as W/D/L) built from OUR OWN archive of finished matches (data/results.json,
// which build-pages.mjs grows every run) plus, when FOOTBALL_DATA_KEY is set, football-data.org's finished matches
// for the free 12 competitions (one call per competition, at most once a day) to give new teams a head start.
// football-data.org's standings endpoint often returns no "form", which is why the old version produced nothing.
// Same exports as before (updateForm, attachForm), so generate.mjs needs no change.
import fs from 'node:fs';
const BASE = process.env.FD_BASE || 'https://api.football-data.org/v4';
const CODES = (process.env.FORM_COMPETITIONS || 'PL,PD,SA,BL1,FL1,DED,PPL,ELC,CL').split(',');
const NEED = +process.env.FORM_MIN || 3;      // show form only with at least this many results
const STOP = new Set(['fc', 'cf', 'sc', 'ac', 'afc', 'the', 'club', 'de', 'sk', 'fk', 'cd', 'ud', 'ca', 'fa']);
export const key = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w)).sort().join(' ');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rj = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

// results: [{d:'YYYY-MM-DD', h, a, hg, ag}] -> { teamKey: 'WDLWW' } (oldest -> newest, last 5)
export function formFrom(results) {
  const seen = new Set(), per = new Map();
  for (const r of results) {
    if (!r || !r.h || !r.a || !Number.isInteger(r.hg) || !Number.isInteger(r.ag)) continue;
    const kh = key(r.h), ka = key(r.a), id = r.d + '|' + kh + '|' + ka;
    if (!kh || !ka || seen.has(id)) continue;      // the same match from two sources counts once
    seen.add(id);
    for (const [k, gf, ga] of [[kh, r.hg, r.ag], [ka, r.ag, r.hg]]) {
      if (!per.has(k)) per.set(k, []);
      per.get(k).push([r.d, gf > ga ? 'W' : gf < ga ? 'L' : 'D']);
    }
  }
  const out = {};
  for (const [k, list] of per) {
    list.sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
    const f = list.slice(-5).map((x) => x[1]).join('');
    if (f.length >= NEED) out[k] = f;
  }
  return out;
}

const fromArchive = () => Object.values(rj('data/results.json') || {}).map((v) => ({ d: v[0], h: v[1], a: v[2], hg: v[3], ag: v[4] }));

const savedFd = () => (rj('data/fd-results.json')?.rows || []).map((v) => ({ d: v[0], h: v[1], a: v[2], hg: v[3], ag: v[4] }));

async function fromFootballData(token) {
  const rows = [], since = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
  for (const code of CODES) {
    try {
      const r = await fetch(`${BASE}/competitions/${code}/matches?status=FINISHED`, { headers: { 'X-Auth-Token': token }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) { console.error('Form: HTTP', r.status, code); await sleep(7000); continue; }
      const j = await r.json();
      for (const m of j.matches || []) {
        const s = m.score?.fullTime || {};
        const d = String(m.utcDate || '').slice(0, 10);
        if (d < since || !Number.isInteger(s.home) || !Number.isInteger(s.away)) continue;
        // full names and short names ("Newcastle United FC" and "Newcastle") so either spelling can match our fixtures
        const pairs = [[m.homeTeam?.name, m.awayTeam?.name], [m.homeTeam?.shortName, m.awayTeam?.shortName]];
        for (const [h, a] of pairs) if (h && a) rows.push({ d, h, a, hg: s.home, ag: s.away });
      }
    } catch (e) { console.error('Form: failed for', code, e.message); }
    await sleep(7000);                              // free plan: 10 requests per minute
  }
  return rows;
}

export async function updateForm() {
  const cur = rj('data/form.json'), token = process.env.FOOTBALL_DATA_KEY;
  const fresh = cur && cur.v === 2 && Date.now() - cur.t < 20 * 36e5;
  let fd = savedFd();
  if (token && !fresh) {
    const got = await fromFootballData(token);
    if (got.length) { fd = got; fs.writeFileSync('data/fd-results.json', JSON.stringify({ t: Date.now(), rows: got.map((r) => [r.d, r.h, r.a, r.hg, r.ag]) })); }
    else console.error('Form: football-data returned nothing; keeping the previous copy');
  } else if (!token) console.log('Form: no FOOTBALL_DATA_KEY, using our own archive only');
  const teams = formFrom([...fromArchive(), ...fd]);
  fs.writeFileSync('data/form.json', JSON.stringify({ t: fresh ? cur.t : Date.now(), v: 2, teams }));
  console.log('Form: ' + Object.keys(teams).length + ' teams with form (archive ' + fromArchive().length + ' results, football-data ' + fd.length + ')');
}

// Attach form only when the two names are the same after removing words like FC; wrong guesses are worse than none.
export function attachForm(days) {
  const f = rj('data/form.json')?.teams || {};
  let n = 0;
  for (const v of Object.values(days)) for (const m of v.matches) {
    delete m.fh; delete m.fa;
    if (!m.o) continue;
    const h = f[key(m.h)], a = f[key(m.a)];
    if (h) { m.fh = h; n++; } if (a) { m.fa = a; n++; }
  }
  console.log('Form: attached to', n, 'teams');
}
