// src/mappers/propertyImageMapper.js

/**
 * Normaliza un PropertyImageDto desde el backend
 */
export const normalizePropertyImage = (data = {}) => ({
  id: data.Id || data.id || "",
  file: data.File || "",
  enabled: data.Enabled ?? true,
  idProperty: data.IdProperty || "",
});

/**
 * Mapea una imagen de propiedad al formato del backend
 */
export const mapPropertyImageToDto = (image = {}) => ({
  Id: image.id,
  File: image.file,
  Enabled: image.enabled,
  IdProperty: image.idProperty,
});
