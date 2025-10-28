/* ===========================================================
   Convierte un UserDto del backend (PascalCase) a formato frontend (camelCase)
   Basado en el DTO: src/modules/user/dto/User.json
   =========================================================== */
export const normalizeUser = (data = {}) => {
  if (typeof data !== "object" || data === null) return { id: "", name: "", email: "", role: "" };

  const pick = (...keys) => {
    for (const key of keys) {
      if (data?.[key] != null && data[key] !== "") return data[key];
    }
    return undefined;
  };

  const id = pick("Id", "id", "UserId", "userId", "sub") || "";
  const name = pick("Name", "name", "FullName", "fullName", "Username", "username") || "";
  const email = pick("Email", "email", "Correo", "correo", "preferred_username") || "";
  const roleRaw =
    pick("Role", "role") ||
    (Array.isArray(data?.roles) ? data.roles[0] : "") ||
    "";

  const role = (roleRaw || "").toString().toLowerCase();

  return { id, name, email, role };
};

/* ===========================================================
   Convierte un User del frontend (camelCase) al formato backend (PascalCase)
   =========================================================== */
export const mapUserToDto = (user = {}) => {
  if (typeof user !== "object" || user === null) return {};

  return {
    Id: user?.id ?? user?.Id ?? null,
    Name: user?.name?.trim?.() || "",
    Email: user?.email?.trim?.() || "",
    Role: user?.role?.trim?.() || "",
  };
};
