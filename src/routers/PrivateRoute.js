import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PrivateRoute = ({ children }) => {
  const { logged } = useSelector((state) => state.auth);
  const { pathname, search } = useLocation();

  sessionStorage.setItem('lastPath', pathname + search);

  // Si no está logueado, redirige a /login (no al dominio completo)
  return logged ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
