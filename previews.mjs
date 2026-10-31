// Match previews, team pages, results archive and weekly review: all built from the site's own data (odds, tables, tracked results).
import fs from 'node:fs';
import { MK, MIN, pick, won, settled, esc, hm, board } from './render.js';
import { teamKey } from './teams.js';

const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const V = (arr, s, salt = 0) => arr[(s + salt) % arr.length];
const norm = (od) => { const t = od.reduce((a, x) => a + 1 / x, 0); return od.map((x) => 1 / x / t); };
const okOdds = (od) => Array.isArray(od) && od.length > 1 && od.every((x) => x > 1);
const pct = (x) => Math.round(x * 100);
const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10] || 'th');
const sgn = (n) => (n > 0 ? '+' : '') + n;
const KEYS = ['o', 'dc', 'ou', 'o15', 'bt'];

export function makePreviews({ page, snaps, TABLES, LG, leagueTest, dstr, TZ, SITE }) {
  const today = dstr(0);
  const D = (iso, o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...o }).format(new Date(iso));
  const wd = (iso) => D(iso, { weekday: 'long', day: 'numeric', month: 'long' }), sd = (iso) => D(iso, { day: 'numeric', month: 'short' }), full = (iso) => D(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const tests = LG.map((L) => [L, leagueTest(L)]), leagueOf = (m) => tests.find(([, t]) => t(m))?.[0];
  const rowOf = (L, team) => { const k = teamKey(team); return k ? TABLES[L.slug]?.rows?.find((r) => teamKey(r.team) == k || teamKey(r.full || '') == k) || null : null; };
  const done = Object.entries(snaps).flatMap(([d, ms]) => ms.filter(settled).map((m) => ({ ...m, day: d }))).sort((a, b) => Date.parse(b.d) - Date.parse(a.d));
  const formOf = (team) => { const k = teamKey(team), out = []; for (const m of done) { const hk = teamKey(m.h) == k, ak = teamKey(m.a) == k; if (!hk && !ak) continue; const [g, c] = hk ? m.sc : [m.sc[1], m.sc[0]]; out.push({ r: g > c ? 'W' : g < c ? 'L' : 'D', s: m.sc[0] + '–' + m.sc[1], opp: hk ? m.a : m.h, ha: hk ? 'H' : 'A', d: m.d }); if (out.length >= 5) break; } return out; };
  const formHtml = (team) => { const f = formOf(team); return `<li><b>${esc(team)}:</b> ${f.length ? f.map((x) => `<span class="fm ${x.r}">${x.r}</span> ${x.s} ${x.ha == 'H' ? 'v' : 'at'} ${esc(x.opp)} (${sd(x.d)})`).join(' · ') : 'no finished games tracked yet'}</li>`; };

  // ---- which games get a preview: leagues with a live table, odds present, from 3 days back to 2 days ahead ----
  const items = [], byLeague = {}, matchFile = {};
  for (let o = -3; o <= 2; o++) {
    const d = dstr(o);
    for (const m of snaps[d] || []) {
      const L = leagueOf(m); if (!L || !TABLES[L.slug]?.rows?.length || !okOdds(m.o)) continue;
      const file = `prediction-${slug(m.h)}-vs-${slug(m.a)}-${d}.html`; if (matchFile[m.id]) continue;
      const it = { m, L, d, file }; items.push(it); matchFile[m.id] = file; (byLeague[L.slug] ??= []).push(it);
    }
  }
  const teamFile = {};
  for (const L of LG) for (const r of TABLES[L.slug]?.rows || []) { const k = teamKey(r.team); if (!k || teamFile[k]) continue; teamFile[k] = { file: `team-${slug(r.team)}.html`, L, r }; }
  const fileCount = {}; for (const v of Object.values(teamFile)) fileCount[v.file] = (fileCount[v.file] || 0) + 1;
  for (const v of Object.values(teamFile)) if (fileCount[v.file] > 1) v.file = v.file.replace('.html', '-' + v.L.slug + '.html');
  const tlink = (name) => { const t = teamFile[teamKey(name)]; return t ? `<a href="${t.file}">${esc(name)}</a>` : esc(name); };

  const picksOf = (m) => KEYS.map((k) => [k, pick(m, k)]).filter(([k, p]) => p && p.od && p.c >= MIN[k]);
  const upcoming = (arr) => arr.filter((it) => it.d >= today && !settled(it.m)).sort((a, b) => Date.parse(a.m.d) - Date.parse(b.m.d));
  const link = (it) => `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${sd(it.m.d)}, ${hm(it.m.d)}</small></li>`;

  const api = {
    linksFor(L) { const l = upcoming(byLeague[L.slug] || []).slice(0, 12); return l.length ? `<div class="prose"><h2>${esc(L.name)} match previews</h2><ul class="pl">${l.map(link).join('')}</ul></div>` : ''; },
    featured() {
      const l = upcoming(items).filter((it) => it.d <= dstr(1)).map((it) => ({ it, p: pick(it.m, 'o') })).filter((x) => x.p && x.p.od && x.p.c >= MIN.o).sort((a, b) => b.p.c - a.p.c).slice(0, 8);
      return l.length ? `<div class="prose"><h2>Match previews: today’s strongest picks</h2><ul class="pl">${l.map(({ it, p }) => `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${MK.o.n[p.i]} · ${p.c}% · ${sd(it.m.d)}</small></li>`).join('')}</ul></div>` : '';
    },
  };

  function matchPage({ m, L, d, file }) {
    const h = m.h, a = m.a, s = hash(m.id || file), t = hm(m.d), hr = rowOf(L, h), ar = rowOf(L, a), q = norm(m.o), fi = q.indexOf(Math.max(...q)), fav = [h, 'a draw', a][fi], fc = pct(q[fi]);
    const ps = picksOf(m), p1 = pick(m, 'o'), over = okOdds(m.ou) ? norm(m.ou)[0] : null, btts = okOdds(m.bt) ? norm(m.bt)[0] : null, ov15 = okOdds(m.o15) ? norm(m.o15)[0] : null;
    const open = V([`${h} take on ${a} in the ${L.name} on ${wd(m.d)}, with kick-off at ${t} WAT.`, `${wd(m.d)} brings ${h} against ${a} in the ${L.name}, kicking off at ${t} WAT.`, `It’s ${h} v ${a} in the ${L.name} on ${wd(m.d)} (${t} WAT).`], s);
    const view = fc >= 60 ? V([`${fav} are clear favourites: the market rates them ${fc}% to win, at odds of ${m.o[fi].toFixed(2)}.`, `The bookmakers back ${fav} firmly, at ${m.o[fi].toFixed(2)}, which works out to a ${fc}% chance once their margin is stripped out.`], s, 1)
      : fc >= 45 ? `${fav} start as favourites at ${m.o[fi].toFixed(2)}, but a ${fc}% chance leaves plenty of room for a surprise.` : `This one looks close. No result is rated above ${fc}%, so any 1X2 pick would be a guess.`;
    const goals = [over != null ? `Over 2.5 goals is rated at ${pct(over)}%` : '', ov15 != null ? `over 1.5 at ${pct(ov15)}%` : '', btts != null ? `and both teams to score at ${pct(btts)}%` : ''].filter(Boolean).join(', ').replace(', and', ' and');
    const tbl = hr && ar ? `${h} are ${ord(hr.pos)} on ${hr.pts} points from ${hr.p} games (${hr.w}W ${hr.d}D ${hr.l}L, goal difference ${sgn(hr.gd)}); ${a} are ${ord(ar.pos)} on ${ar.pts} (${ar.w}W ${ar.d}D ${ar.l}L, ${sgn(ar.gd)}). ${Math.abs(hr.pos - ar.pos) >= 8 ? `${Math.abs(hr.pos - ar.pos)} places separate them, which is a big gap.` : Math.abs(hr.pos - ar.pos) <= 2 ? 'They sit close together in the table, which fits a tight game.' : `${Math.abs(hr.pos - ar.pos)} places separate them.`} On goals, ${h} average ${(hr.gf / hr.p).toFixed(1)} scored and ${(hr.ga / hr.p).toFixed(1)} conceded per game; ${a} ${(ar.gf / ar.p).toFixed(1)} and ${(ar.ga / ar.p).toFixed(1)}.` : '';
    const rows = KEYS.slice().filter((k) => k != 'dc' && okOdds(m[k])).map((k) => { const qq = norm(m[k]), pk = pick(m, k); return MK[k].n.map((nm, i) => `<tr${pk && pk.i == i && pk.c >= MIN[k] ? ' class="hl"' : ''}><td>${i ? '' : MK[k].l}</td><td>${nm}</td><td>${m[k][i].toFixed(2)}</td><td>${pct(qq[i])}%</td></tr>`).join(''); }).join('');
    const result = settled(m) ? `<p class="res"><b>Final score:</b> ${esc(h)} ${m.sc[0]}–${m.sc[1]} ${esc(a)}.${ps.length ? ` Our picks: ${ps.filter(([k, p]) => won(m, k, p)).length} won, ${ps.filter(([k, p]) => !won(m, k, p)).length} lost.` : ''}</p>` : m.st && m.st != 'NS' && m.sc && m.sc[0] != null ? `<p class="res"><b>Latest score we have:</b> ${m.sc[0]}–${m.sc[1]}. For live updates open the <a href="index.html">Today</a> page.</p>` : '';
    const pickHtml = ps.length ? `<ul>${ps.map(([k, p]) => `<li><b>${MK[k].l}:</b> ${MK[k].n[p.i]} at ${p.od.toFixed(2)} <small>(${p.c}% chance${settled(m) ? (won(m, k, p) ? ' · ✓ won' : ' · ✗ lost') : ''})</small></li>`).join('')}</ul>` : `<p>No pick cleared our quality bar here, so we’re leaving this game out of our tips. That’s a feature, not a gap: we only publish picks the market rates at ${MIN.o}% or more (${MIN.dc}% for double chance and over 1.5).</p>`;
    const L1 = `${esc(h)} vs ${esc(a)} prediction`, ptxt = ps.length ? `${MK[ps[0][0]].n[ps[0][1].i]} (${ps[0][1].c}%)` : 'no pick clears our quality bar';
    const body = `<div class="prose"><h2>${L1}: the short version</h2><p>${open} ${view}${goals ? ` In the goals markets, ${goals}.` : ''}</p>${result}<h2>Our picks for ${esc(h)} v ${esc(a)}</h2>${pickHtml}<h2>Odds and chances</h2><div class="sc"><table><thead><tr><th>Market</th><th>Selection</th><th>Odds</th><th>Chance</th></tr></thead><tbody>${rows}</tbody></table></div><p class="mut">Chances are worked out from the bookmaker’s odds with their margin removed. They’re estimates, not guarantees. Highlighted rows are the picks that cleared our quality bar.</p>${tbl ? `<h2>What the ${esc(L.name)} table says</h2><p>${tbl}</p>` : ''}<h2>Recent form we’ve tracked</h2><ul class="fl">${formHtml(h)}${formHtml(a)}</ul><p class="mut">Form uses finished games from our own daily records, so it covers recent matches only.</p><h2>More on this game</h2><p>See all <a href="${L.slug}-predictions.html">${esc(L.name)} predictions</a>, read about ${tlink(h)} and ${tlink(a)}, build a slip with the <a href="ai-betting-assistant.html">AI picker</a>, or learn <a href="how-to-read-football-odds.html">how to read the odds</a>.</p></div>`;
    page(file, { title: `${h} vs ${a} Prediction & Tips (${sd(m.d)})`, desc: `${h} vs ${a} prediction for ${sd(m.d)}: ${ptxt}. Odds, win chances, form and ${L.name} table position. Free, no sign-up.`, h1: `${esc(h)} vs ${esc(a)} <em>prediction</em>`, lead: `${esc(open)} ${esc(view)}`, crumb: `${h} vs ${a}`, eyebrow: `${esc(L.name)} · ${sd(m.d)} · ${t} WAT`, kp: [[fc + '%', 'Favourite’s chance'], [ps.length, 'Picks published'], [t, 'Kick-off WAT']], body,
      faq: [[`What is the prediction for ${h} vs ${a}?`, `${open} ${view}${ps.length ? ` Our published pick${ps.length > 1 ? 's are' : ' is'}: ${ps.map(([k, p]) => `${MK[k].l} ${MK[k].n[p.i]} at ${p.od.toFixed(2)}`).join('; ')}.` : ' No pick cleared our quality bar.'}`], [`What are the odds for ${h} vs ${a}?`, `1X2 odds are ${h} ${m.o[0].toFixed(2)}, draw ${m.o[1].toFixed(2)}, ${a} ${m.o[2].toFixed(2)}. Prices move before kick-off, so check your bookmaker.`], [`When does ${h} vs ${a} kick off?`, `${full(m.d)} at ${t} WAT, in the ${L.name}.`]],
      ld: [{ '@type': 'SportsEvent', name: `${h} vs ${a}`, startDate: m.d, sport: 'Football', homeTeam: { '@type': 'SportsTeam', name: h }, awayTeam: { '@type': 'SportsTeam', name: a }, description: `${L.name} match preview with odds and win chances.` }] });
  }

  function teamPage({ file, L, r }) {
    const s = hash(file), team = r.team, f = formOf(team), k = teamKey(team);
    const nxt = items.filter((it) => (teamKey(it.m.h) == k || teamKey(it.m.a) == k) && it.d >= today && !settled(it.m)).sort((x, y) => Date.parse(x.m.d) - Date.parse(y.m.d));
    const ppg = (r.pts / r.p).toFixed(2), gpg = (r.gf / r.p).toFixed(1), cpg = (r.ga / r.p).toFixed(1);
    const mood = r.pos <= 4 ? V([`${team} are right at the top end of the ${L.name}`, `${team} are part of the ${L.name} leading pack`], s) : r.pos > TABLES[L.slug].rows.length - 3 ? V([`${team} are in the thick of the ${L.name} relegation fight`, `${team} are looking nervously down the ${L.name} table`], s) : V([`${team} are sitting in mid-table in the ${L.name}`, `${team} are in the ${L.name} pack, neither flying nor falling`], s);
    const next = nxt.length ? `<ul class="pl">${nxt.slice(0, 4).map((it) => { const p = pick(it.m, 'o'); return `<li><a href="${it.file}">${esc(it.m.h)} vs ${esc(it.m.a)}</a> <small>${sd(it.m.d)}, ${hm(it.m.d)}${p && p.od && p.c >= MIN.o ? ` · tip: ${MK.o.n[p.i]} (${p.c}%)` : ''}</small></li>`; }).join('')}</ul>` : '<p>No upcoming game with published odds yet. Check back as bookmakers release prices.</p>';
    page(file, { title: `${team} Prediction: Form, Next Match & Tips`, desc: `${team} predictions: ${ord(r.pos)} in the ${L.name} on ${r.pts} points, recent form, next match odds and free tips. Updated every few minutes.`, h1: `${esc(team)} <em>predictions</em> and form`, lead: `${esc(mood)}: ${ord(r.pos)} on ${r.pts} points from ${r.p} games, with ${r.w} wins, ${r.d} draws and ${r.l} defeats. Here’s the next game, the recent form we’ve tracked and what the odds say.`, crumb: team, eyebrow: `${esc(L.name)} · ${esc(TABLES[L.slug].season || '')}`, kp: [[ord(r.pos), 'League position'], [r.pts, 'Points'], [sgn(r.gd), 'Goal difference']],
      body: `<div class="prose"><h2>Next matches</h2>${next}<h2>Season record</h2><div class="sc"><table><thead><tr><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Pts/game</th></tr></thead><tbody><tr><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${sgn(r.gd)}</td><td><b>${r.pts}</b></td><td>${ppg}</td></tr></tbody></table></div><p>That’s ${gpg} goals scored and ${cpg} conceded per game${r.gf / r.p >= 2 ? ', so goals are rarely far away when they play' : r.ga / r.p <= 0.9 ? ', which points to a side that’s hard to break down' : ''}.</p><h2>Recent form we’ve tracked</h2><ul class="fl">${formHtml(team)}</ul><p>See the full <a href="${L.slug}-predictions.html">${esc(L.name)} table and predictions</a>, or build a slip with the <a href="ai-betting-assistant.html">AI picker</a>.</p></div>`,
      faq: [[`Where are ${team} in the ${L.name} table?`, `${team} are ${ord(r.pos)} on ${r.pts} points from ${r.p} games.`], [`When do ${team} play next?`, nxt.length ? `${nxt[0].m.h} vs ${nxt[0].m.a} on ${wd(nxt[0].m.d)} at ${hm(nxt[0].m.d)} WAT.` : 'There is no upcoming game with published odds yet. Check back soon.']],
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
      body: `<div class="prose"><ul class="pl">${list.map(([d, S]) => `<li><a href="predictions-${d}.html">${full(d + 'T12:00:00Z')}</a> <small>${S.n ? `${S.w}/${S.n} picks won (${S.r}%)` : 'no published picks'}</small></li>`).join('') || '<li>The archive fills as days finish.</li>'}</ul><p>For the big picture, read the <a href="weekly-review.html">weekly review</a>.</p></div>` });
  }

  function weeklyReview() {
    const ds = Object.keys(snaps).filter((d) => d < today && d >= dstr(-7)).sort(), R = ds.flatMap((d) => rec(snaps[d] || [])), S = summary(R);
    const by = KEYS.map((k) => [k, summary(R.filter((x) => x.k == k))]).filter(([, x]) => x.n);
    const lost = R.filter((x) => !x.w).sort((a, b) => b.p.c - a.p.c).slice(0, 5), best = R.filter((x) => x.w).sort((a, b) => b.p.od - a.p.od).slice(0, 5);
    const line = (x) => `<li>${esc(x.m.h)} ${x.m.sc[0]}–${x.m.sc[1]} ${esc(x.m.a)} <small>${MK[x.k].l}: ${MK[x.k].n[x.p.i]} at ${x.p.od.toFixed(2)} (${x.p.c}%)</small></li>`;
    const range = ds.length ? `${sd(ds[0] + 'T12:00:00Z')} to ${sd(ds[ds.length - 1] + 'T12:00:00Z')}` : 'the past week', tone = S.r == null ? '' : S.r >= 75 ? 'A good week.' : S.r >= 60 ? 'A solid week, though not a perfect one.' : 'A tough week, and we’re saying so.';
    page('weekly-review.html', { title: 'Weekly Football Picks Review: Wins, Losses & Lessons', desc: `How our football picks did over ${range}: ${S.n ? `${S.w} of ${S.n} won (${S.r}%)` : 'results by market'}, the best calls, the misses and what we learned.`, h1: 'Weekly picks <em>review</em>', lead: S.n ? `Over ${range} we published ${S.n} picks that cleared our quality bar, and ${S.w} won (${S.r}%). ${tone} Here’s the breakdown by market, the best calls and the misses we’d rather forget.` : 'The weekly review fills in as results come in. Check back soon.', crumb: 'Weekly review', eyebrow: `Updated automatically · ${range}`, kp: [[S.n || '–', 'Picks published'], [S.w ?? '–', 'Won'], [S.r == null ? '–' : S.r + '%', 'Win rate']],
      body: `<div class="prose"><h2>How each market did</h2><div class="sc"><table><thead><tr><th>Market</th><th>Picks</th><th>Won</th><th>Rate</th></tr></thead><tbody>${by.map(([k, x]) => `<tr><td>${MK[k].l}</td><td>${x.n}</td><td>${x.w}</td><td>${x.r}%</td></tr>`).join('')}</tbody></table></div><p class="mut">Short-priced picks, like over 1.5 goals, win more often than the rest, which is why every market is listed separately.</p>${lost.length ? `<h2>The misses we’d rather forget</h2><p>These were our most confident picks that lost. A 75% pick still loses one time in four, and this is what that looks like.</p><ul class="pl">${lost.map(line).join('')}</ul>` : ''}${best.length ? `<h2>The best calls</h2><p>The winners that paid the most.</p><ul class="pl">${best.map(line).join('')}</ul>` : ''}<h2>What this tells you</h2><p>Picks are chances, not promises. We only publish what clears our quality bar and we show the results either way, so you can judge us on the record. See any day in the <a href="archive.html">archive</a> or read <a href="how-it-works.html">how the picks are made</a>.</p></div>` });
  }

  api.write = () => {
    const cut = dstr(-14);
    for (const f of fs.readdirSync('.')) { const mm = f.match(/^prediction-.+-(\d{4}-\d\d-\d\d)\.html$/); if (mm && mm[1] < cut) fs.unlinkSync(f); }
    for (const it of items) matchPage(it);
    const seen = new Set(); for (const v of Object.values(teamFile)) if (!seen.has(v.file)) { seen.add(v.file); teamPage(v); }
    archivePages(); weeklyReview();
  };
  return api;
}
