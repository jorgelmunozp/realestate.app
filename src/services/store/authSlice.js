import { createSlice } from "@reduxjs/toolkit";

// Lee token guardado
const storedToken =
  sessionStorage.getItem("token") || localStorage.getItem("token") || "";

// Decodifica usuario desde el JWT
let storedUser = null;
if (storedToken) {
  try {
    const base64Payload = storedToken.split(".")[1] || "";
    storedUser = JSON.parse(atob(base64Payload));
  } catch (err) {
    storedUser = null;
  }
}

// estado inicial
const initialState = {
  logged: !!storedToken,
  token: storedToken,
  user: storedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Mantiene compatibilidad con dispatch(login({...}))
    login(state, action) {
      const payload = action.payload || {};

      // puede venir de 2 formas:
      // a) { token, user: {...} }
      // b) { id, name, email, role, token }
      const nextToken = payload.token || state.token;

      state.logged = true;
      state.token = nextToken;

      if (payload.user) {
        state.user = payload.user;
      } else {
        const { id, name, email, role } = payload;
        state.user = {
          ...(state.user || {}),
          ...(id ? { id } : {}),
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(role ? { role } : {}),
        };
      }

      // Para persistencia
      if (nextToken) {
        sessionStorage.setItem("token", nextToken);
      }
    },

    setAuth(state, action) {
      const payload = action.payload || {};
      state.logged = true;
      if (payload.token) {
        state.token = payload.token;
        sessionStorage.setItem("token", payload.token);
      }
      if (payload.user) {
        state.user = payload.user;
      }
    },

    // USado en EditUser.js
    updateProfile(state, action) {
      const changes = action.payload || {};
      state.user = {
        ...(state.user || {}),
        ...changes,
      };
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

export const { login, logout, updateProfile, setAuth } = authSlice.actions;
export default authSlice.reducer;
