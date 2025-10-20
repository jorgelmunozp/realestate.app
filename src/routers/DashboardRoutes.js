import { Routes, Route } from "react-router-dom";
import { AppMenu } from '../components/AppMenu.js';
import { Home } from '../pages/Home.js';
import { NewProperty } from "../pages/crud/NewProperty.js";

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const DashboardRoutes = () => {
  return (
    <><AppMenu />
      <div>
        
        <Routes>
            <Route path={"/home"} element={<Home />} />
            <Route path={"/new-property"} element={<NewProperty />} />
            <Route path={"/"} element={<Home />} />
            <Route path={"*"} element={<Home />} />
        </Routes>
      </div>
    </>
  )
}

export default DashboardRoutes;