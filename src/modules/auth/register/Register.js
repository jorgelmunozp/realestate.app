import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import Swal from 'sweetalert2';
import { TextField, Button, InputAdornment, Box, Paper } from '@mui/material';
import { FiUser, FiAtSign, FiLock } from 'react-icons/fi';
import './Register.scss';

const registerEndpoint = process.env.REACT_APP_ENDPOINT_REGISTER;

export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await api.post(`${registerEndpoint}`, { name, email, password });

      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          text: 'Registro exitoso',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Error: ', error.response?.data?.errors);

      const errors = error.response?.data?.errors;
      let errorHtml = '';

      if (errors) {
        errorHtml = '<ul style="padding-left: 20px; text-align: justify; margin: 0;">';
        for (const key in errors) {
          if (errors[key] && errors[key].length > 0) {
            for (const msg of errors[key]) {
              errorHtml += `<li style="margin-bottom: 6px; color: #d33;">${msg}</li>`;
            }
          }
        }
        errorHtml += '</ul>';
      } else {
        errorHtml = '<span style="color: #d33;">Ocurrió un error inesperado</span>';
      }

      Swal.fire({
        html: errorHtml,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        customClass: { popup: 'home-swal-popup', title: 'swal-title', content: 'swal-content', confirmButton: 'swal-confirm-btn' },
      });
    }
  };

  const handleCancel = () => navigate('/login');

  return (
    <Box className="register-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', padding: 2 }}>
      <Paper elevation={3} className="register-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Crear cuenta" />

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField label="Nombre" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><FiUser color="#666" /></InputAdornment>) }} />

          <TextField label="Correo electrónico" type="email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><FiAtSign color="#666" /></InputAdornment>) }} />

          <TextField label="Contraseña" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth InputProps={{ startAdornment: (<InputAdornment position="start"><FiLock color="#666" /></InputAdornment>) }} />

          <Button variant="contained" color="primary" onClick={handleRegister} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>Crear cuenta</Button>

          <Button variant="outlined" color="secondary" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>Cancelar</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;

