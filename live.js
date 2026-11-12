import { setPreviews, setCrests, liveHtml, TZ } from './render.js';
try { setCrests(await (await fetch('data/crests.json')).json()); } catch {}
try { setPreviews(await (await fetch('data/previews.json')).json()); } catch {}
const box = document.getElementById('livebox'), info = document.getElementById('liveinfo');
const day = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));
let last = '';
async function load() {
  let ms = [], at = '';
  for (const o of [-1, 0]) {
    try { const r = await fetch('data/' + day(o) + '.json', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); ms = ms.concat(j.matches || []); at = j.liveUpdated || j.updated || at; } } catch {}
  }
  if (!ms.length || !box) return;
  const h = liveHtml(ms, Date.now());
  if (h !== last) { last = h; box.innerHTML = h; }
  if (info && at) info.textContent = 'Data updated ' + new Date(at).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) + ' WAT. Scores refresh about every ten minutes, so expect a short delay. For second-by-second action use a dedicated live-score app.';
}
load(); setInterval(() => { if (!document.hidden) load(); }, 60000);
