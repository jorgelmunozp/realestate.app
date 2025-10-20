import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext.js';
import { types } from '../types/types.js';
import { PiUserCircleFill } from "react-icons/pi";
import { FiLock } from "react-icons/fi";
import { api } from '../services/api';
import Swal from 'sweetalert2';
import '../assets/styles/scss/pages/Login.scss';

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/auth/login', { email, password });

      if (response.status >= 200 && response.status < 300) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userId', response.data.id);

        dispatch({ type: types.login, payload: { email } });

        const lastPath = localStorage.getItem('lastPath') || '/home';
        navigate(lastPath, { replace: true });
      }
    } catch (error) {
      Swal.fire({
        text: error.response?.data?.error?.message || 'Credenciales inválidas',
        icon: 'error',
      });
      console.error('Error user login: ', error.response?.data || error.message);
    }
  };

  const goToIndex = () => navigate('/index');
  const goToRegister = () => navigate('/register');
  const forgotPassword = () => navigate('/password-recover');

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesión</h1>

        <div className="login-input-group">
          <PiUserCircleFill className="login-icon" />
          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-input-group">
          <FiLock className="login-icon" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="login-btn primary" onClick={handleLogin}>
          Ingresar
        </button>

        <button className="login-btn secondary" onClick={goToRegister}>
          Crear cuenta
        </button>

        <button className="login-link" onClick={forgotPassword}>
          ¿Olvidaste tu contraseña?
        </button>
        <br /><br />
        <button className="login-link" onClick={goToIndex}>
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default Login;