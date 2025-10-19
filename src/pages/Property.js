import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Title } from "../components/Title";
import "../assets/styles/scss/pages/Property.scss";

export const Property = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [property, setProperty] = useState({
    images: [],
    owner: {},
    traces: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/api/property/${propertyId}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const goToHome = () => navigate("/home");

  if (loading) {
    return (
      <div className="property-loader">
        <div className="spinner"></div>
        <p>Cargando propiedad...</p>
      </div>
    );
  }

  return (
    <div className="property-container">
      <div className="property-card">
        {/* 🖼️ Imagen principal */}
        {property.images?.length > 0 && (
          <div className="property-image-wrapper">
            <img
              src={property.images[0].file}
              alt={property.name}
              className="property-main-image"
            />
          </div>
        )}

        {/* Información general */}
        <div className="property-info">
          <Title title={property.name} />
          <p className="property-address">📍 {property.address}</p>

          <div className="property-price">
            💰 {property.price?.toLocaleString("es-CO")} COP
          </div>

          <div className="property-details">
            <p><strong>ID Propiedad:</strong> {property.idProperty}</p>
            <p><strong>Código interno:</strong> {property.codeInternal}</p>
            <p><strong>Año construcción:</strong> {property.year}</p>
          </div>

          {/* 👤 Propietario */}
          <div className="property-owner">
            <h3>👤 Propietario</h3>
            {property.owner?.photo && (
              <img
                src={property.owner.photo}
                alt="owner"
                className="owner-photo"
              />
            )}
            <p className="owner-name">{property.owner?.name}</p>
            <p>{property.owner?.address}</p>
            <p>🎂 {property.owner?.birthday}</p>
          </div>

          {/* 📄 Historial */}
          {property.traces?.length > 0 && (
            <div className="property-traces">
              <h3>📄 Historial de transacciones</h3>
              {property.traces.map((trace, index) => (
                <div key={index} className="trace-card">
                  <p><strong>ID Venta:</strong> {trace.idPropertyTrace}</p>
                  <p><strong>Fecha:</strong> {trace.dateSale}</p>
                  <p><strong>Nombre:</strong> {trace.name}</p>
                  <p>
                    <strong>Valor:</strong>{" "}
                    {trace.value?.toLocaleString("es-CO")} COP
                  </p>
                  <p>
                    <strong>Impuesto:</strong>{" "}
                    {trace.tax?.toLocaleString("es-CO")} COP
                  </p>
                </div>
              ))}
            </div>
          )}

          <button className="property-button" onClick={goToHome}>
            ← Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Property;