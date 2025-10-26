import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getTokenPayload, getUserFromToken } from '../services/auth/token';

export const RoleRoute = ({ children, allowed = [], redirectTo = '/home' }) => {
  const user = useSelector((state) => state.auth.user);
  const { pathname, search } = useLocation();

  const payload = getTokenPayload('token');
  const tokenUser = getUserFromToken(payload) || {};

  const rawRole = user?.role ?? tokenUser?.role;
  const userRoles = Array.isArray(rawRole) ? rawRole : (rawRole ? [rawRole] : []);
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  const toKey = (v) => (v == null ? '' : String(v).toLowerCase());
  const userKeys = userRoles.map(toKey);
  const allowedKeys = allowedRoles.map(toKey);

  sessionStorage.setItem('lastPath', pathname + search);

  const isAllowed = allowedKeys.length === 0
    ? true
    : allowedKeys.some((r) => userKeys.includes(r));

  return isAllowed ? children : <Navigate to={redirectTo} replace />;
};

export default RoleRoute;
