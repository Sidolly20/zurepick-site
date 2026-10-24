// Builds data/history.json (permanent track record), static SEO pages, site.css, sitemap.xml and robots.txt from data/*.json.
// Run after generate.mjs. Set SITE_URL when you move to your own domain.
import fs from 'node:fs';
const SITE = (process.env.SITE_URL || 'https://sidolly20.github.io/zurepick-site').replace(/\/$/, '');
const TZ = process.env.TZ_NAME || 'Africa/Lagos', DONE = ['FT', 'AET', 'PEN'];
const day = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hm = (i) => new Date(i).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const dm = (i) => new Date(i).toLocaleDateString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short' });
const MK = {
  o: { l: 'Match result', n: ['Home win', 'Draw', 'Away win'], ev: (i, h, a) => (i == 0 ? h > a : i == 1 ? h == a : a > h) },
  dc: { l: 'Double chance', n: ['Home or draw', 'Home or away', 'Draw or away'], ev: (i, h, a) => (i == 0 ? h >= a : i == 1 ? h != a : a >= h) },
  ou: { l: 'Over/Under 2.5', n: ['Over 2.5', 'Under 2.5'], ev: (i, h, a) => (i == 0 ? h + a > 2.5 : h + a < 2.5) },
  o15: { l: 'Over/Under 1.5', n: ['Over 1.5', 'Under 1.5'], ev: (i, h, a) => (i == 0 ? h + a > 1.5 : h + a < 1.5) },
  bt: { l: 'Both teams score', n: ['Both teams score', 'Not both score'], ev: (i, h, a) => (i == 0 ? h > 0 && a > 0 : !(h > 0 && a > 0)) },
};
const norm = (od) => { const s = od.reduce((t, x) => t + 1 / x, 0); return od.map((x) => 1 / x / s); };
function pick(m, k) {
  if (k == 'dc') { if (!m.o || !m.dc) return null; const p = norm(m.o), q = [p[0] + p[1], p[0] + p[2], p[1] + p[2]], i = q.indexOf(Math.max(...q)); return { i, c: Math.round(q[i] * 100), od: m.dc[i] }; }
  const od = m[k]; if (!od) return null; const p = norm(od), i = p.indexOf(Math.max(...p)); return { i, c: Math.round(p[i] * 100), od: od[i] };
}

// ---- history: every finished match that had pre-match odds, with each market's pick and result ----
let H = {}; try { H = JSON.parse(fs.readFileSync('data/history.json', 'utf8')); } catch {}
const days = {};
for (const f of fs.readdirSync('data').filter((f) => /^\d{4}-\d\d-\d\d\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync('data/' + f, 'utf8')); days[j.date] = j.matches;
  for (const m of j.matches) {
    if (!DONE.includes(m.st) || m.sc[0] == null) continue;
    const p = {}; for (const k in MK) { const x = pick(m, k); if (x && x.od > 1) p[k] = [x.i, x.c, x.od, MK[k].ev(x.i, m.sc[0], m.sc[1]) ? 1 : 0]; }
    if (Object.keys(p).length) H[m.id] = { d: m.d.slice(0, 10), lg: m.lg, cn: m.cn, h: m.h, a: m.a, sc: m.sc, p };
  }
}
fs.writeFileSync('data/history.json', JSON.stringify(H));

