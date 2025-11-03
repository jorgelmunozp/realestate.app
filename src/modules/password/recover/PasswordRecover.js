import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import { Box, Paper, TextField, Button, InputAdornment, Typography } from '@mui/material';
import { FiAtSign } from 'react-icons/fi';
import { primaryColor, secondaryColor } from '../../../global';
import Swal from 'sweetalert2';
import './PasswordRecover.scss';

const recoverEndpoint = process.env.REACT_APP_ENDPOINT_PASSWORD_RECOVER;

export const PasswordRecover = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleRecover = async () => {
    if (!email) return;
    
    try {
      setSending(true);
      const { errorWrapper } = await import('../../../services/api/errorWrapper');
      const { ok, data, error } = await errorWrapper(api.post(`${recoverEndpoint}`, { email }), { unwrap: false });
      if (ok) {
        const msg = data?.message || 'Revisa tu bandeja de entrada para continuar.';
        Swal.fire({ title: 'Correo enviado', icon: 'success', confirmButtonColor: '#107ACC' });
        navigate('/index');
      } else {
        const msg = error?.message || 'No se pudo enviar el correo.';
        Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#C00F0C' });
      }
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'No se pudo enviar el correo.', icon: 'error', confirmButtonColor: '#C00F0C' });
    } finally {
      setSending(false);
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
                  <FiAtSign color={secondaryColor} size={20} />
                </InputAdornment>
              ),
            }}
          />

          <Button id="sendButton" variant="contained" color="primary" onClick={handleRecover} disabled={sending} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }} aria-label="send button">
             {sending ? 'Enviando...':'Enviar enlace'}
          </Button>

          <Button id="cancelutton" variant="outlined" color="secondary" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }} aria-label="send button">
            Cancelar
          </Button>

          <Typography onClick={handleBack} sx={{ color:primaryColor, fontFamily:'Montserrat', fontSize:'0.95rem', fontWeight:'600', mt:4, cursor:'pointer', '&:hover': { color:'#000 !important', textDecoration:'none !important' } }}>
            ← Volver al inicio de sesión
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordRecover;



