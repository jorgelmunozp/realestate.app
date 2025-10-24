/**
 * Convierte uno o varios PropertyTraceDto del backend (PascalCase)
 * al formato frontend (camelCase)
 */
export const normalizePropertyTrace = (data = []) => {
  const traces = Array.isArray(data) ? data : [data];
  return traces.map(trace => ({
    idPropertyTrace: trace?.IdPropertyTrace ?? "",
    dateSale: trace?.DateSale ?? "",
    name: trace?.Name ?? "",
    value: trace?.Value ?? 0,
    tax: trace?.Tax ?? 0,
    idProperty: trace?.IdProperty ?? ""
  }));
};

/**
 * Convierte un PropertyTrace del frontend (camelCase)
 *    al formato backend (PascalCase)
 */
export const mapPropertyTraceToDto = (trace = {}) => ({
  IdPropertyTrace: trace?.idPropertyTrace ?? "",
  DateSale: trace?.dateSale ?? "",
  Name: trace?.name ?? "",
  Value: trace?.value ?? 0,
  Tax: trace?.tax ?? 0,
  IdProperty: trace?.idProperty ?? ""
});
