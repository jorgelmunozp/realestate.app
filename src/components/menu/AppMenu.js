import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/store/authSlice.js';
import { slide as Menu } from "react-burger-menu";
import { Header } from '../header/Header.js';
import { FiHome, FiUser, FiPhone, FiLogOut, FiUpload, FiActivity } from "react-icons/fi";
import { primaryColor } from '../../global.js';
import "./AppMenu.scss";

export const AppMenu = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        try {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userId');
        } catch (_) {}
        navigate("/", { replace: true });
    }

    return (
    <Menu left>
      <Header />
      <hr className='bm-hr' />
      <a className="menu-item" href={user.logged ? "/home":"/index"}>
        <FiHome color={primaryColor} /> Inmuebles
      </a>
      <a className="menu-item" href={user.logged ? "/add-property":"/about-us"}>
        { user.logged ? (<><FiUpload color={primaryColor} /> Subir inmueble</>) : (<><FiUser color={primaryColor} /> Nosotros</>) }
      </a>
      <a className="menu-item" href={user.logged ? "/profile":"/contact"}>
        { user.logged ? (<><FiUser color={primaryColor} /> Perfil</>) : (<><FiPhone color={primaryColor} /> Contacto</>) }
      </a>
      <a className="menu-item" href={user.logged ? "/index":"/login"} onClick={handleLogout}>
        { user.logged ? (<><FiLogOut color={primaryColor} /> Cerrar sesión</>) : (<><FiLogOut color={primaryColor} /> Ingresar</>) }
      </a>
    </Menu>
  );
};

export default AppMenu;
