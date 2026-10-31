// League tables from football-data.org (free key, 12 competitions). Writes data/tables.json. Safe to run often: it refreshes itself at most every 3 hours.
try { await import('./env.mjs'); } catch {}
import fs from 'node:fs';
const env = (k, d) => process.env[k] ?? d, BASE = () => env('FOOTBALL_DATA_BASE', 'https://api.football-data.org/v4');
const COMPS = { 'premier-league': ['PL', 'Premier League'], 'la-liga': ['PD', 'La Liga'], 'serie-a': ['SA', 'Serie A'], bundesliga: ['BL1', 'Bundesliga'], 'ligue-1': ['FL1', 'Ligue 1'], 'champions-league': ['CL', 'UEFA Champions League'], championship: ['ELC', 'Championship'], eredivisie: ['DED', 'Eredivisie'], 'primeira-liga': ['PPL', 'Primeira Liga'] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const F = 'data/tables.json';
if (!env('FOOTBALL_DATA_KEY')) { console.log('Tables: no FOOTBALL_DATA_KEY, skipped'); process.exit(0); }
let old = { t: 0, tables: {} }; try { old = JSON.parse(fs.readFileSync(F, 'utf8')); } catch {}
const hasLogos = Object.values(old.tables).length > 0 && Object.values(old.tables).every((t) => t.emblem && t.rows?.[0]?.crest);
if (Date.now() - old.t < 3 * 36e5 && hasLogos && !process.env.FORCE) { console.log('Tables: fresh, skipped'); process.exit(0); }
fs.mkdirSync('data', { recursive: true });
const tables = { ...old.tables }; let ok = 0, failed = 0;
for (const [slug, [code, name]] of Object.entries(COMPS)) {
  try {
    const r = await fetch(`${BASE()}/competitions/${code}/standings`, { headers: { 'X-Auth-Token': env('FOOTBALL_DATA_KEY') }, signal: AbortSignal.timeout(20000) });
    if (r.status === 429) { await sleep(65000); throw new Error('rate limited, will retry next run'); }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); const g = (j.standings || []).find((s) => s.type === 'TOTAL' && (s.table || []).length) || (j.standings || []).find((s) => (s.table || []).length);
    if (!g) throw new Error('no table in response');
    tables[slug] = { name, code, emblem: j.competition?.emblem || '', season: j.season ? `${(j.season.startDate || '').slice(0, 4)}/${(j.season.endDate || '').slice(2, 4)}` : '', updated: new Date().toISOString(),
      rows: g.table.map((x) => ({ pos: x.position, team: x.team?.shortName || x.team?.name || '?', crest: x.team?.crest || '', tla: x.team?.tla || '', p: x.playedGames, w: x.won, d: x.draw, l: x.lost, gf: x.goalsFor, ga: x.goalsAgainst, gd: x.goalDifference, pts: x.points })) };
    ok++;
  } catch (e) { failed++; console.error('Tables', slug, e.message); }
  await sleep(+env('TABLES_PAUSE_MS', 6500)); // free plan: 10 calls per minute
}
fs.writeFileSync(F, JSON.stringify({ t: ok ? Date.now() : old.t, tables }));
console.log(`Tables: ${ok} updated, ${failed} failed`);
