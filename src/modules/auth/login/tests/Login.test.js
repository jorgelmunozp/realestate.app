// src/modules/auth/login/__tests__/Login.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { api } from "../../../../services/api/api";
import { saveToken } from "../../../../services/auth/token";
import Login from "../Login";
import { login } from "../../../../services/store/authSlice";

jest.mock("../../../../services/api/api");
jest.mock("../../../../services/auth/token");
jest.mock("../../../../services/store/authSlice", () => ({
  login: jest.fn((payload) => ({ type: "LOGIN", payload })),
}));
jest.mock("sweetalert2");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

let actions;
const makeStore = (preloaded) => {
  actions = [];
  const actionSpy = () => (next) => (action) => {
    actions.push(action);
    return next(action);
  };
  return configureStore({
    reducer: {
      auth: (state = preloaded?.auth || { user: null }) => state,
    },
    preloadedState: preloaded,
    middleware: (gDM) => gDM().concat(actionSpy),
  });
};

const renderLogin = (preloaded) =>
  render(
    <Provider store={makeStore(preloaded)}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  actions = [];
});

describe("Login Component", () => {
  it("renderiza campos y botones correctamente", () => {
    renderLogin();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresar/i)).toBeInTheDocument();
    expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
  });

  it("muestra alerta si los campos están vacíos", async () => {
    renderLogin();
    fireEvent.click(screen.getByText(/ingresar/i));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith({
        text: "Por favor, completa todos los campos",
        icon: "warning",
      })
    );
  });

  it("realiza login exitoso y navega al home", async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          user: { id: "u123", name: "Jorge", email: "test@mail.com", role: "admin" },
          accessToken: "access123",
          refreshToken: "refresh123",
        },
      },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { name: "email", value: "test@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { name: "password", value: "1234" },
    });
    fireEvent.click(screen.getByText(/ingresar/i));

    await waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(saveToken).toHaveBeenCalledWith("access123");
    expect(saveToken).toHaveBeenCalledWith("refresh123", "refreshToken");

    expect(login).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u123", email: "test@mail.com", role: "admin" })
    );

    expect(actions.some((a) => a.type === "LOGIN" && a.payload?.id === "u123")).toBe(true);

    expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
  });

  it("muestra alerta en error de servidor", async () => {
    api.post.mockRejectedValue({
      response: { data: { message: "Credenciales inválidas" } },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { name: "email", value: "test@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { name: "password", value: "1234" },
    });
    fireEvent.click(screen.getByText(/ingresar/i));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith({
        text: "Credenciales inválidas",
        icon: "error",
      })
    );
  });

  it("navega correctamente al registro y recuperación", () => {
    renderLogin();
    fireEvent.click(screen.getByText(/crear cuenta/i));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
    fireEvent.click(screen.getByText(/olvidaste tu contraseña/i));
    expect(mockNavigate).toHaveBeenCalledWith("/password-recover");
  });
});
