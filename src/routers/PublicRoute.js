import { useSelector } from 'react-redux';
import { DashboardRoutes } from "./DashboardRoutes.js";

export const PublicRoute = ({ children }) => {
  const { logged } = useSelector((state) => state.auth);
  
  return logged ? <DashboardRoutes /> : children;
};

export default PublicRoute;
