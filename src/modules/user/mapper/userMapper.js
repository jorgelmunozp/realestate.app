/* Convierte un UserDto del backend (PascalCase) a formato frontend (camelCase)
   Basado en el DTO: src/modules/user/dto/User.json */
export const normalizeUser = (data = {}) => {
  const pick = (...keys) => keys.map((k) => data?.[k]).find((v) => v != null && v !== "");
  const id = pick('Id', 'id', 'UserId', 'userId', 'sub');
  const name = pick('Name', 'name', 'FullName', 'fullName', 'Username', 'username') || '';
  const email = pick('Email', 'email', 'Correo', 'correo', 'preferred_username') || '';
  const role = (pick('Role', 'role') || (Array.isArray(data?.roles) ? data.roles[0] : '') || '').toLowerCase();
  return { id, name, email, role };
};

/* Convierte un User del frontend (camelCase) al formato backend (PascalCase) */
export const mapUserToDto = (user = {}) => ({
  Id: user?.id ?? user?.Id ?? undefined,
  Name: user?.name ?? "",
  Email: user?.email ?? "",
  Role: user?.role ?? "",
});
