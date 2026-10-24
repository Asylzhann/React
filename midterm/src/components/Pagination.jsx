// Previous / Next buttons with the current page number. Hidden when there is only one page.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pages">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        Next
      </button>
    </nav>
  );
}
