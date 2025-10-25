import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const { pathname, search } = useLocation();

  sessionStorage.setItem( 'lastPath', pathname + search );

  return user?.logged ? children : <Navigate to={"/" + urlBaseFrontend} /> 
}

export default PrivateRoute;
