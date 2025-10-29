import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PrivateRoute = ({ children }) => {
  const { logged } = useSelector((state) => state.auth);
  const { pathname, search } = useLocation();

  sessionStorage.setItem('lastPath', pathname + search);

  return logged ? children : <Navigate to={'/'} replace />;
};

export default PrivateRoute;
