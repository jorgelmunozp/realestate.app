// ===========================================================
// 🔹 Convierte diferentes formatos de errores en un arreglo plano
// ===========================================================
export function flattenErrors(e) {
  if (!e) return [];
  if (Array.isArray(e)) return e.filter(Boolean).map(String);
  if (typeof e === "object") {
    const out = [];
    for (const [k, v] of Object.entries(e)) {
      if (Array.isArray(v)) out.push(...v.map(String));
      else if (v) out.push(String(v));
    }
    return out;
  }
  return [String(e)];
}

// ===========================================================
// 🔹 Normaliza los errores (FluentValidation / ASP.NET / Custom Wrapper)
// ===========================================================
export function normalizeError(error) {
  const res = error?.response;
  const body = res?.data;
  let statusCode = res?.status ?? 0;
  let message = body?.message || body?.detail || res?.statusText || error?.message || "Error inesperado";
  let errors = [];
  let data = null;

  if (body && typeof body === "object") {
    const hasWrapper = "success" in body || "statusCode" in body || "errors" in body || "data" in body;

    if (hasWrapper) {
      statusCode = body.statusCode ?? statusCode;
      message = body.message ?? message;
      errors = flattenErrors(body.errors);
      data = body.data ?? null;
      return { success: false, statusCode, message, errors, data };
    }

    if (body.errors && typeof body.errors === "object") {
      errors = flattenErrors(body.errors);
      return { success: false, statusCode, message, errors, data: null };
    }

    if (body.title || body.detail) {
      message = body.detail || body.title || message;
      errors = flattenErrors(body.errors);
      return { success: false, statusCode, message, errors, data: null };
    }
  }

  if (!res) {
    return {
      success: false,
      statusCode: 0,
      message: "No hay respuesta del servidor",
      errors: [error?.message || "Network/Timeout"],
      data: null,
    };
  }

  return { success: false, statusCode, message, errors, data: null };
}

// ===========================================================
// 🔹 Wrapper universal de errores para Axios
// ===========================================================
export async function errorWrapper(promise, { unwrap = false } = {}) {
  try {
    const response = await promise;
    const body = response?.data;

    // Caso 1: Backend usa ServiceResultWrapper<T>
    if (body && typeof body === "object" && "success" in body && "statusCode" in body) {
      return {
        ok: true,
        success: body.success,
        statusCode: body.statusCode,
        message: body.message,
        data: unwrap ? body.data : body,
        error: null,
      };
    }

    // Caso 2: Backend devuelve datos directos (sin wrapper)
    return { ok: true, success: true, data: body, message: "Operación exitosa", error: null };
  } catch (err) {
    const friendly = normalizeError(err);
    return { ok: false, ...friendly, error: friendly };
  }
}
