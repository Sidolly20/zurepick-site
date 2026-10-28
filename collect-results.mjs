// Free results feed: downloads played matches from the open "openfootball" dataset and stores them in data/results.json.
// The team-record model uses them to predict games the odds API did not cover. No key needed. Safe to run any time.
import fs from 'node:fs';
import { teamKey } from './teams.js';
const BASE = 'https://raw.githubusercontent.com/openfootball/football.json/master';
const LEAGUES = (process.env.RESULT_LEAGUES || 'en.1,en.2,en.3,en.4,de.1,de.2,es.1,es.2,it.1,it.2,fr.1,fr.2,nl.1,pt.1,tr.1,at.1,be.1,sco.1,gr.1').split(',');
const y = new Date().getFullYear(), m = new Date().getMonth(), s0 = m >= 6 ? y : y - 1;
const season = (a) => `${a}-${String(a + 1).slice(2)}`;
const SEASONS = [season(s0 - 1), season(s0)];
fs.mkdirSync('data', { recursive: true });
let RES = {}; try { RES = JSON.parse(fs.readFileSync('data/results.json', 'utf8')); } catch {}
let added = 0, files = 0, failed = 0;
for (const L of LEAGUES) for (const S of SEASONS) {
  try {
    const r = await fetch(`${BASE}/${S}/${L}.json`, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) continue; files++;
    const j = JSON.parse(await r.text());
    for (const x of j.matches || []) {
      const ft = x && x.score && x.score.ft; // ft can be missing or empty for games not played yet
      if (!Array.isArray(ft) || ft.length < 2 || !x.date || !x.team1 || !x.team2) continue;
      const k = `${x.date}|${teamKey(x.team1)}|${teamKey(x.team2)}`;
      if (!RES[k]) { RES[k] = [x.date, x.team1, x.team2, +ft[0], +ft[1]]; added++; }
    }
  } catch (e) { failed++; console.error('skip', L, S, e.message); }
}
fs.writeFileSync('data/results.json', JSON.stringify(RES));
console.log(`Results feed: ${files} league files read, ${added} new results, ${Object.keys(RES).length} stored, ${failed} failed`);
