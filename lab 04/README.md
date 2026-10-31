# Pet Shelter (Task 4: Async React, Effects and API)

A React app that uses the provided fake asynchronous API (Promises, random delays of 0.5 to 3 seconds, random errors, data in `localStorage`). Only `useState` and `useEffect` are used. There are no custom hooks, no debouncing and no fetching libraries, and components never touch `localStorage`.

Starter: https://github.com/leravanna/fake-api

## Run
```
npm install
npm run dev
```

## Deploy (GitHub Pages)
```
npm run deploy
```
Publishes into the `lab-04/` folder of the `gh-pages` branch without touching other projects.

## What the app does
- Loads the list with `useEffect` (search, sort, pagination, Reload button).
- Select a pet to load its full profile asynchronously (11 fields; 8 facts plus name, description and status are shown).
- Create, edit and remove pets.
- Action that updates the selected pet through the API: Reserve, Mark as adopted, Make available.
- Loading, error (with retry), empty and success states for the list and for the details.

## About the API
- `src/api/fakeApi.js` is the original file, unchanged.
- `src/api/settings.js`: only `DATA_KEY` changed (to `pet-shelter-data`).
- `src/api/initial-data-sample.js`: extended from 3 to 11 fields and 14 pets.
- `createItem` only stores `name` and `description`, so `src/api/petsApi.js` saves a new pet with `createItem` followed by `updateItem`.
- Search covers name and description only, because the API filters only those fields.
- To restore the starting data, delete the `pet-shelter-data` entry in the browser's Local Storage and refresh.

## Where the key ideas are (all in `src/App.jsx`)
- **Effect 1** (list): dependencies `[page, sort, search, reloadCount]`, cleanup sets `ignore = true`.
- **Effect 2** (details): dependencies `[selectedId, detailsAttempt]`, cleanup sets `ignore = true`, so quickly switching pets never shows outdated details.
- **Stale closures:** `changeStatus` copies the pet's `id` before the `await` and updates state by that id with functional updates. `busyIds` blocks a second request on the same pet.
