export const toArray = (raw) => (Array.isArray(raw) ? raw : raw ? [raw] : []);

export const norm = (v) => (v == null ? '' : String(v).toLowerCase());

export const rolesOf = (raw) => toArray(raw).map(norm);

export const hasAnyRole = (raw, allowed = []) => {
  const userRoles = rolesOf(raw);
  const allowedRoles = toArray(allowed).map(norm);
  return allowedRoles.length === 0 ? true : allowedRoles.some((r) => userRoles.includes(r));
};

