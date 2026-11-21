# Gentle Plate

A judgment-free food tracker. Log meals and snacks, get encouragement backed by nutrition research, see your eating rhythm and food groups each week, and get a weekly recipe built from foods you like.

Plain HTML, CSS and JavaScript with no build step. Data is saved only in your browser (localStorage).

- `public/index.html`: the page
- `public/fuel.css`: styles (magazine + scrapbook style, Bubblegum look: forest green, bubblegum pink, olive, maroon)
- `public/fuel.js`: logging, encouragement, charts, recipes

Hosted on Cloudflare Workers. `wrangler.jsonc` serves the `public/` folder and runs `src/worker.js`, which adds a small `/api/sync` endpoint backed by Workers KV (binding `SYNC`) for syncing between devices.

Live at https://bms235-html-4.lpedley.workers.dev
