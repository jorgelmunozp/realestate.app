import { configureStore } from "@reduxjs/toolkit";
import { fetchProperties, createProperty } from "../propertySlice";
import propertyReducer from "../propertySlice";
import { api } from "../../api/api";
import { errorWrapper } from "../../api/errorWrapper";

// Mock de la API y errorWrapper
jest.mock("../../api/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));
jest.mock("../../api/errorWrapper", () => ({
  errorWrapper: jest.fn(),
}));

describe("propertySlice", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({ reducer: { property: propertyReducer } });
  });

  // Acción asincrónica: fetchProperties
  it("carga correctamente las propiedades y actualiza el estado", async () => {
    const mockResponse = {
      ok: true,
      data: { data: [{ idProperty: "1", name: "Casa 1" }], meta: { total: 1, page: 1, limit: 6 } },
    };
    api.get.mockResolvedValue(mockResponse);
    errorWrapper.mockResolvedValue(mockResponse);

    await store.dispatch(fetchProperties({ page: 1, limit: 6 }));

    const state = store.getState().property;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.properties).toEqual([{ idProperty: "1", name: "Casa 1" }]);
    expect(state.meta).toEqual({ total: 1, page: 1, limit: 6, last_page: 1 });
  });

  it("maneja el error al obtener propiedades", async () => {
    const mockError = new Error("Error de red");
    api.get.mockRejectedValue(mockError);
    errorWrapper.mockRejectedValue(mockError);

    await store.dispatch(fetchProperties({ page: 1, limit: 6 }));

    const state = store.getState().property;
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Error de red");
    expect(state.properties).toEqual([]);
  });

  // Acción asincrónica: createProperty
  it("crea una propiedad correctamente", async () => {
    const mockResponse = {
      ok: true,
      data: { data: { idProperty: "2", name: "Casa 2" } },
    };
    api.post.mockResolvedValue(mockResponse);
    errorWrapper.mockResolvedValue(mockResponse);

    await store.dispatch(createProperty({ name: "Casa 2" }));

    const state = store.getState().property;
    expect(state.properties).toHaveLength(1);
    expect(state.properties[0]).toEqual({ idProperty: "2", name: "Casa 2" });
  });

  it("maneja el error al crear una propiedad", async () => {
    const mockError = new Error("Error al crear propiedad");
    api.post.mockRejectedValue(mockError);
    errorWrapper.mockRejectedValue(mockError);

    await store.dispatch(createProperty({ name: "Casa 2" }));

    const state = store.getState().property;
    expect(state.error).toBe("Error al crear propiedad");
    expect(state.properties).toEqual([]);
  });

  // Reducers internos: estados de loading y error
  it("cambia a 'loading' cuando se está haciendo fetch", () => {
    const action = { type: fetchProperties.pending.type };
    const state = propertyReducer(undefined, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("actualiza el estado a 'fulfilled' después de obtener las propiedades", () => {
    const action = {
      type: fetchProperties.fulfilled.type,
      payload: { items: [{ idProperty: "1" }], meta: { total: 1 } },
    };
    const state = propertyReducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.properties).toEqual([{ idProperty: "1" }]);
    expect(state.meta).toEqual({ total: 1 });
  });

  it("actualiza el estado a 'rejected' si hay error al obtener propiedades", () => {
    const action = { type: fetchProperties.rejected.type, error: { message: "Error de red" } };
    const state = propertyReducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Error de red");
  });

  it("actualiza el estado a 'fulfilled' después de crear propiedad", () => {
    const action = {
      type: createProperty.fulfilled.type,
      payload: { idProperty: "2", name: "Casa 2" },
    };
    const state = propertyReducer(undefined, action);
    expect(state.properties).toEqual([{ idProperty: "2", name: "Casa 2" }]);
  });
});
