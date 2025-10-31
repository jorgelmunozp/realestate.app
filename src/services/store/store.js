import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import authReducer from "./authSlice";
import propertyReducer from "./propertySlice";

//useFetch Configuración del almacenamiento en sesión (sessionStorage)
const createSessionStorage = () => {
  try {
    return createWebStorage("session");
  } catch {
    // Fallback para entornos sin window (SSR o pruebas)
    return {
      getItem: () => Promise.resolve(null),
      setItem: (_key, value) => Promise.resolve(value),
      removeItem: () => Promise.resolve(),
    };
  }
};
const sessionStorage = createSessionStorage();

//useFetch Configuración de persistencia solo para auth
const persistConfig = {
  key: "auth",
  storage: sessionStorage,
  whitelist: ["user", "token", "logged"], // persistimos solo lo necesario
};

// Reducer persistente para autenticación
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

//useFetch Store principal
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    property: propertyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // evita warnings con redux-persist
    }),
});

//useFetch Persistor (necesario para <PersistGate> en tu App.jsx)
export const persistor = persistStore(store);
