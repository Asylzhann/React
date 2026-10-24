import { useState } from "react";
import { useDebouncedValue } from "../hooks";
import SearchBar from "./SearchBar";
import SelectField from "./SelectField";
import RecipeCard from "./RecipeCard";
import Pagination from "./Pagination";
import StatusMessage from "./StatusMessage";
import RecipeForm from "./RecipeForm";

// How many recipes appear on one page
const PAGE_SIZE = 12;
// Comparison functions for each sort option (used by Array.sort)
const SORTS = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  fewest: (a, b) => a.ingredients.length - b.ingredients.length,
  most: (a, b) => b.ingredients.length - a.ingredients.length,
};
// Text shown in the "Sort by" dropdown
const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "fewest", label: "Fewest ingredients" },
  { value: "most", label: "Most ingredients" },
];
// Builds the list of distinct values for a dropdown (for example every category).
// "All" is added after sorting, so it is always the first option
const unique = (recipes, key) => ["All", ...[...new Set(recipes.map((r) => r[key]))].sort((a, b) => a.localeCompare(b))];

// The list screen: search box, filters, sorting, the recipe grid and pagination.
// It also shows the loading, error and empty messages.
export default function RecipeBrowser({ hidden, recipes, status, error, onRetry, favorites, onToggleFavorite, onOpen, onAdd }) {
  // Browsing state: only the list uses it, so it lives here instead of in App
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [area, setArea] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Wraps a state setter so that any filter change also returns to page 1
  const change = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  // Reset every control to its default
  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setArea("All");
    setDifficulty("All");
    setFavoritesOnly(false);
    setPage(1);
  };

  // Derived data: computed on every render from state, so it never goes out of sync
  const q = debouncedQuery.trim().toLowerCase();
  const filtered = recipes.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q))) &&
      (category === "All" || r.category === category) &&
      (area === "All" || r.area === area) &&
      (difficulty === "All" || r.difficulty === difficulty) &&
      (!favoritesOnly || favorites.includes(r.id))
  );
  const sorted = [...filtered].sort(SORTS[sort]); // sort() changes the array, so copy it first
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const categories = unique(recipes, "category");

  return (
    <section hidden={hidden} aria-label="Browse recipes">
      <div className="toolbar">
        <SearchBar value={query} onChange={change(setQuery)} />
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close form" : "Add recipe"}
        </button>
      </div>

      {showForm && <RecipeForm categories={categories.slice(1)} onAdd={onAdd} onDone={() => setShowForm(false)} />}

      <div className="filters">
        <SelectField label="Category" value={category} options={categories} onChange={change(setCategory)} />
        <SelectField label="Cuisine" value={area} options={unique(recipes, "area")} onChange={change(setArea)} />
        <SelectField label="Difficulty" value={difficulty} options={["All", "Easy", "Medium", "Hard"]} onChange={change(setDifficulty)} />
        <SelectField label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} />
        <label className="check">
          <input type="checkbox" checked={favoritesOnly} onChange={(e) => change(setFavoritesOnly)(e.target.checked)} />
          Saved only
        </label>
      </div>

      {status === "loading" && <StatusMessage kind="loading" message="Loading recipes…" />}
      {status === "error" && (
        <StatusMessage kind="error" message={`Could not load recipes: ${error}`} action={{ label: "Try again", onClick: onRetry }} />
      )}
      {status === "success" && sorted.length === 0 && (
        <StatusMessage kind="empty" message="No recipes match these filters." action={{ label: "Clear filters", onClick: clearFilters }} />
      )}
      {status === "success" && sorted.length > 0 && (
        <>
          <p className="count" aria-live="polite">
            {sorted.length} recipes
          </p>
          <ul className="grid">
            {pageItems.map((recipe) => (
              // key = stable unique id so React can track each card
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onToggleFavorite={onToggleFavorite}
                onOpen={onOpen}
              />
            ))}
          </ul>
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
