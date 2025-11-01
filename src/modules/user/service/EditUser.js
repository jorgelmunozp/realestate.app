import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../services/api/api";
import { Title } from "../../../components/title/Title";
import { updateProfile } from "../../../services/store/authSlice";
import { getTokenPayload, getUserFromToken } from "../../../services/auth/token";
import { TextField, Button, Box, Paper, MenuItem } from "@mui/material";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { mapUserToDto } from "../../user/mapper/userMapper";
import Swal from "sweetalert2";
import "./EditUser.scss";

export const EditUser = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);

  // Lee token real del navegador
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const payload = getTokenPayload(token);
  const tokenUser = getUserFromToken(payload) || {};

  const role = (authUser?.role || tokenUser?.role || "user").toLowerCase();
  const isAdmin = role === "admin";

  // Formulario usuario (solo perfil propio)
  const [form, setForm] = useState({
    name: authUser?.name || tokenUser?.name || "",
    email: authUser?.email || tokenUser?.email || "",
    role: authUser?.role || tokenUser?.role || "user",
  });

  useEffect(() => {
    setForm({
      name: authUser?.name || tokenUser?.name || "",
      email: authUser?.email || tokenUser?.email || "",
      role: authUser?.role || tokenUser?.role || "user",
    });
  }, [authUser?.name, authUser?.email, authUser?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Guarda perfil propio
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userDto = mapUserToDto(form);

      // Solo envia campos modificados
      const changedFields = {};
      if (authUser?.name !== userDto.Name && userDto.Name.trim() !== "")
        changedFields.name = userDto.Name.trim();

      if (Object.keys(changedFields).length === 0) {
        Swal.fire({
          icon: "info",
          text: "No hay cambios para guardar.",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      const res = await errorWrapper(
        api.patch(`${process.env.REACT_APP_ENDPOINT_USER}/${form.email}`, changedFields)
      );

      if (res.ok) {
        dispatch(updateProfile({ ...authUser, ...changedFields }));
        Swal.fire({
          icon: "success",
          title: "Perfil actualizado",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          text: res.error?.message || "Error al actualizar el perfil",
        });
      }
    } catch (err) {
      console.error(" Error al actualizar perfil:", err);
      Swal.fire({ icon: "error", text: "No se pudo actualizar el perfil" });
    }
  };

  return (
    <div className="edituser-container">
      <Paper elevation={3} className="edituser-card">
        <Title title="Editar perfil" />
        <Box component="form" className="edituser-form" onSubmit={handleSubmit}>
          <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} fullWidth required />
          <TextField name="email" label="Correo" type="email" value={form.email} fullWidth disabled />
          <TextField name="role" label="Rol" value={form.role} select fullWidth disabled >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default EditUser;
