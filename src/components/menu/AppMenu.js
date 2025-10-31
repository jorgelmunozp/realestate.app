import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/store/authSlice.js';
import { slide as Menu } from 'react-burger-menu';
import { Header } from '../header/Header.js';
import { FiHome, FiUser, FiUsers, FiPhone, FiLogOut, FiUpload, FiEdit } from 'react-icons/fi';
import { getTokenPayload, getUserFromToken, isTokenExpired } from '../../services/auth/token';
import './AppMenu.scss';

export const AppMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const { logged, role } = useMemo(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    if (!token && !user) return { logged: false, role: '' };
    try {
      const payload = token ? getTokenPayload(token) : null;
      const tokenUser = payload ? getUserFromToken(payload) : null;
      const currentRole = (user?.role || tokenUser?.role || '').toLowerCase();
      const valid = payload ? !isTokenExpired(payload) : Boolean(user);
      return { logged: Boolean(valid && (user || tokenUser)), role: currentRole };
    } catch { return { logged: Boolean(user), role: (user?.role || '').toLowerCase() }; }
  }, [user]);

  // Control del menú para poder cerrarlo al navegar
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const syncMenu = useCallback(s => setMenuOpen(s.isOpen), []);

  const go = useCallback((whenIn, whenOut) => { navigate(logged ? whenIn : whenOut); closeMenu(); }, [logged, navigate, closeMenu]);
  const goUsers = useCallback(() => { navigate('/users'); closeMenu(); }, [navigate, closeMenu]);
  const goLogin = useCallback(() => { navigate('/login'); closeMenu(); }, [navigate, closeMenu]);
  const goAddProperty = useCallback(() => { navigate('/add-property'); closeMenu(); }, [navigate, closeMenu]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('refreshToken');
    } catch {}
    navigate('/', { replace: true });
    closeMenu();
  }, [dispatch, navigate, closeMenu]);

  return (
    <Menu left isOpen={menuOpen} onStateChange={syncMenu} disableAutoFocus>
      <Header />
      <hr className="bm-hr" />

      <button type="button" className="menu-item" onClick={() => go('/home', '/index')}>
        <FiHome className='menu-item-icon' /> Inmuebles
      </button>

      <button type="button" className="menu-item" onClick={() => go('/add-property', '/about-us')}>
        {logged ? (<><FiUpload className='menu-item-icon' /> Registrar inmueble</>) : (<><FiUser className='menu-item-icon' /> Nosotros</>)}
      </button>

      {logged && role === 'admin' && (
        <button type="button" className="menu-item" onClick={goUsers}>
          <FiUsers className='menu-item-icon' /> Usuarios
        </button>
      )}

      <button type="button" className="menu-item" onClick={() => go('/profile', '/contact')}>
        {logged ? (<><FiUser className='menu-item-icon' /> Perfil</>) : (<><FiPhone className='menu-item-icon' /> Contacto</>)}
      </button>

      <button type="button" className="menu-item" onClick={logged ? handleLogout : goLogin}>
        <FiLogOut className='menu-item-icon' /> {logged ? 'Cerrar sesión' : 'Ingresar'}
      </button>
    </Menu>
  );
};

export default AppMenu;
