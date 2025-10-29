import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import Swal from 'sweetalert2';
import { Box, Paper, TextField, Button, InputAdornment } from '@mui/material';
import { FiLock } from 'react-icons/fi';
import './PasswordReset.scss';

const resetEndpoint = process.env.REACT_APP_ENDPOINT_PASSWORD_RESET;

export const PasswordReset = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    try {
      const response = await api.patch(`${resetEndpoint}`, { token, newPassword: password });
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: 'Contraseña actualizada',
          icon: 'success',
          confirmButtonColor: '#107ACC',
        });
        navigate('/login');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.error?.message || 'No se pudo actualizar la contraseña.',
        icon: 'error',
        confirmButtonColor: '#C00F0C',
      });
    }
  };

  const handleCancel = () => navigate('/login');

  return (
    <Box className="reset-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: '#f6f8fb', padding: 2 }}>
      <Paper elevation={3} className="reset-card" sx={{ borderRadius: 4, width: '100%', maxWidth: 420, p: 4, textAlign: 'center' }}>
        <Title title="Crear Nueva contraseña" />

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField label="Nueva contraseña" type="password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiLock color="#107ACC" size={20} />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" onClick={handleReset} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}>
            Confirmar
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2, backgroundColor: '#e5e7eb', color: '#333', border: 'none', '&:hover': { backgroundColor: '#d1d5db' } }}>
            Cancelar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordReset;




