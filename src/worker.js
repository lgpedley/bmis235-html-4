/* Gentle Plate Worker: serves the site from ./public and a tiny sync API.
   /api/sync stores one JSON blob per sync code in Workers KV (binding: SYNC).
   The browser only ever sends a SHA-256 hash of the sync code, never the code itself. */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sync') return handleSync(request, env);
    if (url.pathname === '/api/food') return handleFood(url, ctx);
    return env.ASSETS.fetch(request);
  }
};

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });
const MAX_BYTES = 4 * 1024 * 1024;

async function handleSync(request, env) {
  if (!env.SYNC) return reply({ error: 'not-setup' }, 503);
  const key = (request.headers.get('x-sync-key') || '').toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(key)) return reply({ error: 'bad-key' }, 400);
  const kvKey = 'u:' + key;

  if (request.method === 'GET') {
    const v = await env.SYNC.get(kvKey);
    if (!v) return reply({ error: 'empty' }, 404);
    return new Response(v, { headers: JSON_HEADERS });
  }
  if (request.method === 'PUT') {
    const body = await request.text();
    if (body.length > MAX_BYTES) return reply({ error: 'too-big' }, 413);
    let parsed;
    try { parsed = JSON.parse(body); } catch (e) { return reply({ error: 'bad-json' }, 400); }
    if (!parsed || typeof parsed.data !== 'object') return reply({ error: 'bad-body' }, 400);
    const savedAt = Date.now();
    await env.SYNC.put(kvKey, JSON.stringify({ data: parsed.data, savedAt }));
    return reply({ ok: true, savedAt });
  }
  return reply({ error: 'method' }, 405);
}

/* ---------- /api/food?q=... : packaged-food search (Open Food Facts) ----------
   Searches from the server instead of the browser so it's more reliable:
   results are cached at Cloudflare for a day, and if the main search is busy
   or rate-limited it tries Open Food Facts' second search service. */
const OFF_FIELDS = 'code,product_name,brands,categories_tags,ingredients_text,nutriments,serving_size,serving_quantity,image_thumb_url';
const UA = 'GentlePlate/1.0 (personal food tracker)';

async function handleFood(url, ctx) {
  const q = (url.searchParams.get('q') || '').trim().slice(0, 80);
  if (q.length < 2) return reply({ error: 'short' }, 400);
  const cache = caches.default;
  const cacheKey = new Request('https://cache.gentle-plate/food?q=' + encodeURIComponent(q.toLowerCase()));
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let products = null, lastErr = '';
  const tries = [
    async () => {   // 1) classic search
      const u = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) + '&search_simple=1&action=process&json=1&page_size=8&fields=' + OFF_FIELDS;
      const r = await timed(u); if (!r.ok) throw new Error('cgi ' + r.status);
      return ((await r.json()).products || []);
    },
    async () => {   // 2) newer search service
      const u = 'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) + '&page_size=8&fields=' + OFF_FIELDS;
      const r = await timed(u); if (!r.ok) throw new Error('sal ' + r.status);
      return ((await r.json()).hits || []);
    }
  ];
  for (const t of tries) {
    try { products = await t(); if (products.length) break; } catch (e) { lastErr = String(e.message || e); }
  }
  if (!products) return reply({ error: 'unavailable', detail: lastErr }, 502);
  const clean = products.filter(p => p && p.product_name).slice(0, 6).map(p => ({
    product_name: p.product_name, brands: Array.isArray(p.brands) ? p.brands.join(', ') : (p.brands || ''),
    categories_tags: p.categories_tags || [], ingredients_text: p.ingredients_text || '', nutriments: p.nutriments || {},
    serving_size: p.serving_size || '', serving_quantity: p.serving_quantity || null, image_thumb_url: p.image_thumb_url || ''
  }));
  const res = new Response(JSON.stringify({ products: clean }), { headers: Object.assign({}, JSON_HEADERS, { 'cache-control': 'public, max-age=86400' }) });
  if (clean.length && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
function timed(u, ms = 8000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  return fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, signal: ac.signal }).finally(() => clearTimeout(t));
}
