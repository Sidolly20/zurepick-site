import { MK, TZ, board, comboHtml, combos, statsHtml, state, visible, fixturesByDay, leagueTest } from './render.js';
const $ = (s) => document.querySelector(s), B = $('#board');
if (B) {
  const S = { k: B.dataset.mk || 'o', off: +(B.dataset.off || 0), lg: +(B.dataset.lg || 0), q: '', min: '', data: [], tok: 0, hit: null };
  const LMODE = B.dataset.mode === 'league', MATCH = LMODE ? leagueTest(JSON.parse(B.dataset.lgspec)) : null; // league pages: next three days of one league
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
  function swap(html) {
    if (html === S.last) return; S.last = html;
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const a = [...B.querySelectorAll('.row')], b = [...tmp.querySelectorAll('.row')];
    const same = a.length > 0 && a.length === b.length && a.every((r, i) => r.dataset.id === b[i].dataset.id) && B.querySelectorAll('.lg').length === tmp.querySelectorAll('.lg').length;
    if (same) a.forEach((r, i) => { if (r.outerHTML !== b[i].outerHTML) r.replaceWith(b[i]); }); else B.innerHTML = html;
  }
  function paintLeague(status) {
    const pool = S.pool || []; if (pool.some(MATCH) || !B.querySelector('.row')) swap(fixturesByDay(pool, S.k, MATCH, { q: S.q })); // keep the pre-built older results when the last/next 3 days are empty
    const st = $('#status'); if (st && status && st.textContent !== status) st.textContent = status;
    const kp = $('#kp'); if (kp) { const h = statsHtml(pool.filter(MATCH), null, 'Games listed'); if (h !== S.lastKp) { S.lastKp = h; kp.innerHTML = h; } }
    mark();
  }
  // Redraw without flicker: skip if nothing changed, swap only the rows that changed, and rebuild everything only when the list of games changes.
  function paint(status) {
    if (LMODE) return paintLeague(status);
    const html = board(S.data, S.k, { lg: S.lg, q: S.q, min: S.min });
    swap(html);
    paintTop();
    const bn = $('#bn-n'); if (bn && S.off == 0) bn.textContent = visible(S.data, S.k, { lg: S.lg }).length; const bh = $('#bn-h'); if (bh && S.hit) bh.textContent = S.hit.r + '%';
    const st = $('#status'); if (st && status && st.textContent !== status) st.textContent = status;
    const kp = $('#kp'); if (kp) { const h = statsHtml(visible(S.data, S.k, { lg: S.lg, q: S.q, min: S.min }), S.hit); if (h !== S.lastKp) { S.lastKp = h; kp.innerHTML = h; } }
    mark();
  }
  // The combo slips use upcoming games from today, tomorrow and the day after, whichever day is selected below.
  function paintTop() { const t = $('#top'); if (!t || !S.pool) return; const h = comboHtml(S.pool); if (h !== S.lastTop) { S.lastTop = h; t.innerHTML = h; } }
  async function loadPool() {
    let all = [];
    for (const d of (LMODE ? [-3, -2, -1, 0, 1, 2, 3] : [0, 1, 2]).map(day)) {
      let ms = []; try { const r = await fetch('data/' + d + '.json', { cache: 'no-store' }); if (r.ok) ms = (await r.json()).matches || []; } catch {}
      if (API) { try { const c = new AbortController(), t = setTimeout(() => c.abort(), 9000); const r = await fetch(API + '/api/matches?date=' + d, { signal: c.signal, cache: 'no-store' }); clearTimeout(t); if (r.ok) { const j = await r.json(); if (Array.isArray(j.matches) && j.matches.length) ms = j.matches; } } catch {} }
      all = all.concat(ms);
    }
    if (all.length) { S.pool = all; paintTop(); if (LMODE) paintLeague('Recent results and the next three days · updated ' + fmt(new Date().toISOString())); }
  }
  function mark() {
    document.querySelectorAll('.oc').forEach((b) => b.classList.toggle('sel', slip.some((s) => s.id == b.dataset.id && s.k == S.k && s.i == b.dataset.i)));
    const bar = $('#slip'); if (!bar) return;
    bar.hidden = !slip.length;
    const tot = slip.reduce((p, s) => p * s.od, 1);
    $('#slipn').textContent = slip.length + (slip.length == 1 ? ' selection' : ' selections');
    $('#slipo').textContent = 'Odds ' + tot.toFixed(2);
  }
  // quiet = a background refresh while games are live: fetch one source, change nothing on screen unless the data changed.
  async function load(quiet) {
    const date = day(S.off), tok = ++S.tok;
    if (!quiet) $('#status').textContent = 'Loading…';
    if (!quiet || !API) { // snapshot file (also the only source on the public site)
      let snap = null; try { const r = await fetch('data/' + date + '.json', { cache: 'no-store' }); if (r.ok) snap = await r.json(); } catch {}
      if (tok != S.tok) return;
      if (snap || !quiet) { S.data = snap?.matches || []; paint(snap ? 'Snapshot · updated ' + fmt(snap.liveUpdated || snap.updated) : 'No data for this date yet'); }
    }
    if (!API) return;
    try {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 9000);
      const r = await fetch(API + '/api/matches?date=' + date, { signal: c.signal, cache: 'no-store' }); clearTimeout(t);
      if (r.ok) { const j = await r.json(); if (tok == S.tok && Array.isArray(j.matches) && j.matches.length) { const pm = new Map(S.data.filter((m) => m.pm).map((m) => [m.id, m.pm])); S.data = j.matches.map((m) => (!m.o && !m.pm && pm.has(m.id) ? { ...m, pm: pm.get(m.id) } : m)); paint('Live API · updated ' + fmt(j.liveUpdated || j.updated)); } }
    } catch {}
  }
  const strip = $('#days'); if (strip) strip.innerHTML = [-2, -1, 0, 1, 2, 3].map((o) => `<button type="button" class="chip" data-o="${o}" aria-pressed="${o == S.off}">${lab(o)}</button>`).join('');
  if (strip) strip.onclick = (e) => { const b = e.target.closest('[data-o]'); if (!b) return; S.off = +b.dataset.o; strip.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x == b)); load(); };
  const tabs = $('#mkts'); tabs.innerHTML = Object.keys(MK).map((k) => `<button type="button" class="chip" data-k="${k}" aria-pressed="${k == S.k}">${MK[k].l}</button>`).join('');
  tabs.onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b) return; S.k = b.dataset.k; tabs.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x == b)); paint(); };
  $('#q').oninput = (e) => { S.q = e.target.value.trim(); paint(); };
  if ($('#min')) $('#min').onchange = (e) => { S.min = e.target.value; paint(); };
  B.onclick = (e) => {
    const b = e.target.closest('.oc'); if (!b) return;
    const m = (LMODE ? S.pool || [] : S.data).find((x) => x.id == b.dataset.id), i = +b.dataset.i, at = slip.findIndex((s) => s.id == m.id);
    const same = at >= 0 && slip[at].k == S.k && slip[at].i == i;
    if (at >= 0) slip.splice(at, 1);
    if (!same) slip.push({ id: m.id, h: m.h, a: m.a, k: S.k, i, od: +b.dataset.od, n: MK[S.k].n[i] });
    save(); mark();
  };
  // "Add games to slip" on a combo: adds every game of that combo (one pick per game)
  const top = $('#top'); if (top) top.onclick = (e) => {
    const b = e.target.closest('.cb'); if (!b) return; const c = combos(S.pool || S.data).find((x) => x.target == b.dataset.t); if (!c) return;
    for (const x of c.legs) { const at = slip.findIndex((s) => s.id == x.m.id); if (at >= 0) slip.splice(at, 1); slip.push({ id: x.m.id, h: x.m.h, a: x.m.a, k: x.k, i: x.i, od: x.od, n: MK[x.k].n[x.i] }); }
    save(); mark(); b.textContent = 'Added ✓'; setTimeout(() => paint(), 1200);
  };
  $('#slipc').onclick = () => { slip = []; save(); mark(); };
  $('#slipx').onclick = async () => {
    const txt = slip.map((s) => `${s.h} v ${s.a}: ${s.n} @ ${s.od.toFixed(2)}`).join('\n') + '\nTotal odds ' + slip.reduce((p, s) => p * s.od, 1).toFixed(2);
    try { await navigator.clipboard.writeText(txt); $('#slipx').textContent = 'Copied'; setTimeout(() => $('#slipx').textContent = 'Copy slip', 1500); } catch {}
  };
  // While games are live: with an API, refresh every minute; on the public site, re-read the data file every 3 minutes.
  let n = 0;
  setInterval(() => { n++; if (LMODE || document.hidden || S.off != 0 || (!API && n % 3)) return; if (visible(S.data, S.k, { lg: S.lg }).some((m) => ['live', 'ko'].includes(state(m).k))) load(true); }, 60000);
  { const h = (B.dataset.hit || '').split('|'); S.hit = h.length == 3 ? { r: +h[0], w: +h[1], n: +h[2] } : null; }
  if (!LMODE) load(); loadPool(); setInterval(() => { if (!document.hidden) loadPool(); }, 300000);
}
