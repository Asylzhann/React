import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePetList } from "../hooks/usePets";
import { selectDashboard } from "../store/pets/petsSelectors";
import { LOCATIONS } from "../constants";
import { formatDate } from "../utils/format";
import StatusMessage from "../components/StatusMessage";
import Breakdown from "../components/Breakdown";

export default function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const shelter = LOCATIONS.includes(params.get("shelter")) ? params.get("shelter") : ""; // the interactive filter
  const pets = usePetList(); // loads the pets (shared with the pets page: one copy in the store)
  const data = useSelector((state) => selectDashboard(state, shelter)); // memoized: counts and groups

  if (!pets.loaded && pets.status !== "failed") return <StatusMessage kind="loading" message="Counting the pets…" />;
  if (!pets.loaded) {
    return <StatusMessage kind="error" message={`Could not load the data: ${pets.error}`} action={{ label: "Try again", onClick: pets.reload }} />;
  }

  const { total, available, reserved, adopted, vaccinated, averageAge, latest } = data;
  const adoptedShare = total ? Math.round((adopted / total) * 100) : 0;

  // A link to the pets page that keeps the chosen shelter.
  const petsLink = (field, value) => {
    const q = new URLSearchParams({ [field]: value });
    if (shelter) q.set("shelter", shelter);
    return `/pets?${q}`;
  };

  const stats = [
    ["Pets", total],
    ["Available", available],
    ["Reserved", reserved],
    ["Adopted", `${adopted} (${adoptedShare}%)`],
    ["Vaccinated", total ? `${Math.round((vaccinated / total) * 100)}%` : "—"],
    ["Average age", averageAge === null ? "—" : `${averageAge.toFixed(1)} y`],
  ];

  const bySpecies = data.bySpecies.map((r) => ({ ...r, to: petsLink("species", r.label) }));
  const byStatus = data.byStatus.map((r) => ({ ...r, to: petsLink("status", r.label) }));
  const bySize = data.bySize;

  const changeShelter = (value) => {
    if (value) setParams({ shelter: value });
    else setParams({});
  };

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="meta">{shelter || "All shelters"}</p>
        </div>
        <label className="field">
          Shelter
          <select value={shelter} onChange={(e) => changeShelter(e.target.value)}>
            <option value="">All shelters</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="stats">
        {stats.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <Breakdown title="By species" rows={bySpecies} total={total} />
        <Breakdown title="By status" rows={byStatus} total={total} />
        <Breakdown title="By size" rows={bySize} total={total} />
      </div>

      <section className="panel">
        <h3>Recently arrived</h3>
        {latest.length === 0 ? (
          <p className="meta">No pets in this shelter.</p>
        ) : (
          <ul className="plain latest">
            {latest.map((p) => (
              <li key={p.id}>
                <Link to={`/pets/${p.id}`}>{p.name}</Link>
                <span className="meta">
                  {p.species} · {formatDate(p.arrivedOn)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p>
          <Link to={shelter ? `/pets?${new URLSearchParams({ shelter })}` : "/pets"}>See all pets →</Link>
        </p>
      </section>
    </div>
  );
}
