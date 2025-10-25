import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from "../../../components/title/Title";
import { Input } from "../../../components/input/Input";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Pagination } from "../../../components/pagination/Pagination";
import { fetchProperties } from "../../../services/store/propertySlice";
import Swal from "sweetalert2";
import "./Home.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { properties, loading, meta } = useSelector((state) => state.property);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({ last_page: 1, limit: 6, page: 1, total: 0 });
      const userId = sessionStorage.getItem("userId");

  // Cargar propiedades desde Redux (incluye imágenes)
  useEffect(() => {
    if (!userId) { navigate("/index"); return; }
    const needsRefresh = location.state?.refresh === true;
    dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, refresh: needsRefresh }));
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, pagination.page, pagination.limit, dispatch, navigate, location.state, userId]);

  // Navegar a edicion
  const handleEditProperty = (propertyId) => navigate(`/edit-property/${propertyId}`);

  // Navegar a creacion
  const handleAddProperty = () => navigate("/add-property");

  // Eliminar propiedad
  const handleDeleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: "Eliminar Propiedad",
      text: "&iquest;Seguro que deseas eliminar este inmueble?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "S&iacute;, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#107ACC",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      customClass: { popup: "home-swal-popup" },
    });

    if (result.isConfirmed) {
      try {
        await errorWrapper( api.delete(`${propertyEndpoint}/${propertyId}`) );
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

  // Paginacion
  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  // Pantalla de carga moderna
  if (loading) {
    return (
      <div className="loader-overlay">
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
          <button className="home-add-btn" onClick={handleAddProperty}>
            <FiPlus />
          </button>
        </div>

        {/* Buscador */}
        <div className="home-search">
          <Input
            Icon={FiSearch}
            type="search"
            placeholder="Buscar inmueble..."
            value={queryPropertyName}
            setState={setQueryPropertyName}
          />
        </div>

        {/* Tarjetas de propiedades */}
        <div className="home-grid">
          {(properties || [])
            .filter((property) =>
              property.name.toLowerCase().includes(queryPropertyName.toLowerCase())
            )
            .map((property) => (
              <div key={property.idProperty} className="home-property-card">
                <div
                  className="home-property-card-img-wrapper"
                  onClick={() => handleEditProperty(property.idProperty)}
                >
                  {property.image ? (
                    <img
                      className="home-property-card-img"
                      src={`data:image/png;base64,${property.image.file}`}
                      alt={property.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="no-image">Sin imagen</div>
                  )}
                </div>

                <div className="home-property-card-info">
                  <h3>{property.name}</h3>
                  <p className="home-property-price">
                    ${property.price.toLocaleString()} | {property.address}
                  </p>
                </div>

                <div className="home-property-card-buttons">
                  <button
                    className="btn-edit"
                    title="Editar"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProperty(property.idProperty);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-delete"
                    title="Eliminar"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProperty(property.idProperty);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Paginacion */}
        <Pagination page={pagination.page} lastPage={meta?.last_page || pagination.last_page} onPageChange={handleChangePage} className="home-pagination" buttonClassName="home-page-btn" prevLabel="Anterior" nextLabel="Siguiente" disabled={loading} />
      </div>
    </div>
  );
};

export default Home;


