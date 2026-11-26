import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPets, fetchPetById } from "../store/pets/petsSlice";
import { selectPetsListStatus, selectPetsListError, selectPetsLoaded, selectPetById, selectPetDetails } from "../store/pets/petsSelectors";

// Pages use these hooks and the selectors; they never call the API or write thunk code themselves.

// Loads the pets list when the page opens (the thunk skips the request if the data is still fresh).
export function usePetList() {
  const dispatch = useDispatch();
  const status = useSelector(selectPetsListStatus);
  const error = useSelector(selectPetsListError);
  const loaded = useSelector(selectPetsLoaded); // true once the list has arrived at least once

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  return { status, error, loaded, reload: () => dispatch(fetchPets({ force: true })) };
}

// Loads one pet. `pet` is undefined until its details have arrived.
export function usePet(id) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => selectPetDetails(state, id));
  const stored = useSelector((state) => selectPetById(state, id));

  useEffect(() => {
    dispatch(fetchPetById({ id }));
  }, [dispatch, id]);

  const loaded = entry?.loadedAt != null && stored !== undefined;
  return {
    pet: loaded ? stored : undefined,
    status: entry?.status ?? "idle",
    error: entry?.error ?? null,
    reload: () => dispatch(fetchPetById({ id, force: true })),
  };
}
