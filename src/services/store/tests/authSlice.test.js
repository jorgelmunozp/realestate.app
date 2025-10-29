import authReducer, { login, logout, updateProfile } from "../authSlice";

describe("authSlice", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  // Estado inicial
  it("usa el estado inicial correcto", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual({
      user: null,
      token: null,
      logged: false,
    });
  });

  // Acción: login
  it("realiza login correctamente (payload plano)", () => {
    const payload = {
      id: "u1",
      name: "Jorge",
      email: "test@mail.com",
      role: "admin",
      token: "abc123",
    };

    const state = authReducer(undefined, login(payload));

    expect(state.logged).toBe(true);
    expect(state.user).toEqual({
      id: "u1",
      name: "Jorge",
      email: "test@mail.com",
      role: "admin",
    });
    expect(state.token).toBe("abc123");

    // Persistencia en sessionStorage
    expect(sessionStorage.getItem("token")).toBe("abc123");
    expect(JSON.parse(sessionStorage.getItem("user"))).toEqual({
      id: "u1",
      name: "Jorge",
      email: "test@mail.com",
      role: "admin",
    });
    expect(sessionStorage.getItem("logged")).toBe("true");
  });

  it("realiza login correctamente (payload anidado con user + token)", () => {
    const payload = {
      user: {
        id: "u2",
        name: "Carlos",
        email: "carlo@mail.com",
        role: "user",
      },
      token: "tokenXYZ",
    };

    const state = authReducer(undefined, login(payload));

    expect(state.logged).toBe(true);
    expect(state.user.name).toBe("Carlos");
    expect(state.token).toBe("tokenXYZ");
    expect(sessionStorage.getItem("token")).toBe("tokenXYZ");
  });

  it("ignora login si payload es inválido", () => {
    const prev = { user: null, token: null, logged: false };
    const state = authReducer(prev, login(undefined));
    expect(state).toEqual(prev);
  });

  // Acción: logout
  it("realiza logout correctamente y limpia sessionStorage", () => {
    const prev = {
      user: { id: "1", name: "Ana" },
      token: "zzz555",
      logged: true,
    };
    sessionStorage.setItem("token", "zzz555");
    sessionStorage.setItem("user", JSON.stringify(prev.user));
    sessionStorage.setItem("logged", "true");

    const state = authReducer(prev, logout());

    expect(state).toEqual({
      user: null,
      token: null,
      logged: false,
    });

    // Verifica que se limpió el storage
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
    expect(sessionStorage.getItem("logged")).toBeNull();
  });

  // Acción: updateProfile
  it("actualiza los datos del usuario correctamente", () => {
    const prev = {
      user: { id: "10", name: "Pepe", email: "old@mail.com", role: "editor" },
      token: "tk777",
      logged: true,
    };

    const payload = { name: "Pepe Actualizado", email: "new@mail.com" };
    const state = authReducer(prev, updateProfile(payload));

    expect(state.user.name).toBe("Pepe Actualizado");
    expect(state.user.email).toBe("new@mail.com");
    expect(sessionStorage.getItem("user")).toContain("Pepe Actualizado");
  });

  it("ignora updateProfile si payload es inválido", () => {
    const prev = {
      user: { id: "5", name: "Luis" },
      token: "abc",
      logged: true,
    };
    const state = authReducer(prev, updateProfile(undefined));
    expect(state).toEqual(prev);
  });
});
