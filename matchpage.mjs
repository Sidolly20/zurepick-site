// Match page engine. One page = one angle. The angle (the most newsworthy fact in the data) decides the headline,
// the opening story and the order of the modules. After full time the page becomes a match report that checks
// the pre-match call against what happened. Everything is plain HTML so Google can index it.
import { MK, MIN, pick, won, settled, esc } from './render.js';
import { teamKey } from './teams.js';

const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const V = (arr, s) => arr[s % arr.length];
const norm = (od) => { const t = od.reduce((a, x) => a + 1 / x, 0); return od.map((x) => 1 / x / t); };
const ok = (od) => Array.isArray(od) && od.length > 1 && od.every((x) => x > 1);
const pc = (x) => Math.round(x * 100);
const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10] || 'th');
const sgn = (n) => (n > 0 ? '+' : '') + n;
const f1 = (x) => x.toFixed(1);
const FKEY = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !new Set(['fc', 'cf', 'sc', 'ac', 'afc', 'the', 'club', 'de', 'sk', 'fk', 'cd', 'ud', 'ca', 'fa']).has(w)).sort().join(' ');

// run of identical results from the most recent game backwards: [{r:'W'}, ...] newest first
const run = (f, test) => { let n = 0; for (const x of f) { if (test(x.r)) n++; else break; } return n; };

