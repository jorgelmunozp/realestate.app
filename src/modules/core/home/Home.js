import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from "../../../components/title/Title";
import { Search } from "../../../components/search/Search";
import { FaUserSecret, FaUserTie, FaUser } from "react-icons/fa6";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Pagination } from "../../../components/pagination/Pagination";
import { fetchProperties } from "../../../services/store/propertySlice";
import Swal from "sweetalert2";
import "./Home.scss";
import { getTokenPayload, getUserFromToken } from "../../../services/auth/token";
import { rolesOf } from "../../../services/auth/roles";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { properties, loading, meta, error } = useSelector((state) => state.property);
  const authUser = useSelector((state) => state.auth.user);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({ last_page: 1, limit: 6, page: 1, total: 0 });
  const userId = sessionStorage.getItem("userId");

  const payload = getTokenPayload("token");
  const tokenUser = getUserFromToken(payload) || {};
  const roles = rolesOf(authUser?.role ?? tokenUser?.role);
  const role = roles[0] || "";
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const canEdit = isEditor || isAdmin;
  const canDelete = isAdmin;
  const firstName = ((authUser?.name || tokenUser?.name || "").split(" ")[0]) || "";
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  // ===========================================================
  // 🔹 Cargar propiedades desde Redux (ya con imagen embebida)
  // ===========================================================
  useEffect(() => {
    if (!userId) {
      navigate("/index");
      return;
    }

    const needsRefresh = location.state?.refresh === true;
    dispatch(fetchProperties({
      page: pagination.page,
      limit: pagination.limit,
      refresh: needsRefresh
    }));

    // Limpia el estado solo una vez si venía con refresh
    if (needsRefresh) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, pagination.page, pagination.limit, dispatch, navigate, userId]);

  // ===========================================================
  // 🔹 Navegación
  // ===========================================================
  const handleEditProperty = (propertyId) => navigate(`/edit-property/${propertyId}`);
  const handleAddProperty = () => navigate("/add-property");

  // ===========================================================
  // 🔹 Eliminar propiedad
  // ===========================================================
  const handleDeleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: "Eliminar Propiedad",
      text: "¿Seguro que deseas eliminar este inmueble?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#107ACC",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      customClass: { popup: "home-swal-popup" },
    });

    if (result.isConfirmed) {
      try {
        await errorWrapper(api.delete(`${propertyEndpoint}/${propertyId}`));
        Swal.fire({
          title: "Eliminado",
          text: "La propiedad ha sido eliminada exitosamente.",
          icon: "success",
          confirmButtonColor: "#107ACC",
        });
        dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, refresh: true }));
      } catch {
        Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
      }
    }
  };

  // ===========================================================
  // 🔹 Paginación
  // ===========================================================
  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  // ===========================================================
  // 🔹 Loader visual
  // ===========================================================
  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
        <p className="loader-text">Cargando propiedades...</p>
      </div>
    );
  }

  // ===========================================================
  // 🔹 Render principal
  // ===========================================================
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <Title title="Inmuebles" />
          <button className="home-add-btn" onClick={handleAddProperty}>
            <FiPlus />
          </button>
        </div>

        {/* Error de carga */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
            }}
          >
            {String(error)}
          </div>
        )}

        {/* Subcabecera con rol */}
        {(firstName || displayRole) && (
          <div className="home-meta">
            <p className="home-greeting">Hola {firstName}</p>
            <p className="home-role">
              {role === "admin" ? (
                <FaUserSecret />
              ) : role === "editor" ? (
                <FaUserTie />
              ) : (
                <FaUser />
              )}
              <span className="home-role__label">{displayRole}</span>
            </p>
          </div>
        )}

        {/* Buscador */}
        <Search
          value={queryPropertyName}
          onChange={setQueryPropertyName}
          placeholder="Buscar inmueble..."
        />

        {/* Tarjetas de propiedades */}
        <div className="home-grid">
          {(properties || [])
            .filter((p) => p.name?.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((p) => (
              <div key={p.idProperty} className="home-property-card">
                <div
                  className="home-property-card-img-wrapper"
                  onClick={canEdit ? () => handleEditProperty(p.idProperty) : undefined}
                  style={{ cursor: canEdit ? "pointer" : "default" }}
                  aria-disabled={!canEdit}
                  title={canEdit ? "Editar" : undefined}
                >
                  {p.image && p.image.file ? (
                    <img
                      className="home-property-card-img"
                      src={`data:image/jpeg;base64,${p.image.file}`}
                      alt={p.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="no-image">Sin imagen</div>
                  )}
                </div>

                <div className="home-property-card-info">
                  <h3>{p.name}</h3>
                  <p className="home-property-price">
                    ${p.price.toLocaleString()} | {p.address}
                  </p>
                </div>

                <div className="home-property-card-buttons">
                  {canEdit && (
                    <button
                      className={`btn-edit ${isEditor ? "editor" : ""} ${isAdmin ? "admin" : ""}`}
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProperty(p.idProperty);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="btn-delete"
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(p.idProperty);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Paginación */}
        <Pagination
          page={pagination.page}
          lastPage={meta?.last_page || pagination.last_page}
          onPageChange={handleChangePage}
          className="home-pagination"
          buttonClassName="home-page-btn"
          prevLabel="Anterior"
          nextLabel="Siguiente"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default Home;
