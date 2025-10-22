import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import propertyDto from "../property/dto/PropertyDto.json";
import ownerDto from "../owner/dto/OwnerDto.json";
import propertyImageDto from "../propertyImage/dto/PropertyImageDto.json";
import propertyTraceDto from "../propertyTrace/dto/PropertyTraceDto.json";
import "../../assets/styles/scss/modules/crud/CrudProperty.scss";

export const CrudProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [itemProperty, setProperty] = useState(propertyDto);
  const [itemOwner, setOwner] = useState(ownerDto);
  const [itemPropertyImage, setPropertyImage] = useState(propertyImageDto);
  const [itemPropertyTrace, setPropertyTrace] = useState(propertyTraceDto);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Cargar datos de propiedad, propietario, imágenes y trazas
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      try {
        // Obtener propiedad
        const { data: propertyData } = await api.get(`/api/property/${propertyId}`);
        
        // Obtener propietario
        const { data: ownerData } = await api.get(`/api/owner/${propertyData.IdOwner}`);

        // Obtener imágenes
        const { data: imagesData } = await api.get(`/api/propertyimage/${propertyData.Id}`);

        // Obtener trazas
        const { data: tracesData } = await api.get(`/api/propertytrace/${propertyData.Id}`);

        setProperty(propertyData);
        setOwner(ownerData);
        setPropertyImage(imagesData);
        setPropertyTrace(tracesData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos de la propiedad");
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  // 🔹 Manejo de cambios en formularios
  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;

    switch (section) {
      case "owner":
        setOwner((prev) => ({
          ...prev,
          [name]: value,
        }));
        break;

      case "propertyImage":
        setPropertyImage((prev) => ({
          ...prev,
          [name]: value,
        }));
        break;

      case "traces":
        if (index !== null) {
          setPropertyTrace((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [name]: value };
            return updated;
          });
        }
        break;
      case "property": 
      default: // "property"
        setProperty((prev) => ({
          ...prev,
          [name]: value,
        }));
        break;
    }
  };

  // 🔹 Convertir archivo a Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });

  // 🔹 Manejo de imagen del inmueble
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      const preview = URL.createObjectURL(file);
      setPropertyImage((prev) => ({
        ...prev,
        File: base64,
        Enabled: true,
        imagePreview: preview,
      }));
    }
  };

  // 🔹 Manejo de imagen del propietario
  const handleOwnerImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      const preview = URL.createObjectURL(file);
      setOwner((prev) => ({
        ...prev,
        Photo: base64,
        // ownerPhotoPreview: preview,
      }));
    }
  };

  // 🔹 Envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payloadOwner = { ...itemOwner };
      const responseOwner = await api.post("/api/owner", payloadOwner);

      const payloadProperty = { ...itemProperty, IdOwner:responseOwner.data.id };
      const responseProperty = await api.post("/api/property", payloadProperty);
     
      const payloadPropertyImage = { ...itemPropertyImage, Enabled:true, IdProperty:responseProperty.data.id };
      const payloadPropertyTrace = { ...itemPropertyTrace, IdProperty:responseProperty.data.id };
      
      if(responseProperty.data.id) {
        await api.post("/api/propertyImage", payloadPropertyImage);
        await api.post("/api/propertyTrace", payloadPropertyTrace);
      }

      navigate("/home");
    } catch (err) {
      console.error("Error creando/actualizando propiedad:", err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="property-loader">
        <div className="spinner"></div>
        <p>Cargando propiedad...</p>
      </div>
    );
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <div className="crudproperty-container">
      <form className="crudproperty-card" onSubmit={handleSubmit}>
        <h1 className="crudproperty-title">
          {propertyId ? "Editar Propiedad" : "Registrar nueva propiedad"}
        </h1>

        {/* Property */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="Name" value={itemProperty.Name} onChange={(e) => handleChange(e, "property")} required />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="Address" value={itemProperty.Address} onChange={(e) => handleChange(e, "property")} required />
            </div>
            <div className="input-group">
              <label>Precio</label>
              <input type="number" name="Price" value={itemProperty.Price} onChange={(e) => handleChange(e, "property")} min={0} required />
            </div>
            <div className="input-group">
              <label>Código interno</label>
              <input type="number" name="CodeInternal" value={itemProperty.CodeInternal} onChange={(e) => handleChange(e, "property")} min={0} />
            </div>
            <div className="input-group">
              <label>Año</label>
              <input type="number" name="Year" value={itemProperty.Year} onChange={(e) => handleChange(e, "property")} min={1800} />
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="Name" value={itemOwner.Name} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="Address" value={itemOwner.Address} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input type="date" name="Birthday" value={itemOwner.Birthday} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Foto del propietario</label>
              <input type="file" accept="image/*" onChange={handleOwnerImageChange} />
              {itemOwner.ownerPhotoPreview && (
                <div className="image-preview">
                  <img className="owner-photo" src={itemOwner.ownerPhotoPreview} alt="Foto del propietario" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PropertyImage */}
        <div className="form-section">
          <h2>Imagen del inmueble</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Subir imagen</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {itemPropertyImage.imagePreview && (
                <div className="image-preview">
                  <img className="property-image" src={itemPropertyImage.imagePreview} alt="Vista previa del inmueble" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PropertyTrace */}
        <div className="form-section">
          <h2>Información de venta</h2>
          {itemPropertyTrace.map((trace, index) => (
            <div key={index} className="form-grid trace-group">
              <h3>Venta #{index + 1}</h3>
              <div className="input-group">
                <label>Fecha de venta</label>
                <input type="date" name="DateSale" value={trace.DateSale} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Nombre del evento</label>
                <input type="text" name="Name" value={trace.Name} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Valor</label>
                <input type="number" name="Value" value={trace.Value} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Impuesto</label>
                <input type="number" name="Tax" value={trace.Tax} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className="crudproperty-btn primary">
          {propertyId ? "Actualizar Propiedad" : "Crear Propiedad"}
        </button>
        <button type="button" className="crudproperty-btn secondary" onClick={() => navigate("/home")}>
          Cancelar
        </button>
      </form>
    </div>
  );
};
