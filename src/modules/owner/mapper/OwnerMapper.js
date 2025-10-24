// src/mappers/ownerMapper.js

/**
 * Normaliza un OwnerDto desde el backend a camelCase
 */
export const normalizeOwner = (data = {}) => ({
  name: data.Name || "",
  address: data.Address || "",
  photo: data.Photo || "",
  birthday: data.Birthday || "",
});

/**
 * Mapea un Owner del frontend al formato del backend
 */
export const mapOwnerToDto = (owner = {}) => ({
  Name: owner.name,
  Address: owner.address,
  Photo: owner.photo,
  Birthday: owner.birthday,
});