// ---- shared layout ----
const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230a7d4b'/%3E%3Cpath d='M9 10h14l-10 12h10' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
const MP = [['over-2-5-goals-predictions.html', 'ou', 'Over 2.5 goals', 'Over 2.5 goals means three or more goals in the match.'], ['over-1-5-goals-predictions.html', 'o15', 'Over 1.5 goals', 'Over 1.5 goals means at least two goals in the match.'], ['btts-predictions.html', 'bt', 'Both teams to score', 'Both teams to score (BTTS) wins when each side scores at least once.'], ['double-chance-predictions.html', 'dc', 'Double chance', 'Double chance covers two of the three match results, so it wins more often but pays less.']];
const LG = [[39, 'premier-league', 'Premier League'], [140, 'la-liga', 'La Liga'], [135, 'serie-a', 'Serie A'], [78, 'bundesliga', 'Bundesliga'], [61, 'ligue-1', 'Ligue 1'], [2, 'champions-league', 'UEFA Champions League'], [3, 'europa-league', 'UEFA Europa League']];
const FOOT = [['football-predictions-today.html', 'Predictions today'], ['football-predictions-tomorrow.html', 'Tomorrow'], ...MP.map((x) => [x[0], x[2]]), ...LG.map((x) => [x[1] + '-predictions.html', x[2]]), ['track-record.html', 'Track record'], ['how-it-works.html', 'How it works'], ['responsible-gambling.html', 'Responsible gambling'], ['tools.html', 'Odds tools']];
const PAGES = [];
function page(file, title, desc, h1, body) {
  const url = SITE + '/' + file;
  fs.writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta name="theme-color" content="#0b0d10"><link rel="icon" href="${FAV}"><link rel="stylesheet" href="site.css"></head><body><header><div class="w"><a class="logo" href="index.html"><i>Z</i>ZurePicks</a><nav class="nv"><a href="index.html">Today</a><a href="track-record.html">Track record</a><a href="how-it-works.html">How it works</a><a href="tools.html">Tools</a></nav></div></header><main class="w"><h1>${h1}</h1>${body}<footer><p class="fl">${FOOT.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</p><p><b>18+ only.</b> Percentages are estimates worked out from bookmaker odds, not guarantees. Only stake what you can afford to lose and check that betting is legal where you live. <a href="responsible-gambling.html">Get help</a>.</p><p>© 2026 ZurePicks</p></footer></main></body></html>`);
  PAGES.push(file);
}
fs.writeFileSync('site.css', `:root{--bg:#0b0d10;--card:#12151a;--raised:#171b22;--ink:#f2f5f7;--mut:#a3adba;--dim:#7c8795;--line:rgba(255,255,255,.09);--g:#31f28c;--pu:#9b7bff;--gold:#ffc53d;--no:#ff6b81;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:400 15px/1.6 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(800px 420px at 90% -10%,rgba(49,242,140,.14),transparent 60%),radial-gradient(700px 480px at -10% 100%,rgba(155,123,255,.10),transparent 60%)}
.w{width:min(980px,100% - 1.4rem);margin:auto}header{position:sticky;top:0;z-index:5;background:rgba(11,13,16,.78);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
header .w{display:flex;align-items:center;gap:1rem;height:62px}.logo{font:800 1.25rem "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:-.03em;display:flex;align-items:center;gap:.55rem;color:var(--ink);text-decoration:none;margin-right:auto}
.logo i{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--g),var(--pu));color:#04130c;display:grid;place-items:center;font-style:normal;font-size:.95rem;font-weight:800}
.nv{display:flex;gap:1rem;font-size:.85rem;font-weight:600;min-width:0;overflow-x:auto}.nv a{color:var(--mut);text-decoration:none;white-space:nowrap}.nv a:hover{color:var(--g)}@media(max-width:560px){.nv a:first-child,.nv a:nth-child(3){display:none}}
h1{font:800 clamp(1.6rem,4.5vw,2.3rem)/1.12 "Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:-.03em;margin:1.4rem 0 .6rem}h2{margin:1.8rem 0 .5rem;font-size:1.2rem}a{color:var(--g)}
.sc{overflow-x:auto;background:rgba(23,27,34,.62);border:1px solid var(--line);border-radius:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}table{width:100%;border-collapse:collapse;font-size:.88rem}th,td{padding:.65rem .8rem;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}tr:last-child td{border-bottom:0}td small{display:block;color:var(--dim);font-size:.74rem}td b{font-variant-numeric:tabular-nums}
.pos{color:var(--g);font-weight:700}.neg{color:var(--no);font-weight:700}.empty{padding:1.6rem 1rem;text-align:center;color:var(--mut);background:var(--card);border:1px dashed var(--line);border-radius:18px}
input{font:inherit;padding:.5rem .7rem;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);max-width:100%}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.6rem;margin:1rem 0}.k div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:.75rem .85rem}.k b{display:block;font-size:1.5rem;letter-spacing:-.03em;font-variant-numeric:tabular-nums}.k span{font-size:.7rem;color:var(--dim);text-transform:uppercase;letter-spacing:.06em}
footer{margin:2.5rem 0 3rem;color:var(--mut);font-size:.8rem}footer p{margin:.5rem 0}footer b{color:var(--ink)}.fl a{margin-right:.8rem;white-space:nowrap;line-height:2}
:focus-visible{outline:2px solid var(--g);outline-offset:2px}
`);

// ---- prediction pages ----
const upd = new Date().toLocaleString('en-GB', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' });
function table(ms, ks) {
  if (!ms.length) return '<p class="empty">No matches with bookmaker odds yet. This page refreshes several times a day.</p>';
  return `<div class="sc"><table><thead><tr><th>Kick-off</th><th>Match</th>${ks.map((k) => `<th>${MK[k].l}</th>`).join('')}</tr></thead><tbody>${ms.map((m) => `<tr><td>${dm(m.d)}<br>${hm(m.d)}</td><td><b>${esc(m.h)}</b><br><b>${esc(m.a)}</b><small>${esc(m.lg)}</small></td>${ks.map((k) => {
    const x = pick(m, k); if (!x || !x.od) return '<td>–</td>';
    const r = DONE.includes(m.st) && m.sc[0] != null ? (MK[k].ev(x.i, m.sc[0], m.sc[1]) ? ' ✓' : ' ✗') : '';
    return `<td><b>${MK[k].n[x.i]}</b>${r}<br>@ ${x.od.toFixed(2)} · ${x.c}% chance</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const withOdds = (d) => (days[d] || []).filter((m) => m.o).sort((a, b) => (a.d < b.d ? -1 : 1));
const note = `<p>Updated ${upd}. Chances come from bookmaker odds with the bookmaker’s margin removed. They are estimates, not guarantees. See the <a href="track-record.html">track record</a> for how past picks performed.</p>`;
for (const [off, name] of [[0, 'today'], [1, 'tomorrow']]) {
  const d = day(off);
  page(`football-predictions-${name}.html`, `Football Predictions ${name[0].toUpperCase() + name.slice(1)} (${dm(d)}) | ZurePicks`, `Free football predictions for ${name}: win chances, odds and over/under picks for matches with bookmaker odds. Results marked after full time.`, `Football predictions ${name}`, note + table(withOdds(d), ['o', 'ou']) + '<p><a href="index.html">Open the full interactive list with filters</a>.</p>');
}
const upcoming = [day(0), day(1), day(2)].flatMap((d) => withOdds(d)).filter((m) => m.st == 'NS');
for (const [file, k, name, what] of MP) {
  const ms = upcoming.map((m) => ({ m, x: pick(m, k) })).filter(({ x }) => x && x.od && (k == 'dc' || x.i == 0)).sort((a, b) => b.x.c - a.x.c).slice(0, 40).map(({ m }) => m);
  page(file, `${name} Predictions Today | ZurePicks`, `Free ${name.toLowerCase()} predictions with odds and chance for upcoming matches, ranked by confidence.`, `${name} predictions`, `<p>${what} Matches below are ranked from the highest to the lowest chance.</p>` + note + table(ms, [k]));
}
for (const [id, slug, name] of LG) {
  const ms = Object.keys(days).filter((d) => d >= day(-1)).sort().flatMap((d) => withOdds(d)).filter((m) => m.li == id);
  page(`${slug}-predictions.html`, `${name} Predictions | Free Tips and Odds | ZurePicks`, `Free ${name} predictions with win chance, odds and over/under 2.5 picks. Results are marked after full time.`, `${name} predictions`, note + table(ms, ['o', 'ou']));
}

// ---- track record ----
const R = Object.values(H).flatMap((r) => Object.entries(r.p).map(([k, v]) => ({ k, lg: r.lg, cn: r.cn, h: r.h, a: r.a, sc: r.sc, d: r.d, i: v[0], c: v[1], od: v[2], w: v[3] })));
const agg = (l) => { const n = l.length, w = l.filter((x) => x.w).length, pr = l.reduce((t, x) => t + (x.w ? x.od - 1 : -1), 0); return { n, w, wr: n ? (w / n) * 100 : 0, ex: n ? l.reduce((t, x) => t + x.c, 0) / n : 0, pr }; };
const f1 = (x) => x.toFixed(1), sg = (x) => (x >= 0 ? '+' : '') + f1(x);
const arow = (label, l) => { const a = agg(l); return `<tr><td>${esc(label)}</td><td>${a.n}</td><td>${a.w}</td><td>${f1(a.wr)}%</td><td>${f1(a.ex)}%</td><td class="${a.pr >= 0 ? 'pos' : 'neg'}">${sg(a.pr)}</td></tr>`; };
const atab = (first, rows) => `<div class="sc"><table><thead><tr><th>${first}</th><th>Picks</th><th>Won</th><th>Win rate</th><th>Avg chance</th><th>Units</th></tr></thead><tbody>${rows}</tbody></table></div>`;
const tot = agg(R), first = R.length ? R.map((x) => x.d).sort()[0] : null;
const bands = [[0, 60, 'Below 60%'], [60, 70, '60–69%'], [70, 80, '70–79%'], [80, 101, '80% and above']];
const leagues = Object.entries(R.reduce((o, x) => ((o[x.cn + ' · ' + x.lg] ??= []).push(x), o), {})).filter(([, l]) => l.length >= 5).sort((a, b) => b[1].length - a[1].length).slice(0, 12);
const recent = [...R].sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 25);
page('track-record.html', 'Track Record: Every Pick, Win and Loss | ZurePicks', 'The full ZurePicks track record: win rate by market and confidence band, profit in units, and the latest settled picks.', 'Track record',
  R.length ? `<p>Every pick is built from bookmaker odds saved before kick-off and settled from the final score. Records start on ${dm(first)} and nothing is edited or removed. Units assume one unit staked on every pick at the listed odds.</p>
<div class="k"><div><b>${tot.n}</b><span>Settled picks</span></div><div><b>${f1(tot.wr)}%</b><span>Win rate</span></div><div><b>${f1(tot.ex)}%</b><span>Average chance</span></div><div><b class="${tot.pr >= 0 ? 'pos' : 'neg'}">${sg(tot.pr)}</b><span>Profit in units</span></div></div>
<h2>By market</h2>${atab('Market', Object.keys(MK).map((k) => arow(MK[k].l, R.filter((x) => x.k == k))).join(''))}
<h2>By confidence</h2><p>If the estimates are good, the win rate should land close to the average chance in each row.</p>${atab('Chance', bands.map(([lo, hi, t]) => arow(t, R.filter((x) => x.c >= lo && x.c < hi))).join(''))}
<h2>By league</h2>${atab('League', leagues.map(([n, l]) => arow(n, l)).join(''))}
<h2>Latest settled picks</h2><div class="sc"><table><thead><tr><th>Date</th><th>Match</th><th>Pick</th><th>Result</th></tr></thead><tbody>${recent.map((x) => `<tr><td>${x.d}</td><td>${esc(x.h)} v ${esc(x.a)}<small>${esc(x.lg)} · ${x.sc[0]}-${x.sc[1]}</small></td><td>${MK[x.k].n[x.i]}<small>${MK[x.k].l} @ ${x.od.toFixed(2)} · ${x.c}%</small></td><td class="${x.w ? 'pos' : 'neg'}">${x.w ? '✓ Won' : '✗ Lost'}</td></tr>`).join('')}</tbody></table></div>`
  : '<p class="empty">The track record builds up automatically as matches finish. Check back after today’s games.</p>');

// ---- trust pages and tools ----
page('how-it-works.html', 'How ZurePicks Works | Methodology and Limits', 'How ZurePicks turns bookmaker odds into win chances, how picks are settled, and what the limits are.', 'How it works',
  `<h2>Where the percentages come from</h2><p>For each market we take the bookmaker’s decimal odds and convert them into implied probabilities (one divided by the odds). Those add up to more than 100% because the bookmaker builds in a margin, so we scale them back to 100%. The result is the chance you see. There is no secret model and no human tipster: the pick is simply the outcome the market rates as most likely.</p>
<h2>Markets we cover</h2><p>Match result, double chance, over/under 2.5 goals, over/under 1.5 goals and both teams to score. A market only appears when a bookmaker has priced it.</p>
<h2>How picks are settled</h2><p>Odds are collected before kick-off and stored. When the match finishes, the final score decides whether each pick won or lost, and the result goes into the <a href="track-record.html">track record</a>. Cup games that go to extra time are settled on the score the data provider reports, which can differ from some bookmakers’ rules.</p>
<h2>Limits</h2><p>Odds-based chances are estimates. A 70% pick still loses about three times in ten, and a short price can win often and still lose money over time, which is why the track record shows profit in units as well as win rate. Coverage depends on the free data we receive, so some leagues have no picks. Nothing here is financial advice or a guarantee.</p>`);
page('responsible-gambling.html', 'Responsible Gambling | ZurePicks', 'Responsible gambling guidance and where to find free help.', 'Responsible gambling',
  '<p>You must be 18 or older to bet, and betting must be legal where you live. ZurePicks provides information only. We do not take bets.</p><h2>Stay in control</h2><p>Only stake money you can afford to lose. Set a budget and a time limit before you start. Never chase losses, and never bet to solve money problems. If betting stops being fun, take a break.</p><h2>Free help</h2><p><a href="https://www.begambleaware.org">BeGambleAware.org</a> · <a href="https://www.gamcare.org.uk">GamCare</a> · <a href="https://www.gamblersanonymous.org">Gamblers Anonymous</a>. Also look for support services and the gambling regulator in your own country.</p>');
page('tools.html', 'Odds Converter and Accumulator Calculator | ZurePicks', 'Free odds converter (decimal, fractional, American) with implied chance, plus an accumulator return calculator.', 'Odds tools',
  '<h2>Odds converter</h2><p><label>Decimal odds <input id="d" type="number" step="0.01" min="1.01" value="2.50"></label></p><p id="r"></p><h2>Accumulator calculator</h2><p><label>Decimal odds, separated by commas<br><input id="a" value="1.50, 2.10, 1.80" size="30"></label></p><p><label>Stake <input id="s" type="number" min="0" value="10"></label></p><p id="ar"></p><p>Every extra selection multiplies the odds but also the risk: one loss loses the whole bet.</p>'
  + '<script>var $=function(i){return document.getElementById(i)};function fr(d){var x=d-1;for(var b=1;b<=20;b++){var a=Math.round(x*b);if(Math.abs(a/b-x)<.005)return a+"/"+b}return x.toFixed(2)}'
  + 'function c1(){var d=+$("d").value;$("r").innerHTML=d>1?"Fractional <b>"+fr(d)+"</b> · American <b>"+(d>=2?"+"+Math.round((d-1)*100):Math.round(-100/(d-1)))+"</b> · Implied chance <b>"+(100/d).toFixed(1)+"%</b>":"Enter odds above 1.00"}'
  + 'function c2(){var o=$("a").value.split(",").map(Number).filter(function(x){return x>1}),s=+$("s").value||0,t=o.reduce(function(p,x){return p*x},1);$("ar").innerHTML=o.length?o.length+" selections · combined odds <b>"+t.toFixed(2)+"</b> · return <b>"+(t*s).toFixed(2)+"</b> · profit <b>"+(t*s-s).toFixed(2)+"</b>":"Enter odds above 1.00"}'
  + 'document.addEventListener("input",function(){c1();c2()});c1();c2()</script>');

// ---- index canonical, sitemap, robots ----
try { fs.writeFileSync('index.html', fs.readFileSync('index.html', 'utf8').replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${SITE}/">`)); } catch {}
const today = day(0);
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...PAGES].map((p) => `<url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Built', PAGES.length, 'pages;', Object.keys(H).length, 'matches in history');
