// Previous / Next buttons with the current page number.
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="pagination" aria-label="Pages">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  );
}
