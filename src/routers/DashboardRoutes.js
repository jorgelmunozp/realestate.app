import { Routes, Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute.js";
import { Home } from "../modules/core/home/Home.js";
import { AddProperty } from "../modules/property/service/AddProperty.js";
import { EditProperty } from "../modules/property/service/EditProperty.js";
import { User } from "../modules/user/User.js";
import { EditUser } from "../modules/user/service/EditUser.js";
import { ManageUsers } from "../modules/user/service/ManageUsers.js";

export const DashboardRoutes = () => (
  <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      {/* Propiedades */}
      <Route path="/add-property" element={<AddProperty />} />
      <Route
        path="/edit-property/:propertyId"
        element={
          <RoleRoute allowed={["editor", "admin"]} element={<EditProperty />} />
        }
      />

      {/* Perfil */}
      <Route path="/profile" element={<User />} />
      <Route
        path="/profile/edit"
        element={
          <RoleRoute
            allowed={["admin", "editor", "user"]}
            element={<EditUser />}
          />
        }
      />

      {/* Gestión de usuarios (solo admin) */}
      <Route
        path="/users"
        element={<RoleRoute allowed={["admin"]} element={<ManageUsers />} />}
      />

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  </div>
);

export default DashboardRoutes;
