import { useEffect, useState } from "react";
import { fetchAllRecipes } from "./api";

// Returns `value` only after it stopped changing for `delay` ms
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup cancels the previous timer, so only the last keystroke counts
  }, [value, delay]);
  return debounced;
}

// useState that is mirrored to localStorage
export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// Loads the catalogue. Cleanup aborts the request, so a stale response
// can never overwrite newer state (race condition / unmount safety).
export function useRecipes() {
  const [state, setState] = useState({ status: "loading", recipes: [], error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchAllRecipes(controller.signal)
      .then((recipes) => setState({ status: "success", recipes, error: "" }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ status: "error", recipes: [], error: err.message });
      });
    return () => controller.abort();
  }, [attempt]); // re-runs when "Try again" changes attempt

  const retry = () => {
    setState({ status: "loading", recipes: [], error: "" });
    setAttempt((a) => a + 1);
  };
  return { ...state, retry };
}
