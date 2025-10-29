import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from "../../../components/title/Title";
import { Search } from "../../../components/search/Search";
import { Pagination } from "../../../components/pagination/Pagination";
import { fetchProperties } from "../../../services/store/propertySlice";
import { getTokenPayload, getUserFromToken } from "../../../services/auth/token";
import { rolesOf } from "../../../services/auth/roles";
import Swal from "sweetalert2";
import { FaUserSecret, FaUserTie, FaUser } from "react-icons/fa6";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import "./Home.scss";

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

  // Cargar propiedades al montar y al cambiar paginación
  useEffect(() => {
    if (!userId) {
      navigate('/index');
      return;
    }

    const needsRefresh = location.state?.refresh === true;
    dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, refresh: needsRefresh }));

    if (needsRefresh) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [dispatch, location.pathname, location.state, pagination.page, pagination.limit, navigate, userId]);

  // Handlers
  const handleEditProperty = (propertyId) => navigate(`/edit-property/${propertyId}`);
  const handleAddProperty = () => navigate('/add-property');

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
          title: "Inmueble Eliminado",
          icon: "success",
          confirmButtonColor: "#107ACC",
        });
        await dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, refresh: true })).unwrap();
      } catch {
        Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
      }
    }
  };

  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  // Render: Loading
  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-spinner"></div>
        <p className="loader-text">Cargando propiedades...</p>
      </div>
    );
  }

  // Render principal
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <Title title="Inmuebles" />
          <button className="home-add-btn" onClick={handleAddProperty} title="Agregar propiedad">
            <FiPlus />
          </button>
        </div>

        {error && (
          <div className="home-error">
            {String(error)}
          </div>
        )}

        {(firstName || displayRole) && (
          <div className="home-meta">
            <p className="home-greeting">Hola {firstName}</p>
            <p className="home-role">
              {role === "admin" ? <FaUserSecret /> : role === "editor" ? <FaUserTie /> : <FaUser />}
              <span className="home-role__label">{displayRole}</span>
            </p>
          </div>
        )}

        <Search value={queryPropertyName} onChange={setQueryPropertyName} placeholder="Buscar inmueble..." />

        <div className="home-grid">
          {(properties || [])
            .filter((p) => p.name?.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((p) => (
              <div key={p.idProperty} className="home-property-card">
                <div
                  className="home-property-card-img-wrapper"
                  onClick={canEdit ? () => handleEditProperty(p.idProperty) : undefined}
                  style={{ cursor: canEdit ? "pointer" : "default" }}
                  title={canEdit ? "Editar" : undefined}
                >
                  {p.image?.file ? (
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
                    ${Number(p.price || 0).toLocaleString()} | {p.address}
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

          {!loading && (!properties || properties.length === 0) && (
            <p className="no-results">No hay propiedades registradas aún</p>
          )}
        </div>

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
