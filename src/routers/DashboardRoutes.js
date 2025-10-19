import { Routes, Route } from "react-router-dom";
import { AppMenu } from '../components/AppMenu.js';
import { Home } from '../pages/Home.js';
import { Property } from '../pages/Property.js'
import { AboutUs } from '../pages/AboutUs.js';
import { Contact } from '../pages/Contact.js';

const urlBaseFrontend = process.env.REACT_APP_FRONTEND_URL;

export const DashboardRoutes = () => {
  return (
    <><AppMenu />
      <div>
        
        <Routes>
            <Route path={"/home"} element={<Home />} />
            <Route path={"/about-us"} element={<AboutUs />} />
            <Route path={"/contact"} element={<Contact />} />
            <Route path={"/"} element={<Home />} />
            <Route path={"/api/property/:propertyId"} element={<Property />} />
            <Route path={"*"} element={<Home />} />
        </Routes>
      </div>
    </>
  )
}

export default DashboardRoutes;