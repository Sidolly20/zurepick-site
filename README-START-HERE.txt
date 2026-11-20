ZUREPICKS KEYWORD + SEO UPGRADE  (final)

Copy ALL the files in this folder into the MAIN folder of your repo (replace the old ones). The build needs them together.

FILES
  keyword-content.mjs   NEW      all new text, titles, descriptions, related links
  guides-intent.mjs     NEW      from the earlier SEO fix (your repo did not have it)
  build-pages.mjs       CHANGED  earlier SEO-fix version + 4 small lines (plug-in, new guides, Saudi Pro League) + the About page portrait (clean white ASJ monogram instead of the drawing)
  previews.mjs          CHANGED  earlier SEO-fix version + 1 fix (Pick of the Day no longer links to deleted match pages)
  extra-pages.mjs       CHANGED  earlier SEO-fix version, untouched by me
  sitemap.xml           CHANGED  150 pages
  site-settings.mjs     CHANGED  one line only: contentUpdated is now 2026-11-20 (all your other settings are untouched)
  fix-existing-pages.mjs         optional, you do not need to run it

HOW TO INSTALL
  1. Unzip this file on your PC.
  2. Copy every file above into your repo's main folder. Say YES to replace.
  3. Commit and push. (site-settings.mjs is already updated: only the "last reviewed" date changed, to 2026-11-20.)
  4. GitHub > Actions > "Update match data" > Run workflow.
  5. Open the home page, saudi-pro-league-predictions.html and pick-of-the-day.html to check them.

TESTED ON A COPY OF YOUR REPO: build finished with no errors (151 pages), 0 broken internal links, 0 duplicate titles or descriptions,
every indexed page has one H1, canonical, social tags and valid schema, no duplicate FAQ schema, noindex pages unchanged.

REAL PHOTO LATER: upload your photo to the repo root (for example owner.jpg) and write owner.jpg in site-settings.mjs after ownerPhoto:. It replaces the monogram automatically.
