// League page "pulse": the story of the league right now, built from the table and the tracked results.
import { esc, MIN, pick, settled, won } from './render.js';
const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10] || 'th');
const ppl = (n, w) => `${n} ${w}${n == 1 ? '' : 's'}`;

export function leaguePulse(L, t, hist) {
  const r = t?.rows || []; if (r.length < 6 || !r[0].p) return '';
  const n = r.length, leader = r[0], second = r[1], fourth = r[3] || r[2], gap = leader.pts - second.pts;
  const games = r.reduce((s, x) => s + x.p, 0) / 2, gpg = r.reduce((s, x) => s + x.gf, 0) / games;
  const atk = [...r].sort((x, y) => y.gf / y.p - x.gf / x.p)[0], def = [...r].sort((x, y) => x.ga / x.p - y.ga / y.p)[0];
  const form = [...r].sort((x, y) => y.pts / y.p - x.pts / x.p)[0];
  const cup = !!L.cup, safe = r[n - 4], bottom = r[n - 1], dropGap = safe ? safe.pts - bottom.pts : null;
  // how this league's published picks have done
  const mine = hist.filter((h) => L.names.includes(h.lg)); let pn = 0, pw = 0; for (const h of mine) for (const k in h.p) { const x = h.p[k]; if (x[1] >= MIN[k]) { pn++; pw += x[3]; } }
  const hit = pn >= 8 ? Math.round((pw / pn) * 100) : null;
  const race = r.slice(0, 5), top = race[0].pts, low = Math.min(...race.map((x) => x.pts)), span = Math.max(top - low, 1);
  const headline = gap == 0 ? `${leader.team} and ${second.team} are level at the top` : gap <= 2 ? `${leader.team} lead by just ${ppl(gap, 'point')}` : gap >= 8 ? `${leader.team} are running away with it, ${gap} points clear` : `${leader.team} lead by ${ppl(gap, 'point')}`;
  const tile = (v, l, s) => `<div><b>${v}</b><span>${l}</span>${s ? `<small>${s}</small>` : ''}</div>`;
  return `<section class="mx-card" id="pulse"><h2>${esc(L.name)} right now</h2><p>${esc(headline)}${fourth && !cup ? `, and the gap from first to fourth is ${ppl(leader.pts - fourth.pts, 'point')}` : ''}.${!cup && dropGap != null ? ` At the other end, ${esc(bottom.team)} are ${dropGap == 0 ? 'level on points with' : ppl(dropGap, 'point') + ' behind'} the first safe place.` : ''}</p>
<div class="mx-stats">${tile(gpg.toFixed(2), 'Goals per game', 'league average')}${tile(esc(atk.team), 'Best attack', (atk.gf / atk.p).toFixed(1) + ' per game')}${tile(esc(def.team), 'Best defence', (def.ga / def.p).toFixed(1) + ' conceded per game')}${hit != null ? tile(hit + '%', 'Our picks won', `${pw} of ${pn} tracked`) : tile(esc(form.team), 'Best points per game', (form.pts / form.p).toFixed(2))}</div>
<div class="mx-race" role="img" aria-label="Points race at the top">${race.map((x) => `<div><span>${ord(x.pos)} ${esc(x.team)}</span><i style="width:${Math.round(25 + ((x.pts - low) / span) * 75)}%"></i><em>${x.pts}</em></div>`).join('')}</div></section>`;
}
