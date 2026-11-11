import { useState } from "react";
import { SPECIES, SIZES, LOCATIONS } from "../constants";

// Form for adding a new pet or editing an existing one.
// Every input is controlled: its value comes from `values` and changes go back into `values`.
export default function PetForm({ mode, pet, saving, error, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: pet?.name ?? "",
    description: pet?.description ?? "",
    species: pet?.species ?? SPECIES[0],
    breed: pet?.breed ?? "",
    age: pet?.age ?? "",
    size: pet?.size ?? SIZES[0],
    temperament: pet?.temperament ?? "",
    vaccinated: pet?.vaccinated ?? false,
    location: pet?.location ?? LOCATIONS[0],
    arrivedOn: pet?.arrivedOn ?? new Date().toISOString().slice(0, 10),
  });
  const [problem, setProblem] = useState(""); // validation message

  // Returns a change handler for one field
  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = values.name.trim();
    const description = values.description.trim();
    const age = Number(values.age);
    if (!name) return setProblem("Give the pet a name.");
    if (!description) return setProblem("Add a short description.");
    if (values.age === "" || !Number.isFinite(age) || age < 0) return setProblem("Age must be 0 or more.");
    setProblem("");

    const result = {
      name,
      description,
      species: values.species,
      breed: values.breed.trim(),
      age,
      size: values.size,
      temperament: values.temperament.trim(),
      vaccinated: values.vaccinated,
      location: values.location,
      arrivedOn: values.arrivedOn,
    };
    if (mode === "create") result.status = "Available"; // new pets start as available
    onSubmit(result);
  };

  const message = problem || error;

  return (
    <form className="panel pet-form" onSubmit={handleSubmit}>
      <h2>{mode === "create" ? "Add a pet" : `Edit ${pet.name}`}</h2>
      <fieldset disabled={saving}>
        <label className="field wide">
          Name
          <input value={values.name} onChange={set("name")} />
        </label>
        <label className="field wide">
          Description
          <input value={values.description} onChange={set("description")} />
        </label>
        <label className="field">
          Species
          <select value={values.species} onChange={set("species")}>
            {SPECIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Breed
          <input value={values.breed} onChange={set("breed")} />
        </label>
        <label className="field">
          Age in years
          <input type="number" min="0" step="1" value={values.age} onChange={set("age")} />
        </label>
        <label className="field">
          Size
          <select value={values.size} onChange={set("size")}>
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field wide">
          Temperament
          <input value={values.temperament} onChange={set("temperament")} />
        </label>
        <label className="field">
          Shelter
          <select value={values.location} onChange={set("location")}>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Arrived on
          <input type="date" value={values.arrivedOn} onChange={set("arrivedOn")} />
        </label>
        <label className="check wide">
          <input type="checkbox" checked={values.vaccinated} onChange={set("vaccinated")} />
          Vaccinated
        </label>
      </fieldset>

      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}

      <div className="actions">
        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save pet"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
