import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import ownerReducer from "./ownerSlice.js";
import propertyReducer from "./propertySlice.js";
import propertyImageReducer from "./propertyImageSlice.js";
import propertyTraceReducer from "./propertyTraceSlice.js";

import sessionStorage from "redux-persist/lib/storage/session"; // Cambiamos localStorage por sessionStorage
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage: sessionStorage, // persistirá solo por la sesión del navegador
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    owner: ownerReducer,
    property: propertyReducer,
    propertyImage: propertyImageReducer,
    propertyTrace: propertyTraceReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
