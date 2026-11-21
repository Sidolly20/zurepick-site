ZUREPICKS FINAL UPDATE - how to install
=======================================
1. Copy ALL files in this folder into the ROOT of your GitHub repo (same place as app.js and index.html). Replace when asked.
2. Commit and push.
3. GitHub > Actions > "Update match data" > Run workflow. The site rebuilds itself.
4. Hard-refresh the site on your phone.

WHAT CHANGED
  zp.css          compact "foundation" match cards, slim header, compact top sections, fixed comparison table labels,
                  round save-star button in the card's top-right corner, 320px + desktop hardening
  render.js       new match card markup (one pick bar, status, Won/Lost, live hint, WAT label);
                  teams with no logo get a coloured monogram badge (same colour for the same team every time)
  collect-bsd.mjs saves each team's BSD id (hid/aid) on every match; cards then load that team's logo from
                  https://sports.bzzoiro.com/img/team/<id>/ (BSD Image API, no key, free to hotlink). No id or no image = coloured monogram.
                  CHECK after the first run: open data/<today>.json - matches should now have "hid" and "aid" numbers.
  ticker.js       strip label now says "Live & next" while it shows both live and upcoming games
  build-pages.mjs no "Home" breadcrumb on the home page; filters hidden via a class (no :has)
  previews.mjs, extra-pages.mjs, site-settings.mjs, keyword-content.mjs, guides-intent.mjs   SEO work from the earlier upgrade (unchanged)
  fix-existing-pages.mjs   one-off script; only run it if you never ran it before (node fix-existing-pages.mjs)

Tested: full site build with these files on your real repo (153 pages built, no errors), plus phone-size checks of the home page, cards and a match preview.
