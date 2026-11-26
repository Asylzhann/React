import { createSlice, nanoid } from "@reduxjs/toolkit";
import { createPet, updatePet, deletePet } from "../pets/petsSlice";

// Short messages shown at the top of every page ("Bella was added."). They live in the store because
// they must survive a change of page: a pet is created on /pets and the message appears on /pets/12.
const noticesSlice = createSlice({
  name: "notices",
  initialState: { items: [] },
  reducers: {
    pushNotice: {
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
      prepare: (kind, text) => ({ payload: { id: nanoid(), kind, text } }),
    },
    dismissNotice: (state, action) => {
      state.items = state.items.filter((notice) => notice.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    const add = (state, action, kind, text) => {
      state.items.push({ id: action.meta.requestId, kind, text });
    };
    builder
      .addCase(createPet.fulfilled, (state, action) => add(state, action, "success", `${action.payload.name} was added.`))
      .addCase(createPet.rejected, (state, action) => {
        if (action.payload?.createdId !== undefined) {
          add(state, action, "error", "The pet was created, but its details could not be saved. Press Edit to finish.");
        }
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        const keys = Object.keys(action.meta.arg.changes);
        const onlyStatus = keys.length === 1 && keys[0] === "status";
        const { name, status } = action.payload;
        add(state, action, "success", onlyStatus ? `${name} is now ${String(status).toLowerCase()}.` : `${name} was updated.`);
      })
      .addCase(deletePet.fulfilled, (state, action) => add(state, action, "success", `${action.payload.name} was removed.`));
  },
});

export const { pushNotice, dismissNotice } = noticesSlice.actions;
export const selectNotices = (state) => state.notices.items;
export default noticesSlice.reducer;
