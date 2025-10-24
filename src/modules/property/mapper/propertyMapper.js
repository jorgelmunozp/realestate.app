// src/mappers/propertyMapper.js

/**
 * Convierte un objeto Property con claves en PascalCase (como viene del backend)
 * a un formato en camelCase para el frontend.
 * 
 * @param {Object} data - Objeto Property recibido del backend
 * @returns {Object} Objeto normalizado con nombres en camelCase
 */
export const normalizeProperty = (data = {}) => ({
  name: data.name || data.Name || "",
  address: data.address || data.Address || "",
  price: data.price || data.Price || 0,
  codeInternal: data.codeInternal || 0,
  year: data.year || data.Year || 0,
});

/**
 * Convierte un objeto Property con claves camelCase (frontend)
 * a formato PascalCase para enviar al backend.
 * 
 * @param {Object} property - Objeto Property del frontend
 * @returns {Object} Objeto listo para enviar al backend
 */
export const mapPropertyToDto = (property = {}) => ({
  Name: property.name,
  Address: property.address,
  Price: property.price,
  CodeInternal: property.codeInternal,
  Year: property.year
});
