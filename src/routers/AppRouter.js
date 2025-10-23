import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { AppMenu } from '../components/menu/AppMenu.js';
import { Header } from "../components/header/Header.js";
import { PublicRoute } from "./PublicRoute.js";
import { PrivateRoute } from "./PrivateRoute.js";
import { DashboardRoutes } from "./DashboardRoutes.js";
import { Index } from "../modules/core/index/Index.js";
import { Property } from "../modules/property/Property.js";
import { Login } from '../modules/auth/login/Login.js';
import { Register } from '../modules/auth/register/Register.js';
import { PasswordRecover } from '../modules/user/password/recover/PasswordRecover.js';
import { PasswordReset } from '../modules/user/password/reset/PasswordReset.js';
import { AboutUs } from '../modules/core/aboutus/AboutUs.js';
import { Contact } from '../modules/core/contact/Contact.js';

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
        <Route path="/login/*" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/password-recover" element={<PublicRoute><PasswordRecover /></PublicRoute>} />
        <Route path="/password-reset/:token" element={<PublicRoute><PasswordReset /></PublicRoute>} />
        <Route path="/about-us/*" element={<PublicRoute><AboutUs /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />

        {/* Rutas privadas */}
        <Route path="/*" element={ <PrivateRoute><DashboardRoutes /></PrivateRoute> } />
      </Routes>
    </Router>
  )
}

export default AppRouter;