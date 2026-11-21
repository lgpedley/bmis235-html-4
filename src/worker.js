/* Gentle Plate Worker: serves the site from ./public and a tiny sync API.
   /api/sync stores one JSON blob per sync code in Workers KV (binding: SYNC).
   The browser only ever sends a SHA-256 hash of the sync code, never the code itself. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sync') return handleSync(request, env);
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
