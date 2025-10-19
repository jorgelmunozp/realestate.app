import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Header } from "../components/Header.js";
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';
import { PasswordRecover } from '../pages/PasswordRecover.js';
import { PasswordReset } from '../pages/PasswordReset.js';
import { PublicRoute } from "./PublicRoute.js";
import { PrivateRoute } from "./PrivateRoute.js";
import { DashboardRoutes } from "./DashboardRoutes.js";

export const AppRouter = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rutas públicas */}
        <Route path="*" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/password-recover" element={<PublicRoute><PasswordRecover /></PublicRoute>} />
        <Route path="/password-reset/:token" element={<PublicRoute><PasswordReset /></PublicRoute>} />
        
        {/* Rutas privadas */}
        <Route path="/*" element={ <PrivateRoute><DashboardRoutes /></PrivateRoute> } />
      </Routes>
    </Router>
  )
}

export default AppRouter;