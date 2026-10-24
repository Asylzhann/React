import { useState } from "react";
import { difficultyFor } from "../api";

// Form for adding the user's own recipe. Every input is controlled by state.
export default function RecipeForm({ categories, onAdd, onDone }) {
  // Controlled inputs: the form's own state is the single source of truth
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] || "Other");
  const [area, setArea] = useState("");
  const [ingredientText, setIngredientText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");

  // Validate the fields, build a recipe object and hand it to the parent
  const handleSubmit = (e) => {
    e.preventDefault();
    // One ingredient per line, written as "name, amount"
    const ingredients = ingredientText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [first, ...rest] = line.split(",");
        return { name: first.trim(), measure: rest.join(",").trim() };
      });
    if (!name.trim()) return setError("Give your recipe a name.");
    if (ingredients.length === 0) return setError("Add at least one ingredient.");

    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      area: area.trim() || "Homemade",
      thumb: "",
      instructions: instructions.trim(),
      youtube: "",
      tags: [],
      ingredients,
      difficulty: difficultyFor(ingredients.length),
      custom: true,
    });
    onDone();
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <label className="field">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="field">
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {(categories.length ? categories : ["Other"]).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="field">
        Cuisine
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Kazakh" />
      </label>
      <label className="field wide">
        Ingredients (one per line: name, amount)
        <textarea value={ingredientText} onChange={(e) => setIngredientText(e.target.value)} placeholder={"Flour, 200g\nEgg, 2"} rows={4} />
      </label>
      <label className="field wide">
        Instructions
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary" type="submit">
        Save recipe
      </button>
    </form>
  );
}
