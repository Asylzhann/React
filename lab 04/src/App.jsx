import { useState, useEffect } from "react";
import { getItemsList, getItem, updateItem, deleteItem } from "./api/fakeApi";
import { createPet } from "./api/petsApi";
import { PAGE_SIZE } from "./constants";
import Toolbar from "./components/Toolbar";
import PetList from "./components/PetList";
import Pagination from "./components/Pagination";
import DetailsPanel from "./components/DetailsPanel";
import PetForm from "./components/PetForm";
import StatusMessage from "./components/StatusMessage";
import Notice from "./components/Notice";
import "./App.css";

// Placeholder shown while the selected pet's details are loading
const LOADING_DETAILS = { id: null, status: "loading", item: null, error: "" };

export default function App() {
  // List
  const [list, setList] = useState({ status: "loading", items: [], total: 0, totalPages: 0, error: "" });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const [search, setSearch] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // Selected pet
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(LOADING_DETAILS);
  const [detailsAttempt, setDetailsAttempt] = useState(0);

  // Form, saving and actions
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const [notice, setNotice] = useState(null);

  // Effect 1: load the list.
  // Runs on mount and whenever page, sort, search or reloadCount changes.
  useEffect(() => {
    let ignore = false; // set to true by the cleanup when this request becomes outdated
    setList((prev) => ({ ...prev, status: "loading", error: "" }));

    const params = new URLSearchParams({ page, limit: PAGE_SIZE, sort });
    if (search) params.set("search", search);

    getItemsList(`?${params}`)
      .then((result) => {
        if (ignore) return; // outdated request: discard its answer
        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages); // this page no longer exists (e.g. its last pet was removed)
          return;
        }
        setList({ status: "success", items: result.data, total: result.total, totalPages: result.totalPages, error: "" });
      })
      .catch((err) => {
        if (!ignore) setList({ status: "error", items: [], total: 0, totalPages: 0, error: err.message });
      });

    return () => {
      ignore = true; // runs before the next effect run and on unmount
    };
  }, [page, sort, search, reloadCount]);

  // Effect 2: load the details of the selected pet.
  // If another pet is selected, the cleanup marks the previous request as outdated,
  useEffect(() => {
    if (selectedId === null) return;
    let ignore = false;
    setDetails({ id: selectedId, status: "loading", item: null, error: "" });

    getItem(selectedId)
      .then((item) => {
        // selectedId comes from the render that started this request, so the answer is labelled with the right pet
        if (!ignore) setDetails({ id: selectedId, status: "success", item, error: "" });
      })
      .catch((err) => {
        if (!ignore) setDetails({ id: selectedId, status: "error", item: null, error: err.message });
      });

    return () => {
      ignore = true;
    };
  }, [selectedId, detailsAttempt]);

  // Details stored for a different pet count as "still loading",
  const shown = details.id === selectedId ? details : LOADING_DETAILS;

  const reload = () => setReloadCount((c) => c + 1);

  const changeSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const runSearch = (text) => {
    setSearch(text.trim());
    setPage(1);
  };

  const selectPet = (id) => {
    if (saving) return;
    setForm(null);
    setSelectedId(id);
  };

  const openCreate = () => {
    setFormError("");
    setForm({ mode: "create", item: null });
  };

  const openEdit = () => {
    setFormError("");
    setForm({ mode: "edit", item: shown.item });
  };

  // Create a pet or save the edited one
  async function savePet(values) {
    const current = form; // copy before the first await
    setSaving(true);
    setFormError("");
    try {
      if (current.mode === "create") {
        const created = await createPet(values);
        setSelectedId(created.id);
        setNotice({ kind: "success", text: `${created.name} was added.` });
      } else {
        const id = current.item.id;
        const updated = await updateItem(id, values);
        setDetails((prev) => (prev.item && prev.item.id === id ? { ...prev, item: updated } : prev));
        setNotice({ kind: "success", text: `${updated.name} was updated.` });
      }
      setForm(null);
      reload();
    } catch (err) {
      if (err.createdId !== undefined) {
        // the pet was created but its details failed to save (see createPet)
        setForm(null);
        reload();
        setNotice({ kind: "error", text: "The pet was created, but its details could not be saved. Select it and press Edit to finish." });
      } else {
        setFormError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  // Change a pet's status (reserve, mark as adopted, make available)
  async function changeStatus(pet, status) {
    const { id, name } = pet; // copy now: the user may select another pet before the answer arrives
    if (busyIds.includes(id)) return; // one request per pet at a time
    setBusyIds((prev) => [...prev, id]);
    setNotice(null);
    try {
      const updated = await updateItem(id, { status });
      // Update by the copied id, not by selectedId
      setList((prev) => ({ ...prev, items: prev.items.map((p) => (p.id === id ? updated : p)) }));
      setDetails((prev) => (prev.item && prev.item.id === id ? { ...prev, item: updated } : prev));
      setNotice({ kind: "success", text: `${name} is now ${status.toLowerCase()}.` });
    } catch (err) {
      setNotice({ kind: "error", text: `Could not update ${name}: ${err.message}` });
    } finally {
      setBusyIds((prev) => prev.filter((x) => x !== id));
    }
  }

  // Remove a pet
  async function removePet(pet) {
    const { id, name } = pet;
    if (busyIds.includes(id)) return;
    setBusyIds((prev) => [...prev, id]);
    setNotice(null);
    try {
      await deleteItem(id);
      setSelectedId((current) => (current === id ? null : current)); // close the panel only if it still shows this pet
      setNotice({ kind: "success", text: `${name} was removed.` });
      reload();
    } catch (err) {
      setNotice({ kind: "error", text: `Could not remove ${name}: ${err.message}` });
    } finally {
      setBusyIds((prev) => prev.filter((x) => x !== id));
    }
  }

  const idle = selectedId === null && !form;

  return (
    <div className="app">
      <header className="masthead">
        <h1>Pet Shelter</h1>
        <p>{list.status === "success" ? `${list.total} pets waiting for a home` : "Checking the kennels"}</p>
      </header>

      {notice && <Notice notice={notice} onDismiss={() => setNotice(null)} />}

      <div className="layout">
        <section className="list-pane" aria-label="Pets">
          <Toolbar
            search={search}
            sort={sort}
            locked={saving}
            onSearch={runSearch}
            onSort={changeSort}
            onReload={reload}
            onCreate={openCreate}
          />
          <PetList
            list={list}
            selectedId={selectedId}
            busyIds={busyIds}
            locked={saving}
            searching={search !== ""}
            onSelect={selectPet}
            onRetry={reload}
          />
          {list.status !== "error" && list.totalPages > 1 && (
            <Pagination page={page} totalPages={list.totalPages} onChange={setPage} />
          )}
        </section>

        <aside className={idle ? "detail-pane idle" : "detail-pane"} aria-label="Pet profile">
          {form ? (
            <PetForm
              key={`${form.mode}-${form.item ? form.item.id : "new"}`}
              mode={form.mode}
              pet={form.item}
              saving={saving}
              error={formError}
              onSubmit={savePet}
              onCancel={() => setForm(null)}
            />
          ) : selectedId === null ? (
            <StatusMessage kind="empty" message="Select a pet to see its full profile." />
          ) : (
            <DetailsPanel
              key={selectedId}
              details={shown}
              busy={shown.item ? busyIds.includes(shown.item.id) : false}
              onStatus={(status) => changeStatus(shown.item, status)}
              onEdit={openEdit}
              onDelete={removePet}
              onRetry={() => setDetailsAttempt((a) => a + 1)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
