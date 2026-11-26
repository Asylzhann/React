// TEMPLATE: `npm run build` (build/sw-plugin.js) fills in the placeholders and writes dist/sw.js.

const VERSION = "__VERSION__";
const PRECACHE_URLS = /*__PRECACHE_URLS__*/ [];
const API_ORIGINS = /*__API_ORIGINS__*/ [];
const IMAGE_ORIGINS = /*__IMAGE_ORIGINS__*/ [];
const MAX_API_ENTRIES = /*__MAX_API_ENTRIES__*/ 50;
const MAX_IMAGE_ENTRIES = /*__MAX_IMAGE_ENTRIES__*/ 60;
const MAX_STATIC_ENTRIES = 30;

const FONT_STYLE_ORIGINS = ["https://fonts.googleapis.com"];
const FONT_FILE_ORIGINS = ["https://fonts.gstatic.com"];
const NETWORK_TIMEOUT_MS = 4000;

// The pre-cache name has the build version; the runtime caches keep their names between builds.
const PRECACHE = `redux-precache-${VERSION}`;
const STATIC_CACHE = "redux-static-v1";
const IMAGE_CACHE = "redux-images-v1";
const API_CACHE = "redux-api-v1";
const CURRENT_CACHES = [PRECACHE, STATIC_CACHE, IMAGE_CACHE, API_CACHE];

const inScope = (path) => new URL(path, self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // cache: "reload" skips the browser's HTTP cache, so we never pre-cache an outdated copy.
      await cache.addAll(PRECACHE_URLS.map((path) => new Request(inScope(path), { cache: "reload" })));
      // No skipWaiting() here: the new version waits until the user chooses to update.
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("redux-") && !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.headers.has("authorization")) return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith("/ping.txt")) return;
    if (isPageNavigation(request, url)) return event.respondWith(handleNavigation(event, request, url));
    return event.respondWith(handleSameOrigin(event, request));
  }

  // Only these other websites are handled. Firebase / Google login is left alone, so tokens are never cached.
  if (API_ORIGINS.includes(url.origin)) {
    const forceNetwork = ["no-cache", "reload", "no-store"].includes(request.cache);
    if (url.pathname.endsWith("/breeds/list/all") && !forceNetwork) {
      return event.respondWith(staleWhileRevalidate(event, request, API_CACHE, MAX_API_ENTRIES));
    }
    return event.respondWith(networkFirst(event, request, API_CACHE, MAX_API_ENTRIES));
  }
  if (IMAGE_ORIGINS.includes(url.origin)) return event.respondWith(cacheFirst(event, request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
  if (FONT_FILE_ORIGINS.includes(url.origin)) return event.respondWith(cacheFirst(event, request, STATIC_CACHE, MAX_STATIC_ENTRIES));
  if (FONT_STYLE_ORIGINS.includes(url.origin)) return event.respondWith(staleWhileRevalidate(event, request, STATIC_CACHE, MAX_STATIC_ENTRIES));
});

// Single page app: every address is the same index.html, served from the pre-cache.
function isPageNavigation(request, url) {
  if (request.mode !== "navigate") return false;
  return !/\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.endsWith("/index.html");
}

async function handleNavigation(event, request, url) {
  const shell = await caches.match(inScope("index.html"), { cacheName: PRECACHE });
  if (shell) return shell;
  try {
    return await fetch(request);
  } catch (error) {
    const offlinePage = await caches.match(inScope("offline.html"), { cacheName: PRECACHE });
    return offlinePage || Response.error();
  }
}

async function handleSameOrigin(event, request) {
  // ignoreVary / ignoreSearch: a saved file is still the right file even if a header or "?query" differs.
  const precached =
    (await caches.match(request, { cacheName: PRECACHE })) ||
    (await caches.match(request.url, { cacheName: PRECACHE, ignoreVary: true, ignoreSearch: true }));
  if (precached) return precached;
  if (request.destination === "image" || request.destination === "font") {
    return cacheFirst(event, request, STATIC_CACHE, MAX_STATIC_ENTRIES);
  }
  try {
    return await fetch(request);
  } catch (error) {
    return Response.error();
  }
}


// Cache first: pictures and fonts.
async function cacheFirst(event, request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(request);
  if (saved) return saved;
  try {
    const response = await fetch(request);
    // Pictures from other websites arrive "opaque" (we cannot read them, but we can show them).
    if ((response.ok || response.type === "opaque") && isCacheable(response)) {
      event.waitUntil(save(cache, request, response.clone(), maxEntries, false));
    }
    return response;
  } catch (error) {
    return Response.error();
  }
}

// Network first: API details.
async function networkFirst(event, request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const network = fetch(request).then((response) => {
    if (response.status >= 500) throw new Error("server error");
    if (response.ok && isCacheable(response)) event.waitUntil(save(cache, request, response.clone(), maxEntries, true));
    return response;
  });
  network.catch(() => {});
  try {
    const saved = await cache.match(request);
    if (!saved) return await network;
    return await Promise.race([network, rejectAfter(NETWORK_TIMEOUT_MS)]);
  } catch (error) {
    const saved = await cache.match(request);
    return saved ? markAsSaved(saved) : offlineResponse();
  }
}

// Stale while revalidate: API lists.
async function staleWhileRevalidate(event, request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const saved = await cache.match(request);
  const refresh = fetch(request).then((response) => {
    if (response.ok && isCacheable(response)) event.waitUntil(save(cache, request, response.clone(), maxEntries, true));
    return response;
  });
  if (saved) {
    event.waitUntil(refresh.catch(() => {}));
    return markAsSaved(saved);
  }
  try {
    return await refresh;
  } catch (error) {
    return offlineResponse();
  }
}


function isCacheable(response) {
  const control = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(control);
}

const rejectAfter = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

// Save a copy; delete the oldest entries above the limit.
async function save(cache, request, response, maxEntries, stamp) {
  await cache.put(request, stamp ? withHeaders(response, { "x-sw-fetched-at": String(Date.now()) }) : response);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - maxEntries; i++) await cache.delete(keys[i]);
}

function withHeaders(response, extra) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const markAsSaved = (response) => withHeaders(response, { "x-sw-from-cache": "1" });

const offlineResponse = () =>
  new Response(JSON.stringify({ status: "error", message: "offline", code: 503 }), {
    status: 503,
    headers: { "content-type": "application/json", "x-sw-offline": "1" },
  });
