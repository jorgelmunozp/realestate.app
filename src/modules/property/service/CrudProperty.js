import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../services/api/api";
import { AddButton } from "../../../components/button/AddButton.js";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
import propertyDto from "../dto/PropertyDto.json";
import ownerDto from "../../owner/dto/OwnerDto.json";
import propertyImageDto from "../../propertyImage/dto/PropertyImageDto.json";
import propertyTraceDto from "../../propertyTrace/dto/PropertyTraceDto.json";
import { normalizeProperty } from "../mapper/propertyMapper";
import { normalizeOwner } from "../../owner/mapper/OwnerMapper";
import { normalizePropertyImage } from "../../propertyImage/mapper/propertyImageMapper";
import { normalizePropertyTrace } from "../../propertyTrace/mapper/propertyTraceMapper";
import "./CrudProperty.scss";

export const CrudProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();

  const endpoints = useMemo(() => ({
    property: process.env.REACT_APP_ENDPOINT_PROPERTY,
    owner: process.env.REACT_APP_ENDPOINT_OWNER,
    image: process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE,
    trace: process.env.REACT_APP_ENDPOINT_PROPERTYTRACE,
  }), []);

  const idFields = useMemo(
    () => ["id", "idProperty", "idPropertyTrace", "idOwner", "idPropertyImage"],
    []
  );

  const [itemProperty, setProperty] = useState(normalizeProperty(propertyDto));
  const [itemOwner, setOwner] = useState(normalizeOwner(ownerDto));
  const [itemPropertyImage, setPropertyImage] = useState(normalizePropertyImage(propertyImageDto));
  const [itemPropertyTrace, setPropertyTrace] = useState(normalizePropertyTrace(propertyTraceDto));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 Convertir archivo a base64
  const toBase64 = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  }), []);

  // Cargar datos si existe propertyId
  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return setLoading(false);
      try {
        const [{ data: propertyData }, { data: tracesData }, { data: imageData }] = await Promise.all([
          api.get(`${endpoints.property}/${propertyId}`),
          api.get(`${endpoints.trace}?idProperty=${propertyId}`),
          api.get(`${endpoints.image}?idProperty=${propertyId}`)
        ]);

        setProperty(propertyData);

        const { data: ownerData } = await api.get(`${endpoints.owner}/${propertyData.idOwner}`);
        setOwner({
          ...ownerData,
          ownerPhotoPreview: ownerData.photo ? `data:image/jpeg;base64,${ownerData.photo}` : ""
        });

        if (Array.isArray(imageData) && imageData.length) {
          const img = imageData[0];
          setPropertyImage({
            ...img,
            imagePreview: img.file ? `data:image/jpeg;base64,${img.file}` : ""
          });
        }

        setPropertyTrace(Array.isArray(tracesData) ? tracesData : [tracesData]);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setError("Error al cargar el inmueble");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId, endpoints]);

  // Evita scroll en inputs numéricos
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === "number") {
        e.preventDefault();
        document.activeElement.blur();
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  const handleChange = useCallback((e, section = "property", index = null) => {
    const { name, value } = e.target;
    const setMap = {
      property: setProperty,
      owner: setOwner,
      propertyImage: setPropertyImage
    };

    if (section === "traces" && index !== null) {
      setPropertyTrace((prev) => prev.map((t, i) => (i === index ? { ...t, [name]: value } : t)));
    } else {
      setMap[section]?.((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageChange = useCallback(async (e, type = "property") => {
    if (!e?.target?.files?.[0]) return;
    const file = e.target.files[0];
    const base64 = await toBase64(file);
    const preview = URL.createObjectURL(file);

    if (type === "owner") {
      setOwner((prev) => ({ ...prev, photo: base64, ownerPhotoPreview: preview }));
    } else {
      setPropertyImage((prev) => ({ ...prev, file: base64, enabled: true, imagePreview: preview }));
    }
  }, [toBase64]);

  // Guardado genérico (POST o PATCH)
  const saveEntity = useCallback(async (endpoint, data) => {
    const idKey = Object.keys(data).find((key) => idFields.includes(key) && data[key]);
    const idValue = idKey ? data[idKey] : null;
    const payload = endpoint.includes("propertyTrace") ? [data] : data;
    return idValue ? api.patch(`${endpoint}/${idValue}`, data) : api.post(endpoint, payload);
  }, [idFields]);

  // Guardar todo el conjunto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resOwner = await saveEntity(endpoints.owner, itemOwner);
      const resProperty = await saveEntity(endpoints.property, { ...itemProperty, idOwner: resOwner.data.id });
      await saveEntity(endpoints.image, { ...itemPropertyImage, idProperty: resProperty.data.idProperty });

      const traces = itemPropertyTrace.map((t) => ({
        ...t,
        value: Number(t.value),
        tax: Number(t.tax),
        idProperty: resProperty.data.idProperty
      }));
      await Promise.all(traces.map((t) => saveEntity(endpoints.trace, t)));

      Swal.fire({
        title: propertyId ? "Inmueble actualizado" : "Inmueble registrado",
        icon: "success",
        confirmButtonText: "Aceptar"
      });
      navigate("/home");
    } catch (error) {
      console.error("❌ Error al guardar:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado al guardar el inmueble"
      });
    }
  };

  const handleAddTrace = useCallback(() => {
    setPropertyTrace((prev) => [...prev, { name: "", value: 0, tax: 0, dateSale: "", idProperty: "" }]);
  }, []);

  const handleDeleteTrace = useCallback(async (index) => {
    try {
      const trace = itemPropertyTrace[index];
      if (trace.idPropertyTrace) await api.delete(`${endpoints.trace}/${trace.idPropertyTrace}`);
      setPropertyTrace((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("❌ Error al eliminar traza:", error.response?.data || error);
    }
  }, [itemPropertyTrace, endpoints]);

  if (loading) return <div className="container-loader full-screen"><div className="spinner" /><p>Cargando...</p></div>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="crudproperty-container">
      <form className="crudproperty-card" onSubmit={handleSubmit}>
        <h1 className="crudproperty-title">{propertyId ? "Editar Propiedad" : "Registrar nueva propiedad"}</h1>

        {/* --- Sección de datos generales --- */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemProperty.name} onChange={(e) => handleChange(e, "property")} variant="outlined" required />
            <TextField name="address" label="Dirección" value={itemProperty.address} onChange={(e) => handleChange(e, "property")} variant="outlined" required />
            <TextField name="price" label="Precio" type="number" value={itemProperty.price} onChange={(e) => handleChange(e, "property")} InputProps={{ inputProps: { min: 0 } }} variant="outlined" required />
            <TextField name="codeInternal" label="Código interno" type="number" value={itemProperty.codeInternal} onChange={(e) => handleChange(e, "property")} InputProps={{ inputProps: { min: 0 } }} variant="outlined" />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Año"
                views={["year"]}
                value={itemProperty.year ? dayjs(String(itemProperty.year), "YYYY") : null}
                onChange={(v) => handleChange({ target: { name: "year", value: v ? v.year() : "" } })}
                slotProps={{ textField: { fullWidth: true, className: "year-input", InputLabelProps: { shrink: true } } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* --- Imagen inmueble --- */}
        <div className="form-section">
          <h2>Imagen del inmueble</h2>
          <div className="image-upload-container">
            {!itemPropertyImage.imagePreview ? (
              <Box className="dropzone-box" onClick={() => document.getElementById("propertyFileInput").click()}>
                <Typography variant="body1" color="textSecondary">Haz clic o arrastra una imagen del inmueble aquí</Typography>
                <input id="propertyFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "property")} />
              </Box>
            ) : (
              <div className="image-preview filled">
                <img src={itemPropertyImage.imagePreview} alt="Inmueble" className="property-image" />
                <button type="button" className="replace-btn" onClick={() => setPropertyImage((p) => ({ ...p, imagePreview: "" }))}>Eliminar imagen</button>
              </div>
            )}
          </div>
        </div>

        {/* --- Propietario --- */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemOwner.name} onChange={(e) => handleChange(e, "owner")} variant="outlined" />
            <TextField name="address" label="Dirección" value={itemOwner.address} onChange={(e) => handleChange(e, "owner")} variant="outlined" />
            <TextField type="date" name="birthday" label="Fecha de nacimiento" value={itemOwner.birthday} onChange={(e) => handleChange(e, "owner")} InputLabelProps={{ shrink: true }} className="input-date" />
            <div className="image-upload-container">
              {!itemOwner.ownerPhotoPreview ? (
                <Box className="dropzone-box" onClick={() => document.getElementById("ownerFileInput").click()}>
                  <Typography variant="body1" color="textSecondary">Haz clic o arrastra una imagen del propietario aquí</Typography>
                  <input id="ownerFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "owner")} />
                </Box>
              ) : (
                <div className="image-preview filled">
                  <img src={itemOwner.ownerPhotoPreview} alt="Propietario" className="owner-photo" />
                  <button type="button" className="replace-btn" onClick={() => setOwner((p) => ({ ...p, ownerPhotoPreview: "" }))}>Eliminar imagen</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Historial --- */}
        <div className="form-section">
          <h2>Historial</h2>
          {itemPropertyTrace.map((trace, index) => (
            <div key={index} className="trace-wrapper">
              <h3 className="trace-title">Registro {index + 1}</h3>
              <div className="form-grid trace-group">
                <TextField type="date" name="dateSale" label="Fecha" value={trace.dateSale} onChange={(e) => handleChange(e, "traces", index)} InputLabelProps={{ shrink: true }} className="input-date" />
                <TextField name="name" label="Nombre del evento" value={trace.name} onChange={(e) => handleChange(e, "traces", index)} />
                <TextField type="number" name="value" label="Valor" value={trace.value} onChange={(e) => handleChange(e, "traces", index)} />
                <TextField type="number" name="tax" label="Impuesto" value={trace.tax} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <button type="button" className="crudproperty-btn secondary" style={{ width: "180px", marginTop: "0.6rem", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "0.9rem", fontWeight: "600" }} onClick={() => handleDeleteTrace(index)}>Eliminar registro</button>
            </div>
          ))}
        </div>

        {/* --- Botones --- */}
        <AddButton label="Añadir evento" handleChange={handleAddTrace} />
        <br />
        <button type="submit" className="crudproperty-btn primary">{propertyId ? "Actualizar Propiedad" : "Crear Propiedad"}</button>
        <button type="button" className="crudproperty-btn secondary" onClick={() => navigate("/home")}>Cancelar</button>
      </form>
    </div>
  );
};

export default CrudProperty;

