import { Link, useSearchParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { fetchPets } from "../services/service";
import { SPECIES, STATUSES, SIZES, LOCATIONS } from "../constants";
import { formatDate } from "../utils/format";
import StatusMessage from "../components/StatusMessage";
import Breakdown from "../components/Breakdown";

const count = (pets, field, value) => pets.filter((p) => p[field] === value).length;

export default function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const shelter = LOCATIONS.includes(params.get("shelter")) ? params.get("shelter") : ""; // the interactive filter
  const pets = useAsync(() => fetchPets(), []);

  if (pets.status === "loading") return <StatusMessage kind="loading" message="Counting the pets…" />;
  if (pets.status === "error") {
    return <StatusMessage kind="error" message={`Could not load the data: ${pets.error}`} action={{ label: "Try again", onClick: pets.reload }} />;
  }

  // Everything below is calculated from the loaded data and the chosen shelter.
  const inScope = shelter ? pets.data.filter((p) => p.location === shelter) : pets.data;
  const total = inScope.length;
  const available = count(inScope, "status", "Available");
  const reserved = count(inScope, "status", "Reserved");
  const adopted = count(inScope, "status", "Adopted");
  const vaccinated = inScope.filter((p) => p.vaccinated === true).length;
  const ages = inScope.filter((p) => typeof p.age === "number").map((p) => p.age);
  const averageAge = ages.length ? (ages.reduce((sum, a) => sum + a, 0) / ages.length).toFixed(1) : "—";
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
    ["Average age", averageAge === "—" ? "—" : `${averageAge} y`],
  ];

  const bySpecies = SPECIES.map((s) => ({ label: s, count: count(inScope, "species", s), to: petsLink("species", s) })).filter((r) => r.count > 0);
  const byStatus = STATUSES.map((s) => ({ label: s, count: count(inScope, "status", s), to: petsLink("status", s) }));
  const bySize = SIZES.map((s) => ({ label: s, count: count(inScope, "size", s) })).filter((r) => r.count > 0);
  const latest = [...inScope].sort((a, b) => (b.arrivedOn ?? "").localeCompare(a.arrivedOn ?? "")).slice(0, 4);

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
