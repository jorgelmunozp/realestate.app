import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import * as StoreModule from "../store"; // importa el módulo real

jest.mock("@reduxjs/toolkit", () => ({
  configureStore: jest.fn(),
}));
jest.mock("redux-persist", () => ({
  persistStore: jest.fn(),
  persistReducer: jest.fn((config, reducer) => reducer),
}));
jest.mock("redux-persist/lib/storage/createWebStorage", () =>
  jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn((_k, v) => Promise.resolve(v)),
    removeItem: jest.fn(() => Promise.resolve()),
  }))
);
jest.mock("../authSlice", () => jest.fn(() => ({ user: null })));
jest.mock("../propertySlice", () => jest.fn(() => ({ properties: [] })));

describe("store.js configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea sessionStorage personalizado correctamente", () => {
    const session = StoreModule.store; // fuerza carga del módulo
    expect(createWebStorage).toHaveBeenCalledWith("session");
  });

  it("usa persistReducer solo en el slice auth", () => {
    expect(persistReducer).toHaveBeenCalled();
    const callArgs = persistReducer.mock.calls[0][0];
    expect(callArgs.key).toBe("auth");
    expect(callArgs.whitelist).toContain("user");
    expect(callArgs.whitelist).toContain("token");
    expect(callArgs.whitelist).toContain("logged");
  });

  it("configura correctamente los reducers en configureStore", () => {
    expect(configureStore).toHaveBeenCalledWith(
      expect.objectContaining({
        reducer: expect.objectContaining({
          auth: expect.any(Function),
          property: expect.any(Function),
        }),
      })
    );
  });

  it("crea el persistor a partir del store", () => {
    const fakeStore = { getState: jest.fn() };
    persistStore.mockReturnValueOnce("persistorFake");
    const result = StoreModule.persistor;
    expect(persistStore).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("usa fallback de sessionStorage sin window (SSR/test env)", () => {
    // Simula fallo de createWebStorage
    const brokenStorage = jest.requireActual("redux-persist/lib/storage/createWebStorage");
    brokenStorage.mockImplementationOnce(() => {
      throw new Error("no window");
    });
    jest.isolateModules(() => {
      const reimported = require("../store");
      const storage = reimported.store; // fuerza ejecución
      expect(storage).toBeDefined();
    });
  });
});
