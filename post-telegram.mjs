// Posts to your Telegram channel: today's slips (morning), a results recap (night) or the weekly summary (Monday).
// Needs two secrets: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID. Without them it does nothing.
import fs from 'node:fs';
import { combos, pick, won, settled, MK, MIN, hm } from './render.js';
const MODE = process.argv[2] || process.env.MODE || 'slips';
const TOKEN = process.env.TELEGRAM_BOT_TOKEN, CHAT = process.env.TELEGRAM_CHAT_ID, API = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
const SITE = (process.env.SITE_URL || 'https://sidolly20.github.io/zurepick-site').replace(/\/$/, ''), TZ = 'Africa/Lagos';
if (!TOKEN || !CHAT) { console.log('Telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipped'); process.exit(0); }
const day = (o = 0) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(Date.now() + o * 864e5);
const load = (d) => { try { return JSON.parse(fs.readFileSync(`data/${d}.json`, 'utf8')).matches || []; } catch { return []; } };
const h = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KEYS = ['o', 'dc', 'ou', 'o15', 'bt'];
const rec = (ms) => ms.filter(settled).flatMap((m) => KEYS.map((k) => [k, pick(m, k)]).filter(([k, p]) => p && p.od && p.c >= MIN[k]).map(([k, p]) => ({ m, k, p, w: !!won(m, k, p) })));
const date = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(Date.now());
const foot = '\n\n18+ · Picks are chances, not guarantees. Play responsibly.';
async function send(text) {
  const r = await fetch(`${API}/bot${TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true }), signal: AbortSignal.timeout(20000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) { console.log('Telegram error', r.status, j.description || ''); process.exit(1); }
  console.log('Telegram: sent', MODE);
}
const sum = (R) => ({ n: R.length, w: R.filter((x) => x.w).length, r: R.length ? Math.round((R.filter((x) => x.w).length / R.length) * 100) : 0 });

if (MODE == 'slips') {
  const cs = combos(load(day()), Date.now(), true).filter((c) => c.legs.length && [2, 3].includes(c.target));
  if (!cs.length) { console.log('Telegram: no slips to post yet'); process.exit(0); }
  const block = (c) => `<b>${c.target} odds slip · total ${c.od.toFixed(2)}</b> (${c.chance}% combined chance)\n` + c.legs.map((x) => `• ${hm(x.m.d)} ${h(x.m.h)} v ${h(x.m.a)}: ${h(MK[x.k].n[x.i])} @${x.od.toFixed(2)}`).join('\n');
  await send(`⚽ <b>ZurePicks · today’s slips</b>\n${h(date)}\n\n${cs.map(block).join('\n\n')}\n\nAll tips and match previews: ${SITE}/${foot}`);
} else if (MODE == 'recap') {
  const R = rec(load(day())), S = sum(R);
  if (!S.n) { console.log('Telegram: nothing settled yet'); process.exit(0); }
  const byK = KEYS.map((k) => [k, sum(R.filter((x) => x.k == k))]).filter(([, x]) => x.n).map(([k, x]) => `• ${h(MK[k].l)}: ${x.w}/${x.n}`).join('\n');
  await send(`📊 <b>ZurePicks · today’s results</b>\n${h(date)}\n\n${S.w} of ${S.n} published picks won (${S.r}%)\n\n${byK}\n\nEvery pick, win or lose: ${SITE}/weekly-review.html${foot}`);
} else if (MODE == 'weekly') {
  const R = [1, 2, 3, 4, 5, 6, 7].flatMap((o) => rec(load(day(-o)))), S = sum(R);
  if (!S.n) { console.log('Telegram: no weekly data yet'); process.exit(0); }
  await send(`🗓 <b>ZurePicks · weekly review</b>\n\nLast 7 days: ${S.w} of ${S.n} published picks won (${S.r}%).\nThe misses, the best calls and each market’s record: ${SITE}/weekly-review.html${foot}`);
} else { console.log('Telegram: unknown mode', MODE); process.exit(1); }
