import { useState } from "react";

// Search, sort, reload and "Add pet". The search runs when the form is submitted,
// not on every keystroke (no debouncing is used in this task).
export default function Toolbar({ search, sort, locked, onSearch, onSort, onReload, onCreate }) {
  const [text, setText] = useState(search); // what is typed, before it is submitted

  const submit = (e) => {
    e.preventDefault();
    onSearch(text);
  };

  const clear = () => {
    setText("");
    onSearch("");
  };

  return (
    <div className="toolbar">
      <form className="search" onSubmit={submit} role="search">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search name or description"
          aria-label="Search pets"
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" onClick={clear}>
            Clear
          </button>
        )}
      </form>
      <div className="controls">
        <label className="field">
          Sort
          <select value={sort} onChange={(e) => onSort(e.target.value)}>
            <option value="name">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </label>
        <button onClick={onReload}>Reload</button>
        <button className="primary" onClick={onCreate} disabled={locked}>
          Add pet
        </button>
      </div>
    </div>
  );
}
