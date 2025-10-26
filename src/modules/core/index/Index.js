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

    // Limpia el state solo si realmente venía con refresh
    if (needsRefresh) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, pagination.page, pagination.limit, dispatch, navigate]);

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

        <Search
          value={queryPropertyName}
          onChange={setQueryPropertyName}
          placeholder="Buscar inmueble..."
        />

        <div className="index-grid">
          {properties
            .filter((p) => p.name?.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((p) => (
              <div
                key={p.idProperty}
                className="index-property-card"
                onClick={() => handleOpenProperty(p.idProperty)}
              >
                {p.image && p.image.file ? (
                  <img
                    className="index-property-card-img"
                    src={`data:image/jpeg;base64,${p.image.file}`}
                    alt={p.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-image">Sin imagen</div>
                )}

                <div className="index-property-card-info">
                  <h3>{p.name}</h3>
                  <p>{p.address}</p>
                  <p className="price">${p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>

        <Pagination
          page={pagination.page}
          lastPage={meta?.last_page || pagination.last_page}
          onPageChange={handleChangePage}
        />
      </div>
    </div>
  );
};

export default Index;
