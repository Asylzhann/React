// Public recipe API (no key needed)
const BASE = "https://www.themealdb.com/api/json/v1/1";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Fetch a path from the API and return parsed JSON. Throws on a failed response.
async function getJson(path, signal) {
  const res = await fetch(`${BASE}/${path}`, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

// Our own rule on top of the API data: difficulty comes from the ingredient count
export const difficultyFor = (count) => (count <= 6 ? "Easy" : count <= 11 ? "Medium" : "Hard");

// The API returns strIngredient1..20 / strMeasure1..20; turn them into one array
function normalize(m) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: m[`strMeasure${i}`]?.trim() || "" });
  }
  return {
    id: m.idMeal,
    name: m.strMeal.trim(),
    category: m.strCategory || "Other",
    area: m.strArea || m.strCountry || "Unknown",
    thumb: m.strMealThumb,
    instructions: m.strInstructions || "",
    youtube: m.strYoutube || "",
    tags: m.strTags ? m.strTags.split(",") : [],
    ingredients,
    difficulty: difficultyFor(ingredients.length),
    custom: false,
  };
}

// One request per letter gives the whole catalogue (hundreds of recipes)
export async function fetchAllRecipes(signal) {
  const pages = await Promise.all(LETTERS.map((l) => getJson(`search.php?f=${l}`, signal)));
  const byId = new Map();
  pages.forEach((p) => (Array.isArray(p.meals) ? p.meals : []).forEach((m) => byId.set(m.idMeal, normalize(m))));
  return [...byId.values()];
}

// Names of all recipes in one category (used for "More from this category")
export async function fetchByCategory(category, signal) {
  const data = await getJson(`filter.php?c=${encodeURIComponent(category)}`, signal);
  return (Array.isArray(data.meals) ? data.meals : []).map((m) => ({ id: m.idMeal, name: m.strMeal }));
}
