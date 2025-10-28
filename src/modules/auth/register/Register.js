import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import Swal from 'sweetalert2';
import { TextField, Button, InputAdornment, Box, Paper } from '@mui/material';
import { FiUser, FiAtSign, FiLock } from 'react-icons/fi';
import './Register.scss';

const urlBaseFrontend = process.env.REACT_APP_URL_BASE_FRONTEND;
const registerEndpoint = process.env.REACT_APP_ENDPOINT_REGISTER;

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      Swal.fire({ text: 'Por favor, completa todos los campos', icon: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(registerEndpoint, { name, email, password });

      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          text: 'Registro exitoso. Ahora puedes iniciar sesión.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error(' Error en registro:', error.response?.data || error.message);

      const errors = error.response?.data?.errors;
      let errorHtml = '';

      if (errors && typeof errors === 'object') {
        errorHtml = '<ul style="padding-left: 20px; text-align: left; margin: 0;">';
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            for (const msg of errors[key]) {
              errorHtml += `<li style="margin-bottom: 6px; color: #d33;">${msg}</li>`;
            }
          }
        }
        errorHtml += '</ul>';
      } else {
        errorHtml = '<span style="color: #d33;">Ocurrió un error inesperado. Intenta nuevamente.</span>';
      }

      Swal.fire({
        html: errorHtml,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'home-swal-popup',
          confirmButton: 'home-accept-btn',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="register-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', p: 2 }}>
      <Paper elevation={3} className="register-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Crear cuenta" />

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField
            label="Nombre"
            name="name"
            variant="outlined"
            value={form.name}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiUser color="#107ACC" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            variant="outlined"
            value={form.email}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiAtSign color="#107ACC" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            variant="outlined"
            value={form.password}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiLock color="#107ACC" />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" onClick={handleRegister} disabled={loading} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </Button>

          <Button variant="outlined" color="secondary" onClick={() => navigate('/login')} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            Cancelar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
