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
// Pick = the outcome the bookmaker prices as most likely, with the bookmaker margin removed.
export function pick(m, k) {
  const od = m[k]; if (!od || od.some((x) => !(x > 1))) return null;
  let q;
  if (k == 'dc') { if (!m.o || m.o.some((x) => !(x > 1))) return null; const p = norm(m.o); q = [p[0] + p[1], p[0] + p[2], p[1] + p[2]]; } else q = norm(od);
  const i = q.indexOf(Math.max(...q)); return { i, c: Math.round(q[i] * 100), od: od[i] };
}
export const settled = (m) => DONE.includes(m.st) && m.sc && m.sc[0] != null;
export const won = (m, k, pk) => settled(m) && MK[k].ev(pk.i, m.sc[0], m.sc[1]);
export function row(m, k) {
  const pk = pick(m, k), M = MK[k], od = m[k] || [];
  let rs = '<span class="mut">–</span>', cl = '';
  if (settled(m)) { const w = pk ? won(m, k, pk) : null; cl = w == null ? '' : w ? ' win' : ' loss'; rs = `<b>${m.sc[0]}–${m.sc[1]}</b>${w == null ? '' : `<small>${w ? '✓' : '✗'}</small>`}`; }
  else if (LIVE.includes(m.st)) { cl = ' live'; rs = `<b>${m.sc?.[0] ?? 0}–${m.sc?.[1] ?? 0}</b><small>LIVE</small>`; }
  const cells = od.map((x, i) => `<button type="button" class="oc${pk && pk.i == i ? ' pick' : ''}" data-id="${m.id}" data-i="${i}" data-od="${x}" aria-label="${esc(M.n[i])} at ${x}"><small>${M.s[i]}</small>${Number(x).toFixed(2)}</button>`).join('');
  return `<article class="row${cl}" data-id="${m.id}"><time>${hm(m.d)}</time><div class="tm"><b>${esc(m.h)}</b><b>${esc(m.a)}</b></div><div class="ods c${od.length}">${cells || '<span class="mut">No odds yet</span>'}</div><div class="pk">${pk ? `<span>${esc(M.n[pk.i])}</span><i style="--w:${pk.c}%"></i><em>${pk.c}%</em>` : '<span class="mut">No pick yet</span>'}</div><div class="rs">${rs}</div></article>`;
}
export function board(ms, k, o = {}) {
  let L = ms.filter((m) => (o.all || m[k]) && (!o.lg || m.li == o.lg));
  if (o.q) { const q = o.q.toLowerCase(); L = L.filter((m) => (m.h + ' ' + m.a + ' ' + m.lg + ' ' + m.cn).toLowerCase().includes(q)); }
  if (o.min) L = L.filter((m) => { const p = pick(m, k); return p && p.c >= o.min; });
  if (o.max) L = L.slice().sort((a, b) => (pick(b, k)?.c || 0) - (pick(a, k)?.c || 0)).slice(0, o.max);
  if (!L.length) return '<div class="empty">No matches with odds for this day and market yet. Data refreshes several times a day.</div>';
  const G = {}; for (const m of L) (G[m.li + '|' + m.cn + '|' + m.lg] ??= []).push(m);
  const rank = (g) => { const i = PRIO.indexOf(+g.split('|')[0]); return i < 0 ? 99 : i; };
  return Object.keys(G).sort((a, b) => rank(a) - rank(b) || G[b].length - G[a].length || a.localeCompare(b)).map((g) => {
    const [, cn, lg] = g.split('|'), x = G[g].sort((a, b) => a.d.localeCompare(b.d));
    return `<section class="lg"><h3>${x[0].lo ? `<img src="${esc(x[0].lo)}" alt="" width="20" height="20" loading="lazy">` : ''}<span>${esc(cn)} · ${esc(lg)}</span><em>${x.length}</em></h3>${x.map((m) => row(m, k)).join('')}</section>`;
  }).join('');
}
export function topCards(ms, n = 6) {
  const L = ms.filter((m) => !settled(m) && !LIVE.includes(m.st)).map((m) => ({ m, p: pick(m, 'o') })).filter((x) => x.p && x.p.od >= 1.15)
    .sort((a, b) => b.p.c - a.p.c || PRIO.indexOf(a.m.li) - PRIO.indexOf(b.m.li)).slice(0, n);
  if (!L.length) return '';
  return L.map(({ m, p }) => `<div class="tc"><small>${esc(m.lg)} · ${hm(m.d)}</small><b>${esc(m.h)} v ${esc(m.a)}</b><div><span class="tag">${esc(MK.o.n[p.i])}</span><span class="mono">${p.od.toFixed(2)}</span></div><i style="--w:${p.c}%"></i><em>${p.c}% implied</em></div>`).join('');
}
