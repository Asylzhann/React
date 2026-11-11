import { useState, useEffect } from "react";
import { peek, fetchWithCache, invalidate } from "../services/cache";

// Loads data through the cache and tracks its status: "loading" | "success" | "error".
//   queryKey: array that identifies the data, e.g. ["pets", "detail", 3]
//   queryFn:  function that returns a Promise with the data (called only when the cache has no fresh copy)
// Returns { status, data, error, reload, setData }.
export function useQuery(queryKey, queryFn) {
  const [attempt, setAttempt] = useState(0); // bumped by reload()
  const key = JSON.stringify([queryKey, attempt]); // identifies "this request"
  const [state, setState] = useState({ key, status: "loading", data: null, error: "" });

  useEffect(() => {
    let ignore = false; // true once this request is outdated
    if (!peek(queryKey)) setState({ key, status: "loading", data: null, error: "" });

    fetchWithCache(queryKey, queryFn)
      .then((data) => {
        if (!ignore) setState({ key, status: "success", data, error: "" });
      })
      .catch((err) => {
        if (!ignore) setState({ key, status: "error", data: null, error: err.message });
      });

    return () => {
      ignore = true; // the key changed (or the page was left): drop this answer
    };
  }, [key]);

  // For one render after `key` changes the stored state belongs to the old request.
  // Show cached data at once if we have it, otherwise "loading".
  let current = state;
  if (state.key !== key) {
    const hit = peek(queryKey);
    current = hit ? { status: "success", data: hit.data, error: "" } : { status: "loading", data: null, error: "" };
  }

  // Lets a page replace the loaded data after an edit, without loading again.
  const setData = (next) => setState((prev) => ({ ...prev, data: typeof next === "function" ? next(prev.data) : next }));

  return {
    status: current.status,
    data: current.data,
    error: current.error,
    // Reload = forget the cached copy of this query, then run the request again.
    reload: () => {
      invalidate(queryKey);
      setAttempt((a) => a + 1);
    },
    setData,
  };
}
