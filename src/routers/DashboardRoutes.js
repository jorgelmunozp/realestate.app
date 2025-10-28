import { Routes, Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { Home } from "../modules/core/home/Home";
import { AddProperty } from "../modules/property/service/AddProperty";
import { EditProperty } from "../modules/property/service/EditProperty";
import { User } from "../modules/user/User";
import { EditUser } from "../modules/user/service/EditUser";
import { ManageUsers } from "../modules/user/service/ManageUsers";

export const DashboardRoutes = () => (
  <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="/home" element={<Home/>} />
    
    <Route path="/add-property" element={<AddProperty/>} />
    <Route path="/edit-property/:propertyId" element={<RoleRoute allowed={["editor","admin"]} element={<EditProperty/>} />} />
    <Route path="/profile" element={<User/>} />
    <Route path="/profile/edit" element={<RoleRoute allowed={["admin","editor","user"]} element={<EditUser/>} />} />
    <Route path="/users" element={<RoleRoute allowed={["admin"]} element={<ManageUsers/>} />} />

    {/* Fallback */}
    <Route path="*" element={<Home/>} />
  </Routes>
);

export default DashboardRoutes;
