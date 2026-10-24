// One recipe tile in the grid. It only displays data and reports clicks to its parent.
export default function RecipeCard({ recipe, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <li className="card">
      {recipe.thumb ? <img src={recipe.thumb} alt="" loading="lazy" /> : <div className="ph">{recipe.name[0]}</div>}
      <div className="card-body">
        <h2>
          <button className="link" onClick={() => onOpen(recipe.id)}>
            {recipe.name}
          </button>
        </h2>
        <p className="meta">
          {recipe.category}, {recipe.area}
        </p>
        <div className="row">
          <span className={`badge ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
          <span className="meta">{recipe.ingredients.length} ingredients</span>
          <button
            className={isFavorite ? "fav on" : "fav"}
            onClick={() => onToggleFavorite(recipe.id)}
            aria-pressed={isFavorite}
            aria-label={`${isFavorite ? "Unsave" : "Save"} ${recipe.name}`}
          >
            ♥
          </button>
        </div>
      </div>
    </li>
  );
}
