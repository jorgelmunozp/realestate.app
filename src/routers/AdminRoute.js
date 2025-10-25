import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getTokenPayload, getUserFromToken } from '../services/auth/token';

export const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const { pathname, search } = useLocation();

  const payload = getTokenPayload('token');
  const tokenUser = getUserFromToken(payload) || {};
  const role = user?.role || tokenUser?.role;

  sessionStorage.setItem('lastPath', pathname + search);

  return role === 'Admin' ? children : <Navigate to="/home" replace />;
};

export default AdminRoute;

