// src/modules/core/index/Index.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { Index } from "./Index";

// Mock del thunk: debe devolver una función (thunk) para que dispatch no falle
import { fetchProperties } from "../../../services/store/propertySlice";
jest.mock("../../../services/store/propertySlice", () => ({
  fetchProperties: jest.fn((params) => () => Promise.resolve({ type: "property/fetchMock", meta: { params } })),
}));

// Store mínimo de pruebas (sin redux-persist ni middlewares raros)
const makeStore = (preloaded) =>
  configureStore({
    reducer: {
      property: (state = preloaded?.property || { properties: [], loading: false, meta: { last_page: 1 }, error: null }) => state,
      auth: (state = preloaded?.auth || { user: null }) => state,
    },
    preloadedState: preloaded,
  });

describe("Index Component", () => {
  const renderUI = (preloadedState) =>
    render(
      <Provider store={makeStore(preloadedState)}>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </Provider>
    );

  beforeEach(() => jest.clearAllMocks());

  it("debería renderizar el formulario de búsqueda y propiedades correctamente", () => {
    renderUI();
    expect(screen.getByText(/Inmuebles Disponibles/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar inmueble/i)).toBeInTheDocument();
  });

  it("debería mostrar las propiedades cuando se reciben datos correctamente", async () => {
    renderUI({
      property: {
        properties: [{ idProperty: "1", name: "Casa 1", address: "Dirección 1", price: 500000 }],
        loading: false,
        meta: { last_page: 1 },
        error: null,
      },
    });
    expect(await screen.findByText("Casa 1")).toBeInTheDocument();
    expect(screen.getByText("Dirección 1")).toBeInTheDocument();
    expect(screen.getByText(/\$?\s?500[.,]000/)).toBeInTheDocument();
  });

  it("debería mostrar un mensaje cuando no se encuentren propiedades", async () => {
    renderUI({ property: { properties: [], loading: false, meta: { last_page: 1 }, error: null } });
    expect(await screen.findByText(/No se encontraron inmuebles/i)).toBeInTheDocument();
  });

  it("debería realizar una búsqueda correctamente", async () => {
    renderUI({
      property: {
        properties: [
          { idProperty: "1", name: "Casa 1", address: "Dirección 1", price: 500000 },
          { idProperty: "2", name: "Casa 2", address: "Dirección 2", price: 700000 },
        ],
        loading: false,
        meta: { last_page: 1 },
        error: null,
      },
    });

    const input = screen.getByPlaceholderText(/Buscar inmueble/i);
    fireEvent.change(input, { target: { value: "Casa 1" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Casa 1")).toBeInTheDocument();
    expect(screen.queryByText("Casa 2")).toBeNull();
  });

  it("debería manejar la paginación correctamente (dispara el thunk con page=2)", async () => {
    renderUI({
      property: {
        properties: [{ idProperty: "1", name: "Casa 1", address: "Dirección 1", price: 500000 }],
        loading: false,
        meta: { last_page: 5 },
        error: null,
      },
    });

    fireEvent.click(screen.getByText("2"));
    expect(fetchProperties).toHaveBeenCalledWith({ page: 2, limit: 6, refresh: false });
  });

  it("debería disparar fetchProperties al montar (page=1)", () => {
    renderUI();
    expect(fetchProperties).toHaveBeenCalledWith({ page: 1, limit: 6, refresh: false });
  });
});
