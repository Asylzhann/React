import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePetList } from "../hooks/usePets";
import { createPet } from "../store/pets/petsSlice";
import { selectFilteredPets } from "../store/pets/petsSelectors";
import { PAGE_SIZE, SPECIES, STATUSES, LOCATIONS, SORTS } from "../constants";
import FilterBar from "../components/FilterBar";
import PetCard from "../components/PetCard";
import Pagination from "../components/Pagination";
import PetForm from "../components/PetForm";
import StatusMessage from "../components/StatusMessage";

// Keep a URL value only if it is one of the allowed values.
const allowed = (value, list) => (list.includes(value) ? value : "");

export default function PetsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // The URL is the source of truth: /pets?q=bella&species=Dog&page=2
  const search = params.get("q") ?? "";
  const species = allowed(params.get("species"), SPECIES);
  const status = allowed(params.get("status"), STATUSES);
  const shelter = allowed(params.get("shelter"), LOCATIONS);
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "name";
  const requestedPage = Math.max(1, parseInt(params.get("page"), 10) || 1);

  // Redux: the loading state from the hook, the filtered and sorted pets from a memoized selector.
  const pets = usePetList();
  const filtered = useSelector((state) => selectFilteredPets(state, { search, species, status, shelter, sort }));

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Change some URL values. Empty values are removed. Any change except "page" goes back to page 1.
  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  }

  // Only the current page is cut out here. Nothing is state: it is calculated on every render.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages); // a page number that is too big becomes the last page
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function savePet(values) {
    setSaving(true);
    setFormError("");
    try {
      const created = await dispatch(createPet(values)).unwrap(); // the success message comes from the store
      if (mounted.current) navigate(`/pets/${created.id}`);
    } catch (err) {
      if (!mounted.current) return;
      if (err.createdId !== undefined) {
        navigate(`/pets/${err.createdId}`); // the pet exists; the store has already added an error message
      } else {
        setFormError(err.message);
        setSaving(false);
      }
    }
  }

  let content;
  if (!pets.loaded && pets.status !== "failed") {
    content = <StatusMessage kind="loading" message="Loading pets…" />;
  } else if (!pets.loaded) {
    content = (
      <StatusMessage kind="error" message={`Could not load pets: ${pets.error}`} action={{ label: "Try again", onClick: pets.reload }} />
    );
  } else if (visible.length === 0) {
    content = (
      <StatusMessage kind="empty" message="No pets match these filters." action={{ label: "Clear filters", onClick: () => setParams({}) }} />
    );
  } else {
    content = (
      <>
        <div className="cards">
          {visible.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
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
          <h1>Pets</h1>
          <p className="meta">{pets.loaded ? `${filtered.length} found` : " "}</p>
        </div>
        <button className="primary" onClick={() => setShowForm(true)} disabled={showForm}>
          Add pet
        </button>
      </div>

      {showForm && (
        <PetForm mode="create" saving={saving} error={formError} onSubmit={savePet} onCancel={() => setShowForm(false)} />
      )}

      <FilterBar
        search={search}
        species={species}
        status={status}
        shelter={shelter}
        sort={sort}
        onChange={update}
        onReset={() => setParams({})}
        onReload={pets.reload}
      />

      {content}
    </div>
  );
}
