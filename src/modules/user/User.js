import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Title } from '../../components/title/Title';
import { PiUserCircleFill, } from 'react-icons/pi';
import { FiEdit } from 'react-icons/fi';
import { getTokenPayload, getUserFromToken, getToken, isTokenExpired } from '../../services/auth/token';
import { orangeColor } from '../../global';
import './User.scss';

export const User = () => {
  const navigate = useNavigate();
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
    <div className="user-container">
      <div className="user-card">
        <div className="user-header">
          <Title title="Mi perfil" />
          {isLogged && (  <button className="user-edit-btn" onClick={() => navigate('/profile/edit')}>
                            <label>Editar</label> <FiEdit className="user-edit-btn-icon" size={30} color={orangeColor} />
                          </button> )
          }
        </div>

        <div className="user-data">
          <div className="user-avatar">
            <PiUserCircleFill size={96} color={orangeColor} />
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
    </div>
  );
};

export default User;
