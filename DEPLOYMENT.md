# ZurePicks frontend deployment

This folder is the static website package. It includes the existing SEO pages and data snapshots, plus homepage search and API-first loading with a snapshot fallback.

## Render Static Site

- Build command: leave empty (or `echo "Static site ready"`).
- Publish directory: `.` (the folder containing `index.html`).
- No secrets or environment variables are required for the static frontend.

## Connect to the backend

After deploying the backend Web Service, open `api-config.js` and set:

```js
window.ZUREPICKS_API_BASE = 'https://YOUR-BACKEND-SERVICE.onrender.com';
```

Use your actual backend URL, with no trailing slash. Commit/redeploy the static site. Until then, the homepage will try the same-origin API and automatically fall back to the bundled `data/*.json` snapshots.

## Important domain note

Update the canonical URL and sitemap URLs if you deploy this site on a different domain from the current GitHub Pages URL. Do not add provider API keys to this static folder.
