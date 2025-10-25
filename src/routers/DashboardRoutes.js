import { Routes, Route } from "react-router-dom";
import { Home } from "../modules/core/home/Home.js";
import { AddProperty } from "../modules/property/service/AddProperty.js";
import { EditProperty } from "../modules/property/service/EditProperty.js";
import { User } from "../modules/user/User.js";
import { EditUser } from "../modules/user/service/EditUser.js";
import { AdminRoute } from "./AdminRoute.js";

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const DashboardRoutes = () => {
  return (
    <div>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Rutas */}
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/edit-property/:propertyId" element={<EditProperty />} />
        <Route path="/profile" element={<User />} />
        <Route path="/profile/edit" element={<AdminRoute><EditUser /></AdminRoute>} />

        {/* Cualquier ruta no existente redirige al Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default DashboardRoutes;
