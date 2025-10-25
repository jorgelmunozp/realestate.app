import { useSelector } from 'react-redux';
import { Title } from '../../components/title/Title';
import { PiUserCircleFill } from 'react-icons/pi';
import { getTokenPayload, getUserFromToken } from '../../services/auth/token';
import './User.scss';

export const User = () => {
  const authUser = useSelector((state) => state.auth.user);
  const payload = getTokenPayload('token');
  const tokenUser = getUserFromToken(payload) || {};
console.log("token: ", tokenUser)
  const name = tokenUser.name || 'Usuario';
  const email = tokenUser.email || 'correo@dominio.com';
  const role = tokenUser.role || 'User';
  const userId = tokenUser.id || '-';

  return (
    <div className="user-profile">
      <Title title="Mi perfil" />

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
          </div>

          <div className="user-meta">
            <div className="meta-item">
              <span className="meta-label">Rol</span>
              <span className="meta-value">{role}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Estado</span>
              <span className={`meta-badge ${authUser?.logged ? 'ok' : 'off'}`}>
                {authUser?.logged ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
