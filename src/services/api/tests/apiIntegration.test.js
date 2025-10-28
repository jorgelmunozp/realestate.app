import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "../../../services/fetch/useFetch";
import { api } from "../api";
import { errorWrapper } from "../errorWrapper";

jest.mock("../api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("../errorWrapper", () => ({
  errorWrapper: jest.fn(),
}));

describe("Integración: useFetch + api + errorWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("flujo completo: api.get → errorWrapper → useFetch (éxito)", async () => {
    const fakeResponse = { data: { success: true, data: [{ id: 1 }] } };
    api.get.mockResolvedValue(fakeResponse);
    errorWrapper.mockResolvedValue({
      ok: true,
      success: true,
      data: [{ id: 1 }],
      message: "OK",
      error: null,
    });

    const { result } = renderHook(() => useFetch("/properties"));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/properties");
    expect(errorWrapper).toHaveBeenCalled();
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBeNull();
    expect(result.current.message).toBe("OK");
  });

  it("flujo con error: errorWrapper → useFetch maneja error", async () => {
    api.get.mockResolvedValue({});
    errorWrapper.mockResolvedValue({
      ok: false,
      success: false,
      message: "Falló",
      data: null,
      error: { message: "Error 500" },
    });

    const { result } = renderHook(() => useFetch("/error"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual({ message: "Error 500" });
    expect(result.current.message).toBe("");
  });
});
