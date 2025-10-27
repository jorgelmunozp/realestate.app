// ===========================================================
// Normaliza imagen del backend (PascalCase → camelCase)
// ===========================================================
export const normalizePropertyImage = (data = {}) => ({
  idPropertyImage: data?.IdPropertyImage ?? data?.idPropertyImage ?? data?.id ?? "",
  idProperty: data?.IdProperty ?? data?.idProperty ?? "",
  file: data?.File ?? data?.file ?? "",
  enabled: data?.Enabled ?? data?.enabled ?? true,
  imagePreview: data?.imagePreview
    ? data.imagePreview
    : data?.File
    ? `data:image/jpeg;base64,${data.File}`
    : "",
});

// ===========================================================
// Mapea imagen del frontend (camelCase → PascalCase)
// ===========================================================
export const mapPropertyImageToDto = (image = {}) => ({
  IdPropertyImage: image?.idPropertyImage ?? image?.IdPropertyImage ?? image?.id ?? "",
  IdProperty: image?.idProperty ?? image?.IdProperty ?? "",
  File: image?.file ?? "",
  Enabled: image?.enabled ?? true,
});
