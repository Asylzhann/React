// Public API: Dog CEO (no key). The service worker caches these requests (build/sw-template.js).
const API = import.meta.env.VITE_DOG_API || "https://dog.ceo/api";

export const OFFLINE_MESSAGE = "You are offline and this data was not saved on this device yet.";

export const breedTitle = (id) =>
  id
    .split("-")
    .reverse()
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

async function getJson(path, { fresh = false } = {}) {
  let response;
  try {
    // "no-cache" tells the service worker to ask the network first.
    response = await fetch(`${API}${path}`, fresh ? { cache: "no-cache" } : undefined);
  } catch (error) {
    throw new Error(OFFLINE_MESSAGE);
  }
  if (response.headers.get("x-sw-offline") === "1") throw new Error(OFFLINE_MESSAGE);

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
  }
  if (!response.ok || !body || body.status !== "success") {
    const failure = new Error(body && body.message ? body.message : `The server answered with status ${response.status}.`);
    failure.code = response.status;
    throw failure;
  }
  return {
    data: body.message,
    fromCache: response.headers.get("x-sw-from-cache") === "1",
    cachedAt: Number(response.headers.get("x-sw-fetched-at")) || null,
  };
}

export async function fetchBreeds(options) {
  const { data, fromCache, cachedAt } = await getJson("/breeds/list/all", options);
  const items = Object.entries(data)
    .map(([id, subBreeds]) => ({ id, subBreeds }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return { items, fromCache, cachedAt };
}

export async function fetchBreed(id, options) {
  if (!/^[a-z]+(-[a-z]+)?$/.test(id)) {
    const failure = new Error("Breed not found");
    failure.code = 404;
    throw failure;
  }
  const [master, sub] = id.split("-");
  const base = sub ? `/breed/${master}/${sub}` : `/breed/${master}`;
  const requests = [getJson(`${base}/images/random/6`, options)];
  if (!sub) requests.push(getJson(`${base}/list`, options));
  const [photos, subList] = await Promise.all(requests);
  const results = [photos, subList].filter(Boolean);
  return {
    id,
    master,
    isSub: Boolean(sub),
    images: photos.data,
    subBreeds: subList ? subList.data : [],
    fromCache: results.some((r) => r.fromCache),
    cachedAt: results.map((r) => r.cachedAt).filter(Boolean).sort()[0] || null,
  };
}
