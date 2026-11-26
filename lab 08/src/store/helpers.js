// Loaded data counts as fresh for this long; no second request is sent in that time.
export const FRESH_FOR = 30_000;

export function shouldFetch(entry, force) {
  if (force || !entry) return true;
  if (entry.status === "loading") return false;
  return !(entry.status === "succeeded" && Date.now() - entry.loadedAt < FRESH_FOR);
}

// The message of a rejected thunk: it is either a string or { message } (see rejectWithValue).
export const errorText = (action) =>
  (typeof action.payload === "string" ? action.payload : action.payload?.message) ?? action.error?.message ?? "Something went wrong";
