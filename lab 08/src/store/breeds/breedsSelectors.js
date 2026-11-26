import { createSelector } from "@reduxjs/toolkit";

export const selectBreedList = (state) => state.breeds.list;
export const selectBreedEntry = (state, id) => state.breeds.details[id];
const selectBreedItems = (state) => state.breeds.list.items;

export const selectFilteredBreeds = createSelector(
  [selectBreedItems, (_state, filters) => filters.search, (_state, filters) => filters.onlyWithSub],
  (items, search, onlyWithSub) => {
    const text = search.trim().toLowerCase();
    return items.filter((b) => (!text || b.id.includes(text)) && (!onlyWithSub || b.subBreeds.length > 0));
  }
);
