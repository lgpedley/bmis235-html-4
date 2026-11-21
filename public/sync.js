/* =====================================================================
   Gentle Plate · sync between devices
   - Each device keeps working offline from its own localStorage.
   - With a sync code, changes are merged with the copy saved in
     Cloudflare KV (via /api/sync), record by record, newest wins.
     Deleting something on one device deletes it everywhere.
   - Only a SHA-256 hash of the sync code is ever sent to the server.
   ===================================================================== */
(function () {
  'use strict';
  if (!window.GP) return;
  const API = '/api/sync';
  const CODE_KEY = 'gentleplate.sync.code';
  const LAST_KEY = 'gentleplate.sync.last';
  const WORDS = ['peach', 'olive', 'river', 'maple', 'berry', 'honey', 'cocoa', 'sage', 'clover', 'plum', 'fig', 'daisy', 'pepper', 'sunny', 'cozy', 'mellow',
    'velvet', 'butter', 'cherry', 'sprout', 'meadow', 'pebble', 'cloud', 'lemon', 'basil', 'cider', 'acorn', 'willow', 'ember', 'lilac', 'mango', 'tulip'];

  // ---- which parts of the data merge record-by-record ----
  const LISTS = {
    entries:   (x) => x.id,
    favorites: (x) => x.id,
    foods:     (x) => String(x.name).toLowerCase(),
    extras:    (x) => String(x.name).toLowerCase(),
    stickers:  (x) => x.key + '@' + x.ts
  };
  const MAPS = ['plan', 'grocery', 'groceryExtra'];           // keyed by day / week
  const SKIP = new Set(Object.keys(LISTS).concat(MAPS, ['sync']));
  const DAY = 864e5, KEEP_TOMBSTONES = 90 * DAY;

  function hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function misc(s) { const o = {}; Object.keys(s).sort().forEach(k => { if (!SKIP.has(k)) o[k] = s[k]; }); return o; }
  function records(s) {
    const out = {};
    Object.keys(LISTS).forEach(c => (s[c] || []).forEach(x => { if (x) out[c + ':' + LISTS[c](x)] = x; }));
    MAPS.forEach(m => Object.keys(s[m] || {}).forEach(k => { out[m + ':' + k] = s[m][k]; }));
    return out;
  }
  // record when each record last changed (or was deleted) on this device
  function stamp(s) {
    const now = Date.now();
    const meta = s.sync = s.sync || {};
    meta.snap = meta.snap || {}; meta.at = meta.at || {}; meta.del = meta.del || {};
    const recs = records(s);
    Object.keys(recs).forEach(k => {
      const h = hash(JSON.stringify(recs[k]));
      if (meta.snap[k] !== h) { meta.snap[k] = h; meta.at[k] = now; delete meta.del[k]; }
    });
    Object.keys(meta.snap).forEach(k => { if (!(k in recs)) { meta.del[k] = now; delete meta.snap[k]; delete meta.at[k]; } });
    const mh = hash(JSON.stringify(misc(s)));
    if (meta.miscHash !== mh) { meta.miscHash = mh; meta.miscAt = now; }
    Object.keys(meta.del).forEach(k => { if (now - meta.del[k] > KEEP_TOMBSTONES) delete meta.del[k]; });
    return s;
  }
  // combine two copies: for every record keep whichever change (edit or delete) is newest
  function merge(L, R) {
    const lm = L.sync || {}, rm = R.sync || {};
    const lr = records(L), rr = records(R);
    const base = (lm.miscAt || 0) >= (rm.miscAt || 0) ? L : R;
    const out = Object.assign({}, misc(base));
    const meta = { snap: {}, at: {}, del: {}, miscHash: hash(JSON.stringify(misc(base))), miscAt: Math.max(lm.miscAt || 0, rm.miscAt || 0) };
    const keys = new Set([...Object.keys(lr), ...Object.keys(rr), ...Object.keys(lm.del || {}), ...Object.keys(rm.del || {})]);
    const winners = {};
    keys.forEach(k => {
      const opts = [];
      if (k in lr) opts.push({ t: (lm.at || {})[k] || 0, v: lr[k] });
      if (k in rr) opts.push({ t: (rm.at || {})[k] || 0, v: rr[k] });
      if ((lm.del || {})[k]) opts.push({ t: lm.del[k], del: true });
      if ((rm.del || {})[k]) opts.push({ t: rm.del[k], del: true });
      opts.sort((a, b) => b.t - a.t || (a.del ? 1 : -1));   // newest first; on a tie, keep the data
      const w = opts[0];
      if (w.del) meta.del[k] = w.t;
      else { winners[k] = w.v; meta.at[k] = w.t; meta.snap[k] = hash(JSON.stringify(w.v)); }
    });
    // rebuild lists (keep this device's order, then anything new from the other device)
    Object.keys(LISTS).forEach(c => {
      const seen = new Set(), list = [];
      [L, R].forEach(src => (src[c] || []).forEach(x => { const k = c + ':' + LISTS[c](x); if (k in winners && !seen.has(k)) { seen.add(k); list.push(winners[k]); } }));
      out[c] = list;
    });
    out.entries.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    MAPS.forEach(m => { out[m] = {}; Object.keys(winners).filter(k => k.startsWith(m + ':')).forEach(k => { out[m][k.slice(m.length + 1)] = winners[k]; }); });
    out.sync = meta;
    return out;
  }

  // ---- talking to the server ----
  let code = null, keyHash = null, busy = false, again = false, timer = null, status = 'off', lastSync = null;
  try { code = localStorage.getItem(CODE_KEY); lastSync = +localStorage.getItem(LAST_KEY) || null; } catch (e) {}
  async function sha256(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const normalize = (c) => String(c).trim().toLowerCase().replace(/\s+/g, '-');

  async function syncNow() {
    if (!code) return;
    if (busy) { again = true; return; }
    busy = true; setStatus('syncing');
    try {
      keyHash = keyHash || await sha256('gentle-plate:' + normalize(code));
      const local = stamp(GP.get());
      GP.saveQuiet(local);
      const res = await fetch(API, { headers: { 'X-Sync-Key': keyHash }, cache: 'no-store' });
      if (res.status === 503) { setStatus('not-ready'); return; }
      let merged = local;
      if (res.ok) { const body = await res.json(); if (body && body.data) merged = merge(local, stamp(body.data)); }
      else if (res.status !== 404) throw new Error('get ' + res.status);
      if (JSON.stringify(merged) !== JSON.stringify(local)) GP.replace(merged);
      const put = await fetch(API, { method: 'PUT', headers: { 'X-Sync-Key': keyHash, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: merged }) });
      if (put.status === 503) { setStatus('not-ready'); return; }
      if (!put.ok) throw new Error('put ' + put.status);
      lastSync = Date.now(); try { localStorage.setItem(LAST_KEY, String(lastSync)); } catch (e) {}
      setStatus('ok');
    } catch (e) {
      setStatus(navigator.onLine === false ? 'offline' : 'error');
    } finally {
      busy = false;
      if (again) { again = false; setTimeout(syncNow, 300); }
    }
  }
  function changed() { if (!code) return; clearTimeout(timer); timer = setTimeout(syncNow, 1500); }

  // ---- settings UI ----
  const esc = GP.esc;
  function setStatus(s) { status = s; render(); }
  function newCode() {
    const r = new Uint32Array(4); crypto.getRandomValues(r);
    return WORDS[r[0] % WORDS.length] + '-' + WORDS[r[1] % WORDS.length] + '-' + WORDS[r[2] % WORDS.length] + '-' + String(1000 + (r[3] % 9000));
  }
  function connect(c) {
    code = normalize(c); keyHash = null;
    try { localStorage.setItem(CODE_KEY, code); } catch (e) {}
    render(); syncNow();
  }
  function render() {
    const box = document.getElementById('sync-box'); if (!box) return;
    if (!code) {
      box.innerHTML = '<p class="muted">Keep the same logs, plans and favorites on your phone, the home-screen app and your computer.</p>'
        + '<button type="button" class="btn small" id="sync-start">Turn on sync</button>'
        + '<details class="sync-join"><summary>I already have a sync code</summary><div class="row">'
        + '<input type="text" id="sync-code-in" placeholder="e.g. peach-olive-river-4821" autocomplete="off" autocapitalize="off" spellcheck="false">'
        + '<button type="button" class="btn small" id="sync-join">Connect</button></div>'
        + '<p class="muted">Anything already on this device is kept and combined with your other devices.</p></details>';
      return;
    }
    const when = lastSync ? new Date(lastSync).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : 'not yet';
    const msg = {
      syncing: '🔄 Syncing…',
      ok: '✓ Synced · last ' + when,
      'not-ready': '⏳ Sync is almost ready. It needs one setup step in Cloudflare, then it starts on its own.',
      offline: '📴 Offline. Your changes are saved here and will sync when you\'re back online.',
      error: '⚠️ Couldn\'t sync just now. It will try again.',
      off: lastSync ? '✓ Last synced ' + when : 'Connecting…'
    }[status] || '';
    box.innerHTML = '<p class="sync-status">' + esc(msg) + '</p>'
      + '<p>Your sync code: <code class="sync-code" id="sync-code">' + (box.dataset.show ? esc(code) : '•••• •••• ••••') + '</code> '
      + '<button type="button" class="linkish" id="sync-show">' + (box.dataset.show ? 'hide' : 'show') + '</button></p>'
      + '<p class="muted">Enter this code on your other devices (My foods → Settings → I already have a sync code). Keep it private: it works like a password.</p>'
      + '<div class="pb-actions"><button type="button" class="btn small" id="sync-now">Sync now</button>'
      + '<button type="button" class="btn small ghost inline" id="sync-copy">Copy code</button>'
      + '<button type="button" class="linkish" id="sync-off">Turn off on this device</button></div>';
  }
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button'); if (!t) return;
    const box = document.getElementById('sync-box');
    if (t.id === 'sync-start') { connect(newCode()); box.dataset.show = '1'; render(); GP.toast('Sync is on. Your code is below'); }
    else if (t.id === 'sync-join') { const v = document.getElementById('sync-code-in').value.trim(); if (v.split('-').length < 3) { alert('That doesn\'t look like a sync code. It should look like peach-olive-river-4821.'); return; } connect(v); }
    else if (t.id === 'sync-show') { if (box.dataset.show) delete box.dataset.show; else box.dataset.show = '1'; render(); }
    else if (t.id === 'sync-now') syncNow();
    else if (t.id === 'sync-copy') { (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => GP.toast('Code copied'), () => { box.dataset.show = '1'; render(); }); }
    else if (t.id === 'sync-off') {
      if (!confirm('Stop syncing on this device? Your data stays here, and your other devices keep syncing.')) return;
      code = null; keyHash = null; try { localStorage.removeItem(CODE_KEY); } catch (e) {} status = 'off'; render();
    }
  });

  window.GPSync = { changed, syncNow, _merge: merge, _stamp: stamp };
  render();
  if (code) syncNow();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(); });
  window.addEventListener('online', syncNow);
  setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 60000);
})();
