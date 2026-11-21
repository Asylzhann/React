# Lab 07 – Pet Shelter as a PWA

Lab 06 (routes, filters, CRUD, Firebase auth, in-memory cache) + installable PWA + public Dog CEO API (`/breeds`, `/breeds/:id`).

## Run
```
npm install
# .env.local with VITE_FIREBASE_* (same as lab 06)
npm run dev            # service worker is OFF in dev
npm run build && npm run preview   # test the PWA here (service worker only in production build)
```
Deploy: `git add "lab 07"`, then `npm run deploy` (goes to `/React/lab-07/`, keeps the other labs).

## PWA files
| File | Job |
|---|---|
| `public/manifest.json` | name, short_name, start_url, scope, display standalone, colors, 192/512 icons (+ maskable) |
| `build/sw-template.js` | the service worker; `build/sw-plugin.js` fills in the file list + version after `vite build` and writes `dist/sw.js` |
| `public/offline.html` | static offline page, precached, works without the app |
| `src/pwa/registerSW.js` | registers the worker, detects updates |
| `src/context/PwaContext.jsx` | `online` (real probe of `ping.txt`, not only `navigator.onLine`), update state, install prompt |
| `src/pages/OfflinePage.jsx` | `/offline` route with Retry Connection |

## Caches
| Cache | What | Strategy | Limit |
|---|---|---|---|
| `shelter-precache-<hash>` | built JS/CSS, index.html, icons, manifest, offline.html | precache on install, cache-first | replaced every build, old one deleted on activate |
| `shelter-static-v1` | same-origin images/fonts, Google Fonts | cache-first (stylesheet: stale-while-revalidate) | – |
| `shelter-images-v1` | dog photos | cache-first | 60 |
| `shelter-api-v1` | `/breeds/list/all` | stale-while-revalidate | 50 |
| | breed details | network-first (4 s timeout) | 50 |

Never cached: non-GET, requests with `Authorization`, Firebase/Google auth origins (only an allow-list of origins is touched), responses with `no-store`/`private`, `ping.txt`.

## Update
New build → new `sw.js` (hash changes) → installs and **waits** → toast "new version" → user presses Update → page sends `SKIP_WAITING` → worker activates, deletes old caches → page reloads. localStorage / Firebase session are untouched.

## Test in DevTools
Application → Manifest (installable), Service Workers (activated), Cache Storage; Network → Offline, reload each page; Lighthouse → PWA.
Mobile: device toolbar 320 / 375 / 414 / 768, rotate.
