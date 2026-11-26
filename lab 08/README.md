# Lab 08 – Pet Shelter with Redux Toolkit

Lab 07 (routes, filters, CRUD, Firebase auth, PWA, offline) refactored to use **Redux Toolkit** for global state and async operations.
Authentication stays in `AuthContext`. Temporary UI state (open form, "confirm remove", typed search text) stays in components.

## Run
```
npm install
# .env.local with VITE_FIREBASE_* (same as before)
npm run dev                          # service worker is OFF in dev
npm run build && npm run preview     # test the PWA here
npm run deploy                       # -> /React/lab-08/
```

## Redux structure
```
src/store/
  index.js                 configureStore({ pets, breeds, notices })   (Provider is in main.jsx)
  helpers.js               FRESH_FOR (30 s), shouldFetch(), errorText()
  pets/petsSlice.js        slice + 5 thunks
  pets/petsSelectors.js    selectors
  breeds/breedsSlice.js    slice + 2 thunks
  breeds/breedsSelectors.js
  notices/noticesSlice.js  slice (messages shown on every page)
src/services/              API calls only (service.js, breedsService.js, authService.js)
src/hooks/                 usePets, useBreeds, useRefreshOnReconnect (connect pages to the store)
src/pages, src/components  UI only
```

### Slices (feature-based)
| Slice | State | Purpose |
|---|---|---|
| `pets` | `ids/entities` (entity adapter: ONE copy of every pet), `list {status,error,requestId,loadedAt}`, `details {id: {status,error,requestId,loadedAt}}` | pets list, pet details, create/update/delete |
| `breeds` | `list {status,error,requestId,loadedAt,items,fromCache,cachedAt}`, `details {id: {…, data}}` | public Dog CEO API (cached by the service worker) |
| `notices` | `items: [{id, kind, text}]` | success/error messages that must survive a page change ("Luna was added." appears on the details page) |

### Thunks (`createAsyncThunk`)
| Thunk | Kind | Notes |
|---|---|---|
| `fetchPets` | list | `condition` skips the request if one is running or data is fresh (30 s); `{force:true}` always fetches |
| `fetchPetById({id})` | details | invalid id → rejected without a request |
| `createPet`, `updatePet`, `deletePet` | mutations | after each one the list is fetched again (`finally`) |
| `fetchBreedList`, `fetchBreedDetails` | list / details | `fresh:true` asks the network instead of the service worker's saved copy |

`pending / fulfilled / rejected` are handled in `extraReducers` of each slice.
- **Loading / error / empty / retry:** `status` + `error` in state; pages show a loading message, an error with **Try again** (`force: true`), or an empty message.
- **Stale requests:** `pending` stores `meta.requestId`; `fulfilled`/`rejected` are ignored when their `requestId` is not the stored one.
- **No duplicate requests:** `condition` + 30 s freshness.
- **Refresh after mutations:** the mutation thunks dispatch `fetchPets({ force: true })` in `finally`.

### Selectors
| Selector | Type | Used by |
|---|---|---|
| `selectAllPets`, `selectPetById` | entity adapter (memoized by RTK) | pages, other selectors |
| `selectPetsListStatus/Error/Loaded`, `selectPetDetails` | simple | hooks |
| **`selectFilteredPets(state, filters)`** | `createSelector` – search, species, status, shelter, sort | PetsPage |
| **`selectDashboard(state, shelter)`** | `createSelector` – counts, groups, average age, latest | DashboardPage |
| **`selectFilteredBreeds(state, filters)`** | `createSelector` – search, only with sub-breeds | BreedsPage |
| `selectNotices`, `selectBreedList`, `selectBreedEntry` | simple | components/hooks |

### What stayed the same
URL search parameters (`?q=&species=&status=&shelter=&sort=&page=`) are still the source of truth for filters and pagination (not copied into Redux). Search is **debounced** (400 ms, `SearchInput`). Protected routes, Firebase login, PWA (manifest, service worker, runtime caching, offline page) are unchanged. Cache names of the service worker start with `redux-` so they do not clash with Lab 07 on the same website.
