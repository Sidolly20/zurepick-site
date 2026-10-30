// Free data engine: fixtures, live scores, results and odds from Bzzoiro (BSD). Needs only BZZOIRO_KEY. Replaces the API-Football refresh.
try { await import('./env.mjs'); } catch {}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { teamKey, sameTeam } from './teams.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const env = (k, d) => process.env[k] ?? d;
const BASE = () => env('BSD_BASE', 'https://sports.bzzoiro.com/api/v2');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FINAL = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP'], LIVE = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'];
export const rank = (s) => (FINAL.includes(s) ? 3 : LIVE.includes(s) ? 2 : !s || s == 'NS' || s == 'TBD' ? 0 : 1);
const num = (n) => (n !== null && n !== undefined && n !== '' && Number.isFinite(+n) ? +n : null);

// BSD status words -> our short codes (NS, 1H, HT, 2H, FT, ...). Unknown "in play" words become LIVE.
export function mapStatus(e) {
  const s = String(e.status || '').toLowerCase().replace(/[^a-z]/g, ''), p = String(e.period || '').toUpperCase();
  if (!s || ['notstarted', 'upcoming', 'scheduled', 'timed'].includes(s)) return 'NS';
  if (['finished', 'ended', 'fulltime', 'ft', 'afterextratime', 'afterpenalties'].includes(s)) return p == 'AET' || p == 'PEN' ? p : 'FT';
  if (s.includes('postpone')) return 'PST'; if (s.includes('cancel')) return 'CANC'; if (s.includes('abandon')) return 'ABD'; if (s.includes('suspend')) return 'SUSP';
  if (s.includes('interrupt')) return 'INT'; if (s.includes('halftime') || p == 'HT') return 'HT';
  if (['1H', '2H', 'ET'].includes(p)) return p;
  return 'LIVE';
}

export async function bsdGet(p, st) {
  for (let i = 0; i < 2; i++) {
    st.calls++;
    const r = await fetch(BASE() + p, { headers: { Authorization: 'Token ' + env('BZZOIRO_KEY') }, signal: AbortSignal.timeout(20000) });
    if (r.status === 429 && i === 0) { await sleep(Math.min(+r.headers.get('retry-after') || 5, 30) * 1000); continue; }
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p);
    return r.json();
  }
}
const rowsOf = (j) => (Array.isArray(j) ? j : j?.results || []);
export async function bsdList(from, to, status, st) {
  const out = [];
  for (let off = 0; off < 1000; off += 200) {
    const rows = rowsOf(await bsdGet(`/events/?status=${status}&date_from=${from}&date_to=${to}&limit=200&offset=${off}`, st));
    out.push(...rows); if (rows.length < 200) break;
  }
  return out;
}
const pair = (...v) => (v.every((n) => Number(n) > 1) ? v.map(Number) : null);
export function mapOdds(o = {}) {
  const r = {}, x = pair(o.home_win, o.draw, o.away_win), u = pair(o.over_25_goals, o.under_25_goals), w = pair(o.over_15_goals, o.under_15_goals), b = pair(o.btts_yes, o.btts_no);
  if (x) r.o = x; if (u) r.ou = u; if (w) r.o15 = w; if (b) r.bt = b; return r;
}

// League names/countries come from a separate list; cached for a day.
const leagueInfo = (l) => ({ n: l.name || l.league_name || l.title || '', c: (typeof l.country == 'object' ? l.country?.name : l.country || l.country_name || l.region) || '', lo: l.logo || l.logo_url || l.image || l.icon || null });
async function leagues(dir, st) {
  const f = path.join(dir, 'bsd-leagues.json'); let c = null; try { c = JSON.parse(fs.readFileSync(f, 'utf8')); } catch {}
  if (c && Date.now() - c.t < 864e5) return c.m;
  const m = { ...(c?.m || {}) };
  try {
    for (let off = 0; off < 2000; off += 200) { const rows = rowsOf(await bsdGet(`/leagues/?limit=200&offset=${off}`, st)); for (const l of rows) m[l.id] = leagueInfo(l); if (rows.length < 200) break; }
    const s = Object.values(m)[0]; if (!s || !s.n) console.log('BSD: league list had no readable names. Send this to Claude:', JSON.stringify(rowsOf(await bsdGet('/leagues/?limit=1', st))[0] || null).slice(0, 400));
  } catch (e) { console.error('BSD leagues:', e.message); }
  if (Object.keys(m).length) fs.writeFileSync(f, JSON.stringify({ t: Date.now(), m }));
  return m;
}
// Known leagues keep the ids the site already uses for league pages and ordering; others get 100000 + BSD id.
const KNOWN = [['england', 'premierleague', 39], ['spain', 'laliga', 140], ['italy', 'seriea', 135], ['germany', 'bundesliga', 78], ['france', 'ligue1', 61], ['', 'uefachampionsleague', 2], ['', 'championsleague', 2], ['', 'uefaeuropaleague', 3], ['', 'europaleague', 3], ['netherlands', 'eredivisie', 88], ['portugal', 'primeiraliga', 94], ['england', 'facup', 45], ['england', 'championship', 40], ['scotland', 'premiership', 179]];
const siteLeagueId = (l, id) => { const n = (l?.n || '').toLowerCase().replace(/[^a-z0-9]/g, ''), c = (l?.c || '').toLowerCase(); const k = KNOWN.find(([cc, nn]) => nn === n && (!cc || c.includes(cc))); return k ? k[2] : 100000 + (+id || 0); };

