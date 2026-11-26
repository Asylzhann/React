import { Link } from "react-router-dom";

// A list of bars: label, count and a bar as wide as its share of `total`.
// A row with a `to` is a link to the pets page filtered by that value; without `to` it is plain text.
export default function Breakdown({ title, rows, total }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="meta">Nothing to show.</p>
      ) : (
        <ul className="bars">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="bar-head">
                {row.to ? <Link to={row.to}>{row.label}</Link> : <span>{row.label}</span>}
                <span>{row.count}</span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${total ? (row.count / total) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
