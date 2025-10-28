import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/store/authSlice.js';
import { slide as Menu } from 'react-burger-menu';
import { Header } from '../header/Header.js';
import { FiHome, FiUser, FiUsers, FiPhone, FiLogOut, FiUpload } from 'react-icons/fi';
import { primaryColor } from '../../global.js';
import { getToken, getTokenPayload, getUserFromToken, isTokenExpired } from '../../services/auth/token';
import './AppMenu.scss';

export const AppMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState('');

  // ===========================================================
  // Leer token y determinar rol real del usuario logueado
  // ===========================================================
  useEffect(() => {
    // 1️⃣ Buscar token en localStorage o sessionStorage
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      '';

    if (!token) {
      setLogged(false);
      setRole('');
      return;
    }

    // 2️⃣ Decodificar token
    const payload = getTokenPayload(token);
    const tokenUser = getUserFromToken(payload) || {};

    // 3️⃣ Determinar rol actual
    const currentRole = (user?.role || tokenUser?.role || '').toLowerCase();
    const valid = !isTokenExpired(payload);

    setLogged(valid);
    setRole(currentRole);
  }, [user]);

  // ===========================================================
  // Cerrar sesión
  // ===========================================================
  const handleLogout = () => {
    dispatch(logout());
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('refreshToken');
    } catch (_) {}
    navigate('/', { replace: true });
  };

  // ===========================================================
  // Renderizado
  // ===========================================================
  return (
    <Menu left>
      <Header />
      <hr className="bm-hr" />

      {/* 🏠 Inmuebles */}
      <a className="menu-item" href={logged ? '/home' : '/index'}>
        <FiHome color={primaryColor} /> Inmuebles
      </a>

      {/* 🏗️ Subir inmueble / Nosotros */}
      <a className="menu-item" href={logged ? '/add-property' : '/about-us'}>
        {logged ? (
          <>
            <FiUpload color={primaryColor} /> Subir inmueble
          </>
        ) : (
          <>
            <FiUser color={primaryColor} /> Nosotros
          </>
        )}
      </a>

      {/* 👥 Solo visible para admin */}
      {logged && role === 'admin' && (
        <a className="menu-item" href="/users">
          <FiUsers color={primaryColor} /> Usuarios
        </a>
      )}

      {/* 👤 Perfil / Contacto */}
      <a className="menu-item" href={logged ? '/profile' : '/contact'}>
        {logged ? (
          <>
            <FiUser color={primaryColor} /> Perfil
          </>
        ) : (
          <>
            <FiPhone color={primaryColor} /> Contacto
          </>
        )}
      </a>

      {/* 🚪 Cerrar sesión / Ingresar */}
      <a
        className="menu-item"
        href={logged ? '/index' : '/login'}
        onClick={logged ? handleLogout : undefined}
      >
        {logged ? (
          <>
            <FiLogOut color={primaryColor} /> Cerrar sesión
          </>
        ) : (
          <>
            <FiLogOut color={primaryColor} /> Ingresar
          </>
        )}
      </a>
    </Menu>
  );
};

export default AppMenu;
