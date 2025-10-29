import { useEffect, useState } from "react";
import { Paper, TextField, Button, MenuItem } from "@mui/material";
import { FiTrash2 } from "react-icons/fi";
import { Title } from "../../../components/title/Title";
import { Search as SearchBox } from "../../../components/search/Search";
import Swal from "sweetalert2";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { normalizeUser } from "../mapper/userMapper";
import { primaryColor } from "../../../global";
import "./ManageUsers.scss";

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const userEndpoint = process.env.REACT_APP_ENDPOINT_USER;

  // Cargar usuarios
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      const res = await errorWrapper(api.get(userEndpoint));
      const { success, data, message, error } = res;

      if (success) {
        const raw = data?.data ?? data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.users)
          ? raw.users
          : [];
        setUsers(list.map((u) => normalizeUser(u)));
      } else {
        setErrorMsg(error?.message || message || "No se pudieron cargar los usuarios");
      }

      setLoading(false);
    };
    load();
  }, [userEndpoint]);

  // Guardar cambios de rol
  const handleRoleChange = async (user, newRole) => {
    try {
      const url = `${userEndpoint}/${encodeURIComponent(user.email)}`;
      const body = { role: newRole };
      const res = await errorWrapper(api.patch(url, body));
      const { success, message, error } = res;

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Rol actualizado",
          timer: 1400,
          showConfirmButton: false,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.email === user.email ? { ...u, role: newRole } : u
          )
        );
      } else {
        Swal.fire({
          icon: "error",
          text: error?.message || message || "No se pudo actualizar el rol",
        });
      }
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      Swal.fire({ icon: "error", text: "No se pudo actualizar el rol" });
    }
  };

  // Eliminar usuario
  const handleDelete = async (email) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: primaryColor,
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const res = await errorWrapper(api.delete(`${userEndpoint}/${encodeURIComponent(email)}`));
    const { success, message, error } = res;

    if (success) {
      Swal.fire({
        icon: "success",
        text: message || "Usuario eliminado correctamente",
        timer: 1400,
        showConfirmButton: false,
      });
      setUsers((prev) => prev.filter((u) => u.email !== email));
    } else {
      Swal.fire({
        icon: "error",
        text: error?.message || message || "No se pudo eliminar el usuario",
      });
    }
  };

  // Filtro
  const filtered = (users || []).filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  // Render
  return (
    <div className="manageusers-container">
      <Title title="Administrar usuarios" />

      {loading && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
          <p className="loader-text">Cargando usuarios...</p>
        </div>
      )}

      {errorMsg && <p className="error-text">{errorMsg}</p>}

      <Paper elevation={3} className="manageusers-card">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar usuario..." />

        <div className="manageusers-table">
          <div className="manageusers-head">
            <div>Nombre</div>
            <div>Correo</div>
            <div>Rol</div>
            <div>Acción</div>
          </div>

          {filtered.map((u, idx) => (
            <div key={`${u.email}-${idx}`} className="manageusers-row">
              <TextField value={u.name || ""} fullWidth disabled />
              <TextField value={u.email || ""} fullWidth disabled />
              <TextField select value={u.role || "user"}
                onChange={(e) => handleRoleChange(u, e.target.value)}
                fullWidth >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </TextField>
              <Button variant="outlined manageusers-replace-btn" color="error" onClick={() => handleDelete(u.email)} >
                <FiTrash2 />
              </Button>
            </div>
          ))}
        </div>
      </Paper>
    </div>
  );
};

export default ManageUsers;
