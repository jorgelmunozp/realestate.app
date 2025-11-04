import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Title } from "../../components/title/Title.js";
import { Button } from "../../components/button/Button.js";
import { useFetch } from "../../services/fetch/useFetch.js";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import "./Property.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY.trim();

export const Property = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = useParams();
  const { data: property, loading, error } = useFetch(`${propertyEndpoint}/${propertyId}`);
  dayjs.locale('es');

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Toma "from" y el estado de paginación para volver
  const goBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, { state: { pagination: location.state.pagination, filters: location.state.filters } });
    } else {
      navigate("/");              // fallback si entró directo
    }
  };

  // Loader
  if (loading) {
    return (
      <div className="container-loader full-screen">
        <div className="spinner"></div>
        <p>Cargando inmueble...</p>
      </div>
    );
  }

  // Error o sin datos
  if (error || !property) {
    return (
      <div className="property-error">
         Error al cargar el inmueble o no existe.
      </div>
    );
  }

  // Extracción de datos
  const { name, address, price, year, idProperty, codeInternal, image, owner, traces = [] } = property.data;

   const ownerBirthday = owner?.birthday
    ? dayjs(owner.birthday).format('D [de] MMMM [de] YYYY')
    : "Sin fecha de nacimiento";

  // Render principal
  return (
    <div className="property-container">
      <div className="property-card">

        {/* Imagen principal */}
        {image?.file ? ( <div className="property-image-wrapper">
                           <img src={`data:image/jpeg;base64,${image.file}`} alt={name} className="property-main-image" loading="lazy" />
                         </div> ) 
                     : ( <div className="no-image">Sin imagen disponible</div> )
        }

        {/* Información general */}
        <div className="property-info">
          <Title title={name} />
          <p className="property-address">📍 {address || "Sin dirección"}</p>
          <div className="property-price">
            💰 {price ? `$ ${Number(price).toLocaleString("es-CO")}` : "Sin precio"}
          </div>

          <div className="property-details">
            <p><strong>ID Propiedad:</strong> {idProperty}</p>
            <p><strong>Código interno:</strong> {codeInternal || "N/A"}</p>
            <p><strong>Año construcción:</strong> {year || "N/A"}</p>
          </div>

          {/* Propietario */}
          {owner && (
            <div className="property-owner">
              <h3>👤 Propietario</h3>
              {owner.photo ? ( <img src={`data:image/jpeg;base64,${owner.photo}`} alt={owner.name} className="owner-photo" loading="lazy" /> )
                           : ( <div className="no-image">Sin foto</div> )}
              <p className="owner-name">{owner.name || "Nombre no disponible"}</p>
              <p>{owner.address || "Sin dirección"}</p>
              {/* <p>🎂 {owner.birthday || "Sin fecha de nacimiento"}</p> */}
              <p>🎂 {ownerBirthday}</p>
            </div>
          )}

          {/* Historial */}
          <div className="property-traces">
            <h3>📄 Historial de transacciones</h3>
            {traces.length > 0 ? (
              traces.map((trace, index) => (
                <div key={index} className="trace-card">
                  <p><strong>Fecha:</strong> {trace.dateSale || "N/A"}</p>
                  <p><strong>Nombre:</strong> {trace.name || "N/A"}</p>
                  <p><strong>Valor:</strong> $ {Number(trace.value || 0).toLocaleString("es-CO")}</p>
                  <p><strong>Impuesto:</strong> {Number(trace.tax || 0).toLocaleString("es-CO")} %</p>
                </div>
              ))
            ) : (
              <p className="no-traces">No hay historial de transacciones.</p>
            )}
          </div>

          <Button id="buttonBack" label={'← Regresar'} onClick={goBack} arial-label="button back" />
        </div>
      </div>
    </div>
  );
};

export default Property;
