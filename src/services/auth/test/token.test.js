import {
  getToken,
  decodeToken,
  getTokenPayload,
  getUserFromToken,
  getTokenExp,
  isTokenExpired,
  isTokenNearExpiry,
  saveToken,
  clearToken
} from "../token";

describe("token.js utilities", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  // getToken()
  it("devuelve el token desde sessionStorage", () => {
    sessionStorage.setItem("token", "abc123");
    expect(getToken()).toBe("abc123");
  });

  it("devuelve null si no existe el token", () => {
    expect(getToken()).toBeNull();
  });

  it("maneja errores de acceso al storage", () => {
    const badStorage = { getItem: () => { throw new Error("fail"); } };
    expect(getToken("token", badStorage)).toBeNull();
  });

  // saveToken() y clearToken()
  it("guarda y limpia el token correctamente", () => {
    saveToken("xyz");
    expect(sessionStorage.getItem("token")).toBe("xyz");
    clearToken();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  // decodeToken()
  it("decodifica un JWT válido correctamente", () => {
    const payload = { id: "u1", name: "Jorge" };
    const base64 = btoa(JSON.stringify(payload));
    const token = `aaa.${base64}.bbb`;
    const decoded = decodeToken(token);
    expect(decoded).toEqual(payload);
  });

  it("retorna null con token inválido o no string", () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken(123)).toBeNull();
    expect(decodeToken("invalid.token")).toBeNull();
  });

  // getTokenPayload()
  it("obtiene el payload desde sessionStorage", () => {
    const payload = { email: "test@mail.com" };
    const base64 = btoa(JSON.stringify(payload));
    sessionStorage.setItem("token", `aaa.${base64}.bbb`);
    const result = getTokenPayload();
    expect(result).toEqual(payload);
  });

  // getUserFromToken()
  it("extrae id, name, email y role desde el payload", () => {
    const payload = {
      sub: "123",
      name: "Carlos",
      email: "test@mail.com",
      role: "admin"
    };
    const user = getUserFromToken(payload);
    expect(user).toEqual({
      id: "123",
      name: "Carlos",
      email: "test@mail.com",
      role: "admin"
    });
  });

  it("devuelve null si el payload es inválido", () => {
    expect(getUserFromToken(null)).toBeNull();
    expect(getUserFromToken("string")).toBeNull();
  });

  // getTokenExp(), isTokenExpired(), isTokenNearExpiry()
  it("obtiene la expiración del payload correctamente", () => {
    const payload = { exp: 1712345678 };
    expect(getTokenExp(payload)).toBe(1712345678);
  });

  it("retorna null si el payload no tiene exp", () => {
    expect(getTokenExp({})).toBeNull();
  });

  it("detecta token expirado correctamente", () => {
    const past = Math.floor(Date.now() / 1000) - 100;
    expect(isTokenExpired({ exp: past })).toBe(true);
  });

  it("detecta token válido (no expirado)", () => {
    const future = Math.floor(Date.now() / 1000) + 500;
    expect(isTokenExpired({ exp: future })).toBe(false);
  });

  it("detecta token cerca de expirar correctamente", () => {
    const near = Math.floor(Date.now() / 1000) + 30;
    expect(isTokenNearExpiry({ exp: near }, 60)).toBe(true);
  });

  it("detecta token con suficiente tiempo restante", () => {
    const far = Math.floor(Date.now() / 1000) + 600;
    expect(isTokenNearExpiry({ exp: far }, 60)).toBe(false);
  });
});