const dayAt = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: env('TZ_NAME', 'Africa/Lagos') }).format(new Date(t));
const toMatch = (e, L) => { const l = L[e.league_id]; return { id: 'bsd:' + e.id, bid: e.id, d: e.event_date, li: siteLeagueId(l, e.league_id), se: e.season_id ?? null, lg: l?.n || 'League ' + e.league_id, cn: l?.c || '', lo: l?.lo || null, h: e.home_team, a: e.away_team, st: mapStatus(e), el: num(e.current_minute), sc: [num(e.home_score), num(e.away_score)] }; };
function advance(m, e) { // never moves a match backwards
  const st = mapStatus(e); if (rank(st) < rank(m.st)) return false;
  const next = [st, rank(st) >= 1 ? num(e.current_minute) ?? m.el : m.el, rank(st) >= 2 ? [num(e.home_score), num(e.away_score)] : m.sc], was = JSON.stringify([m.st, m.el, m.sc]);
  [m.st, m.el, m.sc] = next; if (rank(st) == 0 && e.event_date && e.event_date !== m.d) m.d = e.event_date;
  return JSON.stringify([m.st, m.el, m.sc]) !== was;
}

export async function collect({ dataDir = path.resolve(env('DATA_DIR', path.join(ROOT, 'data'))), ahead = +env('BSD_DAYS_AHEAD', 5), maxOdds = +env('BSD_ODDS_PER_RUN', 250), now = Date.now() } = {}) {
  if (!env('BZZOIRO_KEY')) return console.log('BSD: no BZZOIRO_KEY set, skipped');
  fs.mkdirSync(dataDir, { recursive: true });
  const st = { calls: 0 }, utc = (o) => new Date(now + o * 864e5).toISOString().slice(0, 10), L = await leagues(dataDir, st), seen = new Map(), raw = {};
  for (const s of ['upcoming', 'finished', 'live']) { // 'live' may simply repeat upcoming; the highest status per game wins
    try { for (const e of await bsdList(utc(-1), utc(ahead), s, st)) { const o = seen.get(e.id); if (!o || rank(mapStatus(e)) > rank(mapStatus(o))) seen.set(e.id, e); } } catch (e) { console.error('BSD events', s, e.message); }
  }
  for (const e of seen.values()) raw[e.status] = (raw[e.status] || 0) + 1;
  const days = {}, getDay = (d) => (days[d] ??= (() => { try { return JSON.parse(fs.readFileSync(path.join(dataDir, d + '.json'), 'utf8')); } catch { return { date: d, matches: [] }; } })());
  let fresh = 0, moved = 0;
  for (const e of seen.values()) {
    const t = Date.parse(e.event_date); if (!t || !e.home_team || !e.away_team) continue;
    const day = getDay(dayAt(t));
    const m = day.matches.find((x) => String(x.bid) === String(e.id) || x.id === 'bsd:' + e.id) || day.matches.find((x) => Math.abs(Date.parse(x.d) - t) < 3 * 36e5 && sameTeam(x.h, e.home_team) && sameTeam(x.a, e.away_team));
    if (m) { m.bid = e.id; if (advance(m, e)) moved++; } else { day.matches.push(toMatch(e, L)); fresh++; }
  }
  // Odds: one call per game, soonest kick-offs first. Far-away games have no prices yet, so they are retried every 4 hours (every 30 minutes close to kick-off).
  const cand = Object.values(days).flatMap((d) => d.matches).filter((m) => m.bid && !FINAL.includes(m.st) && Date.parse(m.d) > now - 3 * 36e5 && Date.parse(m.d) < now + 72 * 36e5 && (!m.oa || now - m.oa > (Date.parse(m.d) - now < 3 * 36e5 ? 30 * 6e4 : 4 * 36e5)))
    .sort((a, b) => (a.li >= 100000) - (b.li >= 100000) || Date.parse(a.d) - Date.parse(b.d)).slice(0, maxOdds); // big leagues first, then soonest
  let filled = 0;
  for (const m of cand) {
    try { const add = mapOdds((await bsdGet(`/events/${m.bid}/odds/`, st)).odds); Object.assign(m, add); m.oa = now; if (Object.keys(add).length) filled++; } catch (e) { console.error('BSD odds failed for', m.bid, e.message); }
    await sleep(+env('BSD_ODDS_PAUSE_MS', 120));
  }
  for (const [d, day] of Object.entries(days)) { day.matches.sort((a, b) => Date.parse(a.d) - Date.parse(b.d)); const f = path.join(dataDir, d + '.json'); fs.writeFileSync(f + '.tmp', JSON.stringify({ ...day, date: d, updated: new Date(now).toISOString(), od: day.od || 'bzzoiro' })); fs.renameSync(f + '.tmp', f); }
  console.log(`BSD: ${seen.size} events (${Object.entries(raw).map(([k, v]) => k + '=' + v).join(', ')}), ${fresh} new games, ${moved} updated, odds asked for ${cand.length} games and found for ${filled}, ${st.calls} calls`);
  return { events: seen.size, fresh, moved, filled, calls: st.calls };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await collect();
