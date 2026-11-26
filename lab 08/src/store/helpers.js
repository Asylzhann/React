// How long loaded data counts as fresh. Inside this time a second request is not sent.
export const FRESH_FOR = 30_000;

// Used by the `condition` option of the fetch thunks.
//   entry  = the "list" or "details" part of the state (undefined if never requested)
//   force  = true for Retry / Refresh / after a mutation: always send the request
export function shouldFetch(entry, force) {
  if (force || !entry) return true;
  if (entry.status === "loading") return false; // the same request is already running
  return !(entry.status === "succeeded" && Date.now() - entry.loadedAt < FRESH_FOR);
}

// The message of a rejected thunk: it is either a string or { message } (see rejectWithValue).
export const errorText = (action) =>
  (typeof action.payload === "string" ? action.payload : action.payload?.message) ?? action.error?.message ?? "Something went wrong";
