// Shared by the build script (Node) and the browser (app.js): pure functions that turn match data into HTML.
export const TZ = 'Africa/Lagos', DONE = ['FT', 'AET', 'PEN'], LIVE = ['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE'];
export const PRIO = [39, 140, 135, 78, 61, 2, 3, 848, 88, 94, 45, 40, 179];
export const MK = {
  o: { l: '1X2', s: ['1', 'X', '2'], n: ['Home win', 'Draw', 'Away win'], ev: (i, h, a) => (i == 0 ? h > a : i == 1 ? h == a : a > h) },
  dc: { l: 'Double chance', s: ['1X', '12', 'X2'], n: ['Home or draw', 'Home or away', 'Draw or away'], ev: (i, h, a) => (i == 0 ? h >= a : i == 1 ? h != a : a >= h) },
  ou: { l: 'Over/Under 2.5', s: ['Over', 'Under'], n: ['Over 2.5', 'Under 2.5'], ev: (i, h, a) => (i == 0 ? h + a > 2.5 : h + a < 2.5) },
  o15: { l: 'Over/Under 1.5', s: ['Over', 'Under'], n: ['Over 1.5', 'Under 1.5'], ev: (i, h, a) => (i == 0 ? h + a > 1.5 : h + a < 1.5) },
  bt: { l: 'Both teams score', s: ['Yes', 'No'], n: ['Both score', 'Not both'], ev: (i, h, a) => (i == 0 ? h > 0 && a > 0 : !(h > 0 && a > 0)) },
};
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const hm = (iso) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const norm = (od) => { const s = od.reduce((t, x) => t + 1 / x, 0); return od.map((x) => 1 / x / s); };
// Pick = the outcome the bookmaker prices as most likely (margin removed). Without odds, the team-record model (m.pm) is used.
export function pick(m, k) {
  const od = m[k]; let q, o = null;
  if (od && !od.some((x) => !(x > 1))) {
    if (k == 'dc') { if (m.o && !m.o.some((x) => !(x > 1))) { const p = norm(m.o); q = [p[0] + p[1], p[0] + p[2], p[1] + p[2]]; } } else q = norm(od);
    o = true;
  }
  if (!q && k == 'dc' && m.o && !m.o.some((x) => !(x > 1))) { const p = norm(m.o); q = [p[0] + p[1], p[0] + p[2], p[1] + p[2]]; o = 'derived'; } // no double-chance prices: derive the chance from 1X2 odds
  if (!q && m.pm && (k == 'o' || k == 'dc')) { const p = m.pm.map((x) => x / 100); q = k == 'o' ? p : [p[0] + p[1], p[0] + p[2], p[1] + p[2]]; o = false; }
  if (!q) return null;
  const i = q.indexOf(Math.max(...q)); return { i, c: Math.round(q[i] * 100), od: o === true ? od[i] : null, model: !o };
}
// Quality bar: a pick is only published when its implied chance reaches this level (own tracked results: 1X2 picks under 60% won ~45-50%, 60%+ won ~80%).
export const MIN = { o: 60, dc: 75, ou: 60, o15: 75, bt: 60 };
export function visible(ms, k, o = {}) {
  const min = o.min === undefined || o.min === '' || o.min === null ? MIN[k] : +o.min; // min 0 = show every pick
  let L = ms.filter((m) => { const p = pick(m, k); return p && p.c >= min && (!o.lg || m.li == o.lg); });
  if (o.q) { const q = o.q.toLowerCase(); L = L.filter((m) => (m.h + ' ' + m.a + ' ' + m.lg + ' ' + m.cn).toLowerCase().includes(q)); }
  return L;
}
export const settled = (m) => DONE.includes(m.st) && m.sc && m.sc[0] != null;
export const won = (m, k, pk) => settled(m) && MK[k].ev(pk.i, m.sc[0], m.sc[1]);
const END = ['PST', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP'];
// Match state: finished / live / postponed / kicked-off-but-no-update / not started.
export function state(m, now = Date.now()) {
  const age = now - new Date(m.d).getTime(), sc = m.sc || [null, null];
  if (settled(m)) return { k: 'fin', big: sc[0] + '–' + sc[1], sm: m.st == 'FT' ? 'Full time' : m.st };
  if (END.includes(m.st)) return { k: 'pst', big: '–', sm: 'Postponed' };
  if (LIVE.includes(m.st) && age < 4 * 36e5) return { k: 'live', big: (sc[0] ?? 0) + '–' + (sc[1] ?? 0), sm: m.st == 'HT' ? 'Half time' : m.el ? m.el + '′' : 'Live' };
  if (age > 0) return { k: 'ko', big: sc[0] != null ? sc[0] + '–' + sc[1] : '?–?', sm: age > 3 * 36e5 ? 'Awaiting result' : 'Kicked off' };
  return { k: 'ns', big: '–', sm: 'Not started' };
}
export function stats(ms, now = Date.now()) {
  let done = 0, live = 0, wait = 0; for (const m of ms) { const k = state(m, now).k; if (k == 'fin') done++; else if (k == 'live') live++; else if (k == 'ko') wait++; }
  const n = ms.length; return { n, done, live, wait, left: n - done - live - wait, pct: n ? Math.round((done / n) * 100) : 0 };
}
export function statsHtml(ms, hit) {
  const s = stats(ms), p = (x) => (s.n ? Math.round((x / s.n) * 100) : 0);
  return `<div><b>${s.n || '–'}</b><span>Picks today</span></div><div><b>${s.done}</b><span>Played · ${s.pct}%</span></div><div class="lv"><b>${s.live}</b><span>Live now</span></div>${s.wait ? `<div><b>${s.wait}</b><span>Awaiting score</span></div>` : ''}<div><b>${s.left}</b><span>Not started · ${p(s.left)}%</span></div>${hit && hit.n ? `<div><b>${hit.r}%</b><span>Won ${hit.w} of ${hit.n} · 30 days</span></div>` : ''}`;
}
export function row(m, k) {
  const pk = pick(m, k), M = MK[k], od = m[k] || [], st = state(m);
  const w = st.k == 'fin' && pk ? (won(m, k, pk) ? ' win' : ' loss') : '';
  const cells = (od.length ? od : M.s.map(() => null)).map((x, i) => x
    ? `<button type="button" class="oc${pk && pk.i == i ? ' pick' : ''}" data-id="${m.id}" data-i="${i}" data-od="${x}" aria-label="${esc(M.n[i])} at ${x}"><small>${M.s[i]}</small>${Number(x).toFixed(2)}</button>`
    : `<span class="oc nil"><small>${M.s[i]}</small>–</span>`).join('');
  const pkh = pk ? `<span>${esc(M.n[pk.i])}</span><i style="--w:${pk.c}%"></i><em>${pk.c}% · ${pk.model ? 'team-record model' : 'from odds'}</em>` : '<span class="mut">No pick</span><i style="--w:0%"></i><em>Below quality bar</em>';
  return `<article class="row ${st.k}${w}" data-id="${m.id}"><time>${hm(m.d)}</time><div class="tm"><b>${esc(m.h)}</b><b>${esc(m.a)}</b></div><div class="ods c${M.s.length}">${cells}</div><div class="pk">${pkh}</div><div class="sb"><strong>${st.big}</strong><small>${st.sm}</small></div></article>`;
}
export function board(ms, k, o = {}) {
  let L = visible(ms, k, o);
  if (o.max) L = L.slice().sort((a, b) => (pick(b, k)?.c || 0) - (pick(a, k)?.c || 0)).slice(0, o.max);
  if (!L.length) return '<div class="empty">No picks meet our quality bar for this day yet. We only publish games where the chance is strong enough, so quiet days are normal.</div>';
  const G = {}; for (const m of L) (G[m.li + '|' + m.cn + '|' + m.lg] ??= []).push(m);
  const rank = (g) => { const i = PRIO.indexOf(+g.split('|')[0]); return i < 0 ? 99 : i; };
  return Object.keys(G).sort((a, b) => rank(a) - rank(b) || G[b].length - G[a].length || a.localeCompare(b)).map((g) => {
    const [, cn, lg] = g.split('|'), x = G[g].sort((a, b) => a.d.localeCompare(b.d));
    return `<section class="lg"><h3>${x[0].lo ? `<img src="${esc(x[0].lo)}" alt="" width="20" height="20" loading="lazy">` : ''}<span>${esc(cn)} · ${esc(lg)}</span><em>${x.length}</em></h3>${x.map((m) => row(m, k)).join('')}</section>`;
  }).join('');
}
export function topCards(ms, n = 6) {
  const L = ms.filter((m) => !settled(m) && !LIVE.includes(m.st)).map((m) => ({ m, p: pick(m, 'o') })).filter((x) => x.p && x.p.od && x.p.od >= 1.15)
    .sort((a, b) => b.p.c - a.p.c || PRIO.indexOf(a.m.li) - PRIO.indexOf(b.m.li)).slice(0, n);
  if (!L.length) return '';
  return L.map(({ m, p }) => `<div class="tc"><small>${esc(m.lg)} · ${hm(m.d)}</small><b>${esc(m.h)} v ${esc(m.a)}</b><div><span class="tag">${esc(MK.o.n[p.i])}</span><span class="mono">${p.od.toFixed(2)}</span></div><i style="--w:${p.c}%"></i><em>${p.c}% implied</em></div>`).join('');
}

// ---- Odds combos: slips whose odds multiply to about 2, 3 and 5. They are always filled: the search widens step by step when strong picks are scarce. ----
export const COMBOS = [[2, 4], [3, 5], [5, 6]]; // [target odds, most games to start with]
const CAP = 1.45; // a slip may overshoot its target by at most 45%
const LADDER = [70, 65, 60, 55, 50]; // lowest chance allowed for any single game, tried in this order
function bestCombo(C, T, maxLegs) {
  // suf[j] = odds of C[j..] from highest to lowest, used to drop paths that can no longer reach the target
  const n = C.length, suf = new Array(n + 1); suf[n] = []; for (let j = n - 1; j >= 0; j--) suf[j] = [...suf[j + 1], C[j].od].sort((a, b) => b - a);
  const ub = (j, slots) => { let p = 1; for (let t = 0; t < slots && t < suf[j].length; t++) p *= suf[j][t]; return p; };
  let best = null, nodes = 0;
  const go = (i, k, od, pr, legs) => {
    if (od >= T) { if (!best || pr > best.pr + 1e-9 || (Math.abs(pr - best.pr) < 1e-9 && od < best.od)) best = { legs: legs.slice(), od, pr }; return; }
    if (k >= maxLegs || nodes > 400000 || od * ub(i, maxLegs - k) < T) return;
    for (let j = i; j < n; j++) {
      nodes++; const o = od * C[j].od; if (o > T * CAP || o * ub(j + 1, maxLegs - k - 1) < T) continue;
      legs.push(C[j]); go(j + 1, k + 1, o, pr * C[j].p, legs); legs.pop();
    }
  };
  go(0, 0, 1, 1, []); return best;
}
export function combos(ms, now = Date.now()) {
  // every odds-based pick of every game that has not started
  const games = [];
  for (const m of ms) {
    if (state(m, now).k != 'ns') continue;
    const L = []; for (const k in MK) { const p = pick(m, k); if (p && !p.model && p.od > 1.04) L.push({ m, k, i: p.i, od: p.od, c: p.c, p: p.c / 100 }); }
    if (L.length) games.push(L);
  }
  // one leg per game: its strongest pick that meets the chance and odds limits
  const pool = (minC, minOd, skip) => games.map((L) => L.filter((x) => x.c >= minC && x.od >= minOd && !skip.has(x.m.id)).sort((a, b) => b.c - a.c)[0]).filter(Boolean).sort((a, b) => b.p - a.p || b.od - a.od);
  // half the safest games, half the highest-odds ones: only safe short-odds games could never add up to 5.0
  const mix = (P, size) => { const h = Math.ceil(size / 2), hi = [...P].sort((a, b) => b.od - a.od || b.p - a.p); return [...new Set([...P.slice(0, h), ...hi.slice(0, h)])].sort((a, b) => b.p - a.p || b.od - a.od); };
  const used = new Set(), out = [];
  for (const [T, max] of COMBOS) {
    let r = null, minC = 0;
    search: for (const c of LADDER) for (const bonus of [0, 1, 2]) for (const skip of [used, new Set()]) { // prefer new games, then allow repeats
      const P = mix(pool(c, c >= 60 ? 1.15 : 1.08, skip), bonus ? 22 : 28); r = bestCombo(P, T, max + bonus);
      if (r) { minC = Math.min(...r.legs.map((x) => x.c)); break search; }
    }
    if (!r) { // last resort: stack the strongest picks until the target is reached (or all are used)
      const P = pool(0, 1.04, new Set()); let od = 1, pr = 1; const legs = [];
      for (const x of P) { if (od >= T || legs.length >= 10) break; legs.push(x); od *= x.od; pr *= x.p; }
      if (legs.length) { r = { legs, od, pr }; minC = Math.min(...legs.map((x) => x.c)); }
    }
    if (r) r.legs.forEach((x) => used.add(x.m.id));
    out.push({ target: T, legs: r ? r.legs.sort((a, b) => Date.parse(a.m.d) - Date.parse(b.m.d)) : [], od: r ? r.od : 0, chance: r ? Math.round(r.pr * 100) : 0, minC, short: !!r && r.od < T });
  }
  return out;
}
export function comboHtml(ms, now = Date.now()) {
  const day = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t), today = day(now), tomorrow = day(now + 864e5);
  const tag = (m) => { const d = day(Date.parse(m.d)); return d == today ? '' : d == tomorrow ? 'Tmrw' : new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric' }).format(Date.parse(m.d)); };
  return combos(ms, now).map((c) => !c.legs.length
    ? `<div class="cbx empty"><div class="ch"><span>${c.target} odds</span><b>–</b></div><p>Today’s slips are being prepared. They appear as soon as games and odds are published.</p></div>`
    : `<div class="cbx"><div class="ch"><span>${c.short ? 'Best available' : c.target + '+ odds'}</span><b>${c.od.toFixed(2)}</b></div><div class="cm">${c.legs.length} games · combined chance ${c.chance}% · weakest pick ${c.minC}%</div>${c.legs.map((x) => `<div class="cl"><time>${tag(x.m) ? `<small>${tag(x.m)}</small>` : ''}${hm(x.m.d)}</time><div><b>${esc(x.m.h)} v ${esc(x.m.a)}</b><small>${esc(x.m.lg)}</small></div><span class="tag">${esc(MK[x.k].n[x.i])}</span><span class="mono">${x.od.toFixed(2)}</span></div>`).join('')}<button type="button" class="cb" data-t="${c.target}">Add ${c.legs.length} games to slip</button></div>`).join('');
}
