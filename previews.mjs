// Match previews, team pages, results archive and weekly review: all built from the site's own data (odds, tables, tracked results).
import fs from 'node:fs';
import { MK, MIN, pick, won, settled, esc, hm, board, logoImg, emblemOf } from './render.js';
import { teamKey, sameTeam } from './teams.js';
import { matchModel, renderMatch } from './matchpage.mjs';

// Keep unfinished match pages out of search. The build only rewrites recent days,
// so older pages still marked indexable are switched to noindex here.
for (const f of fs.readdirSync('.')) {
  if (!/^prediction-.*\.html$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  if (s.includes('Match Report') || !s.includes('name="robots" content="index,follow')) continue;
  fs.writeFileSync(f, s.replace('name="robots" content="index,follow', 'name="robots" content="noindex,follow'));
}

const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const V = (arr, s, salt = 0) => arr[(s + salt) % arr.length];
const norm = (od) => { const t = od.reduce((a, x) => a + 1 / x, 0); return od.map((x) => 1 / x / t); };
const okOdds = (od) => Array.isArray(od) && od.length > 1 && od.every((x) => x > 1);
const pct = (x) => Math.round(x * 100);
const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10] || 'th');
const sgn = (n) => (n > 0 ? '+' : '') + n;
const KEYS = ['o', 'dc', 'ou', 'o15', 'bt'];

