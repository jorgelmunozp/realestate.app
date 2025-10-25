import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from '../../../components/title/Title';
import { Input } from '../../../components/input/Input';
import { FiSearch } from "react-icons/fi";
import './Index.scss';

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
const propertImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

export const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({
    last_page: 1,
    limit: 6,
    page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});

  const fetchItems = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const res = await errorWrapper(
        api.get(`${propertyEndpoint}?page=${pagination.page}&limit=${pagination.limit}${refresh ? '&refresh=true' : ''}`)
      );
      if (!res.ok) throw res.error;
      const body = res.data || {};
      const propertiesData = Array.isArray(body) ? body : (body.data || []);

      // Inicializamos loading de imágenes
      const loadingObj = {};
      propertiesData.forEach(p => loadingObj[p.idProperty] = true);
      setLoadingImages(loadingObj);

      // Cargar imágenes individualmente
      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (prop) => {
          try {
            const resImg = await errorWrapper(
              api.get(`${propertImageEndpoint}?idProperty=${prop.idProperty}${refresh ? '&refresh=true' : ''}`)
            );
            if (!resImg.ok) throw resImg.error;
            const imgBody = resImg.data || [];
            const firstImg = Array.isArray(imgBody) ? imgBody[0] : imgBody?.[0];
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: firstImg || null };
          } catch (err) {
            console.error(`Error cargando imagen para property ${prop.idProperty}:`, err);
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: null };
          }
        })
      );
      setProperties(propertiesWithImages);
      setPagination(body.meta || pagination);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    const needsRefresh = location.state?.refresh === true;
    fetchItems(needsRefresh);
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, fetchItems, navigate, location.state]);

  // Lógica simple: sin refetch especial al volver

  // Refrescar al volver el foco a la pestaña
  // Sin refresco por foco para mantenerlo simple
  const handleOpenProperty = (propertyId) => navigate(`/property/${propertyId}`);
  const handleNextPage = () => pagination.page < pagination.last_page && setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  const handlePrevPage = () => pagination.page > 1 && setPagination(prev => ({ ...prev, page: prev.page - 1 }));

  if (loading) {
    return (
      <div className="container-loader full-screen">
        <div className="spinner"></div>
        <p>Cargando inmuebles...</p>
      </div>
    );
  }

  return (
    <div className="index-container">
      <div className="index-content">
        <div className="index-header">
          <Title title="Inmuebles Disponibles" />
        </div>

        <div className="index-search">
          <Input
            Icon={FiSearch}
            type="search"
            placeholder="Buscar inmueble..."
            value={queryPropertyName}
            setState={setQueryPropertyName}
          />
        </div>

        <div className="index-grid">
          {properties
            .filter(property => property.name.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((property) => (
              <div
                key={property.idProperty}
                className="index-property-card"
                onClick={() => handleOpenProperty(property.idProperty)}
              >
                {loadingImages[property.idProperty] ? (
                  <div className="container-loader">
                    <div className="spinner"></div>
                  </div>
                ) : property.image ? (
                  <img
                    className="index-property-card-img"
                    src={`data:image/jpg;base64,${property.image.file}`}
                    alt={property.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="container-loader">
                    <div className="spinner"></div>
                  </div>
                )}

                <div className="index-property-card-info">
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                  <p className="price">${property.price.toLocaleString()}</p>
                </div>
              </div>
          ))}
        </div>

        <div className="index-pagination">
          <button className="index-page-btn" disabled={pagination.page === 1} onClick={handlePrevPage}>← <span>Anterior</span></button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button className="index-page-btn" disabled={pagination.page === pagination.last_page} onClick={handleNextPage}><span>Siguiente</span> →</button>
        </div>
      </div>
    </div>
  );
};

export default Index;

