import { useState } from "react";
import StatusMessage from "./StatusMessage";
import { STATUSES } from "../constants";
import { show, formatDate } from "../format";

// Button text for moving a pet to each status
const ACTION_LABEL = { Available: "Make available", Reserved: "Reserve", Adopted: "Mark as adopted" };

// The full profile of the selected pet. It shows loading and error states for its own request.
export default function DetailsPanel({ details, busy, onStatus, onEdit, onDelete, onRetry, onClose }) {
  const [confirming, setConfirming] = useState(false); // second click needed to remove

  if (details.status === "loading") {
    return <StatusMessage kind="loading" message="Loading profile…" />;
  }
  if (details.status === "error") {
    return (
      <div className="panel">
        <StatusMessage
          kind="error"
          message={`Could not load this pet: ${details.error}`}
          action={{ label: "Try again", onClick: onRetry }}
        />
        <div className="actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const pet = details.item;
  const age = pet.age === undefined ? undefined : `${pet.age} ${pet.age === 1 ? "year" : "years"}`;
  const vaccinated = pet.vaccinated === undefined ? undefined : pet.vaccinated ? "Yes" : "No";
  const facts = [
    ["Species", pet.species],
    ["Breed", pet.breed],
    ["Age", age],
    ["Size", pet.size],
    ["Temperament", pet.temperament],
    ["Vaccinated", vaccinated],
    ["Shelter", pet.location],
    ["Arrived", formatDate(pet.arrivedOn)],
  ];

  return (
    <article className="panel">
      <div className="panel-head">
        <h2>{pet.name}</h2>
        <span className={`badge ${(pet.status || "unknown").toLowerCase()}`}>{pet.status || "Unknown"}</span>
      </div>
      <p className="lead">{pet.description}</p>

      <dl className="facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{show(value)}</dd>
          </div>
        ))}
      </dl>

      {busy && (
        <p className="busy" role="status">
          Saving changes…
        </p>
      )}

      <div className="actions">
        {STATUSES.filter((s) => s !== pet.status).map((s) => (
          <button key={s} className={s === "Adopted" ? "primary" : ""} disabled={busy} onClick={() => onStatus(s)}>
            {ACTION_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="actions">
        <button disabled={busy} onClick={onEdit}>
          Edit
        </button>
        {confirming ? (
          <>
            <button
              className="danger"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                onDelete(pet);
              }}
            >
              Yes, remove {pet.name}
            </button>
            <button onClick={() => setConfirming(false)}>Keep</button>
          </>
        ) : (
          <button className="danger" disabled={busy} onClick={() => setConfirming(true)}>
            Remove
          </button>
        )}
        <button className="spaced" onClick={onClose}>
          Close
        </button>
      </div>
    </article>
  );
}
