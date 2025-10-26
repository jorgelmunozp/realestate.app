export function flattenErrors(e) {
  if (!e) return [];
  if (Array.isArray(e)) return e.filter(Boolean);
  if (typeof e === 'object') {
    const out = [];

    for (const k of Object.keys(e)) {
      const v = e[k];

      if (Array.isArray(v)) out.push(...v);
      else if (v) out.push(String(v));
    }
    return out;
  }
  return [String(e)];
}

export function normalizeError(axiosError) {
  const res = axiosError?.response;
  let statusCode = res?.status ?? 0;
  let message = res?.data?.message || res?.data?.detail || res?.statusText || axiosError?.message || 'Error inesperado';
  let errors = [];
  let data = null;
  const body = res?.data;

  if (body && typeof body === 'object') {
    const looksLikeWrapper =
    Object.prototype.hasOwnProperty.call(body, 'success') ||
    Object.prototype.hasOwnProperty.call(body, 'statusCode') ||
    Object.prototype.hasOwnProperty.call(body, 'errors') ||
    Object.prototype.hasOwnProperty.call(body, 'data');

    if (looksLikeWrapper) {
      statusCode = body.statusCode ?? statusCode;
      message = body.message ?? message;
      errors = flattenErrors(body.errors);
      data = body.data ?? null;

      return { success: false, statusCode, message, errors, data };
    }

    if (body.errors && typeof body.errors === 'object') {
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
      message: 'No hay respuesta del servidor',
      errors: [axiosError?.message || 'Network/Timeout'],
      data: null,
    };
  }

  return { success: false, statusCode, message, errors, data: null };
}

export async function errorWrapper(promise, options = {}) {
  const { unwrap = true } = options;
  try {
    const response = await promise;
    const body = response?.data;
  if (body && typeof body === 'object' && 'success' in body && 'statusCode' in body) {
    return { ok: true, data: unwrap ? body.data : body, error: null };
  }
  return { ok: true, data: body, error: null };
  } catch (err) {
    const friendly = normalizeError(err);
  return { ok: false, data: null, error: friendly };
  }
}