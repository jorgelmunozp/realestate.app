import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RoleRoute } from "../RoleRoute";
import DashboardRoutes from "../DashboardRoutes";
import { Provider } from "react-redux";
import { store } from "../../services/store/store";

// Asegúrate de que estas funciones están siendo importadas correctamente
import { getTokenPayload, getUserFromToken } from "../../services/auth/token";

// Mock de getUserFromToken para simular diferentes roles
jest.mock("../../services/auth/token", () => ({
  getTokenPayload: jest.fn(),
  getUserFromToken: jest.fn(),
}));

describe("Router Integration Test (DashboardRoutes)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería renderizar la ruta pública /home", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/home"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería permitir acceso a /profile si el usuario está logueado", () => {
    // Simula un usuario logueado
    getUserFromToken.mockReturnValue({ role: "user" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("User Profile")).toBeInTheDocument();
  });

  it("debería redirigir a /home si el usuario no tiene permisos para /edit-property", () => {
    // Simula un usuario sin el rol adecuado
    getUserFromToken.mockReturnValue({ role: "viewer" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería permitir el acceso a /edit-property si el usuario tiene el rol adecuado", () => {
    // Simula un usuario con rol "admin"
    getUserFromToken.mockReturnValue({ role: "admin" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Edit Property")).toBeInTheDocument();
  });

  it("debería permitir el acceso a /profile/edit para roles permitidos", () => {
    // Simula un usuario con rol "admin"
    getUserFromToken.mockReturnValue({ role: "admin" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/profile/edit"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
  });

  it("debería redirigir a /home si un usuario no admin intenta acceder a /users", () => {
    // Simula un usuario con rol no admin
    getUserFromToken.mockReturnValue({ role: "editor" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/users"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería guardar la última ruta visitada en sessionStorage", () => {
    const pathname = "/edit-property/1";
    const search = "?param=test";
    
    getUserFromToken.mockReturnValue({ role: "admin" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[pathname + search]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    // Verifica que se guarda la última ruta visitada en sessionStorage
    expect(sessionStorage.getItem("lastPath")).toBe(pathname + search);
  });

  it("debería redirigir a /home por una ruta no definida (fallback)", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/invalid-route"]}>
          <DashboardRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería manejar múltiples rutas protegidas correctamente", async () => {
    // Simula un usuario con rol "editor"
    getUserFromToken.mockReturnValue({ role: "editor" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1", "/profile/edit"]}>
          <Routes>
            <Route path="/edit-property/1" element={<RoleRoute allowed={["editor"]} element={<div>Edit Property</div>} />} />
            <Route path="/profile/edit" element={<RoleRoute allowed={["admin", "editor"]} element={<div>Edit User</div>} />} />
            <Route path="/home" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verifica que accede correctamente a la ruta protegida /profile/edit
    expect(screen.getByText("Edit User")).toBeInTheDocument();

    // Verifica que es redirigido en la ruta no permitida /edit-property/1
    expect(screen.queryByText("Edit Property")).toBeNull();
  });
});
