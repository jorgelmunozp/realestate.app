// src/modules/auth/register/__tests__/Register.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../../../../services/api/api";
import { Register } from "../Register";

jest.mock("sweetalert2", () => ({ fire: jest.fn() }));
jest.mock("../../../../services/api/api", () => ({ api: { post: jest.fn() } }));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let actions;
const makeStore = (preloaded) => {
  actions = [];
  const actionSpy = () => (next) => (action) => { actions.push(action); return next(action); };
  return configureStore({
    reducer: { auth: (s = preloaded?.auth || { user: null }) => s },
    preloadedState: preloaded,
    middleware: (gDM) => gDM().concat(actionSpy),
  });
};

const renderUI = (preloaded) =>
  render(
    <Provider store={makeStore(preloaded)}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => { jest.clearAllMocks(); actions = []; });

describe("Register Component", () => {
  it("renderiza el formulario correctamente", () => {
    renderUI();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("muestra advertencia si hay campos vacíos", async () => {
    renderUI();
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));
    await screen.findByText(/por favor, completa todos los campos/i);
    expect(Swal.fire).toHaveBeenCalledWith({ text: "Por favor, completa todos los campos", icon: "warning" });
  });

  it("llama a la API y maneja éxito", async () => {
    api.post.mockResolvedValue({ status: 200, data: { message: "Usuario creado" } });

    renderUI();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "juan@mail.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(api.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ name: "Juan", email: "juan@mail.com", password: "password123" })
    );

    // Éxito
    expect(await screen.findByText(/registro exitoso/i)).toBeInTheDocument();
    expect(Swal.fire).toHaveBeenCalledWith({
      text: "Registro exitoso. Ahora puedes iniciar sesión.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  });

  it("muestra errores del servidor", async () => {
    api.post.mockRejectedValue({ response: { data: { errors: { email: ["Correo ya registrado"] } } } });

    renderUI();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "juan@mail.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    // Usa findBy* para cumplir la regla prefer-find-by
    expect(
      await screen.findByText((_, el) => el?.textContent?.includes("Correo ya registrado"))
    ).toBeInTheDocument();

    expect(Swal.fire).toHaveBeenCalledWith({
      html: expect.stringContaining("Correo ya registrado"),
      icon: "error",
      confirmButtonText: "Aceptar",
      customClass: { popup: "home-swal-popup", confirmButton: "home-accept-btn" },
    });
  });

  it("maneja estado de carga (loading) en el botón de forma estable", async () => {
    let resolvePost;
    api.post.mockImplementation(
      () => new Promise((res) => { resolvePost = () => res({ status: 200, data: { message: "Usuario creado" } }); })
    );

    renderUI();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "juan@mail.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    // Prefer findBy*
    expect(await screen.findByText(/registrando\.\.\./i)).toBeInTheDocument();

    resolvePost(); // termina la petición
    expect(await screen.findByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it("redirige a /login después de registro exitoso", async () => {
    api.post.mockResolvedValue({ status: 200, data: { message: "Usuario creado" } });

    renderUI();
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "juan@mail.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    // No usamos waitFor+getByRole; verificamos la navegación directamente
    expect(await screen.findByText(/registro exitoso/i)).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
