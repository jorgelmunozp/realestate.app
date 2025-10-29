import { useSelector } from 'react-redux';
import { Title } from '../../components/title/Title';
import { Link } from 'react-router-dom';
import { PiUserCircleFill } from 'react-icons/pi';
import { getTokenPayload, getUserFromToken, getToken, isTokenExpired } from '../../services/auth/token';
import './User.scss';

export const User = () => {
  const authUser = useSelector((state) => state.auth.user);
  const token = getToken('token');
  const payload = getTokenPayload('token');
  const tokenUser = getUserFromToken(payload) || {};

  const name = authUser?.name || tokenUser?.name || 'Usuario';
  const email = authUser?.email || tokenUser?.email || 'correo@dominio.com';
  const role = (authUser?.role || tokenUser?.role || 'user').toLowerCase();
  const userId = authUser?.id || tokenUser?.id || '-';
  const isLogged = !!token && !isTokenExpired(payload);

  return (
    <div className="user-profile">
      <div className="user-header">
        <Title title="Mi perfil" />
        {isLogged && ( <Link to="/profile/edit" className="user-edit-btn">
                        Editar
                      </Link> )
        }
      </div>

      <div className="user-card">
        <div className="user-avatar">
          <PiUserCircleFill size={96} color="#107ACC" />
        </div>

        <div className="user-info">
          <h2 className="user-name">{name}</h2>
          <p className="user-email">{email}</p>

          <div className="user-meta">
            <div className="meta-item">
              <span className="meta-label">ID de usuario</span>
              <span className="meta-value">{userId}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Rol</span>
              <span className="meta-value">{role}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Estado</span>
              <span className={`meta-badge ${isLogged ? 'ok' : 'off'}`}>
                {isLogged ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
