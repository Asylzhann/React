import { createSelector } from "@reduxjs/toolkit";
import { petsAdapter } from "./petsSlice";
import { SPECIES, STATUSES, SIZES } from "../../constants";
import { sortPets } from "../../utils/format";

const adapter = petsAdapter.getSelectors((state) => state.pets);
export const selectAllPets = adapter.selectAll;
export const selectPetById = adapter.selectById;

export const selectPetsListStatus = (state) => state.pets.list.status;
export const selectPetsListError = (state) => state.pets.list.error;
export const selectPetsLoaded = (state) => state.pets.list.loadedAt !== null;
export const selectPetDetails = (state, id) => state.pets.details[id];

// Each input selector picks ONE value from `filters` (a new object on every render), so the result stays memoized.
export const selectFilteredPets = createSelector(
  [
    selectAllPets,
    (_state, filters) => filters.search,
    (_state, filters) => filters.species,
    (_state, filters) => filters.status,
    (_state, filters) => filters.shelter,
    (_state, filters) => filters.sort,
  ],
  (pets, search, species, status, shelter, sort) => {
    const text = search.trim().toLowerCase();
    const filtered = pets.filter(
      (p) =>
        (!text || `${p.name} ${p.description ?? ""}`.toLowerCase().includes(text)) &&
        (!species || p.species === species) &&
        (!status || p.status === status) &&
        (!shelter || p.location === shelter)
    );
    return sortPets(filtered, sort);
  }
);

export const selectDashboard = createSelector([selectAllPets, (_state, shelter) => shelter], (pets, shelter) => {
  const inScope = shelter ? pets.filter((p) => p.location === shelter) : pets;
  const count = (field, value) => inScope.filter((p) => p[field] === value).length;
  const ages = inScope.filter((p) => typeof p.age === "number").map((p) => p.age);
  const rows = (field, values) => values.map((label) => ({ label, count: count(field, label) }));
  return {
    total: inScope.length,
    available: count("status", "Available"),
    reserved: count("status", "Reserved"),
    adopted: count("status", "Adopted"),
    vaccinated: inScope.filter((p) => p.vaccinated === true).length,
    averageAge: ages.length ? ages.reduce((sum, a) => sum + a, 0) / ages.length : null,
    bySpecies: rows("species", SPECIES).filter((r) => r.count > 0),
    byStatus: rows("status", STATUSES),
    bySize: rows("size", SIZES).filter((r) => r.count > 0),
    latest: [...inScope].sort((a, b) => (b.arrivedOn ?? "").localeCompare(a.arrivedOn ?? "")).slice(0, 4),
  };
});
