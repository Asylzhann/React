// Show "—" for a missing value
export const show = (value) => (value === undefined || value === null || value === "" ? "—" : value);

// "2026-08-12" becomes "12 Aug 2026"
export const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

// "3 years", "1 year" or "—"
export const formatAge = (age) => (age === undefined || age === null ? "—" : `${age} ${age === 1 ? "year" : "years"}`);

// Returns a sorted copy. The API already sorts by name; the other orders are done here.
export function sortPets(pets, sort) {
  const copy = [...pets];
  if (sort === "youngest") return copy.sort((a, b) => (a.age ?? 99) - (b.age ?? 99));
  if (sort === "oldest") return copy.sort((a, b) => (b.age ?? -1) - (a.age ?? -1));
  if (sort === "newest") return copy.sort((a, b) => (b.arrivedOn ?? "").localeCompare(a.arrivedOn ?? ""));
  return copy; // "name" and "name-desc" come from the API in the right order
}
