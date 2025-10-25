import { createSlice } from "@reduxjs/toolkit";

// redux-persist cargará automáticamente el estado desde sessionStorage
const initialState = { user: { logged: false } };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Acepta un objeto con datos del usuario y marca sesión como activa
    login: (state, { payload }) => {
      const data = payload && typeof payload === "object" ? payload : {};
      state.user = { ...data, logged: true };
    },
    // Limpia cualquier dato del usuario y cierra sesión
    logout: (state) => {
      state.user = { logged: false };
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
