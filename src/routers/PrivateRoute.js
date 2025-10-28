import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const urlBaseFrontend = process.env.REACT_APP_URL_BASE_FRONTEND;

export const PrivateRoute = ({ children }) => {
  const { logged } = useSelector((state) => state.auth);
  const { pathname, search } = useLocation();

  sessionStorage.setItem('lastPath', pathname + search);

  return logged ? children : <Navigate to={`/${urlBaseFrontend}`} replace />;
};

export default PrivateRoute;
