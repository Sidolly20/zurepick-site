// Builds the whole ZurePicks website from data/*.json: history, every page (SEO pre-rendered), sitemap and robots.
// Run after generate.mjs. Set SITE_URL when you move to your own domain.
import fs from 'node:fs';
import { MK, TZ, DONE, pick, won, settled, esc, board, topCards } from './render.js';
const SITE = (process.env.SITE_URL || 'https://sidolly20.github.io/zurepick-site').replace(/\/$/, '');
const dstr = (o) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(Date.now() + o * 864e5));
const nice = (o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(Date.now() + o * 864e5));
const short = (o) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(Date.now() + o * 864e5));

// ---- history: every finished match with pre-match odds, each market's pick and result ----
let H = {}; try { H = JSON.parse(fs.readFileSync('data/history.json', 'utf8')); } catch {}
const snaps = {};
for (const f of fs.readdirSync('data').filter((f) => /^\d{4}-\d\d-\d\d\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync('data/' + f, 'utf8')); snaps[j.date] = j.matches;
  for (const m of j.matches) {
    if (!settled(m)) continue;
    const p = {}; for (const k in MK) { const x = pick(m, k); if (x && x.od > 1) p[k] = [x.i, x.c, x.od, won(m, k, x) ? 1 : 0]; }
    if (Object.keys(p).length) H[m.id] = { d: m.d.slice(0, 10), lg: m.lg, cn: m.cn, h: m.h, a: m.a, sc: m.sc, p };
  }
}
fs.writeFileSync('data/history.json', JSON.stringify(H));
const HV = Object.values(H);
function rate(k, days = 30, lo = 0, hi = 101) {
  const cut = dstr(-days); let n = 0, w = 0;
  for (const h of HV) { const p = h.p[k]; if (h.d >= cut && p && p[1] >= lo && p[1] < hi) { n++; w += p[3]; } }
  return { n, w, r: n ? Math.round((w / n) * 100) : null };
}

// ---- pages ----
const MKT = {
  o: ['1x2-predictions.html', '1X2 Predictions', 'Match result (1X2)', 'The 1X2 market is the classic match-result bet: 1 is a home win, X is a draw and 2 is an away win. Every pick below is the outcome the bookmaker prices as most likely, with the bookmaker margin removed, so the percentage is the market’s own implied chance.'],
  dc: ['double-chance-predictions.html', 'Double Chance Predictions', 'Double chance', 'Double chance covers two of the three results (1X, 12 or X2), so it wins more often than a straight 1X2 pick but pays less. It suits matches where you trust one side not to lose but cannot call the winner.'],
  ou: ['over-2-5-goals-predictions.html', 'Over 2.5 Goals Predictions', 'Over/Under 2.5 goals', 'Over 2.5 goals wins when the match has three or more goals; Under 2.5 wins with two or fewer. Picks lean on the bookmaker’s goal-line prices and show the implied chance for each side.'],
  o15: ['over-1-5-goals-predictions.html', 'Over 1.5 Goals Predictions', 'Over/Under 1.5 goals', 'Over 1.5 goals needs at least two goals in the match. It is a lower-risk goals market with shorter odds than Over 2.5, which is why it is a popular accumulator leg.'],
  bt: ['btts-predictions.html', 'Both Teams to Score Predictions', 'Both teams to score (BTTS)', 'Both teams to score (BTTS or GG) wins when each side scores at least once, whatever the final result. A 1-1 draw and a 4-3 win both count.'],
};
const LG = [[39, 'premier-league', 'Premier League', 'England'], [140, 'la-liga', 'La Liga', 'Spain'], [135, 'serie-a', 'Serie A', 'Italy'], [78, 'bundesliga', 'Bundesliga', 'Germany'], [61, 'ligue-1', 'Ligue 1', 'France'], [2, 'champions-league', 'UEFA Champions League', 'Europe'], [3, 'europa-league', 'UEFA Europa League', 'Europe']];
const NAV = [['index.html', 'Today'], ['football-predictions-tomorrow.html', 'Tomorrow'], ['1x2-predictions.html', '1X2'], ['over-2-5-goals-predictions.html', 'Goals'], ['btts-predictions.html', 'BTTS'], ['leagues.html', 'Leagues'], ['track-record.html', 'Track record']];
const FOOT = [['Predictions', [['index.html', 'Predictions today'], ['football-predictions-tomorrow.html', 'Predictions tomorrow'], ['football-predictions-yesterday.html', 'Yesterday’s results']]], ['Markets', Object.values(MKT).map((x) => [x[0], x[1]])], ['Leagues', LG.map((l) => [l[1] + '-predictions.html', l[2]])], ['About', [['track-record.html', 'Track record'], ['how-it-works.html', 'How it works'], ['tools.html', 'Odds tools'], ['responsible-gambling.html', 'Responsible gambling']]]];
const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230b8a52'/%3E%3Cpath d='M9 10h14l-10 12h10' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
const PAGES = [], ldj = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const faqHtml = (q) => `<div class="prose"><h2>Frequently asked questions</h2>${q.map(([a, b]) => `<details><summary>${esc(a)}</summary><p>${esc(b)}</p></details>`).join('')}</div>`;

