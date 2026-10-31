// Show "—" for a missing value
export const show = (value) => (value === undefined || value === null || value === "" ? "—" : value);

// "2026-08-12" becomes "12 Aug 2026"
export const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
