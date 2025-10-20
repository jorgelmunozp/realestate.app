import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { AppMenu } from '../components/AppMenu.js';
import { Header } from "../components/Header.js";
import { PublicRoute } from "./PublicRoute.js";
import { PrivateRoute } from "./PrivateRoute.js";
import { DashboardRoutes } from "./DashboardRoutes.js";
import { Index } from "../pages/Index.js";
import { Property } from "../pages/crud/Property.js";
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';
import { PasswordRecover } from '../pages/PasswordRecover.js';
import { PasswordReset } from '../pages/PasswordReset.js';
import { AboutUs } from '../pages/AboutUs.js';
import { Contact } from '../pages/Contact.js';

export const AppRouter = () => {
  return (
    <Router>
      <AppMenu />
      <Header />
      <Routes>
        {/* Rutas públicas */}
        <Route path="*" element={<PublicRoute><Index /></PublicRoute>} />
        <Route path="/index/*" element={<PublicRoute><Index /></PublicRoute>} />
        <Route path="/api/property/:propertyId/*" element={<PublicRoute><Property /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/password-recover" element={<PublicRoute><PasswordRecover /></PublicRoute>} />
        <Route path="/password-reset/:token" element={<PublicRoute><PasswordReset /></PublicRoute>} />
        <Route path="/about-us" element={<PublicRoute><AboutUs /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />

        {/* Rutas privadas */}
        <Route path="/*" element={ <PrivateRoute><DashboardRoutes /></PrivateRoute> } />
      </Routes>
    </Router>
  )
}

export default AppRouter;