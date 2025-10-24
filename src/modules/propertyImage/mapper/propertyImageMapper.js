// src/mappers/propertyImageMapper.js

/**
 * Normaliza un PropertyImageDto desde el backend
 */
export const normalizePropertyImage = (data = {}) => ({
  file: data.File || "",
  enabled: data.Enabled ?? true
});

/**
 * Mapea una imagen de propiedad al formato del backend
 */
export const mapPropertyImageToDto = (image = {}) => ({
  File: image.file,
  Enabled: image.enabled
});
