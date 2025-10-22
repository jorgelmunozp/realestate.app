import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Title } from '../components/title/Title';
import { Input } from '../components/input/Input';
import { FiSearch } from "react-icons/fi";

import '../assets/styles/scss/modules/Index.scss';

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Interceptor para agregar token
        api.interceptors.request.use(
          (config) => {
            const token = sessionStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
          },
          (error) => Promise.reject(error)
        );

        const response = await api.get(`/api/property?page=${pagination.page}&limit=${pagination.limit}`);
        console.log("response: ", response.data);

        setProperties(response.data.data || []);
        setPagination(response.data.meta || pagination);

      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setProperties([]);
      }
    };

    fetchItems();
  }, [pagination.page, pagination.limit]); // SOLO estas propiedades

  const handleOpenProperty = (propertyId) => {
    navigate(`/api/property/${propertyId}`);
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
    <div className="index-container">
      <div className="index-content">
        <div className="index-header">
          <Title title={"Inmuebles Disponibles"} />
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
            .map((property, index) => (
              <div key={`property${index}`} className="index-property-card" onClick={() => handleOpenProperty(property.Id)}>
                <img className="index-property-card-img" src={`data:image/jpg;base64,${property.image?.file}`} alt={`property${index}`} />
                <div className="index-property-card-info">
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                  <p className="price">${property.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="index-pagination">
          <button disabled={pagination.page === 1} onClick={handlePrevPage} className="index-page-btn">← <span>Anterior</span></button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button disabled={pagination.page === pagination.last_page} onClick={handleNextPage} className="index-page-btn"><span>Siguiente</span> →</button>
        </div>
      </div>
    </div>
  );
};

export default Index;
