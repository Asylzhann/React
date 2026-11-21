import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { usePetList, createPet } from "../hooks/usePets";
import { PAGE_SIZE, SPECIES, STATUSES, LOCATIONS, SORTS } from "../constants";
import { sortPets } from "../utils/format";
import FilterBar from "../components/FilterBar";
import PetCard from "../components/PetCard";
import Pagination from "../components/Pagination";
import PetForm from "../components/PetForm";
import StatusMessage from "../components/StatusMessage";
import Notice from "../components/Notice";

// Keep a URL value only if it is one of the allowed values.
const allowed = (value, list) => (list.includes(value) ? value : "");

export default function PetsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The URL is the source of truth: /pets?q=bella&species=Dog&page=2
  const search = params.get("q") ?? "";
  const species = allowed(params.get("species"), SPECIES);
  const status = allowed(params.get("status"), STATUSES);
  const shelter = allowed(params.get("shelter"), LOCATIONS);
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "name";
  const requestedPage = Math.max(1, parseInt(params.get("page"), 10) || 1);

  // The API handles search and name order. Everything else is done below in the browser.
  const apiSort = sort === "name-desc" ? "name-desc" : "name";
  const pets = usePetList({ search, sort: apiSort });

  const [notice, setNotice] = useState(location.state?.notice ?? null);
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

  // Filter, sort and cut out the current page. Nothing here is state: it is calculated on every render.
  let visible = [];
  let totalFound = 0;
  let totalPages = 1;
  let page = 1;
  if (pets.status === "success") {
    const filtered = pets.data.filter(
      (p) => (!species || p.species === species) && (!status || p.status === status) && (!shelter || p.location === shelter)
    );
    const sorted = sortPets(filtered, sort);
    totalFound = sorted.length;
    totalPages = Math.max(1, Math.ceil(totalFound / PAGE_SIZE));
    page = Math.min(requestedPage, totalPages); // a page number that is too big becomes the last page
    visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }

  async function savePet(values) {
    setSaving(true);
    setFormError("");
    try {
      const created = await createPet(values);
      if (!mounted.current) return; // the user already left this page
      navigate(`/pets/${created.id}`, { state: { notice: { kind: "success", text: `${created.name} was added.` } } });
    } catch (err) {
      if (!mounted.current) return;
      if (err.createdId !== undefined) {
        const text = "The pet was created, but its details could not be saved. Press Edit to finish.";
        navigate(`/pets/${err.createdId}`, { state: { notice: { kind: "error", text } } });
      } else {
        setFormError(err.message);
        setSaving(false);
      }
    }
  }

  let content;
  if (pets.status === "loading") {
    content = <StatusMessage kind="loading" message="Loading pets…" />;
  } else if (pets.status === "error") {
    content = (
      <StatusMessage kind="error" message={`Could not load pets: ${pets.error}`} action={{ label: "Try again", onClick: pets.reload }} />
    );
  } else if (visible.length === 0) {
    content = (
      <StatusMessage
        kind="empty"
        message="No pets match these filters."
        action={{ label: "Clear filters", onClick: () => setParams({}) }}
      />
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
          <p className="meta">{pets.status === "success" ? `${totalFound} found` : " "}</p>
        </div>
        <button className="primary" onClick={() => setShowForm(true)} disabled={showForm}>
          Add pet
        </button>
      </div>

      {notice && <Notice notice={notice} onDismiss={() => setNotice(null)} />}

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
