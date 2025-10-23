import { Routes, Route } from "react-router-dom";
import { Home } from '../modules/core/home/Home.js';
import { CrudProperty } from "../modules/property/service/CrudProperty.js";

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const DashboardRoutes = () => {
  return (
    <div>
      <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/home"} element={<Home />} />
          <Route path="/crud-property">
            <Route index element={<CrudProperty />} />
            <Route path=":propertyId" element={<CrudProperty />} />
          </Route>
          <Route path={"*"} element={<Home />} />
      </Routes>
    </div>
  )
}

export default DashboardRoutes;