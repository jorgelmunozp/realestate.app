// Convierte un PropertyImageDto del backend (PascalCase) a formato frontend (camelCase)
 
export const normalizePropertyImage = (data = {}) => ({
  idPropertyImage: data?.IdPropertyImage ?? data?.idPropertyImage ?? "",
  file: data?.File ?? data?.file ?? "",
  enabled: data?.Enabled ?? data?.enabled ?? true,
  idProperty: data?.IdProperty ?? data?.idProperty ?? "",
  url: data?.Url ?? data?.url ?? "",
  imagePreview: data?.imagePreview ?? "",
});

// Convierte un PropertyImage del frontend (camelCase) al formato backend (PascalCase)
 
export const mapPropertyImageToDto = (image = {}) => ({
  IdPropertyImage: image?.idPropertyImage ?? image?.IdPropertyImage ?? undefined,
  File: image?.file ?? "",
  Enabled: image?.enabled ?? true,
  IdProperty: image?.idProperty ?? "",
});
