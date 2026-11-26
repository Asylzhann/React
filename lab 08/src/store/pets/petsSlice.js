import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import * as api from "../../services/service";
import { shouldFetch, errorText } from "../helpers";

// One copy of every pet: state.ids and state.entities. The list page and the details page both read from it.
export const petsAdapter = createEntityAdapter();

const initialState = petsAdapter.getInitialState({
  list: { status: "idle", error: null, requestId: null, loadedAt: null },
  details: {}, // petId -> { status, error, requestId, loadedAt }
});

// ---------- thunks ----------

// LIST. `force: true` skips the freshness check (Retry, Reload, after a change).
export const fetchPets = createAsyncThunk(
  "pets/fetchList",
  async (_arg, { rejectWithValue }) => {
    try {
      return await api.fetchPets();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: (arg, { getState }) => shouldFetch(getState().pets.list, arg?.force) }
);

// DETAILS of one pet. Only whole numbers are valid ids; for anything else no request is sent.
export const fetchPetById = createAsyncThunk(
  "pets/fetchOne",
  async ({ id }, { rejectWithValue }) => {
    if (!/^\d+$/.test(id)) return rejectWithValue("Item not found");
    try {
      return await api.fetchPet(Number(id));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  { condition: ({ id, force }, { getState }) => shouldFetch(getState().pets.details[id], force) }
);

// MUTATIONS. After each one (even a failed one, it may have changed something) the list is loaded again.
export const createPet = createAsyncThunk("pets/create", async (values, { dispatch, rejectWithValue }) => {
  try {
    return await api.addPet(values);
  } catch (err) {
    return rejectWithValue({ message: err.message, createdId: err.createdId });
  } finally {
    dispatch(fetchPets({ force: true }));
  }
});

export const updatePet = createAsyncThunk("pets/update", async ({ id, changes }, { dispatch, rejectWithValue }) => {
  try {
    return await api.editPet(id, changes);
  } catch (err) {
    return rejectWithValue({ message: err.message });
  } finally {
    dispatch(fetchPets({ force: true }));
  }
});

export const deletePet = createAsyncThunk("pets/delete", async ({ id, name }, { dispatch, rejectWithValue }) => {
  try {
    await api.removePet(id);
    return { id, name };
  } catch (err) {
    return rejectWithValue({ message: err.message });
  } finally {
    dispatch(fetchPets({ force: true }));
  }
});

// ---------- slice ----------

const petsSlice = createSlice({
  name: "pets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchPets.pending, (state, action) => {
        state.list.status = "loading";
        state.list.error = null;
        state.list.requestId = action.meta.requestId; // "this is the request we wait for"
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // an older answer arrived late: ignore it
        // Keep the fields that only the details request knows.
        const pets = action.payload.map((pet) => ({ ...state.entities[pet.id], ...pet }));
        petsAdapter.setAll(state, pets);
        state.list.status = "succeeded";
        state.list.loadedAt = Date.now();
      })
      .addCase(fetchPets.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.status = "failed";
        state.list.error = errorText(action);
      })
      // details
      .addCase(fetchPetById.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.details[id] = { ...state.details[id], status: "loading", error: null, requestId: action.meta.requestId };
      })
      .addCase(fetchPetById.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        petsAdapter.upsertOne(state, action.payload);
        state.details[id].status = "succeeded";
        state.details[id].loadedAt = Date.now();
      })
      .addCase(fetchPetById.rejected, (state, action) => {
        const { id } = action.meta.arg;
        if (state.details[id]?.requestId !== action.meta.requestId) return;
        state.details[id].status = "failed";
        state.details[id].error = errorText(action);
      })
      // mutations: the server answer goes straight into the one copy of the pet
      .addCase(createPet.fulfilled, (state, action) => {
        petsAdapter.addOne(state, action.payload);
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        petsAdapter.upsertOne(state, action.payload);
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        petsAdapter.removeOne(state, action.payload.id);
        delete state.details[action.payload.id];
      });
  },
});

export default petsSlice.reducer;
