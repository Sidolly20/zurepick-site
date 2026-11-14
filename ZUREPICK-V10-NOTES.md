# ZurePicks v10: design and SEO notes

## Important: change these in the generator, not in the HTML
Your GitHub Action rebuilds every page every 10 minutes. Anything edited directly in a `.html` file is overwritten.
This update changes `build-pages.mjs`, `zp.css`, `site-settings.mjs`, the icons and `og.png`, so it survives every rebuild.

## Design (zp.css, last section "v10")
- New identity: near-black ink, ivory type, one signal orange for brand and actions. Green is kept only for picks and wins, so they never compete with the brand colour.
- Condensed display type (Barlow Condensed) for headlines and numbers, Figtree for reading. Two font families instead of three, which loads faster.
- New logo mark, favicon, app icons and share image (WhatsApp/Telegram previews).
- Pick of the day card, hero, KPI tiles, buttons, chips, FAQ and footer restyled; every other module inherits the new tokens.

## SEO changes (build-pages.mjs)
- Titles are fitted to about 60 characters (the brand moves to og:site_name and the WebSite markup when space is short). Descriptions are trimmed to 158.
- Structured data: Organization with logo and Telegram, WebSite, WebPage with dateModified, Article with author on every guide, ItemList on board pages, BreadcrumbList, FAQPage.
- The sitemap no longer says "changed today" for every URL. Guides and info pages keep a fixed date (`contentUpdated` in site-settings.mjs); data pages use the day. Google ignores sitemaps whose dates are always today.
- FAQs are visible on the page instead of collapsed.
- Author byline and "Reviewed" date on guides and info pages (an E-E-A-T signal).
- Twitter tags, og:image size and alt text, hreflang, max-snippet, skip link, `<main id>`, and a fixed `</nav>` tag.

## The biggest SEO issue I could not fix in code
The site lives at `sidolly20.github.io/zurepick-site/`. That is a shared github.io address in a sub-folder:
1. Google only reads `robots.txt` at the root of the host, so the one in `/zurepick-site/` is ignored.
2. Your brand has no domain of its own to build trust or links on, and links you earn belong to github.io.
3. Moving later loses ranking history.
**Best fix: buy a domain now.** Steps: add it in GitHub Pages settings; add a `CNAME` file with the domain; set `SITE_URL` in `.github/workflows/update.yml` and `SITE` in `site-settings.mjs` to it; add the new domain as a property in Search Console and submit `sitemap.xml`.

## What only you can do
- Backlinks and mentions from other football sites matter most for a new site.
- Watch Search Console "Pages" for "Crawled, currently not indexed".
- About 1,140 old finished-match pages are marked noindex on purpose (they are stale). Keep it that way.
- Confirm the author name and role on the About page match what you want shown on guides.
- I could not load Google Fonts in my sandbox, so check the condensed headline font once deployed.

No change can guarantee rankings. These remove what holds the site back and add the structure Google rewards over weeks.
