# Recipe Finder (Midterm)

React SPA built on the public [TheMealdb API](https://www.themealdb.com/api.php). Loads the full catalogue (one request per letter, several hundred recipes) and adds its own features on top.

## Features
- List and detail views, with a second API call for "More from this category"
- Debounced search (dish or ingredient), filters (category, cuisine, difficulty, saved only), sorting, pagination
- Derived difficulty (Easy / Medium / Hard) computed from the ingredient count
- Controlled form to add your own recipes (stored in localStorage, since the public API is read-only)
- Saved recipes (favorites), persisted in localStorage
- Loading, error (with retry), empty and success states

## Run
```
npm install
npm run dev
```

## Deploy (GitHub Pages)
```
npm run deploy
```
Publishes into the `midterm/` folder of the `gh-pages` branch without touching other projects.

## Where the key ideas live
- `hooks.js`: `useRecipes` (fetch + AbortController cleanup + retry via effect dependency), `useDebouncedValue` (timer cleanup), `usePersistedState`
- `RecipeBrowser.jsx`: owns search/filter/sort/page state; stays mounted (hidden) while a recipe is open, so its state is preserved
- `App.jsx`: `key={selected.id}` on `RecipeDetail` resets its state when another recipe is opened
- `RelatedRecipes.jsx`: effect with `[category]` dependency and abort cleanup
