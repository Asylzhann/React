import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useBreedList } from "../hooks/useBreeds";
import { breedTitle } from "../services/breedsService";
import { usePwa } from "../context/PwaContext";
import StatusMessage from "../components/StatusMessage";
import Pagination from "../components/Pagination";
import CachedNotice from "../components/CachedNotice";

const BREED_PAGE_SIZE = 12;

// /breeds: a list of dog breeds from a public API. Search and page are kept in the URL.
export default function BreedsPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const { online } = usePwa();
  const breeds = useBreedList();

  const search = params.get("q") ?? "";
  const onlyWithSub = params.get("sub") === "1";
  const requestedPage = Math.max(1, parseInt(params.get("page"), 10) || 1);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  };

  // Nothing saved and no connection: this page cannot be shown, so show the offline page.
  if (breeds.status === "error" && !online) {
    return <Navigate to="/offline" replace state={{ from: location.pathname + location.search }} />;
  }

  let content;
  if (breeds.status === "loading") {
    content = <StatusMessage kind="loading" message="Loading breeds…" />;
  } else if (breeds.status === "error") {
    content = <StatusMessage kind="error" message={`Could not load breeds: ${breeds.error}`} action={{ label: "Try again", onClick: breeds.reload }} />;
  } else {
    const text = search.trim().toLowerCase();
    const filtered = breeds.data.items.filter((b) => (!text || b.id.includes(text)) && (!onlyWithSub || b.subBreeds.length > 0));
    const totalPages = Math.max(1, Math.ceil(filtered.length / BREED_PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const visible = filtered.slice((page - 1) * BREED_PAGE_SIZE, page * BREED_PAGE_SIZE);

    content =
      visible.length === 0 ? (
        <StatusMessage kind="empty" message="No breeds match your search." action={{ label: "Clear search", onClick: () => setParams({}) }} />
      ) : (
        <>
          <div className="cards">
            {visible.map((breed) => (
              <article className="card" key={breed.id}>
                <h3>
                  <Link to={`/breeds/${breed.id}`}>{breedTitle(breed.id)}</Link>
                </h3>
                <p className="meta">{breed.subBreeds.length > 0 ? `${breed.subBreeds.length} sub-breeds` : "No sub-breeds"}</p>
              </article>
            ))}
          </div>
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={(p) => update({ page: p > 1 ? String(p) : "" })} />}
        </>
      );
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Dog breeds</h1>
          <p className="meta">{breeds.status === "success" ? `${breeds.data.items.length} breeds from the public Dog CEO API` : " "}</p>
        </div>
      </div>

      {breeds.status === "success" && <CachedNotice fromCache={breeds.data.fromCache} cachedAt={breeds.data.cachedAt} onRefresh={breeds.reload} />}

      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={search}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Search breeds"
          aria-label="Search breeds"
        />
        <label className="check">
          <input type="checkbox" checked={onlyWithSub} onChange={(e) => update({ sub: e.target.checked ? "1" : "" })} />
          Only with sub-breeds
        </label>
      </form>

      {content}
    </div>
  );
}
