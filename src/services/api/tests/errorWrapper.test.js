import { flattenErrors, normalizeError, errorWrapper } from "../errorWrapper";

describe("flattenErrors()", () => {
  it("retorna [] si no hay error", () => {
    expect(flattenErrors(null)).toEqual([]);
  });

  it("retorna el mismo array si ya es un array plano", () => {
    expect(flattenErrors(["a", "b"])).toEqual(["a", "b"]);
  });

  it("aplasta objeto con arrays y valores simples", () => {
    const input = { name: ["requerido"], age: "invalido" };
    expect(flattenErrors(input)).toEqual(["requerido", "invalido"]);
  });

  it("convierte string suelto en array", () => {
    expect(flattenErrors("error")).toEqual(["error"]);
  });
});

describe("normalizeError()", () => {
  it("maneja wrapper tipo ServiceResultWrapper", () => {
    const err = {
      response: {
        status: 400,
        data: {
          success: false,
          statusCode: 400,
          message: "Error lógico",
          errors: ["Campo inválido"],
          data: null,
        },
      },
    };

    const result = normalizeError(err);
    expect(result).toEqual({
      success: false,
      statusCode: 400,
      message: "Error lógico",
      errors: ["Campo inválido"],
      data: null,
    });
  });

  it("maneja body con 'errors' de FluentValidation", () => {
    const err = {
      response: {
        status: 422,
        data: {
          errors: { Name: ["Requerido"], Age: ["Invalido"] },
          message: "Validación fallida",
        },
      },
    };

    const result = normalizeError(err);
    expect(result.errors).toEqual(["Requerido", "Invalido"]);
    expect(result.statusCode).toBe(422);
  });

  it("maneja body con 'title' o 'detail' (ASP.NET ProblemDetails)", () => {
    const err = {
      response: {
        status: 500,
        data: {
          title: "Internal Server Error",
          detail: "Stack trace oculto",
          errors: { field: ["boom"] },
        },
      },
    };

    const result = normalizeError(err);
    expect(result.message).toBe("Stack trace oculto");
    expect(result.errors).toEqual(["boom"]);
  });

  it("maneja error sin response (problemas de red o timeout)", () => {
    const err = { message: "Network Error" };
    const result = normalizeError(err);
    expect(result.statusCode).toBe(0);
    expect(result.message).toBe("No hay respuesta del servidor");
    expect(result.errors).toEqual(["Network Error"]);
  });

  it("maneja error simple con response vacía", () => {
    const err = { response: { status: 404, statusText: "Not Found" } };
    const result = normalizeError(err);
    expect(result.statusCode).toBe(404);
    expect(result.message).toBe("Not Found");
  });
});

describe("errorWrapper()", () => {
  it("retorna éxito si el body tiene wrapper válido", async () => {
    const mockResponse = {
      data: { success: true, statusCode: 200, message: "OK", data: { id: 1 } },
    };
    const result = await errorWrapper(Promise.resolve(mockResponse));
    expect(result.ok).toBe(true);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.data);
  });

  it("retorna éxito con unwrap=true devolviendo solo data", async () => {
    const mockResponse = {
      data: { success: true, statusCode: 200, message: "OK", data: { name: "Casa" } },
    };
    const result = await errorWrapper(Promise.resolve(mockResponse), { unwrap: true });
    expect(result.data).toEqual({ name: "Casa" });
  });

  it("maneja respuesta directa (sin wrapper)", async () => {
    const mockResponse = { data: [{ id: 1 }, { id: 2 }] };
    const result = await errorWrapper(Promise.resolve(mockResponse));
    expect(result.success).toBe(true);
    expect(result.message).toBe("Operación exitosa");
  });

  it("maneja error con normalizeError (ServiceResultWrapper fallido)", async () => {
    const err = {
      response: {
        status: 400,
        data: {
          success: false,
          statusCode: 400,
          message: "Falló",
          errors: ["Error de validación"],
        },
      },
    };

    const result = await errorWrapper(Promise.reject(err));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(["Error de validación"]);
    expect(result.message).toBe("Falló");
  });

  it("maneja error sin response (problemas de red)", async () => {
    const err = new Error("Network Error");
    const result = await errorWrapper(Promise.reject(err));
    expect(result.ok).toBe(false);
    expect(result.message).toBe("No hay respuesta del servidor");
    expect(result.errors).toContain("Network Error");
  });
});
