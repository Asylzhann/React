// Text input for searching. The parent owns the value (controlled input).
export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="search"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by dish or ingredient, e.g. chicken"
      aria-label="Search recipes"
    />
  );
}
