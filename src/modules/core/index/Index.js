import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Title } from "../../../components/title/Title";
import { Search } from "../../../components/search/Search";
import { Pagination } from "../../../components/pagination/Pagination";
import { fetchProperties } from "../../../services/store/propertySlice";
import "./Index.scss";

export const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { properties = [], loading = false, meta = {} } = useSelector((s) => s.property || {});
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 6, last_page: 1, total: 0 });

  useEffect(() => {
    const needsRefresh = location.state?.refresh === true;
    dispatch(fetchProperties({ page: pagination.page, limit: pagination.limit, name: filters.name, address: filters.address, minPrice: filters.minPrice, maxPrice: filters.maxPrice, refresh: needsRefresh }));
    if (needsRefresh) navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, pagination.page, pagination.limit, filters, dispatch, navigate]);

  const handleSearchChange = (nextFilters) => { setFilters(nextFilters); setPagination((prev) => ({ ...prev, page: 1 })); };
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
        <div className="index-header"><Title title="Inmuebles Disponibles" /></div>
        <Search filters={filters} onChange={handleSearchChange} />
        <div className="index-grid">
          {properties.length > 0 ? (
            properties.map((p) => (
              <div key={p.idProperty} className="index-property-card" onClick={() => handleOpenProperty(p.idProperty)}>
                {p.image && p.image.file ? <img className="index-property-card-img" src={`data:image/jpeg;base64,${p.image.file}`} alt={p.name} loading="lazy" /> : <div className="no-image">Sin imagen</div>}
                <div className="index-property-card-info">
                  <h3>{p.name}</h3>
                  <p>{p.address}</p>
                  <p className="price">${Number(p.price || 0).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No se encontraron inmuebles</p>
          )}
        </div>
        <Pagination page={pagination.page} lastPage={meta?.last_page || pagination.last_page} onPageChange={handleChangePage} />
      </div>
    </div>
  );
};

export default Index;
