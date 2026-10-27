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
  if (!q && m.pm && (k == 'o' || k == 'dc')) { const p = m.pm.map((x) => x / 100); q = k == 'o' ? p : [p[0] + p[1], p[0] + p[2], p[1] + p[2]]; o = false; }
  if (!q) return null;
  const i = q.indexOf(Math.max(...q)); return { i, c: Math.round(q[i] * 100), od: o ? od[i] : null, model: !o };
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
  let done = 0, live = 0; for (const m of ms) { const k = state(m, now).k; if (k == 'fin') done++; else if (k == 'live') live++; }
  const n = ms.length; return { n, done, live, left: n - done - live, pct: n ? Math.round((done / n) * 100) : 0 };
}
export function statsHtml(ms, hit) {
  const s = stats(ms);
  return `<div><b>${s.n || '–'}</b><span>Fixtures</span></div><div><b>${s.done}</b><span>Played · ${s.pct}%</span></div><div class="lv"><b>${s.live}</b><span>Live now</span></div><div><b>${s.left}</b><span>Not started · ${s.n ? 100 - s.pct - Math.round((s.live / s.n) * 100) : 0}%</span></div>${hit == null ? '' : `<div><b>${hit}%</b><span>Favourite hit rate · 30d</span></div>`}`;
}
export function row(m, k) {
  const pk = pick(m, k), M = MK[k], od = m[k] || [], st = state(m);
  const w = st.k == 'fin' && pk ? (won(m, k, pk) ? ' win' : ' loss') : '';
  const cells = (od.length ? od : M.s.map(() => null)).map((x, i) => x
    ? `<button type="button" class="oc${pk && pk.i == i ? ' pick' : ''}" data-id="${m.id}" data-i="${i}" data-od="${x}" aria-label="${esc(M.n[i])} at ${x}"><small>${M.s[i]}</small>${Number(x).toFixed(2)}</button>`
    : `<span class="oc nil"><small>${M.s[i]}</small>–</span>`).join('');
  const pkh = pk ? `<span>${esc(M.n[pk.i])}</span><i style="--w:${pk.c}%"></i><em>${pk.c}% · ${pk.model ? 'team-record model' : 'from odds'}</em>` : '<span class="mut">Prediction pending</span><i style="--w:0%"></i><em>Needs more team data</em>';
  return `<article class="row ${st.k}${w}" data-id="${m.id}"><time>${hm(m.d)}</time><div class="tm"><b>${esc(m.h)}</b><b>${esc(m.a)}</b></div><div class="ods c${M.s.length}">${cells}</div><div class="pk">${pkh}</div><div class="sb"><strong>${st.big}</strong><small>${st.sm}</small></div></article>`;
}
export function board(ms, k, o = {}) {
  let L = ms.filter((m) => !o.lg || m.li == o.lg);
  if (o.q) { const q = o.q.toLowerCase(); L = L.filter((m) => (m.h + ' ' + m.a + ' ' + m.lg + ' ' + m.cn).toLowerCase().includes(q)); }
  if (o.min) L = L.filter((m) => { const p = pick(m, k); return p && p.c >= o.min; });
  if (o.max) L = L.slice().sort((a, b) => (pick(b, k)?.c || 0) - (pick(a, k)?.c || 0)).slice(0, o.max);
  if (!L.length) return '<div class="empty">No fixtures for this day yet. Fixtures are added as the data provider publishes them.</div>';
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
