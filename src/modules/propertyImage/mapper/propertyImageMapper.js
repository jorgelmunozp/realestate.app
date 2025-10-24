/**
 * Convierte un PropertyImageDto del backend (PascalCase) a formato frontend (camelCase)
 */
export const normalizePropertyImage = (data = {}) => ({
  file: data?.File ?? "",
  enabled: data?.Enabled ?? true,
  idProperty: data?.IdProperty ?? "",
  imagePreview: data?.imagePreview ?? ""
});

/**
 * Convierte un PropertyImage del frontend (camelCase) al formato backend (PascalCase)
 */
export const mapPropertyImageToDto = (image = {}) => ({
  File: image?.file ?? "",
  Enabled: image?.enabled ?? true,
  IdProperty: image?.idProperty ?? ""
});
