// One-off: run once from the repo root with `node fix-existing-pages.mjs`, then commit the changes.
// 1) every prediction-*.html and dated page (predictions-DATE, weekly-review-DATE, week-in-review-DATE) gets <meta name="robots" content="noindex, follow">
// 2) every internal link to index.html becomes "./" (the site root)
// 3) those entries are removed from sitemap.xml
// Safe to run more than once. Future builds do all of this on their own (build-pages.mjs / previews.mjs).
import fs from 'node:fs';
const TOP = new Set(['team-arsenal.html', 'team-aston-villa.html', 'team-chelsea.html', 'team-liverpool.html', 'team-man-city.html', 'team-man-united.html', 'team-tottenham.html', 'team-everton.html', 'team-real-madrid.html', 'team-sevilla-fc.html', 'team-valencia.html', 'team-athletic.html', 'team-dortmund.html', 'team-leverkusen.html', 'team-rb-leipzig.html', 'team-stuttgart.html', 'team-inter.html', 'team-juventus.html', 'team-milan.html', 'team-napoli.html', 'team-roma.html', 'team-atalanta.html', 'team-lazio.html', 'team-psg.html', 'team-monaco.html', 'team-ajax.html', 'team-psv.html', 'team-porto.html', 'team-galatasaray.html', 'team-fenerbahce.html']); // the only team pages that stay indexed
let pred = 0, links = 0;
for (const f of fs.readdirSync('.')) {
  if (!f.endsWith('.html') || f === 'ai-assistant.src.html') continue;
  const s = fs.readFileSync(f, 'utf8');
  let t = s;
  if ((/^team-/.test(f) && !TOP.has(f)) || /^(prediction-|predictions-\d{4}-|weekly-review-\d{4}-|week-in-review-\d{4}-)/.test(f)) t = t.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, follow">');
  if (t !== s) pred++;
  const u = t.replace(/href="index\.html"/g, 'href="./"');
  if (u !== t) links++;
  if (u !== s) fs.writeFileSync(f, u);
}
let sm = fs.readFileSync('sitemap.xml', 'utf8');
const n0 = (sm.match(/<url>/g) || []).length;
sm = sm.replace(/<url><loc>[^<]*\/team-[^<]*\.html<\/loc>[^\n]*<\/url>\n?/g, (m) => (TOP.has(m.match(/(team-[^<\/]*\.html)/)[1]) ? m : ''));
sm = sm.replace(/<url><loc>[^<]*\/(prediction-|predictions-\d{4}-|weekly-review-\d{4}-|week-in-review-\d{4}-)[^<]*<\/loc>[^\n]*<\/url>\n?/g, '');
fs.writeFileSync('sitemap.xml', sm);
console.log(`match pages set to noindex: ${pred}; pages with root-link fix: ${links}; sitemap ${n0} -> ${(sm.match(/<url>/g) || []).length} URLs`);
