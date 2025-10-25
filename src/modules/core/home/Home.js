import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from "../../../components/title/Title";
import { Input } from "../../../components/input/Input";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "./Home.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
const propertyImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({ last_page: 1, limit: 6, page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const userId = sessionStorage.getItem("userId");

  // Cargar propiedades con sus imagenes
  const fetchItems = useCallback(async (refresh = false) => {
    if (!userId) return navigate("/index");

    setLoading(true);
    try {
      const res = await errorWrapper(
        api.get(`${propertyEndpoint}?page=${pagination.page}&limit=${pagination.limit}${refresh ? "&refresh=true" : ""}`)
      );
      if (!res.ok) throw res.error;
      const body = res.data || {};
      const propertiesData = Array.isArray(body) ? body : (body.data || []);
      const loadingObj = {};
      propertiesData.forEach((p) => (loadingObj[p.idProperty] = true));
      setLoadingImages(loadingObj);

      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (prop) => {
          try {
            const resImg = await errorWrapper(
              api.get(`${propertyImageEndpoint}?idProperty=${prop.idProperty}${refresh ? "&refresh=true" : ""}`)
            );
            if (!resImg.ok) throw resImg.error;
            const imgBody = resImg.data || [];
            const firstImg = Array.isArray(imgBody) ? imgBody[0] : imgBody?.[0];
            setLoadingImages((prev) => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: firstImg || null };
          } catch {
            setLoadingImages((prev) => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: null };
          }
        })
      );

      setProperties(propertiesWithImages);
      setPagination((prev) => ({
        ...prev,
        ...(body.meta || {}),
        page: prev.page,
      }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, userId, navigate]);

  useEffect(() => {
    const needsRefresh = location.state?.refresh === true;
    fetchItems(needsRefresh);
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, fetchItems, navigate, location.state]);

  // Navegar a edición
  const handleEditProperty = (propertyId) => navigate(`/edit-property/${propertyId}`);

  // Navegar a creación
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
        fetchItems(true);
      } catch {
        Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
      }
    }
  };

  // Paginacion
  const handleNextPage = () =>
    pagination.page < pagination.last_page &&
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
  const handlePrevPage = () =>
    pagination.page > 1 && setPagination((prev) => ({ ...prev, page: prev.page - 1 }));

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
          {properties
            .filter((property) =>
              property.name.toLowerCase().includes(queryPropertyName.toLowerCase())
            )
            .map((property) => (
              <div key={property.idProperty} className="home-property-card">
                <div
                  className="home-property-card-img-wrapper"
                  onClick={() => handleEditProperty(property.idProperty)}
                >
                  {loadingImages[property.idProperty] ? (
                    <div className="loader-inline"></div>
                  ) : property.image ? (
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
        <div className="home-pagination">
          <button
            className="home-page-btn"
            disabled={pagination.page === 1}
            onClick={handlePrevPage}
          >
            &larr; <span>Anterior</span>
          </button>
          <span>P&aacute;gina {pagination.page} de {pagination.last_page}</span>
          <button
            className="home-page-btn"
            disabled={pagination.page === pagination.last_page}
            onClick={handleNextPage}
          >
            <span>Siguiente</span> &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

