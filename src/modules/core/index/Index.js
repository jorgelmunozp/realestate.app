import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Title } from '../../../components/title/Title';
import { Search } from '../../../components/search/Search';
import { Pagination } from '../../../components/pagination/Pagination';
import { fetchProperties } from '../../../services/store/propertySlice';
import './Index.scss';

export const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { properties = [], loading = false, meta = {} } = useSelector((s) => s.property || {});
  const [queryPropertyName, setQueryPropertyName] = useState('');
  const [pagination, setPagination] = useState({ last_page: 1, limit: 6, page: 1, total: 0 });

  useEffect(() => {
    const needsRefresh = location.state?.refresh === true;
    dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, refresh: needsRefresh }));
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, pagination.page, pagination.limit, dispatch, navigate, location.state]);

  const handleOpenProperty = (propertyId) => navigate(`/property/${propertyId}`);
  const handleChangePage = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

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

        <Search value={queryPropertyName} onChange={setQueryPropertyName} placeholder="Buscar inmueble..." />

        <div className="index-grid">
          {properties
            .filter((property) => property.name.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((property) => (
              <div
                key={property.idProperty}
                className="index-property-card"
                onClick={() => handleOpenProperty(property.idProperty)}
              >
                {property.image ? (
                  <img
                    className="index-property-card-img"
                    src={`data:image/jpg;base64,${property.image.file}`}
                    alt={property.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="container-loader"><div className="spinner"></div></div>
                )}

                <div className="index-property-card-info">
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                  <p className="price">${property.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>

        <Pagination page={pagination.page} lastPage={meta?.last_page || pagination.last_page} onPageChange={handleChangePage} />
      </div>
    </div>
  );
};

export default Index;
