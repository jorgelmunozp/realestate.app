import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../services/api/api';
import { Title } from '../../../../components/title/Title';
import Swal from 'sweetalert2';
import { Box, Paper, TextField, Button, InputAdornment, Typography } from '@mui/material';
import { FiAtSign } from 'react-icons/fi';
import './PasswordRecover.scss';

const recoverEndpoint = process.env.REACT_APP_ENDPOINT_PASSWORD_RECOVER || '/password/recover';

export const PasswordRecover = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleRecover = async () => {
    try {
      const response = await api.post(`${recoverEndpoint}`, { email });
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: '✅ ¡Correo enviado!',
          text: response.data.message || 'Revisa tu bandeja de entrada para continuar.',
          icon: 'success',
          confirmButtonColor: '#107ACC',
        });
        navigate('/index');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error?.message || 'No se pudo enviar el correo.',
        icon: 'error',
        confirmButtonColor: '#C00F0C',
      });
    }
  };

  const handleCancel = () => navigate('/login');
  const handleBack = () => navigate('/login');

  return (
    <Box className="recover-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', padding: 2 }}>
      <Paper elevation={3} className="recover-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Recuperar Contraseña" />

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField label="Correo electrónico" type="email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiAtSign color="#107ACC" size={20} />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" onClick={handleRecover} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            Enviar enlace
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2, backgroundColor: '#e5e7eb', color: '#333', border: 'none', '&:hover': { backgroundColor: '#d1d5db' } }}>
            Cancelar
          </Button>

          <Typography onClick={handleBack} sx={{ color: '#107ACC', fontSize: '0.95rem', fontWeight: '500', mt: 2, cursor: 'pointer', '&:hover': { color: '#000' } }}>
            ← Volver al inicio de sesión
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordRecover;
