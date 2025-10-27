import { createSlice } from "@reduxjs/toolkit";

// ===========================================================
// Estado inicial
// ===========================================================
const initialState = {
  user: null,     // Datos del usuario logueado
  token: null,    // JWT activo
  logged: false,  // Estado de sesión
};

// ===========================================================
// Slice de autenticación
// ===========================================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // =======================================================
    //useFetch Inicia sesión (guarda usuario + token en Redux y storage)
    // =======================================================
    login: (state, { payload }) => {
      if (!payload) return;

      // ✅ Estructura esperada desde Login.js → { id, name, email, role, token }
      const { id, name, email, role, token } =
        payload.user ? { ...payload.user, token: payload.token } : payload;

      state.user = { id, name, email, role };
      state.token = token || null;
      state.logged = true;

      // 🧩 Persistencia en sessionStorage (rehidratable)
      try {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(state.user));
        sessionStorage.setItem("logged", "true");
      } catch (_) {}
    },

    // =======================================================
    //useFetch Cierra sesión (limpia Redux y almacenamiento)
    // =======================================================
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.logged = false;
      try {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("logged");
        sessionStorage.removeItem("userId");
      } catch (_) {}
    },

    // =======================================================
    //useFetch Actualiza datos del perfil
    // =======================================================
    updateProfile: (state, { payload }) => {
      if (!payload) return;
      state.user = { ...(state.user || {}), ...payload };

      // Sincroniza los cambios en sessionStorage
      try {
        sessionStorage.setItem("user", JSON.stringify(state.user));
      } catch (_) {}
    },
  },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
