import { Link } from "react-router-dom";
import { formatAge } from "../utils/format";

// One pet in the list. The title is a link to /pets/<id>.
export default function PetCard({ pet }) {
  const kind = [pet.species, pet.breed].filter(Boolean).join(", ") || "No details yet";
  const extra = [pet.age === undefined ? "" : formatAge(pet.age), pet.size].filter(Boolean).join(" · ");

  return (
    <article className="card">
      <div className="card-top">
        <h3>
          <Link to={`/pets/${pet.id}`}>{pet.name}</Link>
        </h3>
        <span className={`badge ${(pet.status || "unknown").toLowerCase()}`}>{pet.status || "Unknown"}</span>
      </div>
      <p className="meta">{kind}</p>
      {extra && <p className="meta">{extra}</p>}
      <p className="desc">{pet.description}</p>
      {pet.location && <p className="meta place">{pet.location}</p>}
    </article>
  );
}
