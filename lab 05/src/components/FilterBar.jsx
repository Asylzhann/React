import { useState, useEffect } from "react";
import { SPECIES, STATUSES, LOCATIONS, SORTS } from "../constants";

// Search box, three filters and sort. It does not own the filter values:
// they come from the URL (props) and every change is reported with onChange({ field: value }).
export default function FilterBar({ search, species, status, shelter, sort, onChange, onReset, onReload }) {
  const [text, setText] = useState(search); // what is typed, before it is submitted

  // Back / Forward can change the URL from outside, so the typed text follows it.
  useEffect(() => {
    setText(search);
  }, [search]);

  const submit = (e) => {
    e.preventDefault();
    onChange({ q: text.trim() });
  };

  const select = (field, value, options) => (
    <label className="field">
      {field.label}
      <select value={value} onChange={(e) => onChange({ [field.key]: e.target.value })}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  const hasFilters = search || species || status || shelter || sort !== "name";

  return (
    <div className="filters">
      <form className="search" onSubmit={submit} role="search">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search name or description" aria-label="Search pets" />
        <button type="submit">Search</button>
      </form>
      <div className="controls">
        {select({ label: "Species", key: "species" }, species, SPECIES)}
        {select({ label: "Status", key: "status" }, status, STATUSES)}
        {select({ label: "Shelter", key: "shelter" }, shelter, LOCATIONS)}
        <label className="field">
          Sort
          <select value={sort} onChange={(e) => onChange({ sort: e.target.value === "name" ? "" : e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onReload}>
          Reload
        </button>
        {hasFilters && (
          <button type="button" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
