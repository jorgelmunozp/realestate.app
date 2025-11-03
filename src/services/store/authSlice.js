import { createSlice } from "@reduxjs/toolkit";

// 1. leer token guardado
const storedToken =
  sessionStorage.getItem("token") || localStorage.getItem("token") || "";

// 2. intentar decodificar usuario desde el JWT
let storedUser = null;
if (storedToken) {
  try {
    const payload = storedToken.split(".")[1] || "";
    storedUser = JSON.parse(atob(payload));
  } catch {
    storedUser = null;
  }
}

// 3. estado inicial limpio
const initialState = {
  logged: !!storedToken,
  token: storedToken,
  user: storedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // acción única para poner auth en redux
    setAuth(state, action) {
      const { token, user } = action.payload || {};
      state.logged = true;
      if (token) {
        state.token = token;
        sessionStorage.setItem("token", token);
      }
      if (user) {
        state.user = user;
      }
    },

    // para cuando el user actualiza su propio perfil
    updateProfile(state, action) {
      const changes = action.payload || {};
      state.user = { ...(state.user || {}), ...changes };
    },

    logout(state) {
      state.logged = false;
      state.token = "";
      state.user = null;
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
    },
  },
});

export const { setAuth, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;
