import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBreeds, fetchBreed } from "../../services/breedsService";
import { shouldFetch, errorText } from "../helpers";

const initialState = {
  list: { status: "idle", error: null, requestId: null, loadedAt: null, items: [], fromCache: false, cachedAt: null },
  details: {}, // breedId -> { status, error, requestId, loadedAt, data }
};

// `fresh: true` asks the network instead of a copy saved by the service worker.
// `force: true` skips the freshness check of the store.
export const fetchBreedList = createAsyncThunk(
  "breeds/fetchList",
  async ({ fresh = false } = {}, { rejectWithValue }) => {
    try {
      return await fetchBreeds({ fresh });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: (arg, { getState }) => shouldFetch(getState().breeds.list, arg?.force) }
);

export const fetchBreedDetails = createAsyncThunk(
  "breeds/fetchOne",
  async ({ id, fresh = false }, { rejectWithValue }) => {
    try {
      return await fetchBreed(id, { fresh });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: ({ id, force }, { getState }) => shouldFetch(getState().breeds.details[id], force) }
);

const breedsSlice = createSlice({
  name: "breeds",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreedList.pending, (state, action) => {
        state.list.status = "loading";
        state.list.error = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchBreedList.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        const { items, fromCache, cachedAt } = action.payload;
        Object.assign(state.list, { status: "succeeded", loadedAt: Date.now(), items, fromCache, cachedAt });
      })
      .addCase(fetchBreedList.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.status = "failed";
        state.list.error = errorText(action);
      })
      .addCase(fetchBreedDetails.pending, (state, action) => {
        const { id } = action.meta.arg;
        const before = state.details[id] ?? { data: null, loadedAt: null };
        state.details[id] = { ...before, status: "loading", error: null, requestId: action.meta.requestId };
      })
      .addCase(fetchBreedDetails.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        Object.assign(state.details[id], { status: "succeeded", loadedAt: Date.now(), data: action.payload });
      })
      .addCase(fetchBreedDetails.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        state.details[id].status = "failed";
        state.details[id].error = errorText(action);
      });
  },
});

export default breedsSlice.reducer;