function page(file, o) {
  const url = SITE + '/' + (file == 'index.html' ? '' : file), canon = o.canon ? SITE + '/' + (o.canon == 'index.html' ? '' : o.canon) : url;
  const crumbs = [['Home', SITE + '/'], ...(file == 'index.html' ? [] : [[o.crumb || o.h1, url]])];
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'ZurePicks', url: SITE + '/' }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: c[1] })) }];
  if (o.faq) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: o.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  const b = o.board;
  const boardHtml = !b ? '' : `<div class="bar"><div class="scr" id="days" aria-label="Choose a day"></div><div class="scr" id="mkts" aria-label="Choose a market"></div></div>
<div class="tools"><input type="search" id="q" placeholder="Search team or league" aria-label="Search team or league"><select id="min" aria-label="Minimum implied chance"><option value="0">Any chance</option><option value="60">60%+</option><option value="70">70%+</option><option value="80">80%+</option></select><label><input type="checkbox" id="all"> Show fixtures without odds</label></div>
<p id="status" role="status">Loaded from the latest data snapshot.</p><p id="count" class="mut" style="margin:.2rem 0 .8rem;font-size:.82rem"></p>
<div id="board" data-mk="${b.k}" data-off="${b.off}" data-lg="${b.lg || ''}">${board(b.ms, b.k, { lg: b.lg, max: 80 })}</div>
<div id="slip" hidden><span><b id="slipn"></b> · <b id="slipo"></b></span><button type="button" id="slipx">Copy slip</button><button type="button" id="slipc">Clear</button></div>`;
  const topHtml = o.top ? `<h2>Top picks by implied chance</h2><div class="tops" id="top">${topCards(b.ms) || '<div class="empty">Top picks appear once odds are published.</div>'}</div>` : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(o.title)}</title><meta name="description" content="${esc(o.desc)}"><link rel="canonical" href="${canon}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:title" content="${esc(o.title)}"><meta property="og:description" content="${esc(o.desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${canon}"><meta property="og:site_name" content="ZurePicks"><meta name="twitter:card" content="summary"><meta name="theme-color" content="#0b8a52"><link rel="icon" href="${FAV}"><link rel="stylesheet" href="zp.css">${ld.map(ldj).join('')}</head><body>
