import { useContext } from 'react';
import { AuthContext } from '../services/auth/authContext.js';
import { DashboardRoutes } from "./DashboardRoutes.js";

export const PublicRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    return user.logged ? <DashboardRoutes /> : children
}

export default PublicRoute;