export function matchModel(c) {
  const { m, L, hr, ar, H, FORM } = c, h = m.h, a = m.a, s = hash(c.file);
  const q = norm(m.o), fi = q.indexOf(Math.max(...q)), fc = pc(q[fi]);
  const ph = pc(q[0]), pd = pc(q[1]), pa = pc(q[2]);
  const fav = [h, 'a draw', a][fi];
  const o25 = ok(m.ou) ? pc(norm(m.ou)[0]) : null, o15 = ok(m.o15) ? pc(norm(m.o15)[0]) : null, bt = ok(m.bt) ? pc(norm(m.bt)[0]) : null;
  const gpg = (r) => [r.gf / r.p, r.ga / r.p];
  let eh = null, ea = null;
  if (hr && ar && hr.p >= 3 && ar.p >= 3) { const [hf, hc] = gpg(hr), [af, ac] = gpg(ar); eh = (hf + ac) / 2; ea = (af + hc) / 2; }
  const fh = c.formH, fa = c.formA; // newest first
  const sh = { w: run(fh, (r) => r == 'W'), u: run(fh, (r) => r != 'L'), l: run(fh, (r) => r == 'L'), nw: run(fh, (r) => r != 'W') };
  const sa = { w: run(fa, (r) => r == 'W'), u: run(fa, (r) => r != 'L'), l: run(fa, (r) => r == 'L'), nw: run(fa, (r) => r != 'W') };
  const gap = hr && ar ? Math.abs(hr.pos - ar.pos) : null, N = c.tableSize || 20;
  const favRow = fi == 0 ? hr : fi == 2 ? ar : null, dogRow = fi == 0 ? ar : fi == 2 ? hr : null;
  const A = []; // angle candidates
  const add = (id, score, tag, head, story) => A.push({ id, score, tag, head, story });
  if (hr && ar && hr.pos <= 4 && ar.pos <= 4) add('summit', 84, 'Top-of-the-table clash', `${h} v ${a}: a clash at the top`, [
    `${h} (${ord(hr.pos)}, ${hr.pts} pts) host ${a} (${ord(ar.pos)}, ${ar.pts} pts) in a game between two sides at the top of the ${L.name}.`,
    Math.abs(hr.pts - ar.pts) <= 3 ? `Only ${Math.abs(hr.pts - ar.pts) || 'no'} point${Math.abs(hr.pts - ar.pts) == 1 ? '' : 's'} separate them, so the result moves the table.` : `${hr.pts > ar.pts ? h : a} lead by ${Math.abs(hr.pts - ar.pts)} points, which gives the other side something to chase.`,
    `The market still splits it ${ph}% / ${pd}% / ${pa}%, so ${fc >= 50 ? `${fav} edge it at ${m.o[fi].toFixed(2)}` : 'nobody gets a real edge'}.`]);
  if (hr && ar && hr.pos > N - 4 && ar.pos > N - 4) add('sixpointer', 82, 'Relegation six-pointer', `${h} v ${a}: a game neither side can afford to lose`, [
    `${ord(hr.pos)} v ${ord(ar.pos)} in a ${L.name} table where the bottom places matter: ${h} have ${hr.pts} points, ${a} ${ar.pts}.`,
    `Games like this tend to be cagey. ${o25 != null ? `The goal market agrees to a degree, rating over 2.5 at ${o25}%.` : ''}`, `${fc >= 50 ? `${fav} are favoured at ${m.o[fi].toFixed(2)}` : 'The 1X2 prices are tight'}, but with so little between them a single mistake can decide it.`]);
  if (favRow && dogRow && fc >= 48 && favRow.pos - dogRow.pos >= 5) add('marketvstable', 88, 'The market disagrees with the table', `${h} v ${a}: the table says one thing, the odds another`, [
    `Look at the ${L.name} table and ${fav} (${ord(favRow.pos)}) sit ${favRow.pos - dogRow.pos} places below ${fi == 0 ? a : h} (${ord(dogRow.pos)}). Look at the odds and ${fav} are the ${fc}% favourites at ${m.o[fi].toFixed(2)}.`,
    `${fi == 0 ? `Home advantage does a lot of the work: ${h} play this one at home.` : `${fav} are away from home, so the market is pricing something the table is not: form, quality or a weakened opponent.`} ${fi == 0 ? sh.u >= 3 ? `${h} are also unbeaten in ${sh.u}.` : '' : sa.u >= 3 ? `${a} are unbeaten in ${sa.u}.` : ''}`,
    `We treat that gap as the thing to check before backing the pick.`]);
  for (const [t, st, who, side] of [[h, sh, h, 'h'], [a, sa, a, 'a']]) {
    if (st.w >= 3) add('streak-' + side, 62 + st.w * 5, `${t}: ${st.w} wins in a row`, `${t} arrive on a ${st.w}-game winning run`, [`${t} have won their last ${st.w}${(side == 'h' ? c.formH : c.formA).slice(0, st.w).filter((x) => x.s).length >= 2 ? ' (' + (side == 'h' ? c.formH : c.formA).slice(0, 2).filter((x) => x.s).map((x) => `${x.s} ${x.ha == 'H' ? 'v' : 'at'} ${x.opp}`).join(', ') + ' the latest)' : ''} and come into this ${side == 'h' ? 'at home' : 'on the road'} with that momentum.`, `${side == 'h' ? (fi == 0 ? `The market backs it: ${h} are ${fc}% favourites.` : `The market does not fully buy it, though: ${fav} are rated higher.`) : (fi == 2 ? `The market backs it: ${a} are ${fc}% favourites.` : `The market does not fully buy it, though: ${fav} are rated higher.`)}`]);
    else if (st.u >= 5) add('unbeaten-' + side, 66, `${t}: unbeaten in ${st.u}`, `${t} are unbeaten in ${st.u}`, [`${t} have gone ${st.u} games without defeat. That kind of run makes a side hard to beat, though not always easy to bet on.`, `${st.nw >= 3 ? 'But they are winless in their last ' + st.nw + ', so it is a run of draws.' : 'A defeat is the exception, not the rule.'}`]);
    else if (st.l >= 3 || st.nw >= 5) add('slump-' + side, 64 + (st.l >= 3 ? 4 : 0), `${t}: ${st.l >= 3 ? st.l + ' straight defeats' : st.nw + ' without a win'}`, `${t} are looking for a way out of a slump`, [`${t} have ${st.l >= 3 ? `lost ${st.l} in a row` : `gone ${st.nw} games without a win`}. Confidence is the question hanging over this game.`, `${(side == 'h' ? fi == 2 : fi == 0) ? `The market has noticed: ${fav} are favoured at ${m.o[fi].toFixed(2)}.` : `Even so, the odds still give them a ${side == 'h' ? ph : pa}% chance, which shows how much a pattern can be overrated.`}`]);
  }
  if (H && H.n >= 4 && (H.hw >= H.n - 1 || H.aw >= H.n - 1)) { const dom = H.hw > H.aw ? h : a, win = Math.max(H.hw, H.aw); add('h2h-owner', 74, `${dom} have the head-to-head edge`, `${dom} have won ${win} of the last ${H.n} against ${dom == h ? a : h}`, [`History points one way: ${dom} have won ${win} of the last ${H.n} meetings, with ${H.dr} ${H.dr == 1 ? 'draw' : 'draws'}.`, `${dom == fav ? 'The odds agree with the record.' : 'The odds do not fully agree with the record, which is worth noting, because rivalries have a habit of repeating.'}`]); }
  else if (H && H.n >= 4 && H.avg >= 3.4) add('h2h-goals', 64, 'Their meetings are full of goals', `${h} v ${a}: their games rarely go quiet`, [`The last ${H.n} meetings averaged ${f1(H.avg)} goals, and ${H.o25} of them reached three or more.`, `${H.bt} of ${H.n} saw both teams score${bt != null ? `, which sits against a ${bt}% BTTS price today` : ''}.`]);
  else if (H && H.n >= 4 && H.dr >= Math.ceil(H.n / 2)) add('h2h-draws', 60, 'These two keep drawing', `${h} v ${a}: the draw is never far away`, [`${H.dr} of the last ${H.n} meetings ended level.`, `The draw is priced at ${m.o[1].toFixed(2)} (${pd}%) today.`]);
  if (o25 != null && o25 >= 62) add('goals', 58 + Math.min(12, o25 - 62), 'Goals expected', `${h} v ${a}: the market expects goals`, [`Over 2.5 goals is rated at ${o25}%${bt != null ? `, with both teams to score at ${bt}%` : ''}.`, eh != null ? `The two sides' season numbers back that up: blending attack and defence gives about ${f1(eh)} for ${h} and ${f1(ea)} for ${a}.` : `${ok(m.o15) ? `Even over 1.5 is priced at ${m.o15[0].toFixed(2)}.` : ''}`]);
  if (o25 != null && o25 <= 38) add('tight', 57 + Math.min(12, 38 - o25), 'A tight, low-scoring game', `${h} v ${a}: expect a tight one`, [`Over 2.5 goals is rated at just ${o25}%, so the market expects a low-scoring game.`, eh != null ? `The season numbers agree: about ${f1(eh + ea)} goals between them.` : `Under 2.5 is priced at ${ok(m.ou) ? m.ou[1].toFixed(2) : 'n/a'}.`]);
  if (fc >= 68) add('banker', 52 + (fc - 68), `${fav} are clear favourites`, `${fav} are strong favourites against ${fi == 0 ? a : h}`, [`${fc}% is a big number for a single match: ${fav} are priced at ${m.o[fi].toFixed(2)}.`, `${favRow && dogRow ? `${fav} are ${ord(favRow.pos)}, the opposition ${ord(dogRow.pos)}.` : ''} Even at this level, about ${100 - fc}% of games go the other way.`]);
  if (fc < 42) add('coinflip', 54, 'Too close to call', `${h} v ${a}: no clear favourite`, [`No result is rated above ${fc}%. It is ${ph}% ${h}, ${pd}% draw, ${pa}% ${a}.`, `That is why this page publishes no 1X2 pick.`]);
  else if (pd >= 29) add('draw', 56, 'The draw is live', `${h} v ${a}: a draw is a real option`, [`The draw is rated ${pd}%, higher than usual.`, `${fav} are favoured at ${m.o[fi].toFixed(2)}, but not by enough to ignore the draw.`]);
  if (eh != null && Math.abs(eh - ea) >= 0.7) add('attackdefence', 59, `${eh > ea ? h : a} have the better numbers`, `${eh > ea ? h : a} look stronger on the numbers`, [`Blending how often each side scores with how often the other concedes gives ${f1(eh)} goals for ${h} and ${f1(ea)} for ${a}.`, `That is a gap of ${f1(Math.abs(eh - ea))} goals, one of the bigger ones on the card.`]);
  if (fi == 2 && fc >= 50) add('roadfav', 61, `${a} are favourites on the road`, `${a} are favoured to win away at ${h}`, [`The market makes the visitors ${a} the ${fc}% favourites at ${m.o[2].toFixed(2)}, against ${ph}% for ${h} at home.`, `Away favourites are less common, and it usually says something about the gap in quality. ${hr && ar ? `The table has ${a} ${ord(ar.pos)} and ${h} ${ord(hr.pos)}.` : ''}`]);
  if (fc >= 58 && o25 != null && o25 >= 55) add('bigwin', 63, `A heavy win is on the cards`, `${fav} are expected to win, and win with goals`, [`${fav} are ${fc}% favourites and over 2.5 goals is rated ${o25}%, a combination that points to a comfortable scoreline rather than a 1-0.`, `${bt != null ? `Both teams to score is ${bt}%, so the market leans ${bt < 50 ? 'towards a clean sheet for the favourite' : 'towards a goal at each end'}.` : ''}`]);
  if (bt != null && bt >= 62) add('bttsyes', 57, 'Both teams to score looks likely', `${h} v ${a}: goals at both ends`, [`Both teams to score is rated ${bt}%.`, `${o25 != null ? `Over 2.5 is ${o25}%, ` : ''}${hr && ar ? `${h} concede ${f1(hr.ga / hr.p)} a game and ${a} ${f1(ar.ga / ar.p)}, so neither goal looks safe.` : 'neither goal looks safe.'}`]);
  if (bt != null && bt <= 38) add('cleansheet', 56, 'A clean sheet is likely', `${h} v ${a}: one side may keep it shut`, [`Both teams to score is rated only ${bt}%, which means the market expects at least one side to be kept out.`, `${fc >= 50 ? `${fav}, at ${m.o[fi].toFixed(2)}, are the likelier side to do it.` : 'No side is a clear favourite to be the one.'}`]);
  if (hr && ar && fi == 0 && fc >= 50 && hr.pos > ar.pos) { /* covered by marketvstable */ }
  A.push({ id: 'standard', score: 10, tag: 'Match preview', head: `${h} v ${a}`, story: [`${h} host ${a} in the ${L.name}. The market rates it ${ph}% / ${pd}% / ${pa}%.`, `${fc >= 45 ? `${fav} are the favourites at ${m.o[fi].toFixed(2)}.` : 'No side is a clear favourite.'}`] });
  A.sort((x, y) => y.score - x.score || hash(x.id + c.file) - hash(y.id + c.file));
  return { s, q, fi, fc, ph, pd, pa, fav, o25, o15, bt, eh, ea, sh, sa, gap, A, angle: A[0], also: A.slice(1, 3).filter((x) => x.score >= 55) };
}

