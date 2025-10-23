import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import { Input } from '../../../components/input/Input';
import { FiPlus, FiSearch } from "react-icons/fi";
import Swal from 'sweetalert2';
import './Home.scss';

export const Home = () => {
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
  const [loadingImages, setLoadingImages] = useState({});

  const userId = sessionStorage.getItem('userId');

  // 🔹 Configurar interceptor solo una vez
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  const fetchItems = async () => {
    if (!userId) {
      navigate('/index');
      return;
    }

    setLoading(true);
    try {
      const responseProperty = await api.get(`/api/property?page=${pagination.page}&limit=${pagination.limit}`);
      const propertiesData = responseProperty.data.data || [];

      const loadingObj = {};
      propertiesData.forEach(p => loadingObj[p.idProperty] = true);
      setLoadingImages(loadingObj);

      const propertiesWithImages = await Promise.all(
        propertiesData.map(async (prop) => {
          try {
            const resImg = await api.get(`/api/propertyImage/?IdProperty=${prop.idProperty}`);
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: resImg.data[0] || null };
          } catch {
            setLoadingImages(prev => ({ ...prev, [prop.idProperty]: false }));
            return { ...prop, image: null };
          }
        })
      );

      setProperties(propertiesWithImages);
      setPagination(prev => ({
        ...prev,
        ...responseProperty.data.meta,
        page: prev.page // evitar reset de página
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.page, pagination.limit]); // evitar loop infinito

  const handleUpdateProperty = (propertyId) => navigate(`/crud-property/${propertyId}`);
  const handleDeleteProperty = async (propertyId) => {
    const result = await Swal.fire({
      title: "Eliminar Propiedad",
      text: "Estás seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/property/${propertyId}`);
        Swal.fire("Propiedad Eliminada", "La propiedad ha sido eliminada con éxito", "success");
        fetchItems();
      } catch {
        Swal.fire("Error", "No se pudo eliminar la propiedad", "error");
      }
    }
  };

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
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <Title title="Inmuebles" />
          <button className="home-add-btn" onClick={() => navigate('/crud-property')}><FiPlus /></button>
        </div>

        <div className="home-search">
          <Input
            Icon={FiSearch}
            type="search"
            placeholder="Buscar inmueble..."
            value={queryPropertyName}
            setState={setQueryPropertyName}
          />
        </div>

        <div className="home-grid">
          {properties
            .filter(property => property.name.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((property) => (
              <div key={property.idProperty} className="home-property-card" onClick={() => navigate(`/crud-property/${property.idProperty}`)}>
                {loadingImages[property.idProperty] ? (
                  <div className="container-loader inline"><div className="spinner"></div></div>
                ) : property.image ? (
                  <img className="home-property-card-img" src={`data:image/png;base64,${property.image.file}`} alt={property.name} loading="lazy" />
                ) : (
                  <div className="container-loader inline"><div className="spinner"></div></div>
                )}

                <div className="home-property-card-info">
                  <h3>{property.name}</h3>
                </div>

                <div className="home-property-card-buttons">
                  <button onClick={(e) => { e.stopPropagation(); handleUpdateProperty(property.idProperty); }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property.idProperty); }}>❌</button>
                </div>
              </div>
          ))}
        </div>
        <div className="home-pagination">
          <button className="home-page-btn" disabled={pagination.page === 1} onClick={handlePrevPage}>← <span>Anterior</span></button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button className="home-page-btn" disabled={pagination.page === pagination.last_page} onClick={handleNextPage}><span>Siguiente</span> →</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
