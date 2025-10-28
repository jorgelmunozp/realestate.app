import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Title } from "../../components/title/Title.js";
import { useFetch } from "../../services/fetch/useFetch.js";
import "./Property.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;

export const Property = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { data: property, loading, error } = useFetch(`${propertyEndpoint}/${propertyId}`);

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => navigate(-1);

  // ===========================================================
  // Loader
  // ===========================================================
  if (loading) {
    return (
      <div className="container-loader full-screen">
        <div className="spinner"></div>
        <p>Cargando inmueble...</p>
      </div>
    );
  }

  // ===========================================================
  // Error o sin datos
  // ===========================================================
  if (error || !property) {
    return (
      <div className="property-error">
         Error al cargar el inmueble o no existe.
      </div>
    );
  }

  // ===========================================================
  // Extracción de datos
  // ===========================================================
  const { name, address, price, year, idProperty, codeInternal, image, owner, traces = [] } = property.data;

  // ===========================================================
  // Render principal
  // ===========================================================
  return (
    <div className="property-container">
      <div className="property-card">

        {/* 🖼️ Imagen principal */}
        {image?.file ? (
          <div className="property-image-wrapper">
            <img
              src={`data:image/jpeg;base64,${image.file}`}
              alt={name}
              className="property-main-image"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="no-image">Sin imagen disponible</div>
        )}

        {/* 📋 Información general */}
        <div className="property-info">
          <Title title={name} />
          <p className="property-address">📍 {address || "Sin dirección"}</p>
          <div className="property-price">
            💰 {price ? `$${Number(price).toLocaleString("es-CO")} COP` : "Sin precio"}
          </div>

          <div className="property-details">
            <p><strong>ID Propiedad:</strong> {idProperty}</p>
            <p><strong>Código interno:</strong> {codeInternal || "N/A"}</p>
            <p><strong>Año construcción:</strong> {year || "N/A"}</p>
          </div>

          {/* 👤 Propietario */}
          {owner && (
            <div className="property-owner">
              <h3>👤 Propietario</h3>
              {owner.photo ? (
                <img
                  src={`data:image/jpeg;base64,${owner.photo}`}
                  alt={owner.name}
                  className="owner-photo"
                  loading="lazy"
                />
              ) : (
                <div className="no-image">Sin foto</div>
              )}
              <p className="owner-name">{owner.name || "Nombre no disponible"}</p>
              <p>{owner.address || "Sin dirección"}</p>
              <p>🎂 {owner.birthday || "Sin fecha de nacimiento"}</p>
            </div>
          )}

          {/* 📄 Historial */}
          <div className="property-traces">
            <h3>📄 Historial de transacciones</h3>
            {traces.length > 0 ? (
              traces.map((trace, index) => (
                <div key={index} className="trace-card">
                  <p><strong>Fecha:</strong> {trace.dateSale || "N/A"}</p>
                  <p><strong>Nombre:</strong> {trace.name || "N/A"}</p>
                  <p><strong>Valor:</strong> ${Number(trace.value || 0).toLocaleString("es-CO")} COP</p>
                  <p><strong>Impuesto:</strong> ${Number(trace.tax || 0).toLocaleString("es-CO")} COP</p>
                </div>
              ))
            ) : (
              <p className="no-traces">No hay historial de transacciones.</p>
            )}
          </div>

          {/* 🔙 Botón volver */}
          <button className="property-button" onClick={goBack}>
            ← Regresar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Property;
