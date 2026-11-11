import { useQuery } from "./useQuery";
import { invalidate } from "../services/cache";
import { fetchPets, fetchPet, addPet, editPet, removePet } from "../services/service";

// Everything the pages need from the server goes through this file.
// Pages never call the API directly.

// All pets cache entries start with this key part, so one invalidate removes them all.
const PETS = "pets";

// The list. `search` and `sort` are part of the key, so each combination is cached separately.
export function usePetList({ search = "", sort = "name" } = {}) {
  return useQuery([PETS, "list", { search, sort }], () => fetchPets({ search, sort }));
}

// One pet. Only whole numbers are valid ids; for anything else no request is sent.
export function usePet(id) {
  return useQuery([PETS, "detail", id], () =>
    /^\d+$/.test(id) ? fetchPet(Number(id)) : Promise.reject(new Error("Item not found"))
  );
}

// Changes. After each one (even a failed one, because a failure may still have changed something)
// the cached pets are thrown away, so the next read shows the real data.
async function thenInvalidate(change) {
  try {
    return await change();
  } finally {
    invalidate([PETS]);
  }
}

export const createPet = (values) => thenInvalidate(() => addPet(values));
export const updatePet = (id, changes) => thenInvalidate(() => editPet(id, changes));
export const deletePet = (id) => thenInvalidate(() => removePet(id));
