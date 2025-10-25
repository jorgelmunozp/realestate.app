import { Routes, Route } from "react-router-dom";
import { Home } from "../modules/core/home/Home.js";
import { AddProperty } from "../modules/property/service/AddProperty.js";
import { EditProperty } from "../modules/property/service/EditProperty.js";

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const DashboardRoutes = () => {
  return (
    <div>
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Registrar nueva propiedad */}
        <Route path="/add-property" element={<AddProperty />} />

        {/* Editar propiedad existente */}
        <Route path="/edit-property/:propertyId" element={<EditProperty />} />

        {/* Cualquier ruta no existente redirige al Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default DashboardRoutes;
