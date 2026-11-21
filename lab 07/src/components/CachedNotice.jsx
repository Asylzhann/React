import { usePwa } from "../context/PwaContext";

// Tells the user that the data on screen is a saved copy, not fresh from the server.
export default function CachedNotice({ fromCache, cachedAt, onRefresh }) {
  const { online } = usePwa();
  if (!fromCache) return null;
  const when = cachedAt ? new Date(cachedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "earlier";
  return (
    <p className="cached-notice" role="status">
      {online ? `Showing a saved copy from ${when}. Press Refresh now for the latest.` : `You are offline. Showing a saved copy from ${when}.`}
      {online && onRefresh && (
        <button type="button" onClick={onRefresh}>
          Refresh now
        </button>
      )}
    </p>
  );
}
