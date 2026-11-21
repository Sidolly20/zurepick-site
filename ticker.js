import { state, TZ } from './render.js';
// Live bar: scrolling live scores and next kick-offs under the header. Tap goes to the live page.
const bar = document.getElementById('tick'), rail = document.getElementById('tickr'), lab = document.getElementById('tkl');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const day = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));
const hm = (d) => new Date(d).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const saved = () => { try { return new Set(JSON.parse(localStorage.getItem('zp-saved') || '[]')); } catch { return new Set(); } };
const key = (m) => String(m.id);
async function load() {
  if (!bar || !rail) return;
  let ms = [];
  for (const o of [-1, 0]) { try { const r = await fetch('data/' + day(o) + '.json', { cache: 'no-store' }); if (r.ok) ms = ms.concat((await r.json()).matches || []); } catch {} }
  const now = Date.now(), fav = saved(), L = [], N = [], F = [];
  for (const m of ms) { const s = state(m, now), t = new Date(m.d).getTime(); const f = fav.has(key(m)) ? '<em>★</em>' : '';
    if (s.k == 'live' || s.k == 'ko') L.push(`<a href="live.html" class="lv">${f}<span class="dot"></span><b>${esc(m.h)} ${s.big.includes('?') ? 'v' : esc(s.big)} ${esc(m.a)}</b>${m.el ? `<i>${m.el}′</i>` : ''}</a>`);
    else if (s.k == 'ns' && t > now && t - now < 12 * 36e5) N.push([t, `<a href="live.html">${f}<b>${esc(m.h)} v ${esc(m.a)}</b><i>${hm(m.d)}</i></a>`, fav.has(key(m))]);
    else if (s.k == 'fin' && now - t < 8 * 36e5) F.push(`<a href="live.html" class="ft">${f}<b>${esc(m.h)} ${esc(s.big)} ${esc(m.a)}</b><i>FT</i></a>`); }
  N.sort((a, b) => (b[2] - a[2]) || a[0] - b[0]);
  const items = [...L, ...N.slice(0, 12).map((x) => x[1]), ...F.slice(0, 8)];
  if (!items.length) { bar.hidden = true; return; }
  if (lab) { lab.textContent = L.length ? (N.length || F.length ? 'Live & next' : 'Live now') : 'Next up'; lab.className = 'tk-l' + (L.length ? ' on' : ''); }
  const h = items.join('');
  if (rail.dataset.h !== h) { rail.dataset.h = h; rail.innerHTML = '<div class="tk-s">' + h + '</div><div class="tk-s" aria-hidden="true">' + h + '</div>'; rail.style.setProperty('--tk', Math.max(25, items.length * 7) + 's'); }
  bar.hidden = false;
}
load(); setInterval(() => { if (!document.hidden) load(); }, 60000);
// Saved games: a star on every match card. Saved games show first in the live bar.
document.addEventListener('click', (e) => { const b = e.target.closest('.sv'); if (!b) return; e.preventDefault(); e.stopPropagation(); const k = b.dataset.k, s = saved(); s.has(k) ? s.delete(k) : s.add(k); try { localStorage.setItem('zp-saved', JSON.stringify([...s])); } catch {} paint(); load(); });
function paint() { const s = saved(); document.querySelectorAll('.row[data-id]').forEach((r) => { const k = r.dataset.id; let b = r.querySelector(':scope>.sv'); if (!b) { b = document.createElement('button'); b.className = 'sv'; b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-label', 'Save this game'); r.appendChild(b); } const on = s.has(k); b.setAttribute('aria-pressed', on); const g = on ? '★' : '☆'; if (b.textContent !== g) b.textContent = g; r.classList.toggle('saved', on); }); }
paint(); new MutationObserver(() => { clearTimeout(paint.t); paint.t = setTimeout(paint, 80); }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
