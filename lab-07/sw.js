/* Service worker for Pet Shelter.
 *
 * This file is a TEMPLATE. During `npm run build`, build/sw-plugin.js copies it to dist/sw.js and
 * replaces the placeholders below (version, list of files to pre-cache, API hosts, cache limits).
 *
 * Lifecycle:  install  -> pre-cache the app shell
 *             waiting  -> a new version waits until the user presses "Update" in the app
 *             activate -> delete old caches, take control of open pages
 *             fetch    -> answer requests with one of the strategies below
 */

const VERSION = "849b815dcb";
const PRECACHE_URLS = ["assets/AboutPage-CB86yjNH.js","assets/BreedDetailsPage-BPL6LoyF.js","assets/BreedsPage-CBjIA7dT.js","assets/CachedNotice-Cgil_UJq.js","assets/DashboardPage-BRpd4CSq.js","assets/GoogleButton-BNywlwZV.js","assets/LoginPage-DYMEFjW-.js","assets/NotFoundPage-B-Wk2cyF.js","assets/Notice-CCeWDp9o.js","assets/OfflinePage-Cn_qNmoE.js","assets/Pagination-DrUwRsCr.js","assets/PetDetailsPage-cQNgnVXN.js","assets/PetsPage-BHjQl7OT.js","assets/ProfilePage-CK1yW4d7.js","assets/SignupPage-CwWpwFxn.js","assets/constants-CVTW0hhp.js","assets/format-D2vbSA3l.js","assets/hero-CiN3jvf6.svg","assets/index-8NEScp2N.css","assets/index-m9j5Rrho.js","assets/useQuery-IisNATi_.js","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","index.html","manifest.json","offline.html"];
const API_ORIGINS = ["https://dog.ceo"];
const IMAGE_ORIGINS = ["https://images.dog.ceo"];
const MAX_API_ENTRIES = 50;
const MAX_IMAGE_ENTRIES = 60;
const MAX_STATIC_ENTRIES = 30;

const FONT_STYLE_ORIGINS = ["https://fonts.googleapis.com"];
const FONT_FILE_ORIGINS = ["https://fonts.gstatic.com"];
const NETWORK_TIMEOUT_MS = 4000;

// Cache names. The pre-cache name contains the build version, so every build gets its own cache.
// The runtime caches keep their names (and their content) between builds.
const PRECACHE = `shelter-precache-${VERSION}`;
const STATIC_CACHE = "shelter-static-v1"; // fonts
const IMAGE_CACHE = "shelter-images-v1"; // pictures
const API_CACHE = "shelter-api-v1"; // public API answers
const CURRENT_CACHES = [PRECACHE, STATIC_CACHE, IMAGE_CACHE, API_CACHE];

// Full address of a file inside the app's folder (the service worker's scope).
const inScope = (path) => new URL(path, self.registration.scope).href;

// ---------- install: pre-cache the application shell ----------
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

// ---------- activate: remove outdated caches ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("shelter-") && !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name))
      );
      await self.clients.claim(); // start controlling the open pages right away
    })()
  );
});

// ---------- messages from the page ----------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting(); // the user pressed "Update"
});

// ---------- fetch: choose a strategy ----------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // never touch POST/PUT/DELETE
  if (request.headers.has("authorization")) return; // private requests are never cached

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith("/ping.txt")) return; // the connectivity check must always use the network
    if (isPageNavigation(request, url)) return event.respondWith(handleNavigation(event, request, url));
    return event.respondWith(handleSameOrigin(event, request));
  }

  // Only a short list of other websites is handled. Everything else (Firebase login, Google, ...)
  // is left alone, so tokens and private data can never end up in our caches.
  if (API_ORIGINS.includes(url.origin)) {
    const forceNetwork = ["no-cache", "reload", "no-store"].includes(request.cache);
    if (url.pathname.endsWith("/breeds/list/all") && !forceNetwork) {
      return event.respondWith(staleWhileRevalidate(event, request, API_CACHE, MAX_API_ENTRIES)); // lists
    }
    return event.respondWith(networkFirst(event, request, API_CACHE, MAX_API_ENTRIES)); // details
  }
  if (IMAGE_ORIGINS.includes(url.origin)) return event.respondWith(cacheFirst(event, request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
  if (FONT_FILE_ORIGINS.includes(url.origin)) return event.respondWith(cacheFirst(event, request, STATIC_CACHE, MAX_STATIC_ENTRIES));
  if (FONT_STYLE_ORIGINS.includes(url.origin)) return event.respondWith(staleWhileRevalidate(event, request, STATIC_CACHE, MAX_STATIC_ENTRIES));
});

// ---------- navigation (opening or refreshing a page) ----------
// The app is a single page: every address is the same index.html, so it is served from the pre-cache.
// This works offline and always matches the JS/CSS of the same version.
function isPageNavigation(request, url) {
  if (request.mode !== "navigate") return false;
  return !/\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.endsWith("/index.html");
}

async function handleNavigation(event, request, url) {
  const shell = await caches.match(inScope("index.html"), { cacheName: PRECACHE });
  if (shell) return shell;
  // The shell is missing (should not happen after install): try the network, then show the offline page.
  try {
    return await fetch(request);
  } catch (error) {
    const offlinePage = await caches.match(inScope("offline.html"), { cacheName: PRECACHE });
    return offlinePage || Response.error();
  }
}

// Files of the app itself: the pre-cache first, then the network.
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

// ---------- strategies ----------

// CACHE FIRST: use the saved copy; only go to the network if there is none. For pictures and fonts.
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

// NETWORK FIRST: ask the network; if it fails or is too slow, use the saved copy. For API details.
async function networkFirst(event, request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const network = fetch(request).then((response) => {
    if (response.status >= 500) throw new Error("server error"); // treat like "no answer"
    if (response.ok && isCacheable(response)) event.waitUntil(save(cache, request, response.clone(), maxEntries, true));
    return response;
  });
  network.catch(() => {}); // avoid an "unhandled rejection" message if we stopped waiting
  try {
    const saved = await cache.match(request);
    if (!saved) return await network; // nothing saved yet: wait for the network
    return await Promise.race([network, rejectAfter(NETWORK_TIMEOUT_MS)]); // a copy exists: do not wait forever
  } catch (error) {
    const saved = await cache.match(request);
    return saved ? markAsSaved(saved) : offlineResponse();
  }
}

// STALE WHILE REVALIDATE: show the saved copy at once, refresh it in the background. For API lists.
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

// ---------- helpers ----------

// Do not store answers that say they are private.
function isCacheable(response) {
  const control = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(control);
}

const rejectAfter = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

// Save a copy and keep the cache small: when there are too many entries the oldest ones are deleted.
async function save(cache, request, response, maxEntries, stamp) {
  await cache.put(request, stamp ? withHeaders(response, { "x-sw-fetched-at": String(Date.now()) }) : response);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - maxEntries; i++) await cache.delete(keys[i]); // keys are in insertion order
}

// A copy of a response with extra headers. The page reads them to know the data came from the cache.
function withHeaders(response, extra) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const markAsSaved = (response) => withHeaders(response, { "x-sw-from-cache": "1" });

// What the app gets when there is no network and no saved copy. The app shows a normal error message.
const offlineResponse = () =>
  new Response(JSON.stringify({ status: "error", message: "offline", code: 503 }), {
    status: 503,
    headers: { "content-type": "application/json", "x-sw-offline": "1" },
  });
