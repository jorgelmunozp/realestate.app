import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { login, logout } from "../authSlice";
import authReducer from "../authSlice";
import propertyReducer from "../propertySlice";

jest.mock("redux-persist/lib/storage/createWebStorage", () =>
  jest.fn(() => {
    const mockStorage = {};
    return {
      getItem: (key) => Promise.resolve(mockStorage[key] || null),
      setItem: (key, value) => {
        mockStorage[key] = value;
        return Promise.resolve(value);
      },
      removeItem: (key) => {
        delete mockStorage[key];
        return Promise.resolve();
      },
      _storage: mockStorage, // solo para test
    };
  })
);

describe("🧩 Redux Persist Integration (auth persist sessionStorage)", () => {
  let sessionStorage;
  let store, persistor;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage = createWebStorage("session");
    const persistConfig = {
      key: "auth",
      storage: sessionStorage,
      whitelist: ["user", "token", "logged"],
    };
    const persistedAuthReducer = persistReducer(persistConfig, authReducer);

    store = configureStore({
      reducer: {
        auth: persistedAuthReducer,
        property: propertyReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    persistor = persistStore(store);
  });

  it("persiste el estado de auth tras login", async () => {
    const user = {
      id: "u1",
      name: "Jorge",
      email: "test@mail.com",
      role: "admin",
      token: "abc123",
    };

    // Dispatch login
    store.dispatch(login(user));
    const stateBefore = store.getState();
    expect(stateBefore.auth.user.name).toBe("Jorge");
    expect(stateBefore.auth.logged).toBe(true);

    // Forzar persistencia
    await persistor.flush();

    // Verifica que el estado se guardó en sessionStorage
    const key = "persist:auth";
    const persisted = await sessionStorage.getItem(key);
    expect(persisted).toBeTruthy();
    expect(persisted).toContain("Jorge");
  });

  it("hidrata correctamente tras recrear la store (como reload de página)", async () => {
    // Simula login inicial
    store.dispatch(login({ id: "u1", name: "Luis", token: "xyz789" }));
    await persistor.flush();

    // Guardar sessionStorage actual
    const persistedState = await sessionStorage.getItem("persist:auth");
    expect(persistedState).toContain("Luis");

    // 🔄 Simula recargar la app (nueva store con misma persistencia)
    const newSessionStorage = createWebStorage("session");
    newSessionStorage._storage["persist:auth"] = persistedState;

    const newPersistConfig = {
      key: "auth",
      storage: newSessionStorage,
      whitelist: ["user", "token", "logged"],
    };

    const newPersistedAuthReducer = persistReducer(newPersistConfig, authReducer);
    const newStore = configureStore({
      reducer: {
        auth: newPersistedAuthReducer,
        property: propertyReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const newPersistor = persistStore(newStore);
    await newPersistor.flush();

    // Verifica que el estado persistió correctamente
    const newState = newStore.getState();
    expect(newState.auth.user.name).toBe("Luis");
    expect(newState.auth.logged).toBe(true);
  });

  it("limpia la persistencia tras logout", async () => {
    store.dispatch(login({ id: "u1", name: "Ana", token: "zzz555" }));
    await persistor.flush();

    store.dispatch(logout());
    const stateAfter = store.getState();
    expect(stateAfter.auth.logged).toBe(false);
    expect(stateAfter.auth.user).toBeNull();
  });
});
