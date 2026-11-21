export const DEFAULT_TTL = 30_000; // 30 seconds

const entries = new Map(); // key text -> { data, expiresAt }
const inflight = new Map(); // key text -> Promise of a request that is running now

// ["pets", "detail", 3] -> '["pets","detail",3]'. Equal keys give equal text.
const keyText = (queryKey) => JSON.stringify(queryKey);

// Returns { data } if there is a fresh entry, otherwise undefined.
// (An object is returned so that cached values like null or 0 can still be told from "no entry".)
export function peek(queryKey) {
  const text = keyText(queryKey);
  const entry = entries.get(text);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    entries.delete(text); // expired
    return undefined;
  }
  return { data: entry.data };
}

// Gives the data for a key: from the cache if fresh, otherwise by calling `load()`.
export function fetchWithCache(queryKey, load, ttl = DEFAULT_TTL) {
  const hit = peek(queryKey);
  if (hit) return Promise.resolve(hit.data);

  const text = keyText(queryKey);
  if (inflight.has(text)) return inflight.get(text); // someone is already loading it

  const request = load()
    .then((data) => {
      // Save only if this request was not cancelled by invalidate() while it was running.
      if (inflight.get(text) === request) entries.set(text, { data, expiresAt: Date.now() + ttl });
      return data;
    })
    .finally(() => {
      if (inflight.get(text) === request) inflight.delete(text);
    });
  inflight.set(text, request);
  return request;
}

// Does key `a` start with all the parts of `prefix`?  ["pets","list",{}] starts with ["pets"].
const startsWith = (text, prefix) => {
  const key = JSON.parse(text);
  return prefix.every((part, i) => JSON.stringify(key[i]) === JSON.stringify(part));
};

// Throws away every cached entry (and forgets every running request) whose key starts with `prefix`.
// A request that is still running will still answer its caller, but its result is not stored.
export function invalidate(prefix) {
  for (const text of [...entries.keys()]) if (startsWith(text, prefix)) entries.delete(text);
  for (const text of [...inflight.keys()]) if (startsWith(text, prefix)) inflight.delete(text);
}
