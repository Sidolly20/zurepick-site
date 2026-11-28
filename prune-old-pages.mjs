// Keeps the repository small: deletes finished match pages (prediction-*-DATE.html) older than KEEP_DAYS and
// turns every link to a deleted page into plain text, so nothing on the site points at a missing page.
// Match pages are noindex and not in the sitemap, so removing old ones does not affect search results.
import fs from 'node:fs';

const KEEP_DAYS = Math.max(1, Number(process.env.KEEP_DAYS) || 3);
const cut = new Date(Date.now() - KEEP_DAYS * 86400000).toISOString().slice(0, 10);
const TZ_NOTE = 'dates in file names are Lagos match days; one day of margin is kept by KEEP_DAYS';

const gone = new Set();
for (const f of fs.readdirSync('.')) {
  const m = /^prediction-.+-(\d{4}-\d\d-\d\d)\.html$/.exec(f);
  if (m && m[1] < cut) { fs.unlinkSync(f); gone.add(f); }
}

let fixed = 0;
if (gone.size) {
  const A = /<a\b([^>]*?)href="(prediction-[^"#?]+\.html)(?:[#?][^"]*)?"([^>]*)>([\s\S]*?)<\/a>/g;
  for (const f of fs.readdirSync('.')) {
    if (!f.endsWith('.html')) continue;
    const s = fs.readFileSync(f, 'utf8');
    if (!s.includes('href="prediction-')) continue;
    const t = s.replace(A, (all, a, file, b, inner) => (gone.has(file) || !fs.existsSync(file) ? (fixed++, inner) : all));
    if (t !== s) fs.writeFileSync(f, t);
  }
}
console.log(`pruned ${gone.size} match pages older than ${cut}; ${fixed} links turned into plain text`);
