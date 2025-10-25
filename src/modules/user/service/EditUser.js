import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Title } from '../../../components/title/Title';
import { updateProfile } from '../../../services/store/authSlice';
import { getTokenPayload, getUserFromToken } from '../../../services/auth/token';
import { TextField, Button, Box, Paper, MenuItem } from '@mui/material';
import Swal from 'sweetalert2';
import './EditUser.scss';

export const EditUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const payload = getTokenPayload('token');
  const tokenUser = getUserFromToken(payload) || {};

  const [form, setForm] = useState({
    name: user?.name || tokenUser?.name || '',
    email: user?.email || tokenUser?.email || '',
    role: user?.role || tokenUser?.role || 'User',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || tokenUser?.name || '',
      email: user?.email || tokenUser?.email || '',
      role: user?.role || tokenUser?.role || 'User',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.email, user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateProfile({ name: form.name, email: form.email, role: form.role }));
      Swal.fire({ icon: 'success', text: 'Perfil actualizado', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', text: 'No se pudo actualizar' });
    }
  };

  return (
    <div className="edituser-container">
      <Paper elevation={3} className="edituser-card">
        <Title title="Editar usuario" />
        <Box component="form" className="edituser-form" onSubmit={handleSubmit}>
          <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} fullWidth />
          <TextField name="email" label="Correo" type="email" value={form.email} onChange={handleChange} fullWidth />
          <TextField name="role" label="Rol" value={form.role} onChange={handleChange} select fullWidth>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary" className="edituser-btn">Guardar</Button>
        </Box>
      </Paper>
    </div>
  );
};
