import { configureStore } from "@reduxjs/toolkit";
import petsReducer from "./pets/petsSlice";
import breedsReducer from "./breeds/breedsSlice";
import noticesReducer from "./notices/noticesSlice";

// The Redux store: three slices. Authentication stays in AuthContext (Firebase keeps its own session).
export const store = configureStore({
  reducer: {
    pets: petsReducer,
    breeds: breedsReducer,
    notices: noticesReducer,
  },
});
