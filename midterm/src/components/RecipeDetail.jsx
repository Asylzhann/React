import RelatedRecipes from "./RelatedRecipes";

// The detail screen for one recipe: photo, ingredients, method and actions.
export default function RecipeDetail({ recipe, recipes, isFavorite, onToggleFavorite, onBack, onOpen, onRemove }) {
  // Split the instructions text into one paragraph per line
  const steps = recipe.instructions.split(/\r?\n/).filter((s) => s.trim());

  return (
    <article className="detail">
      <button onClick={onBack}>← Back to recipes</button>

      <div className="detail-head">
        {recipe.thumb && <img src={recipe.thumb} alt={recipe.name} />}
        <div>
          <h2>{recipe.name}</h2>
          <p className="meta">
            {recipe.category}, {recipe.area}
          </p>
          <div className="row">
            <span className={`badge ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
            {recipe.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <div className="row actions">
            <button className={isFavorite ? "primary" : ""} onClick={() => onToggleFavorite(recipe.id)} aria-pressed={isFavorite}>
              {isFavorite ? "Saved" : "Save recipe"}
            </button>
            {recipe.youtube && (
              <a className="btn" href={recipe.youtube} target="_blank" rel="noreferrer">
                Watch video
              </a>
            )}
            {recipe.custom && (
              <button className="danger" onClick={() => onRemove(recipe.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <section>
          <h3>Ingredients</h3>
          <ul className="ingredients">
            {recipe.ingredients.map((ing, i) => (
              // Static list that never reorders, and names can repeat (e.g. "Salt"), so index is safe here
              <li key={`${i}-${ing.name}`}>
                <span>{ing.name}</span>
                <span className="meta">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Method</h3>
          {steps.length ? steps.map((s, i) => <p key={i}>{s}</p>) : <p className="meta">No instructions added.</p>}
        </section>
      </div>

      <RelatedRecipes category={recipe.category} currentId={recipe.id} recipes={recipes} onOpen={onOpen} />
    </article>
  );
}
