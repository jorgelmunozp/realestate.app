import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/authContext.js';

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { pathname, search } = useLocation();

  sessionStorage.setItem( 'lastPath', pathname + search );

  return user.logged ? children : <Navigate to={"/" + urlBaseFrontend} /> 
}

export default PrivateRoute;