<header><div class="w"><a class="logo" href="index.html"><i>Z</i>ZurePicks</a><nav aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${h == file ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav><span class="age">18+</span></div></header>
<main class="w"><p class="crumbs">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a> › ` : esc(c[0])).join('')}</p>
<section class="hero"><h1>${o.h1}</h1><p class="lead">${o.lead}</p>${o.kp ? `<div class="kp">${o.kp.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>` : ''}</section>
${topHtml}${boardHtml}${o.body || ''}${o.faq ? faqHtml(o.faq) : ''}
<footer><div class="fg">${FOOT.map(([t, l]) => `<div><b>${t}</b>${l.map(([h, x]) => `<a href="${h}">${x}</a>`).join('')}</div>`).join('')}</div><p><b>18+ only.</b> Percentages are estimates worked out from bookmaker odds, not guarantees, and no pick is a “sure” win. Only stake what you can afford to lose and check that betting is legal where you live. <a href="responsible-gambling.html">Get help</a>.</p><p>© 2026 ZurePicks · Times shown in WAT (Africa/Lagos)</p></footer></main>
${b ? '<script src="api-config.js"></script><script type="module" src="app.js"></script>' : ''}</body></html>`;
  fs.writeFileSync(file, html); PAGES.push(file);
}

const R30 = rate('o'), snapFor = (o) => snaps[dstr(o)] || [];
const kpFor = (ms, k) => [[ms.length || '–', 'Fixtures'], [ms.filter((m) => m[k]).length || '–', 'With odds'], [R30.r == null ? '–' : R30.r + '%', 'Favourite hit rate, 30 days']];
const faqCommon = [
  ['Are these predictions free?', 'Yes. Every pick, odds table and result on ZurePicks is free and needs no sign-up.'],
  ['How are the picks made?', 'Each pick is the outcome bookmakers price as most likely, with their margin removed. The percentage is that market-implied chance. It is not a private model and it is not a guarantee.'],
  ['What does the percentage mean?', 'A 70% pick is one the market gives roughly a 70% chance, so it still loses around three times in ten. Use it as a guide to how one-sided a match looks, not as a promise.'],
];
// Home / today
const dayPage = (file, off, h1, lead, extra = {}) => page(file, { title: extra.title, desc: extra.desc, h1, lead, crumb: extra.crumb, canon: extra.canon, kp: kpFor(snapFor(off), 'o'), board: { k: 'o', off, ms: snapFor(off) }, top: off >= 0, faq: faqCommon, body: extra.body });
dayPage('index.html', 0, 'Football predictions <em>today</em>', `Free football predictions for ${nice(0)}: 1X2, double chance, over/under goals and both teams to score, with odds, implied chance and results as they finish. Tap any odds to build a slip.`, { title: `Football Predictions Today (${short(0)}) | Free 1X2, Over 2.5 & BTTS Tips – ZurePicks`, desc: `Free football predictions for ${short(0)}: 1X2, double chance, Over 2.5 and BTTS tips with odds, win probability and tracked results. No sign-up.` });
dayPage('football-predictions-today.html', 0, 'Football predictions <em>today</em>', `Today’s football predictions for ${nice(0)}.`, { canon: 'index.html', title: `Football Predictions Today (${short(0)}) | ZurePicks`, desc: `Free football predictions for ${short(0)} with odds and results.`, crumb: 'Predictions today' });
dayPage('football-predictions-tomorrow.html', 1, 'Football predictions <em>tomorrow</em>', `Free football predictions for ${nice(1)}. Fixtures and odds are added as bookmakers publish prices, usually a day or two before kick-off.`, { title: `Football Predictions Tomorrow (${short(1)}) | Free Tips & Odds – ZurePicks`, desc: `Free football predictions for tomorrow, ${short(1)}: 1X2, Over 2.5, BTTS and double chance tips with odds and implied chance.`, crumb: 'Predictions tomorrow' });
dayPage('football-predictions-yesterday.html', -1, 'Yesterday’s football <em>results</em>', `How the picks did on ${nice(-1)}. Green ticks are winning picks, red crosses are losing ones, shown for every market.`, { title: `Football Predictions Yesterday (${short(-1)}) | Results & Tracked Picks – ZurePicks`, desc: `Yesterday’s football predictions and results for ${short(-1)}, with every pick marked as a win or a loss.`, crumb: 'Yesterday’s results' });
// Markets
for (const k in MKT) {
  const [file, name, short_, text] = MKT[k], r = rate(k);
  page(file, { title: `${name} Today (${short(0)}) | Free ${short_} Tips – ZurePicks`, desc: `${short_} predictions for ${short(0)} with odds and implied chance for every match. Free, updated through the day, results tracked.`, h1: `${name.replace(' Predictions', '')} predictions <em>today</em>`, lead: text, crumb: name, kp: [...kpFor(snapFor(0), k).slice(0, 2), [r.r == null ? '–' : r.r + '%', 'Favourite hit rate, 30 days']], board: { k, off: 0, ms: snapFor(0) }, top: false,
    body: `<div class="prose"><h2>How to read ${short_} picks</h2><p>${text}</p><p>Tap an odds button to add it to your slip. The highlighted price is the market favourite for that match. Finished games show a ✓ or ✗ so you can judge the picks yourself, and the <a href="track-record.html">track record</a> page lists the full 30-day numbers.</p></div>`,
    faq: [[`What is ${short_.toLowerCase()}?`, text], ...faqCommon.slice(1), [`How often does the ${short_.toLowerCase()} favourite win?`, r.r == null ? 'The record fills in as matches finish; see the track record page.' : `Over the last 30 days the favourite won ${r.w} of ${r.n} tracked matches (${r.r}%). That is a hit rate of the market favourite, not a promise for future games.`]] });
}
// Leagues
for (const [id, slug, name, cn] of LG) {
  const ms = snapFor(0).filter((m) => m.li == id);
  page(slug + '-predictions.html', { title: `${name} Predictions Today | Free Tips, Odds & Results – ZurePicks`, desc: `${name} predictions with 1X2, goals and BTTS tips, odds and implied chance for every fixture, plus tracked results.`, h1: `${name} predictions <em>today</em>`, lead: `Every ${name} (${cn}) fixture on the board with odds, implied chance and results. Fixtures appear when bookmakers publish prices, so a quiet matchday can show nothing yet.`, crumb: name, kp: [[ms.length || '–', 'Fixtures today'], [ms.filter((m) => m.o).length || '–', 'With odds']], board: { k: 'o', off: 0, lg: id, ms: snapFor(0) }, top: false, faq: faqCommon });
}
// Leagues hub
page('leagues.html', { title: 'Football Leagues – Predictions by League | ZurePicks', desc: 'Pick a league: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and European cup predictions.', h1: 'Predictions by <em>league</em>', lead: 'Choose a competition to see only its fixtures, odds and results.', body: `<div class="grid">${LG.map(([, s, n, c]) => `<a href="${s}-predictions.html">${n}<small>${c}</small></a>`).join('')}</div>` });
// Track record
const bands = [[0, 50, 'Under 50%'], [50, 60, '50–59%'], [60, 70, '60–69%'], [70, 80, '70–79%'], [80, 101, '80%+']];
const rows = Object.keys(MK).map((k) => { const r = rate(k, 30); return `<tr><td>${MK[k].l}</td><td>${r.n}</td><td>${r.w}</td><td><b>${r.r == null ? '–' : r.r + '%'}</b></td></tr>`; }).join('');
const brows = bands.map(([lo, hi, l]) => { const r = rate('o', 30, lo, hi); return `<tr><td>${l}</td><td>${r.n}</td><td>${r.w}</td><td><b>${r.r == null ? '–' : r.r + '%'}</b></td></tr>`; }).join('');
page('track-record.html', { title: 'Track Record – Football Prediction Results & Hit Rate | ZurePicks', desc: 'Every ZurePicks pick is tracked. See hit rates for each market over 30 days and how often higher-chance picks really win.', h1: 'Our <em>track record</em>', lead: `Every finished match with pre-match odds is stored with its pick and result. ${HV.length} matches tracked so far.`,
  body: `<div class="prose"><h2>Last 30 days by market</h2><div class="sc"><table><thead><tr><th>Market</th><th>Picks</th><th>Won</th><th>Hit rate</th></tr></thead><tbody>${rows}</tbody></table></div><h2>Does higher implied chance win more often? (1X2)</h2><div class="sc"><table><thead><tr><th>Implied chance</th><th>Picks</th><th>Won</th><th>Hit rate</th></tr></thead><tbody>${brows}</tbody></table></div><p class="mut">Hit rate here is how often the bookmaker favourite won. It measures the market, not a separate prediction model, and small samples move a lot. Past results do not guarantee future ones.</p></div>` });
// How it works
page('how-it-works.html', { title: 'How ZurePicks Works – Methodology & Data | ZurePicks', desc: 'How ZurePicks turns bookmaker odds into implied probabilities, what the percentages mean and where the data comes from.', h1: 'How ZurePicks <em>works</em>', lead: 'No hidden tricks. Here is exactly where the numbers come from and what they can and cannot tell you.',
  body: `<div class="prose"><h2>1. Fixtures and odds</h2><p>Fixtures, scores and pre-match odds come from football data providers and are refreshed several times a day by an automatic job.</p><h2>2. Implied probability</h2><p>Decimal odds convert to a probability by dividing 1 by the odds. Bookmaker prices add up to more than 100% because of their margin, so ZurePicks rescales each market back to 100%. That rescaled figure is the percentage you see.</p><h2>3. The pick</h2><p>The pick is the outcome with the highest rescaled probability in that market. For double chance, it is the pair of results with the highest combined probability.</p><h2>4. Results</h2><p>When a match finishes, the pick is marked won or lost and stored permanently for the <a href="track-record.html">track record</a>.</p><h2>Limits</h2><p>The picks are market-based estimates. They do not use private information, and no site can promise winners. Football is unpredictable, so stake responsibly.</p></div>` });
page('responsible-gambling.html', { title: 'Responsible Gambling – Help & Limits | ZurePicks', desc: 'Betting should be entertainment. Set limits, never chase losses and find free support if gambling stops being fun.', h1: 'Responsible <em>gambling</em>', lead: 'Predictions are information, not advice. Betting is for adults aged 18+.', body: `<div class="prose"><ul><li>Only stake money you can afford to lose and set a budget first.</li><li>Never chase losses. A bad run does not mean a win is due.</li><li>Take breaks, and stop if betting stops being enjoyable.</li><li>Check that betting is legal where you live.</li></ul><p>Free support: <a href="https://www.begambleaware.org" rel="noopener">BeGambleAware.org</a> · <a href="https://www.gamblingtherapy.org" rel="noopener">GamblingTherapy.org</a></p></div>` });
// Tools
page('tools.html', { title: 'Betting Odds Tools – Odds Converter & Accumulator Calculator | ZurePicks', desc: 'Free odds converter (decimal, fractional, American) and accumulator calculator with implied chance.', h1: 'Odds <em>tools</em>', lead: 'Convert odds and see what an accumulator really pays and risks.',
  body: `<div class="prose"><h2>Odds converter</h2><p><label>Decimal odds <input class="f" id="d" type="number" step="0.01" min="1.01" value="2.50"></label></p><p id="dr" class="mono"></p><h2>Accumulator calculator</h2><p><label>Decimal odds, comma separated <input class="f" id="a" value="1.50, 1.80, 2.10"></label> <label>Stake <input class="f" id="s" type="number" min="0" value="1000"></label></p><p id="ar" class="mono"></p><p class="mut">Every extra selection multiplies the odds but also the risk: one loss loses the whole bet.</p></div><script>(function(){var $=function(i){return document.getElementById(i)};function fr(d){var x=d-1;for(var b=1;b<=50;b++){var a=Math.round(x*b);if(Math.abs(a/b-x)<.005)return a+"/"+b}return x.toFixed(2)}function c1(){var d=+$("d").value;$("dr").textContent=d>1?"Fractional "+fr(d)+" · American "+(d>=2?"+"+Math.round((d-1)*100):Math.round(-100/(d-1)))+" · Implied chance "+(100/d).toFixed(1)+"%":"Enter odds above 1.00"}function c2(){var o=$("a").value.split(",").map(Number).filter(function(x){return x>1}),s=+$("s").value||0,t=o.reduce(function(p,x){return p*x},1);$("ar").textContent=o.length?o.length+" selections · combined odds "+t.toFixed(2)+" · return "+(t*s).toFixed(2)+" · profit "+(t*s-s).toFixed(2):"Enter odds above 1.00"}document.addEventListener("input",function(){c1();c2()});c1();c2()})()</script>` });

const today = dstr(0);
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.filter((p) => p != 'football-predictions-today.html').map((p) => `<url><loc>${SITE}/${p == 'index.html' ? '' : p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Built', PAGES.length, 'pages; history', HV.length, 'matches');
