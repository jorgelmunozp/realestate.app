/**
 * Convierte un UserDto del backend (PascalCase) a formato frontend (camelCase)
 * Basado en el DTO: src/modules/user/dto/User.json
 */
export const normalizeUser = (data = {}) => ({
  name: data?.Name ?? "",
  email: data?.Email ?? "",
  role: data?.Role ?? "",
});

/**
 * Convierte un User del frontend (camelCase) al formato backend (PascalCase)
 */
export const mapUserToDto = (user = {}) => ({
  Name: user?.name ?? "",
  Email: user?.email ?? "",
  Role: user?.role ?? "",
});
