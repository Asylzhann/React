import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPets, fetchPetById } from "../store/pets/petsSlice";
import { selectPetsListStatus, selectPetsListError, selectPetsLoaded, selectPetById, selectPetDetails } from "../store/pets/petsSelectors";


export function usePetList() {
  const dispatch = useDispatch();
  const status = useSelector(selectPetsListStatus);
  const error = useSelector(selectPetsListError);
  const loaded = useSelector(selectPetsLoaded);

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  return { status, error, loaded, reload: () => dispatch(fetchPets({ force: true })) };
}

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
