import StatusMessage from "./StatusMessage";

// The list of pets, or a loading / error / empty message.
export default function PetList({ list, selectedId, busyIds, locked, searching, onSelect, onRetry }) {
  if (list.status === "loading") {
    return <StatusMessage kind="loading" message="Loading pets…" />;
  }
  if (list.status === "error") {
    return (
      <StatusMessage
        kind="error"
        message={`Could not load pets: ${list.error}`}
        action={{ label: "Try again", onClick: onRetry }}
      />
    );
  }
  if (list.items.length === 0) {
    return (
      <StatusMessage
        kind="empty"
        message={searching ? "No pets match this search. Try another word or clear the search." : "No pets yet. Add the first one."}
      />
    );
  }

  return (
    <ul className="pet-list">
      {list.items.map((pet) => (
        // key = the pet's id, which never changes
        <li key={pet.id}>
          <button
            className={pet.id === selectedId ? "pet selected" : "pet"}
            aria-current={pet.id === selectedId}
            onClick={() => onSelect(pet.id)}
            disabled={locked}
          >
            <span className="pet-top">
              <strong>{pet.name}</strong>
              <span className={`badge ${(pet.status || "unknown").toLowerCase()}`}>{pet.status || "Unknown"}</span>
            </span>
            <span className="meta">{[pet.species, pet.breed].filter(Boolean).join(", ") || "No details yet"}</span>
            <span className="desc">{pet.description}</span>
            {busyIds.includes(pet.id) && <span className="busy">Updating…</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
