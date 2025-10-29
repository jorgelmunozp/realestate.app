import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppMenu } from "../components/menu/AppMenu";
import { Header } from "../components/header/Header";
import { PublicRoute } from "./PublicRoute";
import { PrivateRoute } from "./PrivateRoute";
import { DashboardRoutes } from "./DashboardRoutes";
import { Index } from "../modules/core/index/Index";
import { Property } from "../modules/property/Property";
import { Login } from "../modules/auth/login/Login";
import { Register } from "../modules/auth/register/Register";
import { PasswordRecover } from "../modules/password/recover/PasswordRecover";
import { PasswordReset } from "../modules/password/reset/PasswordReset";
import { AboutUs } from "../modules/core/aboutus/AboutUs";
import { Contact } from "../modules/core/contact/Contact";
import { NotFound } from "../modules/core/notfound/NotFound"

export const AppRouter = () => (
  <BrowserRouter>
    <AppMenu />
    <Header />
    <Routes>
      <Route path="/" element={<PublicRoute><Index/></PublicRoute>} />
      <Route path="/index/*" element={<PublicRoute><Index/></PublicRoute>} />
      <Route path="/property/:propertyId" element={<PublicRoute><Property/></PublicRoute>} />
      <Route path="/login/*" element={<PublicRoute><Login/></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register/></PublicRoute>} />
      <Route path="/password-recover" element={<PublicRoute><PasswordRecover/></PublicRoute>} />
      <Route path="/password-reset/:token" element={<PublicRoute><PasswordReset/></PublicRoute>} />
      <Route path="/about-us" element={<PublicRoute><AboutUs/></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute><Contact/></PublicRoute>} />
      <Route path="/*" element={<PrivateRoute><DashboardRoutes/></PrivateRoute>} />
      {/* <Route path="*" element={<PublicRoute><Index/></PublicRoute>} /> */}
      <Route path="*" element={<PublicRoute><NotFound/></PublicRoute>} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
