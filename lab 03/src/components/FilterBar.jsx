import { STATUSES } from "../constants";

export default function FilterBar({ filter, counts, onFilter, onReverse, onSortShortest, onSortLongest }) {
  console.log("FilterBar render");

  return (
    <nav className="filter-bar" aria-label="Filter and order books">
      <div className="group">
        {["All", ...STATUSES].map((s) => (
          <button key={s} className={s === filter ? "tab active" : "tab"} onClick={() => onFilter(s)}>
            {s} <span className="count">{counts[s]}</span>
          </button>
        ))}
      </div>
      <div className="group">
        <button onClick={onSortShortest}>Shortest first</button>
        <button onClick={onSortLongest}>Longest first</button>
        <button onClick={onReverse}>Reverse list</button>
      </div>
    </nav>
  );
}
