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

// What the details panel shows until the right pet has arrived
const LOADING_DETAILS = { id: null, status: "loading", item: null, error: "" };

// Root component. It owns the data and both effects:
//   effect 1 loads the list, effect 2 loads the details of the selected pet.
export default function App() {
  // ---- the list ----
  const [list, setList] = useState({ status: "loading", items: [], total: 0, totalPages: 0, error: "" });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const [search, setSearch] = useState("");
  const [reloadCount, setReloadCount] = useState(0); // bump it to load the list again

  // ---- the selected pet and its details ----
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(LOADING_DETAILS);
  const [detailsAttempt, setDetailsAttempt] = useState(0); // bump it to retry the details

  // ---- create / edit / actions ----
  const [form, setForm] = useState(null); // null, or { mode: "create" | "edit", item }
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false); // a create or edit request is running
  const [busyIds, setBusyIds] = useState([]); // pets with a status or delete request running
  const [notice, setNotice] = useState(null); // { kind: "success" | "error", text }

  // EFFECT 1: load the list.
  // It runs after the first render and again whenever page, sort, search or reloadCount changes.
  useEffect(() => {
    let ignore = false; // the cleanup sets this to true: "this request is outdated"
    setList((prev) => ({ ...prev, status: "loading", error: "" }));

    const params = new URLSearchParams({ page, limit: PAGE_SIZE, sort });
    if (search) params.set("search", search);

    getItemsList(`?${params}`)
      .then((result) => {
        if (ignore) return; // a newer request replaced this one, drop the answer
        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages); // the last pet of the last page was removed
          return;
        }
        setList({ status: "success", items: result.data, total: result.total, totalPages: result.totalPages, error: "" });
      })
      .catch((err) => {
        if (!ignore) setList({ status: "error", items: [], total: 0, totalPages: 0, error: err.message });
      });

    return () => {
      ignore = true; // runs before the next run of this effect, and when App is removed
    };
  }, [page, sort, search, reloadCount]);

  // EFFECT 2: load the details of the selected pet.
  // The request belongs to ONE selectedId. If the user picks another pet, the cleanup
  // marks this request as outdated, so a slow answer can never replace newer details.
  useEffect(() => {
    if (selectedId === null) return;
    let ignore = false;
    setDetails({ id: selectedId, status: "loading", item: null, error: "" });

    getItem(selectedId)
      .then((item) => {
        // selectedId here is the value from the render that started this request (a closure on purpose)
        if (!ignore) setDetails({ id: selectedId, status: "success", item, error: "" });
      })
      .catch((err) => {
        if (!ignore) setDetails({ id: selectedId, status: "error", item: null, error: err.message });
      });

    return () => {
      ignore = true;
    };
  }, [selectedId, detailsAttempt]);

  // Details that belong to a different pet than the selected one are treated as "still loading".
  // This avoids showing the previous pet for a moment after switching.
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

  // Create a new pet, or save the edited one
  async function savePet(values) {
    const current = form; // read the form BEFORE the first await
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
        // the first request worked and the second failed, so a half-filled pet exists
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

  // Change the status of a pet (reserve, mark as adopted, make available)
  async function changeStatus(pet, status) {
    const { id, name } = pet; // captured NOW, because the user may select another pet before the answer arrives
    if (busyIds.includes(id)) return; // never run two requests on the same pet at once
    setBusyIds((prev) => [...prev, id]);
    setNotice(null);
    try {
      const updated = await updateItem(id, { status });
      // Update by the captured id, never by selectedId
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
      setSelectedId((current) => (current === id ? null : current)); // only close the panel if it still shows this pet
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
