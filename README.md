# Gentle Plate

A judgment-free food tracker. Log meals and snacks, get encouragement backed by nutrition research, see your eating rhythm and food groups each week, and get a weekly recipe built from foods you like.

Plain HTML, CSS and JavaScript with no build step. Data is saved only in your browser (localStorage).

- `public/index.html`: the page
- `public/fuel.css`: styles (palette: Cream #F5EFC6, Sceptre Red #4D0E12, Cerulean #A5BCD6, Potting Soil #4A2E27, Java #231815)
- `public/fuel.js`: logging, encouragement, charts, recipes

Hosted on Cloudflare Workers; `wrangler.jsonc` tells it to serve the `public/` folder.

Live at https://bms235-html-4.lpedley.workers.dev
