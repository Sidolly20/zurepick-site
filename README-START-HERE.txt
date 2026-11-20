ZUREPICKS KEYWORD + SEO UPGRADE  (final)

Copy ALL the files in this folder into the MAIN folder of your repo (replace the old ones). The build needs them together.

FILES
  keyword-content.mjs   NEW      all new text, titles, descriptions, related links
  guides-intent.mjs     NEW      from the earlier SEO fix (your repo did not have it)
  build-pages.mjs       CHANGED  earlier SEO-fix version + 4 small lines (plug-in, new guides, Saudi Pro League) + African football hub page + menu and footer links for the new pages + the About page portrait (clean white ASJ monogram instead of the drawing)
  previews.mjs          CHANGED  earlier SEO-fix version + 1 fix (Pick of the Day no longer links to deleted match pages)
  extra-pages.mjs       CHANGED  earlier SEO-fix version, untouched by me
  sitemap.xml           CHANGED  152 pages
  zp.css                CHANGED  only added lines at the end: League "right now" stat boxes + points race fix, and the classier match-card look
  render.js             CHANGED  2 small edits to the team badge only: a team without a crest shows its initials (no empty grey circle)
  site-settings.mjs     CHANGED  one line only: contentUpdated is now 2026-11-20 (all your other settings are untouched)
  fix-existing-pages.mjs         optional, you do not need to run it

HOW TO INSTALL
  1. Unzip this file on your PC.
  2. Copy every file above into your repo's main folder. Say YES to replace.
  3. Commit and push. (site-settings.mjs is already updated: only the "last reviewed" date changed, to 2026-11-20.)
  4. GitHub > Actions > "Update match data" > Run workflow.
  5. Open the home page, saudi-pro-league-predictions.html and pick-of-the-day.html to check them.

TESTED ON A COPY OF YOUR REPO: build finished with no errors (153 pages), 0 broken internal links, 0 duplicate titles or descriptions,
every indexed page has one H1, canonical, social tags and valid schema, no duplicate FAQ schema, noindex pages unchanged.

REAL PHOTO LATER: upload your photo to the repo root (for example owner.jpg) and write owner.jpg in site-settings.mjs after ownerPhoto:. It replaces the monogram automatically.

NEW PAGES IN THIS VERSION: jackpot-predictions.html (free jackpot planner), african-football-predictions.html, saudi-pro-league-predictions.html and 5 guides.

CARD UPGRADE (added)
  render.js   row() rewritten: one pick bar, Upcoming/Live/Full-time status, Won/Lost pills, live "needs 1 more goal" hint, WAT label
  zp.css      new "Clean match card" block added at the very end
  Same install: copy all files over your repo, push, run "Update match data". Test adding a pick to the slip once.
