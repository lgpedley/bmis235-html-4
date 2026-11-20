# Gentle Plate

A judgment-free food tracker. Log meals and snacks, get encouragement backed by nutrition research, see your eating rhythm and food groups each week, and get a weekly recipe built from foods you like.

Plain HTML, CSS and JavaScript with no build step. Data is saved only in your browser (localStorage).

- `public/index.html`: the page
- `public/fuel.css`: styles (three edgy editorial looks: Cherry Noir, Moody Moss, Ink & Paper; switch with the dots in the header)
- `public/fuel.js`: logging, encouragement, charts, recipes

Hosted on Cloudflare Workers; `wrangler.jsonc` tells it to serve the `public/` folder.

Live at https://bms235-html-4.lpedley.workers.dev
