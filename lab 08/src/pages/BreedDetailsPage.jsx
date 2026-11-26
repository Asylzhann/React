import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useBreed } from "../hooks/useBreeds";
import { breedTitle } from "../services/breedsService";
import { usePwa } from "../context/PwaContext";
import StatusMessage from "../components/StatusMessage";
import CachedNotice from "../components/CachedNotice";

export default function BreedDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { online } = usePwa();
  const breed = useBreed(id);

  const goBack = () => (location.key === "default" ? navigate("/breeds") : navigate(-1));
  const backLinks = (
    <div className="actions">
      <button onClick={goBack}>← Back</button>
      <Link className="button" to="/breeds">
        All breeds
      </Link>
    </div>
  );

  // A breed that was never opened before, and no connection: this navigation cannot be completed.
  if (!breed.data && breed.status === "failed" && !online) {
    return <Navigate to="/offline" replace state={{ from: location.pathname }} />;
  }

  if (!breed.data && breed.status !== "failed") {
    return (
      <div className="stack">
        {backLinks}
        <StatusMessage kind="loading" message="Loading photos…" />
      </div>
    );
  }

  if (!breed.data) {
    const missing = breed.error.includes("not found");
    return (
      <div className="stack">
        {backLinks}
        <StatusMessage
          kind={missing ? "empty" : "error"}
          message={missing ? `There is no breed "${id}".` : `Could not load this breed: ${breed.error}`}
          action={missing ? undefined : { label: "Try again", onClick: breed.reload }}
        />
      </div>
    );
  }

  const item = breed.data;
  const title = breedTitle(item.id);
  return (
    <div className="stack">
      {backLinks}
      <CachedNotice fromCache={item.fromCache} cachedAt={item.cachedAt} onRefresh={breed.reload} />
      <article className="panel">
        <h1>{title}</h1>
        <dl className="facts">
          <div>
            <dt>Type</dt>
            <dd>{item.isSub ? "Sub-breed" : "Main breed"}</dd>
          </div>
          {item.isSub && (
            <div>
              <dt>Main breed</dt>
              <dd>
                <Link to={`/breeds/${item.master}`}>{breedTitle(item.master)}</Link>
              </dd>
            </div>
          )}
          <div>
            <dt>Photos shown</dt>
            <dd>{item.images.length}</dd>
          </div>
        </dl>
        {item.subBreeds.length > 0 && (
          <div>
            <h2>Sub-breeds</h2>
            <p className="chips">
              {item.subBreeds.map((sub) => (
                <Link key={sub} className="chip" to={`/breeds/${item.id}-${sub}`}>
                  {breedTitle(`${item.id}-${sub}`)}
                </Link>
              ))}
            </p>
          </div>
        )}
      </article>
      <div className="gallery">
        {item.images.map((url, index) => (
          <img key={url} src={url} alt={`${title}, photo ${index + 1}`} loading="lazy" />
        ))}
      </div>
    </div>
  );
}
