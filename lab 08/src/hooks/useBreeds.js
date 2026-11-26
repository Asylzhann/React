import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBreedList, fetchBreedDetails } from "../store/breeds/breedsSlice";
import { selectBreedList, selectBreedEntry } from "../store/breeds/breedsSelectors";
import { useRefreshOnReconnect } from "./useRefreshOnReconnect";

// reload() asks the network (fresh: true) and skips the freshness check (force: true).
export function useBreedList() {
  const dispatch = useDispatch();
  const list = useSelector(selectBreedList);
  const reload = () => dispatch(fetchBreedList({ fresh: true, force: true }));

  useEffect(() => {
    dispatch(fetchBreedList());
  }, [dispatch]);
  useRefreshOnReconnect(list.status === "failed" || list.fromCache, reload);

  return { ...list, loaded: list.loadedAt !== null, reload };
}

export function useBreed(id) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => selectBreedEntry(state, id));
  const reload = () => dispatch(fetchBreedDetails({ id, fresh: true, force: true }));

  useEffect(() => {
    dispatch(fetchBreedDetails({ id }));
  }, [dispatch, id]);
  useRefreshOnReconnect(entry?.status === "failed" || Boolean(entry?.data?.fromCache), reload);

  return { data: entry?.data ?? null, status: entry?.status ?? "idle", error: entry?.error ?? null, reload };
}
