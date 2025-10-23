import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Title } from "../../components/title/Title";
import { useFetchGet } from "../../hooks/useFetchGet";
import "./Property.scss";

export const Property = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);      // Scroll al inicio al cargar

  const navigate = useNavigate();
  const { propertyId } = useParams();

  const { data: property, loading, error } = useFetchGet(`/api/property/${propertyId}`);
  const { data: owner, loading: loadingOwner } = useFetchGet(property ? `/api/owner/${property.idOwner}` : null);
  const { data: propertyImage, loading: loadingPropertyImage } = useFetchGet(propertyId ? `/api/propertyImage/?IdProperty=${propertyId}` : null);
  const { data: propertyTrace, loading: loadingPropertyTrace } = useFetchGet(propertyId ? `/api/propertyTrace/?IdProperty=${propertyId}` : null);

  const goToHome = () => navigate("/home");

  // Loader general de propiedad
  if (loading) {
    return (
      <div className="container-loader full-screen">
        <div className="spinner"></div>
        <p>Cargando propiedad...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>Error al cargar la propiedad</p>;
  }

  return (
    <div className="property-container">
      <div className="property-card">

        {/* 🖼️ Imagen principal */}
        {loadingPropertyImage ? (
          <div className="container-loader inline">
            <div className="spinner"></div>
            <p>Cargando imagen...</p>
          </div>
        ) : (
          propertyImage?.length > 0 && (
            <div className="property-image-wrapper">
              <img
                src={`data:image/jpg;base64,${propertyImage[0].file}`}
                alt={property.name}
                className="property-main-image"
                loading="lazy"
              />
            </div>
          )
        )}

        {/* Información general */}
        <div className="property-info">
          <Title title={property.name} />
          <p className="property-address">📍 {property.address}</p>

          <div className="property-price">
            💰 $ {property.price?.toLocaleString("es-CO")} COP
          </div>

          <div className="property-details">
            <p><strong>ID Propiedad:</strong> {property.idProperty}</p>
            <p><strong>Código interno:</strong> {property.codeInternal}</p>
            <p><strong>Año construcción:</strong> {property.year}</p>
          </div>

          {/* 👤 Propietario */}
          <div className="property-owner">
            <h3>👤 Propietario</h3>
            {loadingOwner ? (
              <div className="owner-image-loader">
                <div className="spinner"></div>
                <p>Cargando propietario...</p>
              </div>
            ) : (
              owner?.photo && (
                <img
                  src={`data:image/jpg;base64,${owner.photo}`}
                  alt="owner"
                  className="owner-photo"
                  loading="lazy"
                />
              )
            )}
            <p className="owner-name">{owner?.name}</p>
            <p>{owner?.address}</p>
            <p>🎂 {owner?.birthday}</p>
          </div>

          {/* 📄 Historial */}
          <div className="property-traces">
            <h3>📄 Historial de transacciones</h3>
            {loadingPropertyTrace ? (
              <div className="container-loader inline">
                <div className="spinner"></div>
                <p>Cargando historial...</p>
              </div>
            ) : propertyTrace?.length > 0 ? (
              propertyTrace.map((trace, index) => (
                <div key={index} className="trace-card">
                  <p><strong>ID Venta:</strong> {trace.idPropertyTrace}</p>
                  <p><strong>Fecha:</strong> {trace.dateSale}</p>
                  <p><strong>Nombre:</strong> {trace.name}</p>
                  <p><strong>Valor:</strong> $ {trace.value?.toLocaleString("es-CO")} COP</p>
                  <p><strong>Impuesto:</strong> $ {trace.tax?.toLocaleString("es-CO")} COP</p>
                </div>
              ))
            ) : (
              <p>No hay historial de transacciones.</p>
            )}
          </div>

          <button className="property-button" onClick={goToHome}>
            ← Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Property;
