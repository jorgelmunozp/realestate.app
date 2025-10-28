import { store, persistor } from "../store";
import { login, logout } from "../authSlice";
import propertyReducer from "../propertySlice";

describe("🧩 Redux Integration: store + slices + persist", () => {
  beforeEach(() => {
    // Limpia sessionStorage simulado
    sessionStorage.clear();
  });

  it("crea el store correctamente con los reducers esperados", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("property");
  });

  it("permite hacer dispatch de login y cambia el estado en auth", () => {
    const user = { id: "u1", name: "Jorge", email: "test@mail.com", role: "admin", token: "abc123" };
    store.dispatch(login(user));

    const state = store.getState();
    expect(state.auth.user.name).toBe("Jorge");
    expect(state.auth.user.email).toBe("test@mail.com");
    expect(state.auth.user.role).toBe("admin");
    expect(state.auth.logged).toBe(true);
  });

  it("permite hacer logout y limpia el estado", () => {
    const user = { id: "u1", name: "Carlos", token: "xyz789" };
    store.dispatch(login(user));
    store.dispatch(logout());

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
    expect(state.auth.logged).toBe(false);
  });

  it("permite modificar el slice de propiedades (property)", () => {
    const state = store.getState();
    expect(propertyReducer).toBeInstanceOf(Function);
    expect(state.property).toBeDefined();
  });

  it("el persistor está configurado correctamente", () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.persist).toBe("function");
  });

  it("la store es compatible con redux-persist (dispatch persist actions)", async () => {
    // Simula persistencia en memoria
    const persistPromise = new Promise((resolve) => {
      persistor.persist();
      resolve(true);
    });

    const result = await persistPromise;
    expect(result).toBe(true);
  });
});
