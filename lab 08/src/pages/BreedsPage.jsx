import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useBreedList } from "../hooks/useBreeds";
import { selectFilteredBreeds } from "../store/breeds/breedsSelectors";
import { breedTitle } from "../services/breedsService";
import { usePwa } from "../context/PwaContext";
import StatusMessage from "../components/StatusMessage";
import Pagination from "../components/Pagination";
import CachedNotice from "../components/CachedNotice";
import SearchInput from "../components/SearchInput";

const BREED_PAGE_SIZE = 12;

export default function BreedsPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const { online } = usePwa();
  const breeds = useBreedList();

  const search = params.get("q") ?? "";
  const onlyWithSub = params.get("sub") === "1";
  const requestedPage = Math.max(1, parseInt(params.get("page"), 10) || 1);
  const filtered = useSelector((state) => selectFilteredBreeds(state, { search, onlyWithSub }));

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
  if (breeds.status === "failed" && !breeds.loaded && !online) {
    return <Navigate to="/offline" replace state={{ from: location.pathname + location.search }} />;
  }

  let content;
  if (!breeds.loaded && breeds.status !== "failed") {
    content = <StatusMessage kind="loading" message="Loading breeds…" />;
  } else if (!breeds.loaded) {
    content = <StatusMessage kind="error" message={`Could not load breeds: ${breeds.error}`} action={{ label: "Try again", onClick: breeds.reload }} />;
  } else {
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
          <p className="meta">{breeds.loaded ? `${breeds.items.length} breeds from the public Dog CEO API` : " "}</p>
        </div>
      </div>

      {breeds.loaded && <CachedNotice fromCache={breeds.fromCache} cachedAt={breeds.cachedAt} onRefresh={breeds.reload} />}

      <div className="filters">
        <SearchInput value={search} onSearch={(q) => update({ q })} placeholder="Search breeds" label="Search breeds" />
        <label className="check">
          <input type="checkbox" checked={onlyWithSub} onChange={(e) => update({ sub: e.target.checked ? "1" : "" })} />
          Only with sub-breeds
        </label>
      </div>

      {content}
    </div>
  );
}
