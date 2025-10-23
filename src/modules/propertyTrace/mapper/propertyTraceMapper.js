// src/mappers/propertyTraceMapper.js

/**
 * Normaliza un PropertyTraceDto desde el backend, ya sea objeto o arreglo
 */
export const normalizePropertyTrace = (data = []) => {
  if (!Array.isArray(data)) data = [data];

  return data.map(trace => ({
    id: trace.Id || trace.id || "",
    name: trace.Name || "",
    value: trace.Value || 0,
    tax: trace.Tax || 0,
    dateSale: trace.DateSale || "",
    idProperty: trace.IdProperty || "",
  }));
};

/**
 * Mapea un PropertyTrace al formato del backend
 */
export const mapPropertyTraceToDto = (trace = {}) => ({
  Id: trace.id,
  Name: trace.name,
  Value: trace.value,
  Tax: trace.tax,
  DateSale: trace.dateSale,
  IdProperty: trace.idProperty,
});
