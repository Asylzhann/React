import { useState } from "react";
import { useRecipes, usePersistedState } from "./hooks";
import RecipeBrowser from "./components/RecipeBrowser";
import RecipeDetail from "./components/RecipeDetail";
import "./App.css";

// Root component: loads the data, holds the shared state, and decides whether to
// show the recipe list or a single recipe.
export default function App() {
  const { status, recipes: apiRecipes, error, retry } = useRecipes();
  // Shared state: favorites, custom recipes and the selected recipe live here
  // because both the list and the detail view need them.
  const [favorites, setFavorites] = usePersistedState("rf-favorites", []);
  const [custom, setCustom] = usePersistedState("rf-custom", []);
  const [selectedId, setSelectedId] = useState(null);

  const recipes = [...custom, ...apiRecipes];
  const selected = recipes.find((r) => r.id === selectedId);

  // Add the id to favorites, or remove it if it is already there
  const toggleFavorite = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  // Put a recipe created in the form at the top of the list
  const addRecipe = (recipe) => setCustom((prev) => [recipe, ...prev]);

  // Delete one of the user's own recipes and clean up its favorite and selection
  const removeRecipe = (id) => {
    setCustom((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => prev.filter((f) => f !== id));
    setSelectedId(null);
  };

  // Show the detail view for this recipe
  const open = (id) => setSelectedId(id);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Recipe Finder</h1>
        <p>
          {recipes.length} recipes, {favorites.length} saved
        </p>
      </header>

      {/* Hidden (not unmounted) while a recipe is open, so search, filters and page are kept */}
      <RecipeBrowser
        hidden={Boolean(selected)}
        recipes={recipes}
        status={status}
        error={error}
        onRetry={retry}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onOpen={open}
        onAdd={addRecipe}
      />

      {selected && (
        // key = recipe id: opening a different recipe remounts the detail, so its state starts fresh
        <RecipeDetail
          key={selected.id}
          recipe={selected}
          recipes={recipes}
          isFavorite={favorites.includes(selected.id)}
          onToggleFavorite={toggleFavorite}
          onBack={() => setSelectedId(null)}
          onOpen={open}
          onRemove={removeRecipe}
        />
      )}
    </div>
  );
}
