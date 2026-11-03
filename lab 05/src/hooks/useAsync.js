import { useState, useEffect } from "react";

// Runs an async function and tracks its status: "loading" | "success" | "error".
//   load: function that returns a Promise (it may use values from the component)
//   deps: values that load depends on; when one changes, the data is loaded again
// Returns { status, data, error, reload, setData }.
export function useAsync(load, deps) {
  const [attempt, setAttempt] = useState(0); // bumped by reload()
  const key = JSON.stringify([...deps, attempt]); // identifies "this request"
  const [state, setState] = useState({ key, status: "loading", data: null, error: "" });

  useEffect(() => {
    let ignore = false; // true once this request is outdated
    setState({ key, status: "loading", data: null, error: "" });

    load()
      .then((data) => {
        if (!ignore) setState({ key, status: "success", data, error: "" });
      })
      .catch((err) => {
        if (!ignore) setState({ key, status: "error", data: null, error: err.message });
      });

    return () => {
      ignore = true; // a newer request started (or the page was left): drop this answer
    };
  }, [key]);

  // For one render after `key` changes, the stored state still belongs to the old request.
  const current = state.key === key ? state : { status: "loading", data: null, error: "" };

  // Lets a page update the loaded data after an edit, without loading again.
  const setData = (next) =>
    setState((prev) => ({ ...prev, data: typeof next === "function" ? next(prev.data) : next }));

  return {
    status: current.status,
    data: current.data,
    error: current.error,
    reload: () => setAttempt((a) => a + 1),
    setData,
  };
}
