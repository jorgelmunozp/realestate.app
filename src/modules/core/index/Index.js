import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import { Input } from '../../../components/input/Input';
import { FiSearch } from "react-icons/fi";

import './Index.scss';

export const Index = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({
    last_page: 1,
    limit: 6,
    page: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState({}); // loading por imagen

  const fetchItems = async () => {
    setLoading(true);
    try {
      api.interceptors.request.use(
        (config) => {
          const token = sessionStorage.getItem('token');
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => Promise.reject(error)
      );

      const responseProperty = await api.get(`/api/property?page=${pagination.page}&limit=${pagination.limit}`);
      const propertiesData = responseProperty.data.data || [];

      // Inicializamos loading de imágenes
      const loadingObj = {};
      propertiesData.forEach(p => loadingObj[p.idProperty] = true);
      setLoadingImages(loadingObj);

      // Cargar imágenes individualmente
      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (prop) => {
          try {
            const resImg = await api.get(`/api/propertyImage/?IdProperty=${prop.idProperty}`);
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: resImg.data[0] || null };
          } catch (err) {
            console.error(`Error cargando imagen para property ${prop.idProperty}:`, err);
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: null };
          }
        })
      );

      setProperties(propertiesWithImages);
      setPagination(responseProperty.data.meta || pagination);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.page, pagination.limit]);

  const handleOpenProperty = (propertyId) => navigate(`/api/property/${propertyId}`);
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
