# ZurePicks final build (4.2)
Upload every file in this zip to the repo root (replace existing), run the workflow once, open the site in a private tab.

Files: render.js, zp.css, build-pages.mjs, previews.mjs, app.js, ticker.js, manifest.webmanifest

## Since 3.6
- Categories menu (next to the logo): Slips (2/3/5 odds accumulator, Single bet today), Popular today (all predictions today, tomorrow, weekend, yesterday's results, Safest tips today, Banker of the day), then Match result, Double chance, Goals, Both teams to score.
- Slip pages: H1 "2 odds accumulator for today" (also 3, 5; single is "Single bet prediction for today"), matching titles, descriptions, section headings, footer links.
- Banker: the pick-of-the-day card and page now carry "banker of the day" wording; home and safest pages explain it honestly.
- New page safest-football-tips-today.html (chance 75%+, odds 1.15+, no double chance), also shown on the home page under the games. In the sitemap automatically.
- Home board opens on Top picks (mixed markets, no double chance, odds 1.15+); 1X2 and other buttons still filter.
- Live bar scrolls under the header; saved-game stars; slip switcher; AI in bottom bar; Telegram logo at right.

## Last fixes (final 4)
- AI Betting Assistant page now uses the same header, footer and bottom bar as every other page (it was a separate old page: old header with an 18+ badge, near-invisible title, old footer). Its widget lives in ai-assistant.src.html (new file, upload it too). Do not delete it.
- Contact and Partner pages: the contact cards (Email, Telegram, WhatsApp) are styled again.
- Home banker card reads today's saved pick and the record counts settled picks of today.
