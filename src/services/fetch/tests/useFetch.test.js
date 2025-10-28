import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "../useFetch";
import { api } from "../../api/api";
import { errorWrapper } from "../../api/errorWrapper";

jest.mock("../../api/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("../../api/errorWrapper", () => ({
  errorWrapper: jest.fn(),
}));

describe("useFetch hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no ejecuta fetch si no hay apiUrl", async () => {
    const { result } = renderHook(() => useFetch(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("inicia cargando cuando hay apiUrl", async () => {
    api.get.mockResolvedValue({ data: [] });
    errorWrapper.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useFetch("/test"));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.message).toBe("Datos cargados correctamente");
  });

  it("maneja respuesta lógica con error (success=false)", async () => {
    api.get.mockResolvedValue({ data: null });
    errorWrapper.mockResolvedValue({
      success: false,
      data: null,
      message: "Error de negocio",
      error: { code: 400 },
    });

    const { result } = renderHook(() => useFetch("/bad"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual({ code: 400 });
    expect(result.current.message).toBe("");
  });

  it("maneja errores lanzados (try/catch)", async () => {
    api.get.mockRejectedValue(new Error("Falla de red"));
    errorWrapper.mockImplementation((p) => p);

    const { result } = renderHook(() => useFetch("/fail"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toEqual({ message: "Falla de red" });
    expect(result.current.data).toBeNull();
  });

  it("establece mensaje personalizado si el backend lo provee", async () => {
    api.get.mockResolvedValue({ data: { msg: "OK" } });
    errorWrapper.mockResolvedValue({
      success: true,
      data: { msg: "OK" },
      message: "Todo correcto",
    });

    const { result } = renderHook(() => useFetch("/custom"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ msg: "OK" });
    expect(result.current.message).toBe("Todo correcto");
  });
});
