// Convierte un OwnerDto del backend (PascalCase) a formato frontend (camelCase)
export const normalizeOwner = (data = {}) => ({
  name: data?.Name ?? "",
  address: data?.Address ?? "",
  photo: data?.Photo ?? "",
  birthday: data?.Birthday ?? "",
});

// Convierte un Owner del frontend (camelCase) al formato backend (PascalCase)
export const mapOwnerToDto = (owner = {}) => ({
  Name: owner?.name ?? "",
  Address: owner?.address ?? "",
  Photo: owner?.photo ?? "",
  Birthday: owner?.birthday ?? "",
});
