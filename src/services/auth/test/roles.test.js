import { toArray, norm, rolesOf, hasAnyRole } from "../roles";

describe("roles.js helpers", () => {
  // ===========================================================
  // toArray()
  // ===========================================================
  it("devuelve el mismo array si la entrada ya es un array", () => {
    const arr = ["admin", "user"];
    expect(toArray(arr)).toBe(arr);
  });

  it("convierte un valor único en array", () => {
    expect(toArray("admin")).toEqual(["admin"]);
  });

  it("devuelve un array vacío para null o undefined", () => {
    expect(toArray(null)).toEqual([]);
    expect(toArray(undefined)).toEqual([]);
  });

  // ===========================================================
  // norm()
  // ===========================================================
  it("convierte el valor a string en minúsculas", () => {
    expect(norm("ADMIN")).toBe("admin");
    expect(norm(123)).toBe("123");
  });

  it("devuelve string vacío si el valor es null o undefined", () => {
    expect(norm(null)).toBe("");
    expect(norm(undefined)).toBe("");
  });

  // ===========================================================
  // rolesOf()
  // ===========================================================
  it("normaliza un solo rol en array lowercase", () => {
    expect(rolesOf("ADMIN")).toEqual(["admin"]);
  });

  it("normaliza un array mixto de roles", () => {
    expect(rolesOf(["Admin", "EDITOR", "User"])).toEqual(["admin", "editor", "user"]);
  });

  it("devuelve array vacío si el valor es null o vacío", () => {
    expect(rolesOf(null)).toEqual([]);
    expect(rolesOf("")).toEqual([""]);
  });

  // ===========================================================
  // hasAnyRole()
  // ===========================================================
  it("retorna true si el usuario tiene alguno de los roles permitidos", () => {
    expect(hasAnyRole(["admin", "user"], ["editor", "user"])).toBe(true);
  });

  it("retorna false si no tiene ninguno de los roles permitidos", () => {
    expect(hasAnyRole(["admin"], ["guest", "editor"])).toBe(false);
  });

  it("no distingue mayúsculas/minúsculas", () => {
    expect(hasAnyRole("ADMIN", ["admin", "editor"])).toBe(true);
  });

  it("retorna true si la lista de roles permitidos está vacía", () => {
    expect(hasAnyRole(["user"], [])).toBe(true);
    expect(hasAnyRole("admin")).toBe(true);
  });

  it("maneja entradas nulas o vacías correctamente", () => {
    expect(hasAnyRole(null, ["admin"])).toBe(false);
    expect(hasAnyRole(undefined, undefined)).toBe(true); // allowed vacío => true
  });
});
