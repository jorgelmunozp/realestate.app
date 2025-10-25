import { useSelector } from 'react-redux';
import { DashboardRoutes } from "./DashboardRoutes.js";

export const PublicRoute = ({ children }) => {
    const user = useSelector((state) => state.auth.user);

    return user?.logged ? <DashboardRoutes /> : children
}

export default PublicRoute;
