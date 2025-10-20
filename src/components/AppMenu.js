import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext.js';
import { types } from '../types/types.js';
import { slide as Menu } from "react-burger-menu";
import { FiHome, FiUser, FiPhone, FiLogOut, FiUpload } from "react-icons/fi";
import { primaryColor } from '../global.js';
import "../assets/styles/scss/components/AppMenu.scss";

export const AppMenu = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: types.logout });
        navigate("/", { replace: true });
    }
console.log("user: ", user.logged)
  return (
    <Menu left>
      <hr className='bm-hr' />
      <a className="menu-item" href="/home">
        <FiHome color={primaryColor} /> Inmuebles
      </a>
      <a className="menu-item" href="/about-us">
        { user.logged ? (<><FiUpload color={primaryColor} /> Subir inmueble</>) : (<><FiUser color={primaryColor} /> Nosotros</>) }
      </a>
      <a className="menu-item" href="/contact">
        { user.logged ? (<><FiUpload color={primaryColor} /> Cerrar sesión</>) : (<><FiPhone color={primaryColor} /> Contacto</>) }
      </a>
      <a className="menu-item" href="/login" onClick={handleLogout}>
        { user.logged ? (<><FiLogOut color={primaryColor} /> Cerrar sesión</>) : (<><FiLogOut color={primaryColor} /> Ingresar</>) }
      </a>
    </Menu>
  );
};

export default AppMenu;