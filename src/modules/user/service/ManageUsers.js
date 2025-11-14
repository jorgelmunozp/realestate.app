import { useEffect, useState } from "react";
import { Paper, TextField, Button, MenuItem, InputAdornment } from "@mui/material";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { FiTrash2, FiSearch } from "react-icons/fi";
import { Title } from "../../../components/title/Title";
import { Pagination } from "../../../components/pagination/Pagination";
import { normalizeUser } from "../mapper/userMapper";
import { primaryColor, secondaryColor } from "../../../global";
import Swal from "sweetalert2";
import "./ManageUsers.scss";

const PAGE_SIZE = 6;

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, last_page: 1, total: 0 });

  const userEndpoint = process.env.REACT_APP_ENDPOINT_USER.trim();

  useEffect(() => {
    const load = async () => {
      setErrorMsg("");
      try {
        const res = await errorWrapper(api.get(userEndpoint));
        const { success, data, message, error } = res;
        if (success) {
          const raw = data?.data ?? data;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.users) ? raw.users : [];
          const normalized = list.map((u) => normalizeUser(u));
          setUsers(normalized);
          const total = normalized.length;
          setPagination((prev) => ({ ...prev, total, last_page: Math.max(1, Math.ceil(total / prev.limit)) }));
        } else {
          setErrorMsg(error?.message || message || "No se obtuvieron los usuarios");
        }
      } catch {
        setErrorMsg("Ocurrió un error inesperado en el servicio");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userEndpoint]);

  const handleRoleChange = async (user, newRole) => {
    try {
      const url = `${userEndpoint}/${encodeURIComponent(user.email)}`;
      const body = { role: newRole };
      const res = await errorWrapper(api.patch(url, body));
      const { success, message, error } = res;
      if (success) {
        Swal.fire({ icon: "success", title: "Rol actualizado", timer: 1400, showConfirmButton: false });
        setUsers((prev) => prev.map((u) => (u.email === user.email ? { ...u, role: newRole } : u)));
      } else {
        Swal.fire({ icon: "error", text: error?.message || message || "No se pudo actualizar el rol" });
      }
    } catch {
      Swal.fire({ icon: "error", text: "No se pudo actualizar el rol" });
    }
  };

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
      Swal.fire({ icon: "success", text: message || "Usuario eliminado correctamente", timer: 1400, showConfirmButton: false });
      setUsers((prev) => prev.filter((u) => u.email !== email));
      setPagination((prev) => {
        const nextTotal = Math.max(0, prev.total - 1);
        const nextLast = Math.max(1, Math.ceil(nextTotal / prev.limit));
        const nextPage = prev.page > nextLast ? nextLast : prev.page;
        return { ...prev, total: nextTotal, last_page: nextLast, page: nextPage };
      });
    } else {
      Swal.fire({ icon: "error", text: error?.message || message || "No se pudo eliminar el usuario" });
    }
  };

  const filtered = (users || []).filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q);
  });

  const totalFiltered = filtered.length;
  const lastFilteredPage = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
  const currentPage = Math.min(pagination.page, lastFilteredPage);
  const start = (currentPage - 1) * pagination.limit;
  const end = start + pagination.limit;
  const paged = filtered.slice(start, end);

  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  return (
    <div className="manageusers-container">
      <Paper elevation={3} className="manageusers-card">
        <Title title="Administrar usuarios" />

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <div className="manageusers-toolbar">
          <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, correo o rol..." InputProps={{ startAdornment: (<InputAdornment position="start"><FiSearch size={18} color={secondaryColor} /></InputAdornment>) }} fullWidth className="manageusers-search-input" />
        </div>

        <div className="manageusers-table">
          <div className="manageusers-head">
            <div>Nombre</div>
            <div>Correo</div>
            <div>Rol</div>
            <div>Acción</div>
          </div>

          {paged.length > 0 ? (
            paged.map((u, idx) => (
              <div key={`${u.email}-${idx}`} className="manageusers-row">
                <TextField value={u.name || ""} fullWidth disabled />
                <TextField value={u.email || ""} fullWidth disabled />
                <TextField select value={u.role || "user"} onChange={(e) => handleRoleChange(u, e.target.value)} fullWidth>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </TextField>
                <Button id={`deletebutton${idx}`} variant="outlined" className="manageusers-delete-btn" color="error" onClick={() => handleDelete(u.email)} style={{marginTop:0}} aria-label={`delete button ${idx}`}><FiTrash2 /></Button>
              </div>
            ))
          ) : (
            !loading && <div className="manageusers-empty">No hay usuarios que coincidan con la búsqueda</div>
          )}
        </div>

        <Pagination page={currentPage} lastPage={lastFilteredPage} onPageChange={handleChangePage} />
      </Paper>
    </div>
  );
};

export default ManageUsers;
