# Pet Shelter: authentication and caching (Task 6)

React + React Router + Firebase Authentication + a small cache for server data.
Routes: `/`, `/about`, `/pets`, `/pets/:id`, `/dashboard`, `/login`, `/signup`, `/profile` (logged-in users only), `*`.

## Run it

    npm install
    cp .env.example .env.local      # then fill in your Firebase values
    npm run dev

## Firebase setup
1. Firebase console > create a project > Build > Authentication > Get started.
2. Sign-in method: enable **Email/Password** and **Google**.
3. Project settings > Your apps > add a Web app > copy the config values into `.env.local`
   (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, ... see `.env.example`).
4. Authentication > Settings > **Authorized domains**: add `asylzhann.github.io` (needed for Google sign-in on the deployed site; `localhost` is already there).

`.env.local` is in `.gitignore`. Vite copies the `VITE_` values into the build when you run `npm run build`, so deploy from the computer that has `.env.local`:

    npm run deploy        # builds, then publishes to the lab-06 folder of gh-pages

## Authentication
- `src/firebase.js` initializes Firebase from the `VITE_` variables (if they are missing the app shows a message instead of crashing).
- `src/services/authService.js` is the only file that calls Firebase Auth: signup, login, Google sign-in, logout, `onAuthStateChanged`, and readable error messages.
- `src/context/AuthContext.jsx` has `AuthProvider` and `useAuth()` (`user`, `loading`, `error`, `signup`, `login`, `loginWithGoogle`, `logout`).
- `src/components/ProtectedRoute.jsx` guards `/profile`: it waits while `loading`, then redirects to `/login` if nobody is logged in. After logging in the user is sent back to the page they wanted.
- Sessions persist after refresh because persistence is set to `browserLocalPersistence` and the app waits for the first `onAuthStateChanged` answer before deciding what to show.
- The NavBar shows Login / Signup when logged out and Profile / Logout when logged in.

## Caching strategy
Server data is cached by `src/services/cache.js` and read through the `useQuery` hook (`src/hooks`). Pages use `usePetList`, `usePet`, `createPet`, `updatePet` and `deletePet` from `src/hooks/usePets.js`; they never call the API directly.

- **Query keys:** `["pets", "list", { search, sort }]` for lists (the dashboard uses the same list key) and `["pets", "detail", id]` for one pet. Different keys are cached separately.
- **Expiration:** an entry is fresh for **30 seconds**. While fresh, the data is shown instantly and no request is made. After 30 seconds the entry is deleted and loaded again on the next read.
- **Shared requests:** if two components ask for the same key at the same time, they share one request.
- **Invalidation:** after every create, update or delete (successful or not) all cache entries whose key starts with `["pets"]` are deleted, so the next read loads fresh data. The Reload button and "Try again" delete the entry of their own query before loading.
- **Outdated requests:** a request that was started for an old key is ignored when it finishes (cleanup flag in `useQuery`). A request that was running when `invalidate` was called does not write its result into the cache.
- **States:** every data page shows loading, error (with Try again) and empty states.

## Folders
`pages/` pages, `components/` reusable UI, `context/` AuthContext, `hooks/` useQuery + usePets, `services/` API, auth and cache logic, `api/` the provided fake API, `styles/`.
