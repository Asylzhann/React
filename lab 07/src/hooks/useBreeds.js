import { useQuery } from "./useQuery";
import { fetchBreeds, fetchBreed } from "../services/breedsService";

// The pages get breeds only through these hooks (same pattern as usePets.js).
// `fresh` is true after Reload / "Refresh now": the network is asked first.
export const useBreedList = () => useQuery(["breeds", "list"], ({ fresh }) => fetchBreeds({ fresh }));

export const useBreed = (id) => useQuery(["breeds", "detail", id], ({ fresh }) => fetchBreed(id, { fresh }));
