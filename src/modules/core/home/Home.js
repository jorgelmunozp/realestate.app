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
  const propertyState = useSelector((state) => state.property);
  const properties = propertyState?.properties ?? [];
  const loading = propertyState?.loading;
  const meta = propertyState?.meta ?? {};
  const error = propertyState?.error;
  const authUser = useSelector((state) => state.auth.user);

  // const [filters, setFilters] = useState({ name: "", address: "" });
  // const [pagination, setPagination] = useState({ last_page: 1, limit: 6, page: 1, total: 0 });

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

  // Cuando regresa de property restaura la paginación y los filtros con lo que venga del history
  const [filters, setFilters] = useState(() => location.state?.filters || { name: "", address: "" });
  const [pagination, setPagination] = useState(() => location.state?.pagination || { last_page: 1, limit: 6, page: 1, total: 0 });


  useEffect(() => {
    if (!userId) {
      navigate("/index");
      return;
    }
    const needsRefresh = location.state?.refresh === true;
    const { name, address, minPrice, maxPrice } = filters;
    dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, name, address, minPrice, maxPrice, refresh: needsRefresh }));
    if (needsRefresh) navigate(location.pathname, { replace: true, state: {} });
  }, [ dispatch, navigate, location.pathname, location.state?.refresh, pagination.page, pagination.limit, filters.name, filters.address, filters.minPrice, filters.maxPrice, userId, ]);

   // Sincroniza history cuando cambien filtros/paginación
  useEffect(() => {
    const { refresh, ...rest } = location.state || {}; 
    navigate(location.pathname, { replace: true, state: { ...rest, pagination, filters } }); 
  }, [pagination, filters, navigate, location.pathname]); 

  const handleFiltersChange = (next) => { setFilters(next); setPagination((prev) => ({ ...prev, page: 1 })); };
  
  const handleEditProperty = (propertyId) => navigate(`/edit-property/${propertyId}`, { state: { from: location.pathname, pagination, filters } });

  // const handleAddProperty = () => navigate("/add-property");
  const handleAddProperty = () => navigate("/add-property", { state: { from: location.pathname, pagination, filters } });

  const handleDeleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: "Eliminar",
      text: "Deseas eliminar este inmueble?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#107ACC",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      customClass: { popup: "home-swal-popup" },
    });
    if (!result.isConfirmed) return;

    try {
      await errorWrapper(api.delete(`${propertyEndpoint}/${propertyId}`));
      const { name, address, minPrice, maxPrice } = filters;
      await dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, name, address, minPrice, maxPrice, refresh: true })).unwrap();
      Swal.fire({ title: "Inmueble Eliminado", icon: "success", confirmButtonColor: "#107ACC" });
    } catch {
      Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
    }
  };

  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  // fallback
  if (loading) {
    return (
      <div className="loader-overlay loader-overlay--home">
        <div className="loader-spinner"></div>
        <p className="loader-text">Cargando propiedades...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <Title title="Inmuebles" />
          <button className="home-add-btn" onClick={handleAddProperty} title="Agregar propiedad"><FiPlus /></button>
        </div>

        {error && <div className="home-error">{String(error)}</div>}

        {(firstName || displayRole) && (
          <div className="home-meta">
            <p className="home-greeting">Hola {firstName}</p>
            <p className="home-role">{role === "admin" ? <FaUserSecret /> : role === "editor" ? <FaUserTie /> : <FaUser />}<span className="home-role__label">{displayRole}</span></p>
          </div>
        )}

        <Search filters={filters} onChange={handleFiltersChange} />

        <div className="home-grid">
          {properties.length > 0 ? (
            properties.map((p) => (
              <div key={p.idProperty} className="home-property-card">
                <div className="home-property-card-img-wrapper" onClick={canEdit ? () => handleEditProperty(p.idProperty) : undefined} style={{ cursor: canEdit ? "pointer" : "default" }} title={canEdit ? "Editar" : undefined}>
                  {p.image?.file ? <img className="home-property-card-img" src={`data:image/jpeg;base64,${p.image.file}`} alt={p.name} loading="lazy" /> : <div className="no-image">Sin imagen</div>}
                </div>
                <div className="home-property-card-info">
                  <h1>{p.name}</h1>
                  <p className="home-property-price">$ {Number(p.price || 0).toLocaleString()} | {p.address}</p>
                </div>
                <div className="home-property-card-buttons">
                  {canEdit && <button className={`btn-edit ${isEditor ? "editor" : ""} ${isAdmin ? "admin" : ""}`} title="Editar" onClick={(e) => { e.stopPropagation(); handleEditProperty(p.idProperty); }}><FiEdit2 /></button>}
                  {canDelete && <button className="btn-delete" title="Eliminar" onClick={(e) => { e.stopPropagation(); handleDeleteProperty(p.idProperty); }}><FiTrash2 /></button>}
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No hay propiedades registradas aún</p>
          )}
        </div>

        <Pagination page={pagination.page} lastPage={meta?.last_page || pagination.last_page} onPageChange={handleChangePage} />
      </div>
    </div>
  );
};

export default Home;
