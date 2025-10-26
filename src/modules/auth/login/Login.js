import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { useDispatch } from 'react-redux';
import { login } from '../../../services/store/authSlice.js';
import { Title } from '../../../components/title/Title';
import Swal from 'sweetalert2';
import { TextField, Button, InputAdornment, Box, Paper } from '@mui/material';
import { PiUserCircleFill } from 'react-icons/pi';
import { FiLock } from 'react-icons/fi';
import './Login.scss';

const loginEndpoint = process.env.REACT_APP_ENDPOINT_LOGIN;

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post(`${loginEndpoint}`, { email, password });
      if (response.status >= 200 && response.status < 300) {
        // token set below
        sessionStorage.setItem('userId', response.data.id);
        dispatch(login({
          email,
          id: response.data.id,
          name: response.data.name || response.data.fullName || response.data.username,
          role: response.data.role || (Array.isArray(response.data?.roles) ? response.data.roles[0] : undefined),
        }));

        const lastPath = sessionStorage.getItem('lastPath') || '/home';
        navigate(lastPath, { replace: true });
      }
    } catch (error) {
      console.error('Error user login: ', error.response?.data || error.message);
      Swal.fire({
        text: error.response?.data?.error?.message || 'Credenciales inválidas',
        icon: 'error',
      });
    }
  };

  const handleGoRegister = () => navigate('/register');
  const handleForgotPassword = () => navigate('/password-recover');

  return (
    <Box className="login-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', padding: 2 }}>
      <Paper elevation={3} className="login-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Iniciar sesión" />

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField label="Correo electrónico" type="email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PiUserCircleFill color="#107ACC" size={20} />
                </InputAdornment>
              ),
            }}
          />

          <TextField label="Contraseña" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiLock color="#107ACC" size={18} />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" onClick={handleLogin} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            Ingresar
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleGoRegister} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            Crear cuenta
          </Button>

          <Button variant="text" onClick={handleForgotPassword} sx={{ color: '#107ACC', textTransform: 'none', fontWeight: 500, fontSize: '0.95rem', mt: 1, '&:hover': { color: '#000' } }}>
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;






