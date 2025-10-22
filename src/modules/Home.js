import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Title } from '../components/title/Title';
import { Input } from '../components/input/Input';
import { FiPlus, FiSearch } from "react-icons/fi";
import Swal from 'sweetalert2';
import '../assets/styles/scss/modules/Home.scss';

const handleDeleteProperty = async (propertyId, fetchItems) => {
  const result = await Swal.fire({
    title: "Eliminar Propiedad",
    text: "Estás seguro?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    try {
      const response = await api.delete(`/api/property/${propertyId}`);
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "Propiedad Eliminada",
          text: "La propiedad ha sido eliminada con éxito",
          icon: "success"
        });
        fetchItems(); // refrescar lista
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la propiedad",
        icon: "error"
      });
      console.error(error);
    }
  }
};

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

  const userId = sessionStorage.getItem('userId');

  const fetchItems = async () => {
    if (!userId) {
      navigate('/index');
      return;
    }

    try {
      api.interceptors.request.use(
        (config) => {
          const token = sessionStorage.getItem('token');
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => Promise.reject(error)
      );

      const response = await api.get(`/api/property?page=${pagination.page}&limit=${pagination.limit}`);
      setProperties(response.data.data || []);
      setPagination(response.data.meta || pagination);

    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      setProperties([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.page, pagination.limit]); // solo page y limit

  const handleUpdateProperty = (propertyId) => {
    navigate(`/crud-property/${propertyId}`);
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.last_page) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

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
            .map((property, index) => (
              <div key={`property${index}`} className="home-property-card">
                <img className="home-property-card-img" src={`data:image/png;base64,${property.image?.file}`} alt={`property${index}`} />
                <div className="home-property-card-info">
                  <h3>{property.name}</h3>
                </div>
                <div className="home-property-card-buttons">
                  <button onClick={() => handleUpdateProperty(property.Id)}>✏️</button>
                  <button onClick={() => handleDeleteProperty(property.Id, fetchItems)}>❌</button>
                </div>
              </div>
            ))}
        </div>

        <div className="home-pagination">
          <button disabled={pagination.page === 1} onClick={handlePrevPage} className="home-page-btn">← <span>Anterior</span></button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button disabled={pagination.page === pagination.last_page} onClick={handleNextPage} className="home-page-btn"><span>Siguiente</span> →</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
