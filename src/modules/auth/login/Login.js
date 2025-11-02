import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import { login } from '../../../services/store/authSlice';
import { saveToken } from '../../../services/auth/token';
import { TextField, Button, InputAdornment, Box, Paper } from '@mui/material';
import { PiUserCircleFill } from 'react-icons/pi';
import { FiLock } from 'react-icons/fi';
import { blueColor, orangeColor } from '../../../global';
import Swal from 'sweetalert2';
import './Login.scss';

const loginEndpoint = process.env.REACT_APP_ENDPOINT_LOGIN;

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = form;
    if (!email || !password) {
      Swal.fire({ text: 'Por favor, completa todos los campos', icon: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(loginEndpoint, { email, password });

      const { data } = response;
      const user = data?.data?.user || {};
      const accessToken = data?.data?.accessToken || '';
      const refreshToken = data?.data?.refreshToken || '';

      if (!accessToken || !user?.id) {
        Swal.fire({ text: 'Respuesta inválida del servidor', icon: 'error' });
        return;
      }

      saveToken(accessToken);
      if (refreshToken) saveToken(refreshToken, 'refreshToken');
      sessionStorage.setItem('userId', user.id);

      dispatch(login({ id: user.id, name: user.name, email: user.email, role: user.role, token: accessToken }));

      navigate('/home', { replace: true });
    } catch (error) {
      console.error(' Error en login:', error.response?.data || error.message);
      Swal.fire({
        text: error.response?.data?.message || 'Credenciales inválidas o servidor no disponible',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', p: 2 }}>
      <Paper elevation={3} className="login-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Iniciar sesión" />
        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField label="Correo electrónico" name="email" type="email" variant="outlined"
            value={form.email} onChange={handleChange} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PiUserCircleFill color={orangeColor} size={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField label="Contraseña" name="password" type="password"
            variant="outlined" value={form.password} onChange={handleChange} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiLock color={orangeColor} size={18} />
                </InputAdornment>
              ),
            }}
          />
          <Button id="loginButton" variant="contained" color="primary" onClick={handleLogin} disabled={loading} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }} aria-label="login button">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <Button id="registerButton" variant="outlined" color="secondary" onClick={() => navigate('/register')} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }} aria-label="register button">
            Crear cuenta
          </Button>
          <Button id="forgotPasswordButton" variant="text" onClick={() => navigate('/password-recover')} sx={{ color: blueColor, textTransform: 'none', fontWeight: 500, fontSize: '0.95rem !important', mt: 1, '&:hover': { color: '#000' }, }} aria-label="forgot password button">
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
