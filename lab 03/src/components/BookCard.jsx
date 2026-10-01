import { useState } from "react";
import { STATUSES } from "../constants";

export default function BookCard({ book, hidden, onStatusChange, onRemove, onReset }) {
  // LOCAL STATE: belongs to this card instance. It survives as long as the
  // card keeps the same key; a different key means a new instance.
  const [pagesRead, setPagesRead] = useState(0);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  console.log(`BookCard render: "${book.title}" (id ${book.id})`);

  const finished = book.status === "Finished";
  const percent = Math.round((pagesRead / book.pages) * 100);

  return (
    <li hidden={hidden} className={`card ${book.status.replace(/ /g, "-").toLowerCase()}`}>
      <div className="card-top">
        <div>
          <h2>{book.title}</h2>
          <p className="meta">
            {book.author}, {book.genre}, {book.pages} pages
          </p>
        </div>
        <select
          value={book.status}
          onChange={(e) => onStatusChange(book.id, e.target.value)}
          aria-label={`Status of ${book.title}`}
        >
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="progress">
        <button onClick={() => setPagesRead((p) => Math.max(0, p - 10))} disabled={pagesRead === 0} aria-label="Read 10 fewer pages">
          −10
        </button>
        <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
          <div style={{ width: `${percent}%` }} />
        </div>
        <button
          onClick={() => setPagesRead((p) => Math.min(book.pages, p + 10))}
          disabled={pagesRead === book.pages}
          aria-label="Read 10 more pages"
        >
          +10
        </button>
        <span className="tally">
          {pagesRead}/{book.pages} pages
        </span>
      </div>

      {pagesRead === book.pages && !finished && (
        <p className="hint">You reached the last page. Set the status to Finished to count it.</p>
      )}

      {showNote && (
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Your thoughts on this book" aria-label="Notes" />
      )}

      <div className="card-actions">
        <button onClick={() => setShowNote((s) => !s)}>{showNote ? "Hide note" : note ? "Show note" : "Add note"}</button>
        <button onClick={() => onReset(book.id)}>Reset progress</button>
        <button className="danger" onClick={() => onRemove(book.id)}>
          Remove
        </button>
      </div>
    </li>
  );
}
