import { MK, TZ, board, topCards } from './render.js';
const $ = (s) => document.querySelector(s), B = $('#board');
if (B) {
  const S = { k: B.dataset.mk || 'o', off: +(B.dataset.off || 0), lg: +(B.dataset.lg || 0), q: '', min: 0, all: false, data: [], tok: 0 };
  const day = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));
  const lab = (o) => o == -1 ? 'Yesterday' : o == 0 ? 'Today' : o == 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(Date.now() + o * 864e5));
  // API address: set in api-config.js, or test a local API once with ?api=http://localhost:10000 (?api=reset clears it).
  function apiBase() {
    const u = new URLSearchParams(location.search).get('api');
    try { if (u === 'reset') localStorage.removeItem('zp_api'); else if (u && /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(u)) localStorage.setItem('zp_api', u); } catch {}
    let b = ''; try { b = localStorage.getItem('zp_api') || ''; } catch {}
    return String(b || window.ZUREPICKS_API_BASE || '').replace(/\/+$/, '');
  }
  const API = apiBase();
  let slip = []; try { slip = JSON.parse(localStorage.getItem('zp_slip') || '[]'); } catch {}
  const save = () => { try { localStorage.setItem('zp_slip', JSON.stringify(slip)); } catch {} };
  const fmt = (t) => t ? new Date(t).toLocaleString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' WAT' : '';
  function paint(status) {
    B.innerHTML = board(S.data, S.k, { lg: S.lg, q: S.q, min: S.min, all: S.all });
    const t = $('#top'); if (t) t.innerHTML = topCards(S.data) || '<div class="empty">Top picks appear once odds are published.</div>';
    const st = $('#status'); if (st && status) st.textContent = status;
    const n = $('#count'); if (n) n.textContent = S.data.length + ' fixtures · ' + S.data.filter((m) => m[S.k]).length + ' with ' + MK[S.k].l + ' odds';
    mark();
  }
  function mark() {
    document.querySelectorAll('.oc').forEach((b) => b.classList.toggle('sel', slip.some((s) => s.id == b.dataset.id && s.k == S.k && s.i == b.dataset.i)));
    const bar = $('#slip'); if (!bar) return;
    bar.hidden = !slip.length;
    const tot = slip.reduce((p, s) => p * s.od, 1);
    $('#slipn').textContent = slip.length + (slip.length == 1 ? ' selection' : ' selections');
    $('#slipo').textContent = 'Odds ' + tot.toFixed(2);
  }
  async function load() {
    const date = day(S.off), tok = ++S.tok; let snap = null;
    $('#status').textContent = 'Loading…';
    try { const r = await fetch('data/' + date + '.json', { cache: 'no-cache' }); if (r.ok) snap = await r.json(); } catch {}
    if (tok != S.tok) return;
    S.data = snap?.matches || [];
    paint(snap ? 'Snapshot · updated ' + fmt(snap.updated) : 'No data for this date yet');
    if (!API) return;
    try {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 9000);
      const r = await fetch(API + '/api/matches?date=' + date, { signal: c.signal, cache: 'no-store' }); clearTimeout(t);
      if (r.ok) { const j = await r.json(); if (tok == S.tok && Array.isArray(j.matches) && j.matches.length) { S.data = j.matches; paint('Live API · updated ' + fmt(j.updated)); } }
    } catch {}
  }
  const strip = $('#days'); strip.innerHTML = [-2, -1, 0, 1, 2, 3].map((o) => `<button type="button" class="chip" data-o="${o}" aria-pressed="${o == S.off}">${lab(o)}</button>`).join('');
  strip.onclick = (e) => { const b = e.target.closest('[data-o]'); if (!b) return; S.off = +b.dataset.o; strip.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x == b)); load(); };
  const tabs = $('#mkts'); tabs.innerHTML = Object.keys(MK).map((k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k == S.k}">${MK[k].l}</button>`).join('');
  tabs.onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b) return; S.k = b.dataset.k; tabs.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x == b)); paint(); };
  $('#q').oninput = (e) => { S.q = e.target.value.trim(); paint(); };
  $('#min').onchange = (e) => { S.min = +e.target.value; paint(); };
  $('#all').onchange = (e) => { S.all = e.target.checked; paint(); };
  B.onclick = (e) => {
    const b = e.target.closest('.oc'); if (!b) return;
    const m = S.data.find((x) => x.id == b.dataset.id), i = +b.dataset.i, at = slip.findIndex((s) => s.id == m.id);
    const same = at >= 0 && slip[at].k == S.k && slip[at].i == i;
    if (at >= 0) slip.splice(at, 1);
    if (!same) slip.push({ id: m.id, h: m.h, a: m.a, k: S.k, i, od: +b.dataset.od, n: MK[S.k].n[i] });
    save(); mark();
  };
  $('#slipc').onclick = () => { slip = []; save(); mark(); };
  $('#slipx').onclick = async () => {
    const txt = slip.map((s) => `${s.h} v ${s.a}: ${s.n} @ ${s.od.toFixed(2)}`).join('\n') + '\nTotal odds ' + slip.reduce((p, s) => p * s.od, 1).toFixed(2);
    try { await navigator.clipboard.writeText(txt); $('#slipx').textContent = 'Copied'; setTimeout(() => $('#slipx').textContent = 'Copy slip', 1500); } catch {}
  };
  load();
}