export function makePreviews({ page, snaps, TABLES, LG, leagueTest, dstr, TZ, SITE, RES = {} }) {
  const RESV = Object.values(RES);
  const today = dstr(0);
  let H2H = {}; try { H2H = JSON.parse(fs.readFileSync('data/h2h.json', 'utf8')); } catch {}
  const h2hFor = (h, a, before = '9999') => { const e = H2H[[teamKey(h), teamKey(a)].sort().join('|')] || Object.values(H2H).find((x) => (sameTeam(x.names[0], h) && sameTeam(x.names[1], a)) || (sameTeam(x.names[0], a) && sameTeam(x.names[1], h))); if (!e || !e.list?.length) return null; const rows = e.list.filter((r) => r[0] < before).map(([d, hn, an, hs, as]) => { const homeIsH = sameTeam(hn, h); return { d, hn, an, hs, as, g: homeIsH ? hs : as, c: homeIsH ? as : hs }; }); if (!rows.length) return null; return { rows, n: rows.length, hw: rows.filter((r) => r.g > r.c).length, aw: rows.filter((r) => r.g < r.c).length, dr: rows.filter((r) => r.g == r.c).length, avg: rows.reduce((s, r) => s + r.hs + r.as, 0) / rows.length, o25: rows.filter((r) => r.hs + r.as >= 3).length, bt: rows.filter((r) => r.hs > 0 && r.as > 0).length }; };
  const D = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...o }).format(new Date(iso));
  const wd = (iso) => D(iso, { weekday: 'long', day: 'numeric', month: 'long' }), sd = (iso) => D(iso, { day: 'numeric', month: 'short' }), full = (iso) => D(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const tests = LG.map((L) => [L, leagueTest(L)]), leagueOf = (m) => tests.find(([, t]) => t(m))?.[0];
  const rowOf = (L, team) => { const k = teamKey(team); return k ? TABLES[L.slug]?.rows?.find((r) => teamKey(r.team) == k || teamKey(r.full || '') == k) || null : null; };
  const done = Object.entries(snaps).flatMap(([d, ms]) => ms.filter(settled).map((m) => ({ ...m, day: d }))).sort((a, b) => Date.parse(b.d) - Date.parse(a.d));
  const formOf = (team, before = Infinity) => { const k = teamKey(team), out = []; for (const m of done) { if (Date.parse(m.d) >= before) continue; const hk = teamKey(m.h) == k, ak = teamKey(m.a) == k; if (!hk && !ak) continue; const [g, c] = hk ? m.sc : [m.sc[1], m.sc[0]]; out.push({ r: g > c ? 'W' : g < c ? 'L' : 'D', s: m.sc[0] + '–' + m.sc[1], opp: hk ? m.a : m.h, ha: hk ? 'H' : 'A', d: m.d }); if (out.length >= 5) break; } return out; };
  const formHtml = (team, before) => { const f = formOf(team, before); return `<li><b>${esc(team)}:</b> ${f.length ? f.map((x) => `<span class="fm ${x.r}">${x.r}</span> ${x.s} ${x.ha == 'H' ? 'v' : 'at'} ${esc(x.opp)} (${sd(x.d)})`).join(' · ') : 'no finished games tracked yet'}</li>`; };

  const picksOf = (m) => KEYS.map((k) => [k, pick(m, k)]).filter(([k, p]) => p && p.od && p.c >= MIN[k]);
  // ---- which games get a preview: leagues with a live table, odds present, from 3 days back to 2 days ahead ----
  const items = [], byLeague = {}, matchFile = {};
  for (let o = -3; o <= 2; o++) {
    const d = dstr(o);
    for (const m of snaps[d] || []) {
      if (!okOdds(m.o)) continue;
      if (['CANC','PST','ABD','AWD','WO','TBD'].includes(m.st)) continue;
      if (/\b(stadium|arena|stadion|estadio)\b/i.test(`${m.h} ${m.a}`)) continue;
      const L0 = leagueOf(m), L = L0 || { name: m.lg || 'League', slug: null }, idx = !!L0 || picksOf(m).length > 0;
      const file = `prediction-${slug(m.h)}-vs-${slug(m.a)}-${d}.html`; if (matchFile[m.id]) continue;
      const it = { m, L, d, file, idx }; items.push(it); matchFile[m.id] = file; if (L0) (byLeague[L0.slug] ??= []).push(it);
    }
  }
  const teamFile = {};
  for (const L of LG) for (const r of TABLES[L.slug]?.rows || []) { const k = teamKey(r.team); if (!k || teamFile[k]) continue; teamFile[k] = { file: `team-${slug(r.team)}.html`, L, r }; }
  const fileCount = {}; for (const v of Object.values(teamFile)) fileCount[v.file] = (fileCount[v.file] || 0) + 1;
  for (const v of Object.values(teamFile)) if (fileCount[v.file] > 1) v.file = v.file.replace('.html', '-' + v.L.slug + '.html');
  const tlink = (name) => { const t = teamFile[teamKey(name)]; return t ? `<a href="${t.file}">${esc(name)}</a>` : esc(name); };

  const upcoming = (arr) => arr.filter((it) => it.d >= today && !settled(it.m)).sort((a, b) => Date.parse(a.m.d) - Date.parse(b.m.d));
  const link = (it) => `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${sd(it.m.d)}, ${hm(it.m.d)}</small></li>`;

  const api = {
    map: matchFile,
    linksFor(L) { const l = upcoming(byLeague[L.slug] || []).slice(0, 12); return l.length ? `<div class="prose"><h2>${esc(L.name)} match previews</h2><ul class="pl">${l.map(link).join('')}</ul></div>` : ''; },
    // ---- homepage modules ----
    pulse() {
      const ms = snaps[today] || [], tips = ms.filter((m) => KEYS.some((k) => { const q = pick(m, k); return q && !q.model && q.c >= MIN[k]; })).length;
      const S = summary([...Array(7)].flatMap((_, i) => rec(snaps[dstr(-(i + 1))] || []))), lg = new Set(ms.map((m) => m.li)).size;
      const T = (v, l, h) => `<${h ? 'a href="' + h + '"' : 'div'}><b>${v}</b><span>${l}</span></${h ? 'a' : 'div'}>`;
      return `<div class="mx-strip">${T(ms.length, 'Games today')}${T(tips, 'Tips published')}${T(S.r == null ? '–' : S.r + '%', 'Won, last 7 days', 'track-record.html')}${T(lg, 'Leagues today')}</div>${api.potd('last')}`;
    },
    radarAll() {
      const l = upcoming(items).filter((it) => it.d <= dstr(1)).map((it) => ({ it, p: pick(it.m, 'o'), g: TAGS[it.file] || {} })).filter((x) => x.p && x.p.od && x.p.c >= MIN.o).sort((a, b) => (b.g.tag ? 1 : 0) - (a.g.tag ? 1 : 0) || b.p.c - a.p.c).slice(0, 6);
      return l.length ? `<section class="mx-card" id="radar"><h2>Today and tomorrow: games worth a look</h2><ul class="mx-rad">${l.map(({ it, p, g }) => `<li><a href="${it.file}"><small>${esc(it.L.name)} · ${sd(it.m.d)} · ${hm(it.m.d)}</small><b>${esc(it.m.h)} vs ${esc(it.m.a)}</b>${g.tag ? `<span class="mx-tag">${esc(g.tag)}</span>` : ''}</a><em class="on">${MK.o.s[p.i]} · ${p.c}%</em></li>`).join('')}</ul></section>` : '';
    },
    recordStrip() {
      const ds = [...Array(7)].map((_, i) => dstr(-(7 - i))), cells = ds.map((d) => { const S = summary(rec(snaps[d] || [])); return `<a title="${S.w} of ${S.n} won" href="predictions-${d}.html" class="${S.n ? (S.r >= 60 ? 'dw' : 'dl') : 'dz'}"><small>${D(d + 'T12:00:00Z', { weekday: 'short', day: 'numeric' })}</small><b>${S.n ? S.r + '%' : '–'}</b></a>`; }).join('');
      return `<section class="mx-card" id="record"><h2>Last 7 days, win or lose</h2><div class="mx-days">${cells}</div><p class="mut">Every published pick, with losses shown. <a href="weekly-review.html">Read the weekly review</a> or the <a href="track-record.html">track record</a>.</p></section>`;
    },
    leagueTiles() {
      const t = LG.filter((L) => TABLES[L.slug]?.rows?.length);
      return t.length ? `<section class="mx-card"><h2>Leagues</h2><div class="mx-lt">${t.map((L) => { const r = TABLES[L.slug].rows[0]; return `<a href="${L.slug}-predictions.html">${logoImg(emblemOf(TABLES[L.slug]), L.name, 'lgo')}<span><b>${esc(L.name)}</b><small>${esc(r.team)} lead on ${r.pts}</small></span></a>`; }).join('')}</div></section>` : '';
    },
    radar(L) {
      const l = upcoming(byLeague[L.slug] || []).slice(0, 8); if (!l.length) return '';
      return `<section class="mx-card" id="radar"><h2>${esc(L.name)} matchday radar</h2><ul class="mx-rad">${l.map((it) => { const g = TAGS[it.file] || {}, p = pick(it.m, 'o'), pk = p && p.od && p.c >= MIN.o; return `<li><a href="${it.file}"><small>${sd(it.m.d)} · ${hm(it.m.d)}</small><b>${esc(it.m.h)} vs ${esc(it.m.a)}</b>${g.tag ? `<span class="mx-tag">${esc(g.tag)}</span>` : ''}</a><em class="${pk ? 'on' : ''}">${pk ? MK.o.s[p.i] + ' · ' + p.c + '%' : 'No tip'}</em></li>`; }).join('')}</ul></section>`;
    },
    featured() {
      const l = upcoming(items).filter((it) => it.d <= dstr(1)).map((it) => ({ it, p: pick(it.m, 'o') })).filter((x) => x.p && x.p.od && x.p.c >= MIN.o).sort((a, b) => b.p.c - a.p.c).slice(0, 8);
      return l.length ? `<div class="prose"><h2>Match previews: today’s strongest picks</h2><ul class="pl">${l.map(({ it, p }) => `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${MK.o.n[p.i]} · ${p.c}% · ${sd(it.m.d)}</small></li>`).join('')}</ul></div>` : '';
    },
  };

  // pre-kick-off table snapshots, so a finished game's report shows the table as it stood BEFORE the match
  const PMF = 'data/prematch.json'; let PM = {}; try { PM = JSON.parse(fs.readFileSync(PMF, 'utf8')); } catch {}
  let FORMJ = {}; try { FORMJ = JSON.parse(fs.readFileSync('data/form.json', 'utf8')).teams || {}; } catch {}
  const FK = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !['fc', 'cf', 'sc', 'ac', 'afc', 'the', 'club', 'de', 'sk', 'fk', 'cd', 'ud', 'ca', 'fa'].includes(w)).sort().join(' ');
  const snapRow = (r) => ({ pos: r.pos, pts: r.pts, p: r.p, w: r.w, d: r.d, l: r.l, gf: r.gf, ga: r.ga, gd: r.gd });
  const guide = (team) => (FORMJ[FK(team)] || '').split('').reverse().map((r) => ({ r, s: '', ha: '', opp: '' })); // newest first

  const TAGS = {};
  function matchPage({ m, L, d, file, idx }) {
    const h = m.h, a = m.a, t = hm(m.d), key = String(m.id);
    const isSet = settled(m), started = isSet || (m.st && m.st != 'NS') || Date.parse(m.d) < Date.now();
    const state = isSet ? 'post' : started ? 'live' : 'pre';
    let hr = rowOf(L, h), ar = rowOf(L, a), tableNote = 'Table as of the latest update.';
    const size = TABLES[L.slug]?.rows?.length || 20;
    if (state == 'pre' && hr && ar) PM[key] = { h: snapRow(hr), a: snapRow(ar), n: size, t: m.d };
    else if (PM[key]) { hr = PM[key].h; ar = PM[key].a; tableNote = 'Table as it stood before kick-off.'; }
    else if (hr && ar) tableNote = 'This is the latest table, so it may already count this game.';
    const before = Date.parse(m.d);
    let formH = formOf(h, before), formA = formOf(a, before), guided = false;
    if (state == 'pre') { if (formH.length < 3 && guide(h).length >= 3) { formH = guide(h); guided = true; } if (formA.length < 3 && guide(a).length >= 3) { formA = guide(a); guided = true; } }
    const H = h2hFor(h, a, m.d.slice(0, 10)), ps = picksOf(m);
    const c = { m, L, hr, ar, H, file, SITE, D: { t }, state, ps, formH, formA, fbH: guided ? 'g' : '', fbA: '', tableNote, tableSize: PM[key]?.n || size, tlink };
    const M = matchModel(c); c.M = M;
    const rich = [hr && ar, H, formH.length >= 3 && formA.length >= 3, M.o25 != null].filter(Boolean).length;
    const index = idx && !!L.slug && ps.length > 0 && state == 'post';
    const body = renderMatch(c), ag = M.angle, p1 = pick(m, 'o');
    TAGS[file] = { tag: ag.id == 'standard' ? '' : ag.tag, fc: M.fc, fav: M.fav, state };
    const ptxt = ps.length ? `${MK[ps[0][0]].n[ps[0][1].i]} (${ps[0][1].c}%)` : 'no pick clears our quality bar';
    const wonN = ps.filter(([k, p]) => won(m, k, p)).length;
    const first = ag.story.filter(Boolean)[0].replace(/\s+/g, ' ').trim();
    const sc = isSet ? `${m.sc[0]}–${m.sc[1]}` : '';
    const open = `${h} take on ${a} in the ${L.name} on ${wd(m.d)}, kick-off ${t} WAT.`;
    const title = state == 'post' ? `${h} ${sc} ${a}: Match Report (${sd(m.d)})` : state == 'live' ? `${h} vs ${a}: Live Score & Prediction (${sd(m.d)})` : `${h} vs ${a} Prediction & Odds (${sd(m.d)})`;
    const desc = state == 'post' ? `${h} ${sc} ${a} in the ${L.name}. ${ps.length ? `${wonN} of ${ps.length} of our picks won. ` : ''}See what our pre-match analysis got right and wrong.` : `${h} vs ${a} prediction for ${sd(m.d)}: ${ptxt}. ${ag.id == 'standard' ? '' : ag.tag + '. '}Odds, form, table and head-to-head.`;
    page(file, { title, desc: desc.slice(0, 200), h1: state == 'post' ? `${esc(h)} ${sc} ${esc(a)}: <em>match report</em>` : `${esc(h)} vs ${esc(a)} <em>prediction</em>`, lead: `${esc(ag.head)}. ${esc(first)}`, crumb: `${h} vs ${a}`, eyebrow: `${esc(L.name)} · ${sd(m.d)} · ${t} WAT${ag.id == 'standard' ? '' : ' · ' + esc(ag.tag)}`, noindex: !index,
      kp: state == 'post' ? [[sc, 'Final score'], [ps.length ? `${wonN}/${ps.length}` : '–', 'Our picks won'], [M.fc + '%', 'Favourite’s pre-match chance']] : [[M.fc + '%', 'Favourite’s chance'], [ps.length, 'Picks published'], [t, 'Kick-off WAT']], body,
      faq: [[`What is the prediction for ${h} vs ${a}?`, `${open} ${first} ${ps.length ? `Our published pick${ps.length > 1 ? 's are' : ' is'}: ${ps.map(([k, p]) => `${MK[k].l} ${MK[k].n[p.i]}${p.od ? ' at ' + p.od.toFixed(2) : ''}`).join('; ')}.` : 'No pick cleared our quality bar.'}`],
        [`What are the odds for ${h} vs ${a}?`, `1X2 odds are ${h} ${m.o[0].toFixed(2)}, draw ${m.o[1].toFixed(2)}, ${a} ${m.o[2].toFixed(2)}. Prices move before kick-off, so check your bookmaker.`],
        ...(isSet ? [[`What was the score in ${h} vs ${a}?`, `${h} ${sc} ${a}.${ps.length ? ` ${wonN} of our ${ps.length} published picks won.` : ''}`]] : [[`When does ${h} vs ${a} kick off?`, `${full(m.d)} at ${t} WAT, in the ${L.name}.`]]),
        ...(H ? [[`What is the head-to-head record between ${h} and ${a}?`, `${h} have won ${H.hw} and ${a} ${H.aw}, with ${H.dr} ${H.dr == 1 ? 'draw' : 'draws'}, in their last ${H.n} meetings, averaging ${H.avg.toFixed(1)} goals a game.`]] : [])] });
  }


  // ---- deeper team content, from every tracked result (not only games that had odds) ----
  const tracked = (team) => { const k = teamKey(team), out = []; for (const x of RESV) { const hk = teamKey(x[1]) == k, ak = teamKey(x[2]) == k; if (!hk && !ak) continue; const g = hk ? x[3] : x[4], c = hk ? x[4] : x[3]; out.push({ d: x[0], opp: hk ? x[2] : x[1], hk, g, c, r: g > c ? 'W' : g < c ? 'L' : 'D' }); } return out.sort((a, b) => b.d.localeCompare(a.d)); };
  const per = (a, b) => (b ? (a / b).toFixed(1) : '0.0'), cnt = (a, f) => a.filter(f).length, rate = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  function teamDeep(team, r, L, nxt, s, lgAvg) {
    const T = tracked(team), n = T.length; if (n < 3) return { n, html: '', faq: [] };
    const w = cnt(T, (x) => x.r == 'W'), d = cnt(T, (x) => x.r == 'D'), l = n - w - d, gf = T.reduce((t, x) => t + x.g, 0), ga = T.reduce((t, x) => t + x.c, 0);
    const bt = cnt(T, (x) => x.g > 0 && x.c > 0), o25 = cnt(T, (x) => x.g + x.c >= 3), o15 = cnt(T, (x) => x.g + x.c >= 2), u25 = n - o25, cs = cnt(T, (x) => x.c == 0), fts = cnt(T, (x) => x.g == 0);
    const hm_ = T.filter((x) => x.hk), aw_ = T.filter((x) => !x.hk), pts = (a) => a.reduce((t, x) => t + (x.r == 'W' ? 3 : x.r == 'D' ? 1 : 0), 0);
    const side = (a, nm) => a.length >= 3 ? `${nm}: ${cnt(a, (x) => x.r == 'W')} wins, ${cnt(a, (x) => x.r == 'D')} draws and ${cnt(a, (x) => x.r == 'L')} defeats in ${a.length}, ${per(pts(a), a.length)} points a game, ${per(a.reduce((t, x) => t + x.g, 0), a.length)} scored and ${per(a.reduce((t, x) => t + x.c, 0), a.length)} conceded` : '';
    let run = 0; const first = T[0].r; for (const x of T) { if (first == 'W' ? x.r == 'W' : first == 'L' ? x.r == 'L' : x.r != 'L' && first != 'W' ? x.r == 'D' : false) run++; else break; }
    let unb = 0; for (const x of T) { if (x.r == 'L') break; unb++; } let wl = 0; for (const x of T) { if (x.r == 'W') break; wl++; }
    const streak = unb >= 4 ? `They are unbeaten in their last ${unb} tracked games.` : wl >= 4 ? `They have gone ${wl} tracked games without a win.` : first == 'W' && run >= 2 ? `They have won their last ${run}.` : first == 'L' && run >= 2 ? `They have lost their last ${run}.` : '';
    const sh = (v) => (v >= 4 ? 'most' : '');
    const rows = T.slice(0, 10).map((x) => `<tr><td>${sd(x.d + 'T12:00:00Z')} ${x.d.slice(0, 4)}</td><td>${tlink(x.opp)}</td><td>${x.hk ? 'Home' : 'Away'}</td><td>${x.hk ? x.g + '–' + x.c : x.c + '–' + x.g}</td><td><span class="fm ${x.r}">${x.r}</span></td></tr>`).join('');
    const hs = side(hm_, 'At home'), as = side(aw_, 'Away'), split = [hs, as].filter(Boolean);
    const goalsLine = V([
      `Across those ${n} games, ${team} have scored ${gf} and conceded ${ga}, which works out at ${per(gf, n)} for and ${per(ga, n)} against per game. ${o25} of the ${n} (${rate(o25, n)}%) finished with three or more goals, and both teams scored in ${bt} (${rate(bt, n)}%).`,
      `${team}’s tracked games average ${per(gf + ga, n)} goals. Three or more goals came up in ${o25} of ${n} (${rate(o25, n)}%), and both sides found the net in ${bt} (${rate(bt, n)}%). They scored ${per(gf, n)} per game and let in ${per(ga, n)}.`], s);
    const angle = [];
    if (o25 / n >= 0.6) angle.push(`Their games have leaned towards goals, so over 2.5 and BTTS have both been worth a look in this sample.`);
    else if (o25 / n <= 0.35) angle.push(`Their games have mostly been low-scoring, which is what under 2.5 backers look for, and only ${o25} of ${n} reached three goals.`);
    else angle.push(`Their games are split fairly evenly between tight and open, so the goals lines near 2.5 have been close to a coin flip.`);
    if (cs / n >= 0.4) angle.push(`They kept a clean sheet in ${cs} of ${n}, a sign of a solid back line.`); else if (fts / n >= 0.3) angle.push(`They failed to score in ${fts} of ${n}, so “both teams to score: No” has landed a fair few times.`);
    if (lgAvg) angle.push(`For comparison, the average across the games we track is ${lgAvg.toFixed(1)} goals, so ${team} sit ${per(gf + ga, n) > lgAvg + 0.3 ? 'above' : per(gf + ga, n) < lgAvg - 0.3 ? 'below' : 'close to'} the norm.`);
    let mkt = '';
    const nx = nxt[0]; if (nx && nx.m.o && nx.m.o.length == 3 && nx.m.o.every((x) => x > 1)) {
      const q = norm(nx.m.o).map(pct), isH = teamKey(nx.m.h) == teamKey(team), mine = isH ? q[0] : q[2], opp = isH ? nx.m.a : nx.m.h;
      mkt = `<h2>Next game: what the odds say</h2><p>${esc(nx.m.h)} v ${esc(nx.m.a)} is on ${wd(nx.m.d)} at ${hm(nx.m.d)} WAT. With the bookmaker’s margin removed, the market gives ${esc(team)} about a ${mine}% chance of winning, ${q[1]}% for a draw and ${isH ? q[2] : q[0]}% for ${esc(opp)}. ${mine >= 55 ? `That makes ${esc(team)} clear favourites, so the short price is the thing to weigh, not just the team.` : mine <= 30 ? `${esc(team)} are the underdogs here, which is when a double chance or draw no bet price can be more interesting than the win.` : 'It is a fairly open game by the market’s reckoning.'} <a href="${nx.file}">Read the full match preview</a>.</p>`;
    }
    const html = `<h2>Results we’ve tracked</h2><p>${esc(team)} have ${w} win${w == 1 ? '' : 's'}, ${d} draw${d == 1 ? '' : 's'} and ${l} defeat${l == 1 ? '' : 's'} in the ${n} results we hold${T.length > 10 ? ', and the latest ten are below' : ''}. ${streak}</p><div class="sc"><table><thead><tr><th>Date</th><th>Opponent</th><th>Venue</th><th>Score (home first)</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>${split.length ? `<h2>Home and away</h2><p>${split.join('. ')}.${hm_.length >= 3 && aw_.length >= 3 ? (pts(hm_) / hm_.length > pts(aw_) / aw_.length + 0.5 ? ` They have clearly been better at home, which is worth remembering when they travel.` : pts(aw_) / aw_.length > pts(hm_) / hm_.length + 0.5 ? ` Oddly, the away numbers have been better than the home ones.` : ` There is not much between their home and away form.`) : ''}</p>` : ''}<h2>Goals and betting angles</h2><p>${goalsLine} ${angle.join(' ')}</p><p class="mut">This is a small sample of the games we track, not a full season, so use it as a nudge and not as a rule. Our <a href="how-it-works.html">methodology page</a> explains how the odds-based numbers on this site are produced.</p>${mkt}`;
    const faq = [[`Do ${team} games usually have goals?`, `Of the ${n} games we track, ${o25} (${rate(o25, n)}%) had three or more goals and both teams scored in ${bt} (${rate(bt, n)}%). That is a small sample, so treat it as a guide.`], [`How have ${team} done at home and away?`, split.length ? split.join('. ') + '.' : `We hold ${n} results for ${team} so far, not enough for a reliable home and away split.`], [`What is ${team}’s recent form?`, `${w} wins, ${d} draws and ${l} defeats in the ${n} games we track. ${streak}`.trim()]];
    return { n, html, faq };
  }

  function teamPage({ file, L, r }) {
    const s = hash(file), team = r.team, f = formOf(team), k = teamKey(team);
    const nxt = items.filter((it) => (teamKey(it.m.h) == k || teamKey(it.m.a) == k) && it.d >= today && !settled(it.m)).sort((x, y) => Date.parse(x.m.d) - Date.parse(y.m.d));
    const ppg = (r.pts / r.p).toFixed(2), gpg = (r.gf / r.p).toFixed(1), cpg = (r.ga / r.p).toFixed(1);
    const mood = r.pos <= 4 ? V([`${team} are right at the top end of the ${L.name}`, `${team} are part of the ${L.name} leading pack`], s) : r.pos > TABLES[L.slug].rows.length - 3 ? V([`${team} are in the thick of the ${L.name} relegation fight`, `${team} are looking nervously down the ${L.name} table`], s) : V([`${team} are sitting in mid-table in the ${L.name}`, `${team} are in the ${L.name} pack, neither flying nor falling`], s);
    const lgAvg = (() => { const g = RESV.reduce((t, x) => t + x[3] + x[4], 0); return RESV.length ? g / RESV.length : 0; })(), deep = teamDeep(team, r, L, nxt, s, lgAvg);
    const next = nxt.length ? `<ul class="pl">${nxt.slice(0, 4).map((it) => { const p = pick(it.m, 'o'); return `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${sd(it.m.d)}, ${hm(it.m.d)}${p && p.od && p.c >= MIN.o ? ` · tip: ${MK.o.n[p.i]} (${p.c}%)` : ''}</small></li>`; }).join('')}</ul>` : '<p>No upcoming game with published odds yet. Check back as bookmakers release prices.</p>';
    page(file, { title: `${team} Prediction: Form, Next Match & Tips`, desc: `${team} predictions: ${ord(r.pos)} in the ${L.name} on ${r.pts} points, recent form, next match odds and free tips. Updated every few minutes.`, h1: `${esc(team)} <em>predictions</em> and form`, lead: `${esc(mood)}: ${ord(r.pos)} on ${r.pts} points from ${r.p} games, with ${r.w} win${r.w == 1 ? '' : 's'}, ${r.d} draw${r.d == 1 ? '' : 's'} and ${r.l} defeat${r.l == 1 ? '' : 's'}. Here’s the next game, the recent form we’ve tracked and what the odds say.`, crumb: team, eyebrow: `${esc(L.name)} · ${esc(TABLES[L.slug].season || '')}`, kp: [[ord(r.pos), 'League position'], [r.pts, 'Points'], [sgn(r.gd), 'Goal difference']],
      body: `<div class="prose"><h2>Next matches</h2>${next}<h2>Season record</h2><div class="sc"><table><thead><tr><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Pts/game</th></tr></thead><tbody><tr><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${sgn(r.gd)}</td><td><b>${r.pts}</b></td><td>${ppg}</td></tr></tbody></table></div><p>That’s ${gpg} goals scored and ${cpg} conceded per game${r.gf / r.p >= 2 ? ', so goals are rarely far away when they play' : r.ga / r.p <= 0.9 ? ', which points to a side that’s hard to break down' : ''}.</p><h2>Recent form we’ve tracked</h2><ul class="fl">${formHtml(team)}</ul>${deep.html}<p>See the full <a href="${L.slug}-predictions.html">${esc(L.name)} table and predictions</a>, or build a slip with the <a href="ai-betting-assistant.html">AI picker</a>.</p></div>`,
      faq: [[`Where are ${team} in the ${L.name} table?`, `${team} are ${ord(r.pos)} on ${r.pts} points from ${r.p} games.`], [`When do ${team} play next?`, nxt.length ? `${nxt[0].m.h} vs ${nxt[0].m.a} on ${wd(nxt[0].m.d)} at ${hm(nxt[0].m.d)} WAT.` : 'There is no upcoming game with published odds yet. Check back soon.'], ...deep.faq],
      noindex: deep.n < 6,
      ld: [{ '@type': 'SportsTeam', name: team, sport: 'Football' }] });
  }

  const rec = (ms) => { const out = []; for (const m of ms) if (settled(m)) for (const k of KEYS) { const p = pick(m, k); if (p && p.od && p.c >= MIN[k]) out.push({ m, k, p, w: !!won(m, k, p) }); } return out; };
  const summary = (R) => { const n = R.length, w = R.filter((x) => x.w).length; return { n, w, r: n ? Math.round((w / n) * 100) : null }; };

  function archivePages() {
    const days = Object.keys(snaps).filter((d) => d < today && d >= dstr(-14)).sort().reverse(), list = [];
    for (const d of days) {
      const ms = snaps[d] || [], R = rec(ms), S = summary(R); if (!ms.length) continue; list.push([d, S]);
      const iso = d + 'T12:00:00Z';
      page(`predictions-${d}.html`, { title: `Football Predictions ${sd(iso)} ${d.slice(0, 4)}: Results & Tips`, desc: `Football predictions for ${full(iso)}: ${S.n ? `${S.w} of ${S.n} published picks won (${S.r}%)` : 'full results'}, with odds and final scores for every game.`, h1: `Football predictions <em>${sd(iso)}</em>: results`, lead: S.n ? `On ${full(iso)} we published ${S.n} picks that cleared our quality bar, and ${S.w} won (${S.r}%). ${S.r >= 75 ? 'A good day.' : S.r >= 60 ? 'A solid day, with a few that got away.' : 'A tough one, and we won’t pretend otherwise.'} Every game, its odds and the final score are below.` : `Every game from ${full(iso)} with odds and final scores.`, crumb: `Results ${sd(iso)}`, eyebrow: 'Results archive · every pick, win or lose', kp: [[ms.length, 'Games'], [S.n, 'Picks published'], [S.r == null ? '–' : S.r + '%', 'Picks won']],
        body: `<div class="prose"><h2>All games and results</h2></div>${board(ms, 'o', { max: 150 })}<div class="prose"><p>See how the week went in our <a href="weekly-review.html">weekly review</a>, browse the <a href="archive.html">full archive</a>, or check <a href="index.html">today’s predictions</a>.</p></div>` });
    }
    page('archive.html', { title: 'Football Predictions Archive: Past Results & Tips', desc: 'Every day’s football predictions and final results from the last two weeks. See how our picks did, win or lose.', h1: 'Predictions <em>archive</em>', lead: 'We keep every day’s picks and results, because a tip you can’t check is just an opinion. Pick a day to see the games, the odds and how each one ended.', crumb: 'Archive', eyebrow: 'Receipts for every pick',
      body: `<div class="prose"><ul class="pl">${list.map(([d, S]) => `<li><a href="predictions-${d}.html">${full(d + 'T12:00:00Z')}</a> <small>${S.n ? `${S.w}/${S.n} picks won (${S.r}%)` : 'no published picks'}</small></li>`).join('') || '<li>The archive fills as days finish.</li>'}</ul>${WEEKS.length ? `<h2>Weekly reviews</h2><ul class="pl">${WEEKS.map((w) => `<li><a href="${w.file}">${w.range}</a> <small>${w.S.n ? `${w.S.w}/${w.S.n} picks won (${w.S.r}%)` : 'no published picks'}</small></li>`).join('')}</ul>` : ''}<p>For the big picture, read the <a href="weekly-review.html">weekly review</a>.</p></div>` });
  }

  function reviewPage(ds, file, rolling) {
    const R = ds.flatMap((d) => rec(snaps[d] || [])), S = summary(R);
    const by = KEYS.map((k) => [k, summary(R.filter((x) => x.k == k))]).filter(([, x]) => x.n);
    const lost = R.filter((x) => !x.w).sort((a, b) => b.p.c - a.p.c).slice(0, 5), best = R.filter((x) => x.w).sort((a, b) => b.p.od - a.p.od).slice(0, 5);
    const line = (x) => `<li>${esc(x.m.h)} ${x.m.sc[0]}–${x.m.sc[1]} ${esc(x.m.a)} <small>${MK[x.k].l}: ${MK[x.k].n[x.p.i]} at ${x.p.od.toFixed(2)} (${x.p.c}%)</small></li>`;
    const range = ds.length ? `${sd(ds[0] + 'T12:00:00Z')} to ${sd(ds[ds.length - 1] + 'T12:00:00Z')}` : 'the past week', tone = S.r == null ? '' : S.r >= 75 ? 'A good week.' : S.r >= 60 ? 'A solid week, though not a perfect one.' : 'A tough week, and we’re saying so.';
    page(file, { title: rolling ? 'Weekly Football Picks Review: Wins, Losses & Lessons' : `Weekly Picks Review ${range}: Results & Lessons`, desc: `How our football picks did over ${range}: ${S.n ? `${S.w} of ${S.n} won (${S.r}%)` : 'results by market'}, the best calls, the misses and what we learned.`, h1: rolling ? 'Weekly picks <em>review</em>' : `Picks review <em>${range}</em>`, lead: S.n ? `From ${range} we published ${S.n} picks that cleared our quality bar, and ${S.w} won (${S.r}%). ${tone} Here’s the breakdown by market, the best calls and the misses we’d rather forget.` : 'The weekly review fills in as results come in. Check back soon.', crumb: rolling ? 'Weekly review' : `Review ${range}`, eyebrow: rolling ? `Updated automatically · ${range}` : `Final results · ${range}`, kp: [[S.n || '–', 'Picks published'], [S.w ?? '–', 'Won'], [S.r == null ? '–' : S.r + '%', 'Win rate']],
      body: `<div class="prose"><h2>How each market did</h2><div class="sc"><table><thead><tr><th>Market</th><th>Picks</th><th>Won</th><th>Rate</th></tr></thead><tbody>${by.map(([k, x]) => `<tr><td>${MK[k].l}</td><td>${x.n}</td><td>${x.w}</td><td>${x.r}%</td></tr>`).join('')}</tbody></table></div><p class="mut">Short-priced picks, like over 1.5 goals, win more often than the rest, which is why every market is listed separately.</p>${lost.length ? `<h2>The misses we’d rather forget</h2><p>These were our most confident picks that lost. A 75% pick still loses one time in four, and this is what that looks like.</p><ul class="pl">${lost.map(line).join('')}</ul>` : ''}${best.length ? `<h2>The best calls</h2><p>The winners that paid the most.</p><ul class="pl">${best.map(line).join('')}</ul>` : ''}<h2>What this tells you</h2><p>Picks are chances, not promises. We only publish what clears our quality bar and we show the results either way, so you can judge us on the record. See any day in the <a href="archive.html">archive</a> or read <a href="how-it-works.html">how the picks are made</a>.</p>${rolling && WEEKS.length ? `<h2>Earlier weeks</h2><ul class="pl">${WEEKS.map((w) => `<li><a href="${w.file}">${w.range}</a> <small>${w.S.n ? `${w.S.w}/${w.S.n} picks won (${w.S.r}%)` : 'no published picks'}</small></li>`).join('')}</ul>` : ''}</div>` });
  }
  const WEEKS = [];
  function weeklyArchive() {
    const byWeek = {}; for (const d of Object.keys(snaps)) { const dt = new Date(d + 'T12:00:00Z'), back = (dt.getUTCDay() + 6) % 7, mon = new Date(dt - back * 864e5).toISOString().slice(0, 10); (byWeek[mon] ??= []).push(d); }
    for (const mon of Object.keys(byWeek).sort().reverse()) { const sun = new Date(Date.parse(mon + 'T12:00:00Z') + 6 * 864e5).toISOString().slice(0, 10), ds = byWeek[mon].sort(); if (sun >= today || ds.length < 5) continue; const file = `weekly-review-${mon}.html`, R = ds.flatMap((d) => rec(snaps[d] || [])); WEEKS.push({ file, ds, S: summary(R), range: `${sd(mon + 'T12:00:00Z')} to ${sd(sun + 'T12:00:00Z')}` }); }
    for (const w of WEEKS) reviewPage(w.ds, w.file, false);
  }
  function weeklyReview() { reviewPage(Object.keys(snaps).filter((d) => d < today && d >= dstr(-7)).sort(), 'weekly-review.html', true); }

  // ---- pick of the day: today's card, plus a permanent record so results stay visible after midnight ----
  const HF = 'data/potd-history.json';
  const loadHist = () => { try { return JSON.parse(fs.readFileSync(HF, 'utf8')); } catch { return []; } };
  const potdFile = (id) => matchFile[id] || '';
  function updateHist(extra) {
    const hist = loadHist();
    for (const st of extra ? [extra] : []) if (st && st.id && st.date && !hist.some((e) => e.date == st.date)) { const m = (snaps[st.date] || []).find((x) => x.id == st.id); if (m) hist.push({ date: st.date, id: st.id, i: st.i, c: st.c, od: st.od, h: m.h, a: m.a, lg: m.lg || '', d: m.d, file: potdFile(st.id) }); }
    for (const e of hist) { const m = (snaps[e.date] || []).find((x) => x.id == e.id); if (m && settled(m)) { e.sc = m.sc; e.res = won(m, 'o', { i: e.i }) ? 'won' : 'lost'; } if (!e.file && potdFile(e.id)) e.file = potdFile(e.id); }
    hist.sort((x, y) => y.date.localeCompare(x.date));
    try { fs.writeFileSync(HF, JSON.stringify(hist.slice(0, 400))); } catch {}
    return hist;
  }
  const badge = (e) => e.res ? `<span class="pr ${e.res == 'won' ? 'w' : 'l'}">${e.res == 'won' ? '✓ Won' : '✗ Lost'} ${e.sc[0]}–${e.sc[1]}</span>` : '';
  let potdNow = null; // today's pick of the day, kept so the home page hero can show it too
  api.potd = (parts = 'all') => {
    const F = 'data/potd.json'; let st = {}; try { st = JSON.parse(fs.readFileSync(F, 'utf8')); } catch {}
    let hist = updateHist(st.id ? st : null);
    let it = st.date === today ? items.find((x) => x.m.id === st.id) : null;
    if (!it) {
      const cands = (min, od) => items.filter((x) => x.d === today && Date.parse(x.m.d) > Date.now() && (!x.m.st || x.m.st == 'NS')).map((x) => ({ x, p: pick(x.m, 'o') })).filter(({ p }) => p && p.od && p.c >= min && p.od >= od).sort((a, b) => b.p.c - a.p.c);
      const c = cands(65, 1.3)[0] || cands(60, 1.2)[0];
      if (c) { it = c.x; st = { date: today, id: it.m.id, i: c.p.i, c: c.p.c, od: c.p.od }; try { fs.writeFileSync(F, JSON.stringify(st)); } catch {} hist = updateHist(st); }
    }
    const past = hist.filter((e) => e.date < today && e.res), rec7 = past.slice(0, 7), w7 = rec7.filter((e) => e.res == 'won').length;
    let html = '';
    potdNow = it ? { it, st, e: hist.find((x) => x.date == today) } : null;
    if (it && parts != 'last') { const m = it.m, e = hist.find((x) => x.date == today); html += `<a class="potd" href="${it.file}" data-id="${esc(m.id)}" data-i="${st.i}"><span class="pt">★ Pick of the day</span><b>${esc(m.h)} vs ${esc(m.a)}</b><span class="pp">${MK.o.n[st.i]} · ${st.c}% chance · odds ${Number(st.od).toFixed(2)}${e ? badge(e) : ''}</span><small>${esc(it.L.name)} · ${sd(m.d)}, ${hm(m.d)} WAT · tap for the full preview</small></a>`; }
    if (past.length) { const y = past[0]; html += `<a class="potd-last" href="pick-of-the-day.html"><span><b>Last pick of the day</b> ${esc(y.h)} ${y.sc[0]}–${y.sc[1]} ${esc(y.a)} ${badge(y).replace(/ \d+–\d+/, '')}</span><small>Record: ${w7} of ${rec7.length} recent picks won · see every pick of the day →</small></a>`; }
    return html;
  };
  // The big button at the top of the home page: today's pick of the day (empty when there is no pick yet).
  api.potdHero = () => {
    if (!potdNow) return '';
    const { it, st, e } = potdNow, m = it.m;
    return `<a class="mega potd-hero" href="${it.file}" data-id="${esc(m.id)}" data-i="${st.i}"><span class="mi">★</span><span class="mt"><small class="pt">Pick of the day</small><b>${esc(m.h)} vs ${esc(m.a)}</b><small class="pp">${MK.o.n[st.i]} · ${st.c}% · odds ${Number(st.od).toFixed(2)}${e ? badge(e) : ''}</small></span><span class="arr">→</span></a>`;
  };
  function potdArchive() {
    const hist = updateHist(null), done = hist.filter((e) => e.res), w = done.filter((e) => e.res == 'won').length;
    page('pick-of-the-day.html', { title: 'Pick of the Day: Free Football Tip & Results Record', desc: `Our football pick of the day, every day, with the result kept for good${done.length ? `: ${w} of ${done.length} won (${Math.round((w / done.length) * 100)}%)` : ''}. Every pick, win or lose.`, h1: 'Pick of the day: <em>the record</em>', lead: `Every morning we choose one pick with a strong chance and a fair price, and we keep the result forever, win or lose. ${done.length ? `So far ${w} of ${done.length} have won (${Math.round((w / done.length) * 100)}%).` : 'The record builds as days finish.'}`, crumb: 'Pick of the day', eyebrow: 'One pick a day · results kept for good', kp: [[done.length || '–', 'Picks settled'], [w, 'Won'], [done.length ? Math.round((w / done.length) * 100) + '%' : '–', 'Win rate']],
      body: `<div class="prose"><h2>Every pick of the day</h2><ul class="pl">${hist.map((e) => `<li><a href="${e.file || 'index.html'}">${esc(e.h)} vs ${esc(e.a)}</a> <small>${full(e.date + 'T12:00:00Z')} · ${MK.o.n[e.i]} · ${e.c}% chance · odds ${Number(e.od).toFixed(2)} ${badge(e)}</small></li>`).join('') || '<li>No picks recorded yet.</li>'}</ul><h2>How the pick of the day is chosen</h2><p>Each morning we look at the day’s games that haven’t started and pick the 1X2 result the market rates highest, as long as the price is worth taking (odds of at least 1.30, and a chance of 65% or more). The pick is saved once and never changes, so the record can’t be edited after the fact. Read more in <a href="how-it-works.html">how it works</a>, or see the <a href="weekly-review.html">weekly review</a>.</p></div>` });
  }
  api.write = () => {
    const cut = dstr(-14);
    for (const f of fs.readdirSync('.')) { const mm = f.match(/^prediction-.+-(\d{4}-\d\d-\d\d)\.html$/); if (mm && mm[1] < cut) fs.unlinkSync(f); }
    for (const it of items) matchPage(it);
    // older match pages (outside the rebuild window) may still carry the retired Event markup: strip it so Search Console stops flagging them
    for (const f of fs.readdirSync('.')) if (/^prediction-.+\.html$/.test(f)) { const s = fs.readFileSync(f, 'utf8'); if (s.includes('SportsEvent')) fs.writeFileSync(f, s.replace(/<script type="application\/ld\+json">(?:(?!<\/script>).)*SportsEvent(?:(?!<\/script>).)*<\/script>/gs, '')); }
    const seen = new Set(); for (const v of Object.values(teamFile)) if (!seen.has(v.file)) { seen.add(v.file); teamPage(v); }
    weeklyArchive(); archivePages(); weeklyReview(); potdArchive();
    for (const k of Object.keys(PM)) if (PM[k].t.slice(0, 10) < dstr(-14)) delete PM[k];
    try { fs.writeFileSync(PMF, JSON.stringify(PM)); } catch {}
    fs.writeFileSync('data/previews.json', JSON.stringify(matchFile));
  };
  return api;
}
