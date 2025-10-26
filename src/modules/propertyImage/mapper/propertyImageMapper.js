// ===========================================================
// 🔹 Normaliza imagen del backend (PascalCase → camelCase)
// ===========================================================
export const normalizePropertyImage = (data = {}) => ({
  idPropertyImage:
    data?.IdPropertyImage ?? data?.idPropertyImage ?? data?.id ?? "",
  file: data?.File ?? data?.file ?? "",
  enabled:
    data?.Enabled ?? data?.enabled ?? true,
  idProperty:
    data?.IdProperty ?? data?.idProperty ?? "",
  url: data?.Url ?? data?.url ?? "",
  imagePreview: data?.imagePreview
    ? data.imagePreview
    : data?.File
    ? `data:image/jpeg;base64,${data.File}`
    : "",
});

// ===========================================================
// 🔹 Mapea imagen del frontend (camelCase → PascalCase)
// ===========================================================
export const mapPropertyImageToDto = (image = {}) => ({
  IdPropertyImage:
    image?.idPropertyImage ??
    image?.IdPropertyImage ??
    image?.id ??
    undefined,
  File: image?.file ?? "",
  Enabled: image?.enabled ?? true,
  IdProperty: image?.idProperty ?? "",
});
