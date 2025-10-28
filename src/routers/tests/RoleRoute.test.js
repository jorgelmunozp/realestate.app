import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoleRoute } from "../RoleRoute";
import { Provider } from "react-redux";
import { store } from "../../services/store/store";  // Ajusta la importación de tu store
import { getTokenPayload, getUserFromToken } from "../../services/auth/token";

// Mock de getTokenPayload y getUserFromToken
jest.mock("../../services/auth/token", () => ({
  getTokenPayload: jest.fn(),
  getUserFromToken: jest.fn(),
}));

describe("RoleRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería redirigir si el usuario no tiene el rol permitido", () => {
    // Simula un usuario sin rol o con un rol incorrecto
    getTokenPayload.mockReturnValue(null);
    getUserFromToken.mockReturnValue({ role: "viewer" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1"]}>
          <Routes>
            <Route path="/edit-property/1" element={<RoleRoute allowed={["admin"]} element={<div>Edit Property</div>} />} />
            <Route path="/home" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verifica que redirija al home
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería permitir el acceso si el rol del usuario está permitido", () => {
    // Simula un usuario con rol correcto
    getTokenPayload.mockReturnValue({ exp: 12345678 });
    getUserFromToken.mockReturnValue({ role: "admin" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1"]}>
          <Routes>
            <Route path="/edit-property/1" element={<RoleRoute allowed={["admin"]} element={<div>Edit Property</div>} />} />
            <Route path="/home" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verifica que se pueda acceder a la ruta protegida
    expect(screen.getByText("Edit Property")).toBeInTheDocument();
  });

  it("debería redirigir al usuario si no tiene roles permitidos", () => {
    // Simula un usuario sin roles permitidos
    getTokenPayload.mockReturnValue({ exp: 12345678 });
    getUserFromToken.mockReturnValue({ role: "viewer" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/edit-property/1"]}>
          <Routes>
            <Route path="/edit-property/1" element={<RoleRoute allowed={["admin", "editor"]} element={<div>Edit Property</div>} />} />
            <Route path="/home" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verifica que se redirige al home
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("debería guardar la última ruta en sessionStorage", () => {
    const pathname = "/edit-property/1";
    const search = "?param=test";
    
    getTokenPayload.mockReturnValue({ exp: 12345678 });
    getUserFromToken.mockReturnValue({ role: "admin" });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[pathname + search]}>
          <Routes>
            <Route path="/edit-property/1" element={<RoleRoute allowed={["admin"]} element={<div>Edit Property</div>} />} />
            <Route path="/home" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verifica que se guarda la última ruta en sessionStorage
    expect(sessionStorage.getItem("lastPath")).toBe(pathname + search);
  });
});
