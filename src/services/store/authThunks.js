import { api } from "../api/api";
import { errorWrapper } from "../api/errorWrapper";
import { saveToken } from "../auth/token";
import { setAuth, logout } from "./authSlice";

const LOGIN_ENDPOINT = process.env.REACT_APP_ENDPOINT_LOGIN || "/auth/login";

export const loginUser = (credentials) => async (dispatch) => {
  const res = await errorWrapper(api.post(LOGIN_ENDPOINT, credentials));
  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  // Backend viene así:
  // data.data.user
  // data.data.accessToken
  // data.data.refreshToken
  const data = res.data?.data || {};
  const user = data.user || {};
  const accessToken = data.accessToken || data.token || "";
  const refreshToken = data.refreshToken || "";

  if (!accessToken) {
    return { ok: false, error: { message: "Token no recibido del servidor" } };
  }

  // guarda tokens
  saveToken(accessToken);
  if (refreshToken) saveToken(refreshToken, "refreshToken");

  // pone en redux
  dispatch(setAuth({ token: accessToken, user }));

  // Guardar id
  if (user?.id) sessionStorage.setItem("userId", user.id);

  return { ok: true, user, accessToken, refreshToken };
};

// para cerrar sesión desde thunks
export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};
