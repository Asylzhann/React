import { useEffect, useState } from "react";
import { fetchByCategory } from "../api";
import StatusMessage from "./StatusMessage";

// Second API call: more dishes from the same category as the open recipe
// Lists more recipes from the same category as the open recipe
export default function RelatedRecipes({ category, currentId, recipes, onOpen }) {
  const [state, setState] = useState({ status: "loading", items: [], error: "" });

  useEffect(() => {
    const controller = new AbortController();
    fetchByCategory(category, controller.signal)
      .then((items) => setState({ status: "success", items, error: "" }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", items: [], error: err.message });
      });
    return () => controller.abort(); // leaving the recipe cancels the request
  }, [category]); // runs again when the category changes; cleanup cancels the old request

  const known = new Set(recipes.map((r) => r.id));
  const items = state.items.filter((i) => i.id !== currentId && known.has(i.id)).slice(0, 6);

  return (
    <section className="related">
      <h3>More from {category}</h3>
      {state.status === "loading" && <StatusMessage kind="loading" message="Finding similar dishes…" />}
      {state.status === "error" && <StatusMessage kind="error" message={`Could not load: ${state.error}`} />}
      {state.status === "success" && items.length === 0 && <StatusMessage kind="empty" message="Nothing else in this category yet." />}
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button className="link" onClick={() => onOpen(item.id)}>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
