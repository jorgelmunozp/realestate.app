import axios from "axios";
import { installAuthInterceptors, refreshToken, ensureFreshToken } from "../session";
import { store } from "../../store/store";
import { getToken, getTokenPayload, isTokenNearExpiry, saveToken, clearToken } from "../token";

jest.mock("axios");
jest.mock("../../api/config", () => ({
  getBaseURL: jest.fn(() => "http://localhost:5235/api"),
}));
jest.mock("../../store/store", () => ({
  store: { dispatch: jest.fn(), getState: jest.fn() },
}));
jest.mock("../../store/authSlice", () => ({
  login: jest.fn((p) => ({ type: "LOGIN", payload: p })),
  logout: jest.fn(() => ({ type: "LOGOUT" })),
}));
jest.mock("../token", () => ({
  getToken: jest.fn(),
  getTokenPayload: jest.fn(),
  isTokenNearExpiry: jest.fn(),
  saveToken: jest.fn(),
  clearToken: jest.fn(),
}));

describe("session.js (auth interceptors & refresh flow)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH;
    sessionStorage.clear();
  });

  // refreshToken()
  it("no hace refresh si no hay endpoint o token", async () => {
    process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH = "";
    getToken.mockReturnValue(null);
    const result = await refreshToken();
    expect(result).toBeNull();
  });

  it("realiza refresh exitoso y despacha login", async () => {
    process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH = "/token/refresh";
    getToken.mockReturnValue("old123");

    const mockResponse = { data: { data: { accessToken: "new456" } } };
    const mockClient = { post: jest.fn().mockResolvedValue(mockResponse) };
    axios.create.mockReturnValue(mockClient);

    store.getState.mockReturnValue({ auth: { user: { id: "1", name: "Jorge" } } });

    const newToken = await refreshToken();

    expect(mockClient.post).toHaveBeenCalledWith(
      "/token/refresh",
      {},
      { headers: { Authorization: "Bearer old123" } }
    );
    expect(saveToken).toHaveBeenCalledWith("new456");
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "LOGIN" }));
    expect(newToken).toBe("new456");
  });

  it("maneja error en refresh limpiando token y redirigiendo a login", async () => {
    process.env.REACT_APP_ENDPOINT_TOKEN_REFRESH = "/token/refresh";
    getToken.mockReturnValue("abc");
    const mockClient = { post: jest.fn().mockRejectedValue(new Error("expired")) };
    axios.create.mockReturnValue(mockClient);

    await expect(refreshToken()).rejects.toThrow("expired");
    expect(clearToken).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "LOGOUT" }));
    expect(window.location.replace).toHaveBeenCalledWith("/login");
  });

  // ensureFreshToken()
  it("devuelve null si no hay payload", async () => {
    getTokenPayload.mockReturnValue(null);
    const result = await ensureFreshToken();
    expect(result).toBeNull();
  });

  it("refresca si el token está por expirar", async () => {
    getTokenPayload.mockReturnValue({ exp: 1 });
    isTokenNearExpiry.mockReturnValue(true);
    const mockRefresh = jest.spyOn(require("../session"), "refreshToken").mockResolvedValue("newTkn");

    const token = await ensureFreshToken();
    expect(mockRefresh).toHaveBeenCalled();
    expect(token).toBe("newTkn");
  });

  it("devuelve el token actual si no está por expirar", async () => {
    getTokenPayload.mockReturnValue({ exp: 999999 });
    isTokenNearExpiry.mockReturnValue(false);
    getToken.mockReturnValue("tokenActual");
    const token = await ensureFreshToken();
    expect(token).toBe("tokenActual");
  });

  // installAuthInterceptors()
  it("instala interceptores de request y response correctamente", async () => {
    const fakeApi = { interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } };
    installAuthInterceptors(fakeApi);
    expect(fakeApi.interceptors.request.use).toHaveBeenCalled();
    expect(fakeApi.interceptors.response.use).toHaveBeenCalled();
  });

  it("añade Authorization header en el interceptor de request", async () => {
    const api = { interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } };
    installAuthInterceptors(api);

    const requestHandler = api.interceptors.request.use.mock.calls[0][0];
    getToken.mockReturnValue("tokenXYZ");
    const cfg = await requestHandler({ headers: {} });
    expect(cfg.headers.Authorization).toBe("Bearer tokenXYZ");
  });

  it("reintenta una petición tras un 401 si el refresh es exitoso", async () => {
    const api = jest.fn();
    api.interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
    installAuthInterceptors(api);

    const [, responseErrorHandler] = api.interceptors.response.use.mock.calls[0];
    const newToken = "tokenRefrescado";
    jest.spyOn(require("../session"), "refreshToken").mockResolvedValue(newToken);

    const original = { headers: {}, __retry: false };
    const error = { response: { status: 401 }, config: original };

    await responseErrorHandler(error);
    expect(original.headers.Authorization).toBe(`Bearer ${newToken}`);
  });

  it("redirige al login si falla el refresh tras un 401", async () => {
    const api = jest.fn();
    api.interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
    installAuthInterceptors(api);

    const [, responseErrorHandler] = api.interceptors.response.use.mock.calls[0];
    jest.spyOn(require("../session"), "refreshToken").mockRejectedValue(new Error("bad refresh"));

    const error = { response: { status: 401 }, config: {} };
    await responseErrorHandler(error);
    expect(window.location.replace).toHaveBeenCalledWith("/login");
  });
});
