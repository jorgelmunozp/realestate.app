import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { Title } from "../../../components/title/Title.js";
import { AddButton } from "../../../components/button/AddButton.js";
import { FiTrash2 } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { mapOwnerToDto } from "../../owner/mapper/OwnerMapper";
import { mapPropertyImageToDto } from "../../propertyImage/mapper/propertyImageMapper";
import { mapPropertyTraceToDto } from "../../propertyTrace/mapper/propertyTraceMapper";
import Swal from "sweetalert2";
import "./EditProperty.scss";

export const EditProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const location = useLocation();
  const endpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;

  const [itemProperty, setProperty] = useState(null);
  const [itemOwner, setOwner] = useState({});
  const [itemPropertyImage, setPropertyImage] = useState({});
  const [itemPropertyTrace, setPropertyTrace] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [traceAlert, setTraceAlert] = useState({ message: "", severity: "success" });

  const toBase64 = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }),
    []
  );

  // Cargar datos completos de la propiedad
  useEffect(() => {
    const loadProperty = async () => {
      try {
        const needsRefresh = location.state?.refresh === true;
        const res = await errorWrapper(api.get(`${endpoint}/${propertyId}${needsRefresh ? "?refresh=true" : ""}`));
        const property = res?.data?.data ?? res?.data ?? res?.data?.data;
        if (!property) throw new Error("No se encontró la propiedad");

        setProperty(property);
        if (property.image)
          setPropertyImage({
            ...property.image,
            imagePreview: property.image.file ? `data:image/jpeg;base64,${property.image.file}` : "",
          });
        if (property.owner)
          setOwner({
            ...property.owner,
            ownerPhotoPreview: property.owner.photo ? `data:image/jpeg;base64,${property.owner.photo}` : "",
          });
        if (property.traces?.length) setPropertyTrace(property.traces);
      } catch (err) {
        console.error("Error al cargar propiedad:", err);
        Swal.fire({ icon: "error", title: "Error", text: "No se obtuvo los datos del inmueble" });
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [propertyId, location.state, endpoint]);

  // Handlers
  const clampNonNegative = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;
    if (section === "owner") {
      setOwner((prev) => ({ ...prev, [name]: value }));
    } else if (section === "traces") {
      const newVal = name === "value" || name === "tax" ? clampNonNegative(value) : value;
      setPropertyTrace((prev) => prev.map((t, i) => (i === index ? { ...t, [name]: newVal } : t)));
    } else {
      const newVal = name === "price" || name === "codeInternal" ? clampNonNegative(value) : value;
      setProperty((prev) => ({ ...prev, [name]: newVal }));
    }
  };

  const handleImageChange = async (e, type = "property") => {
    if (!e?.target?.files?.[0]) return;
    const file = e.target.files[0];
    const base64 = await toBase64(file);
    const preview = URL.createObjectURL(file);
    if (type === "owner") {
      setOwner((prev) => ({ ...prev, photo: base64, ownerPhotoPreview: preview }));
    } else {
      setPropertyImage((prev) => ({ ...prev, file: base64, enabled: true, imagePreview: preview }));
    }
  };

  const handleAddTrace = () => setPropertyTrace((prev) => [...prev, { name: "", value: 0, tax: 0, dateSale: "" }]);
  const handleDeleteTrace = (index) => {
    setPropertyTrace((prev) => prev.filter((_, i) => i !== index));
    setTraceAlert({ message: "Traza eliminada localmente (se guardará al actualizar)", severity: "info" });
  };

  // Guardar cambios con wrapper
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      if (!itemProperty) {
        setUpdating(false);
        Swal.fire({ icon: "error", title: "Error", text: "No se encontró la propiedad." });
        return;
      }

      const cleanedImage =
        itemPropertyImage?.file && itemPropertyImage.file.trim() !== ""
          ? mapPropertyImageToDto(itemPropertyImage)
          : null;

      const cleanedOwner =
        itemOwner?.name?.trim() &&
        itemOwner?.address?.trim() &&
        (itemOwner?.photo?.trim() || itemOwner?.ownerPhotoPreview?.trim()) &&
        itemOwner?.birthday?.trim()
          ? mapOwnerToDto(itemOwner)
          : null;

      const cleanedTraces =
        Array.isArray(itemPropertyTrace) && itemPropertyTrace.length > 0
          ? itemPropertyTrace
              .filter((t) => t.name?.trim() && t.dateSale?.trim() && Number(t.value) > 0)
              .map(mapPropertyTraceToDto)
          : [];

      const patchPayload = {
        name: itemProperty.name,
        address: itemProperty.address,
        price: Number(itemProperty.price),
        codeInternal: Number(itemProperty.codeInternal),
        year: itemProperty.year,
        image: cleanedImage,
        owner: cleanedOwner,
        traces: cleanedTraces,
      };

      console.log("Actualización Ok →", patchPayload);

      const resUpdate = await errorWrapper(api.patch(`${endpoint}/${propertyId}`, patchPayload));
      const { success, message, error } = resUpdate;
      console.log("message: ", message)
      console.log("error: ", error)

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Propiedad actualizada",
          confirmButtonText: "Aceptar",
        });
        navigate('/home', { state: { refresh: true } });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message || "Ocurrió un error al actualizar la propiedad",
        });
      }
    } catch (error) {
      console.error("Error al actualizar propiedad:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Ocurrió un error al actualizar el inmueble",
      });
    } finally {
      setUpdating(false);
    }
  };

  // fallback
  if (loading || updating)
    return (
      <div className="loader-overlay loader-overlay--home">
        <div className="loader-spinner"></div>
        {loading &&  <p className="loader-text">Cargando inmueble...</p>}
        {updating &&  <p className="loader-text">Actualizando inmueble...</p>}
      </div>
    );

  if (!itemProperty)
    return <p style={{ textAlign: "center", color: "red" }}>Inmueble no encontrado</p>;

  return (
    <div className="editproperty-container">
      <form className="editproperty-card" onSubmit={handleSubmit}>
        <Title title="Editar propiedad" />

        {/* --- Datos generales --- */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemProperty.name || ""} onChange={handleChange} required />
            <TextField name="address" label="Dirección" value={itemProperty.address || ""} onChange={handleChange} required />
            <TextField name="price" label="Precio" type="number" value={itemProperty.price || 0} onChange={handleChange} required />
            <TextField name="codeInternal" label="Código interno" type="number" value={itemProperty.codeInternal || 0} onChange={handleChange} required />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Año"
                views={["year"]}
                value={itemProperty.year ? dayjs(String(itemProperty.year), "YYYY") : null}
                onChange={(v) => handleChange({ target: { name: "year", value: v ? v.year() : "" } })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* --- Imagen propiedad --- */}
        <div className="form-section">
          <h2>Imagen del inmueble</h2>
          <div className="image-upload-container">
            {!itemPropertyImage.imagePreview ? (
              <Box className="dropzone-box" onClick={() => document.getElementById("propertyFileInput").click()}>
                <Typography variant="body1" color="textSecondary">Haz clic o arrastra una imagen</Typography>
                <input id="propertyFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "property")} aria-label="property image input" required aria-required="true" />
              </Box>
            ) : (
              <div className="image-preview filled">
                <img src={itemPropertyImage.imagePreview} alt="Inmueble" className="property-image" />
                <div className="add-property-card-buttons">
                  <button type="button" className="replace-btn" onClick={() => setPropertyImage({ imagePreview: "" })}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Propietario --- */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid owner-grid">
            <TextField name="name" label="Nombre" value={itemOwner.name || ""} onChange={(e) => handleChange(e, "owner")} required />
            <TextField name="address" label="Dirección" value={itemOwner.address || ""} onChange={(e) => handleChange(e, "owner")} required />
            <TextField type="date" name="birthday" label="Fecha de nacimiento" value={itemOwner.birthday || ""} onChange={(e) => handleChange(e, "owner")} InputLabelProps={{ shrink: true }} required />
            <div className="image-upload-container full-width">
              {!itemOwner.ownerPhotoPreview && !itemOwner.photo ? (
                <Box className="dropzone-box" onClick={() => document.getElementById("ownerFileInput").click()}>
                  <Typography variant="body1" color="textSecondary">Cargar imagen del propietario</Typography>
                  <input id="ownerFileInput" name="file" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "owner")} aria-label="owner photo input" required aria-required="true" />
                </Box>
              ) : (
                <div className="image-preview filled">
                  <img src={itemOwner.ownerPhotoPreview || `data:image/jpeg;base64,${itemOwner.photo}`} alt="Propietario" className="owner-photo" />
                  <div className="add-property-card-buttons">
                    <button type="button" className="replace-btn" onClick={() => setOwner({ ...itemOwner, photo: "", ownerPhotoPreview: "" })}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Historial --- */}
        <div className="form-section">
          <h2>Historial</h2>
          {itemPropertyTrace.map((trace, index) => (
            <div key={index} className="editproperty-trace-wrapper">
              <div className="trace-grid">
                <TextField type="date" name="dateSale" label="Fecha" value={trace.dateSale || ""} onChange={(e) => handleChange(e, "traces", index)} InputLabelProps={{ shrink: true }} required />
                <TextField name="name" label="Evento" value={trace.name || ""} onChange={(e) => handleChange(e, "traces", index)} required />
                <TextField type="number" name="value" label="Valor" value={trace.value || 0} onChange={(e) => handleChange(e, "traces", index)} required />
                <TextField type="number" name="tax" label="Impuesto" value={trace.tax || 0} onChange={(e) => handleChange(e, "traces", index)} required />
                <button type="button" className="editproperty-trace-delete-btn" onClick={() => handleDeleteTrace(index)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {traceAlert.message && (
            <Box className="trace-alert" sx={{ mb: 2 }}>
              <Alert severity={traceAlert.severity} onClose={() => setTraceAlert({ message: "", severity: "success" })}>
                {traceAlert.message}
              </Alert>
            </Box>
          )}
          <AddButton label="Añadir evento" handleChange={handleAddTrace} />
        </div>

        <Button id="updateButton" type="submit" variant="contained" color={updating ? 'secondary':'primary'} disabled={updating} aria-label="update button">{updating ? 'Actualizando...' : 'Actualizar Propiedad'}</Button>
        <Button id="cancelButton" variant="outlined" color="secondary" onClick={() => navigate('/home')} aria-label="cancel button">Cancelar</Button>
      </form>
    </div>
  );
};

export default EditProperty;