// ---------------- modules ----------------
const ringStyle = (v) => `--v:${v}`;
export function renderMatch(c) {
  const { m, L, hr, ar, H, SITE, file, D } = c, h = m.h, a = m.a, M = c.M, st = c.state; // st: pre | live | post
  const t = D.t, ps = c.ps, p1 = pick(m, 'o');
  const form = (team, f) => `<div class="mx-frm"><b>${esc(team)}</b><span class="mx-chips">${f.length ? f.slice(0, 5).reverse().map((x) => `<i class="fm ${x.r}"${x.s ? ` title="${esc(x.s + ' ' + (x.ha == 'H' ? 'v' : 'at') + ' ' + x.opp)}"` : ''}>${x.r}</i>`).join('') : '<small class="mut">nothing tracked yet</small>'}</span>${f.some((x) => x.s) ? `<small class="mut">${f.filter((x) => x.s).slice(0, 3).map((x) => `${x.s} ${x.ha == 'H' ? 'v' : 'at'} ${esc(x.opp)}`).join(' · ')}</small>` : ''}</div>`;
  const mod = {};
  const stripe = (pct, cls) => `<span class="${cls}" style="width:${Math.max(pct, 3)}%">${pct}%</span>`;
  mod.prob = `<section class="mx-card" id="odds"><h2>What the market thinks</h2><div class="mx-pbar" role="img" aria-label="Win probabilities">${stripe(M.ph, 'ph')}${stripe(M.pd, 'pd')}${stripe(M.pa, 'pa')}</div><div class="mx-pl"><span>${esc(h)}</span><span>Draw</span><span>${esc(a)}</span></div>` +
    `<div class="sc"><table><thead><tr><th>Market</th><th>Selection</th><th>Odds</th><th>Chance</th></tr></thead><tbody>${['o', 'ou', 'o15', 'bt'].filter((k) => ok(m[k])).map((k) => { const qq = norm(m[k]), pk = pick(m, k); return MK[k].n.map((nm, i) => `<tr${pk && pk.i == i && pk.c >= MIN[k] ? ' class="hl"' : ''}><td>${i ? '' : MK[k].l}</td><td>${nm}</td><td>${m[k][i].toFixed(2)}</td><td>${pc(qq[i])}%</td></tr>`).join(''); }).join('')}</tbody></table></div><p class="mut">Chances are the bookmaker’s odds with their margin removed. Highlighted rows cleared our quality bar.</p></section>`;
  mod.table = hr && ar ? (() => {
    const hp = hr.pts / hr.p, ap = ar.pts / ar.p, hgf = hr.gf / hr.p, agf = ar.gf / ar.p, hga = hr.ga / hr.p, aga = ar.ga / ar.p;
    const R = [['League position', hr.pos, ar.pos, true, ord(hr.pos), ord(ar.pos)], ['Points per game', hp, ap, false, hp.toFixed(2), ap.toFixed(2)], ['Record W-D-L', 0, 0, null, `${hr.w}-${hr.d}-${hr.l}`, `${ar.w}-${ar.d}-${ar.l}`], ['Scored per game', hgf, agf, false, f1(hgf), f1(agf)], ['Conceded per game', hga, aga, true, f1(hga), f1(aga)], ['Goal difference', hr.gd, ar.gd, false, sgn(hr.gd), sgn(ar.gd)]];
    const cell = (v, o, low, x) => `<td${low === null || v === o ? '' : (low ? v < o : v > o) ? ' class="bt"' : ''}>${x}</td>`;
    return `<section class="mx-card" id="table"><h2>${esc(h)} and ${esc(a)} side by side</h2><div class="sc"><table class="cmp"><thead><tr><th>${esc(h)}</th><th></th><th>${esc(a)}</th></tr></thead><tbody>${R.map(([l, hv, av, low, ht, at]) => `<tr>${cell(hv, av, low, ht)}<td class="lb">${l}</td>${cell(av, hv, low, at)}</tr>`).join('')}</tbody></table></div>${M.eh != null ? `<p>Blending how often each side scores with how often the other concedes gives roughly <b>${f1(M.eh)}</b> goals for ${esc(h)} and <b>${f1(M.ea)}</b> for ${esc(a)}, about ${f1(M.eh + M.ea)} in total.</p>` : ''}<p class="mut">${c.tableNote}</p></section>`;
  })() : '';
  mod.form = `<section class="mx-card" id="form"><h2>Recent form</h2>${form(h, c.formH)}${form(a, c.formA)}<p class="mut">Latest result on the right. Form comes from finished games in our daily records${c.fbH ? ' and the league’s own form guide' : ''}.</p></section>`;
  mod.h2h = H ? `<section class="mx-card" id="h2h"><h2>Head-to-head</h2><div class="mx-h2h"><div><b>${H.hw}</b><span>${esc(h)}</span></div><div><b>${H.dr}</b><span>Draws</span></div><div><b>${H.aw}</b><span>${esc(a)}</span></div></div><p>Last ${H.n} meetings: ${f1(H.avg)} goals a game on average, ${H.o25} with three or more, ${H.bt} with both sides scoring.</p><ul class="fl">${H.rows.slice(0, 5).map((r) => `<li>${esc(r.hn)} ${r.hs}–${r.as} ${esc(r.an)} <small>(${r.d.split('-').reverse().join('/')})</small></li>`).join('')}</ul><p class="mut">Head-to-head data from football-data.org.</p></section>` : '';
  mod.goals = M.o25 != null || M.bt != null ? `<section class="mx-card" id="goals"><h2>Goals</h2><div class="mx-gauges">${[['Over 1.5', M.o15], ['Over 2.5', M.o25], ['Both score', M.bt]].filter(([, v]) => v != null).map(([l, v]) => `<div class="mx-g"><i style="${ringStyle(v)}"><b>${v}%</b></i><span>${l}</span></div>`).join('')}</div>${M.eh != null ? `<p>Season numbers suggest about ${f1(M.eh + M.ea)} goals. ${M.eh + M.ea >= 2.8 ? 'That leans towards a game with goals.' : M.eh + M.ea <= 2.2 ? 'That leans towards a tight game.' : 'That is a middling total.'}</p>` : ''}</section>` : '';
  // what would change the call: the 1X2 odds at which our pick stops clearing the bar
  const ov = m.o.reduce((x, y) => x + 1 / y, 0), flip = (MIN.o / 100) * ov;
  mod.change = `<section class="mx-card" id="change"><h2>What would change the pick</h2><p>${p1 && p1.c >= MIN.o ? `Our ${MK.o.n[p1.i].toLowerCase()} pick stays published while ${esc([h, 'the draw', a][p1.i])} are priced <b>${(1 / flip).toFixed(2)}</b> or shorter. If the price drifts out past that, the market is saying the chance has fallen under ${MIN.o}% and we would drop it.` : `The favourite would need to shorten to about <b>${(1 / flip).toFixed(2)}</b> or lower before we published a 1X2 pick here (today the best price is ${Math.min(...m.o).toFixed(2)}).`} ${M.sh.l >= 2 || M.sa.l >= 2 ? 'A late team-news change on a side already in poor form would move this more than usual.' : 'Late team news is the other thing that can move it; we do not have lineup data, so check it before kick-off.'}</p></section>`;
  // ---- verdict card (always first) ----
  const PR = { o: 0, ou: 1, bt: 2, dc: 3, o15: 4 }, top = [...ps].sort((x, y) => PR[x[0]] - PR[y[0]])[0]; // lead with the main market; the 1.06-odds legs sit below
  const why = M.angle.id == 'standard' ? '' : M.angle.tag;
  const verdict = `<section class="mx-verdict ${st}" id="verdict"><div class="mx-ring" style="${ringStyle(top ? top[1].c : M.fc)}"><b>${top ? top[1].c : M.fc}<small>%</small></b><span>${top ? 'chance' : 'favourite'}</span></div><div class="mx-vt"><p class="mx-k">${st == 'post' ? 'Final result' : st == 'live' ? 'In play' : 'Our call'}</p>${st == 'post' ? `<h2 class="mx-score">${esc(h)} <em>${m.sc[0]}–${m.sc[1]}</em> ${esc(a)}</h2>` : `<h2>${top ? `${MK[top[0]].l}: ${MK[top[0]].n[top[1].i]}` : 'No pick clears the bar'}</h2>`}<p class="mx-sub">${top ? `${top[1].od ? `at ${top[1].od.toFixed(2)} · ` : ''}${ps.length > 1 ? `${ps.length - 1} more published pick${ps.length > 2 ? 's' : ''} below` : 'one published pick'}` : `The market rates nothing above ${MIN.o}% here, so we publish no tip. Skipping is part of the method.`}</p>${why ? `<span class="mx-tag">${esc(why)}</span>` : ''}</div></section>`;
  const steps = `<ol class="mx-tl" aria-label="Match status"><li class="on">Preview</li><li class="${st != 'pre' ? 'on' : ''}">Kick-off ${t}</li><li class="${st == 'post' ? 'on' : ''}">Full time</li></ol>`;
  const picksList = ps.length ? `<section class="mx-card" id="picks"><h2>Our picks for ${esc(h)} v ${esc(a)}</h2><ul class="mx-picks">${ps.map(([k, p]) => `<li class="${settled(m) ? (won(m, k, p) ? 'w' : 'l') : ''}"><b>${MK[k].l}</b><span>${MK[k].n[p.i]}${p.od ? ' @ ' + p.od.toFixed(2) : ''}</span><em>${p.c}%${settled(m) ? (won(m, k, p) ? ' ✓' : ' ✗') : ''}</em></li>`).join('')}</ul></section>` : '';
  // ---- post-match report ----
  let report = '';
  if (st == 'post') {
    const [g1, g2] = m.sc, tot = g1 + g2, res = g1 > g2 ? 0 : g1 == g2 ? 1 : 2, W = [h + ' win', 'draw', a + ' win'][res];
    const checks = [{ l: `${M.fav == 'a draw' ? 'Draw' : M.fav + ' to win'}`, p: M.fc, hit: res == M.fi, note: `Result: ${W}` }];
    if (M.o25 != null) checks.push({ l: 'Over 2.5 goals', p: M.o25, hit: tot > 2.5, note: `${tot} goal${tot == 1 ? '' : 's'}`, side: M.o25 >= 50 });
    if (M.bt != null) checks.push({ l: 'Both teams score', p: M.bt, hit: g1 > 0 && g2 > 0, note: g1 > 0 && g2 > 0 ? 'Both scored' : 'A clean sheet', side: M.bt >= 50 });
    if (M.o15 != null) checks.push({ l: 'Over 1.5 goals', p: M.o15, hit: tot > 1.5, note: `${tot} goals` });
    const right = (x) => (x.side === false ? !x.hit : x.hit); // when the market leaned against it, "right" means it did not happen
    const nr = checks.filter(right).length;
    const upset = M.fc >= 55 && res != M.fi;
    const expTot = M.eh != null ? M.eh + M.ea : null;
    const lessons = [upset ? `An upset: ${esc(M.fav)} were rated ${M.fc}% and did not win. At that level roughly one game in ${Math.round(100 / (100 - M.fc))} goes the other way, and this was one.` : res == M.fi && M.fc >= 55 ? `The favourite did the job: ${esc(M.fav)} were the ${M.fc}% call and delivered.` : res == 1 ? `A draw, the result the market priced at ${M.pd}%.` : `A close call that went ${esc(W)}.`,
      expTot != null ? `Season numbers pointed to about ${f1(expTot)} goals; the game produced ${tot}${Math.abs(tot - expTot) >= 1.5 ? ', so the goals model was well off this time' : ', roughly in line'}.` : '',
      M.sh.u >= 4 || M.sa.u >= 4 || M.sh.l >= 3 || M.sa.l >= 3 ? `Form was a talking point going in (${M.sh.u >= 4 ? esc(h) + ' unbeaten in ' + M.sh.u : M.sa.u >= 4 ? esc(a) + ' unbeaten in ' + M.sa.u : M.sh.l >= 3 ? esc(h) + ' beaten ' + M.sh.l + ' in a row' : esc(a) + ' beaten ' + M.sa.l + ' in a row'}). ${(M.sh.u >= 4 && g1 >= g2) || (M.sa.u >= 4 && g2 >= g1) || (M.sh.l >= 3 && g1 < g2) || (M.sa.l >= 3 && g2 < g1) ? 'The run carried on.' : 'The run did not carry on.'}` : ''].filter(Boolean);
    report = `<section class="mx-card mx-report" id="report"><h2>Match report: what the preview got right and wrong</h2><p>${esc(h)} ${g1}–${g2} ${esc(a)}. Here is how each pre-match call fared against the result.</p><ul class="mx-chk">${checks.map((x) => `<li class="${right(x) ? 'y' : 'n'}"><b>${right(x) ? '✓' : '✗'}</b><span>${x.l} <small>${x.p}% pre-match</small></span><em>${x.note}</em></li>`).join('')}</ul><p><b>${nr} of ${checks.length}</b> pre-match calls landed.</p><p>${lessons.join(' ')}</p><p class="mut">Reports use our own data (score, odds, table). We do not have scorers or xG, so we do not guess at how the goals came.</p></section>`;
  }
  const live = st == 'live' ? `<p class="mx-live"><span></span>Latest score we have: <b>${m.sc && m.sc[0] != null ? m.sc[0] + '–' + m.sc[1] : 'not available'}</b>. Live scores are on the <a href="index.html">Today</a> page.</p>` : '';
  const story = `<section class="mx-card mx-story" id="story"><h2>${st == 'post' ? 'What we said before kick-off' : 'The story of this game'}</h2>${M.angle.story.filter(Boolean).map((x) => `<p>${x.replace(/\s+/g, ' ').trim()}</p>`).join('')}${M.also.length ? `<p class="mx-also"><b>Also worth knowing:</b> ${M.also.map((x) => esc(x.tag)).join(' · ')}.</p>` : ''}</section>`;
  // module order depends on the angle
  const ORD = { summit: ['table', 'h2h', 'form', 'prob', 'goals'], sixpointer: ['table', 'form', 'goals', 'prob', 'h2h'], marketvstable: ['prob', 'table', 'form', 'h2h', 'goals'], goals: ['goals', 'prob', 'h2h', 'table', 'form'], 'h2h-goals': ['h2h', 'goals', 'prob', 'table', 'form'], tight: ['goals', 'table', 'form', 'prob', 'h2h'], 'h2h-owner': ['h2h', 'prob', 'form', 'table', 'goals'], 'h2h-draws': ['h2h', 'prob', 'form', 'table', 'goals'], coinflip: ['prob', 'h2h', 'form', 'table', 'goals'], draw: ['prob', 'form', 'h2h', 'table', 'goals'], banker: ['prob', 'table', 'form', 'h2h', 'goals'], attackdefence: ['table', 'goals', 'form', 'prob', 'h2h'] };
  const order = ORD[M.angle.id] || (M.angle.id.startsWith('streak') || M.angle.id.startsWith('unbeaten') || M.angle.id.startsWith('slump') ? ['form', 'table', 'prob', 'h2h', 'goals'] : ['prob', 'table', 'form', 'h2h', 'goals']);
  const ID = { prob: 'odds', table: 'table', form: 'form', h2h: 'h2h', goals: 'goals' }, LB = { prob: 'Odds', table: 'Table', form: 'Form', h2h: 'H2H', goals: 'Goals' };
  const jump = [['verdict', 'Call'], ...(st == 'post' ? [['report', 'Report']] : []), ['story', 'Story'], ...order.filter((k) => mod[k]).map((k) => [ID[k], LB[k]])];
  const nav = `<nav class="mx-jump" aria-label="Jump to">${jump.map(([id, l]) => `<a href="#${id}">${l}</a>`).join('')}</nav>`;
  const share = `<section class="mx-card"><h2>Share this ${st == 'post' ? 'report' : 'preview'}</h2><p><a class="btn alt" href="https://wa.me/?text=${encodeURIComponent(h + ' vs ' + a + (st == 'post' ? ' ' + m.sc[0] + '-' + m.sc[1] : ' prediction') + ' ' + SITE + '/' + file)}" target="_blank" rel="noopener">WhatsApp</a> <a class="btn alt" href="https://t.me/share/url?url=${encodeURIComponent(SITE + '/' + file)}" target="_blank" rel="noopener">Telegram</a></p></section>`;
  const more = `<section class="mx-card"><h2>More on this game</h2><p>${L.slug ? `All <a href="${L.slug}-predictions.html">${esc(L.name)} predictions</a> · ` : ''}${c.tlink(h)} · ${c.tlink(a)} · <a href="ai-betting-assistant.html">AI slip builder</a> · <a href="how-to-read-football-odds.html">How to read the odds</a></p></section>`;
  const body = `<div class="mx">${verdict}${steps}${live}${nav}${st == 'post' ? report : ''}${story}${st == 'post' ? '' : picksList}${order.map((k) => mod[k]).join('')}${st == 'post' ? picksList : mod.change}${share}${more}</div>`;
  return body;
}
