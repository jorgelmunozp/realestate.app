// Convierte un PropertyDto del backend (PascalCase) a formato frontend (camelCase)
export const normalizeProperty = (data = {}) => ({
  idProperty: data?.IdProperty ?? "",
  name: data?.Name ?? "",
  address: data?.Address ?? "",
  price: data?.Price ?? 0,
  codeInternal: data?.CodeInternal ?? 0,
  year: data?.Year ?? 0,
  idOwner: data?.IdOwner ?? "",
  image: data?.Image
    ? {
        idPropertyImage: data.Image.IdPropertyImage ?? "",
        idProperty: data.Image.IdProperty ?? "",
        file: data.Image.File ?? "",
        enabled: data.Image.Enabled ?? true,
      }
    : null,
});

// Convierte un Property del frontend (camelCase) al formato backend (PascalCase)
export const mapPropertyToDto = (property = {}) => ({
  IdProperty: property?.idProperty ?? "",
  Name: property?.name ?? "",
  Address: property?.address ?? "",
  Price: property?.price ?? 0,
  CodeInternal: property?.codeInternal ?? 0,
  Year: property?.year ?? 0,
  IdOwner: property?.idOwner ?? "",
  Image: property?.image
    ? {
        IdPropertyImage: property.image.idPropertyImage ?? "",
        IdProperty: property.image.idProperty ?? "",
        File: property.image.file ?? "",
        Enabled: property.image.enabled ?? true,
      }
    : undefined,
});
