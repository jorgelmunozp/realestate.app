import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { AddButton } from "../../../components/button/AddButton.js";
import { FiTrash2 } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
import propertyDto from "../dto/PropertyDto.json";
import ownerDto from "../../owner/dto/OwnerDto.json";
import propertyImageDto from "../../propertyImage/dto/PropertyImageDto.json";
import propertyTraceDto from "../../propertyTrace/dto/PropertyTraceDto.json";
import { mapPropertyToDto } from "../mapper/propertyMapper";
import "./AddProperty.scss";

export const AddProperty = () => {
  const navigate = useNavigate();
  const endpoints = {
    property: process.env.REACT_APP_ENDPOINT_PROPERTY,
  };

  const [itemProperty, setProperty] = useState(propertyDto);
  const [itemOwner, setOwner] = useState(ownerDto);
  const [itemPropertyImage, setPropertyImage] = useState(propertyImageDto);
  const [itemPropertyTrace, setPropertyTrace] = useState([propertyTraceDto]);

  const toBase64 = useCallback(
    (file) =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
      }),
    []
  );

  const clamp = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;
    if (section === "traces") {
      const val = name === "value" || name === "tax" ? clamp(value) : value;
      setPropertyTrace((prev) => prev.map((t, i) => (i === index ? { ...t, [name]: val } : t)));
    } else if (section === "owner") {
      setOwner((prev) => ({ ...prev, [name]: value }));
    } else {
      const val = name === "price" || name === "codeInternal" ? clamp(value) : value;
      setProperty((prev) => ({ ...prev, [name]: val }));
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

  const handleAddTrace = () => {
    setPropertyTrace((prev) => [...prev, { name: "", value: 0, tax: 0, dateSale: "", idProperty: "" }]);
  };

  const handleDeleteTrace = (index) => {
    setPropertyTrace((prev) => prev.filter((_, i) => i !== index));
  };

  // ===========================================================
  // Guardar nueva propiedad (POST con wrapper adaptado)
  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!itemProperty.name || !itemProperty.address)
      return Swal.fire("Faltan datos", "Completa los datos de la propiedad.", "warning");

    if (!itemPropertyImage?.file)
      return Swal.fire("Imagen requerida", "Debes cargar la imagen del inmueble.", "warning");

    if (!itemOwner.name || !itemOwner.address || !itemOwner.photo || !itemOwner.birthday)
      return Swal.fire("Datos del propietario", "Completa todos los datos del propietario.", "warning");

    const traceValid = itemPropertyTrace.every((t) => t.name && t.dateSale && t.value > 0);
    if (!traceValid)
      return Swal.fire("Historial", "Completa los datos de las trazas.", "warning");

    try {
      // Construcción definitiva del payload compatible con backend
      const payload = mapPropertyToDto({
        ...itemProperty,
        owner: itemOwner,
        image: itemPropertyImage,
        traces: itemPropertyTrace,
      });

      console.log("📤 propertyPayload", payload);

      const res = await errorWrapper(api.post(endpoints.property, payload));
      const { success, message } = res;

      if (success) {
        Swal.fire("Inmueble registrado", "success");
        navigate("/home", { state: { refresh: true } });
      } else {
        Swal.fire("Error", message || "Ocurrió un error al registrar el inmueble.", "error");
      }
    } catch (err) {
      console.error("Error al crear propiedad:", err);
      Swal.fire("Error", "Ocurrió un error al registrar el inmueble.", "error");
    }
  };

  return (
    <div className="addproperty-container">
      <form className="addproperty-card" onSubmit={handleSubmit}>
        <h1 className="addproperty-title">Registrar nueva propiedad</h1>

        {/* --- Datos generales --- */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemProperty.name} onChange={handleChange} required />
            <TextField name="address" label="Dirección" value={itemProperty.address} onChange={handleChange} required />
            <TextField name="price" label="Precio" type="number" value={itemProperty.price} onChange={handleChange} required />
            <TextField name="codeInternal" label="Código interno" type="number" value={itemProperty.codeInternal} onChange={handleChange} required />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Año"
                views={["year"]}
                value={itemProperty.year ? dayjs(String(itemProperty.year), "YYYY") : null}
                onChange={(v) => handleChange({ target: { name: "year", value: v ? v.year() : "" } })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
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
                <Typography variant="body1" color="textSecondary">
                  Haz clic o arrastra una imagen
                </Typography>
                <input id="propertyFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "property")} required />
              </Box>
            ) : (
              <div className="image-preview filled">
                <img src={itemPropertyImage.imagePreview} alt="Inmueble" className="property-image" />
                <div className="add-property-card-buttons">
                  <button type="button" className="replace-btn" onClick={() => setPropertyImage({ imagePreview: "", file: "" })}>
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
            <TextField name="name" label="Nombre" value={itemOwner.name} onChange={(e) => handleChange(e, "owner")} required />
            <TextField name="address" label="Dirección" value={itemOwner.address} onChange={(e) => handleChange(e, "owner")} required />
            <TextField type="date" name="birthday" label="Fecha de nacimiento" value={itemOwner.birthday} onChange={(e) => handleChange(e, "owner")} InputLabelProps={{ shrink: true }} required />
            <div className="image-upload-container full-width">
              {!itemOwner.ownerPhotoPreview ? (
                <Box className="dropzone-box" onClick={() => document.getElementById("ownerFileInput").click()}>
                  <Typography variant="body1" color="textSecondary">Cargar imagen del propietario</Typography>
                  <input id="ownerFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "owner")} required />
                </Box>
              ) : (
                <div className="image-preview filled">
                  <img src={itemOwner.ownerPhotoPreview} alt="Propietario" className="owner-photo" />
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
          {itemPropertyTrace.map((trace, i) => (
            <div key={i} className="trace-wrapper">
              <div className="trace-grid">
                <TextField type="date" name="dateSale" label="Fecha" value={trace.dateSale} onChange={(e) => handleChange(e, "traces", i)} InputLabelProps={{ shrink: true }} required />
                <TextField name="name" label="Evento" value={trace.name} onChange={(e) => handleChange(e, "traces", i)} required />
                <TextField type="number" name="value" label="Valor" value={trace.value} onChange={(e) => handleChange(e, "traces", i)} required />
                <TextField type="number" name="tax" label="Impuesto" value={trace.tax} onChange={(e) => handleChange(e, "traces", i)} required />
                <button type="button" className="trace-delete-btn" onClick={() => handleDeleteTrace(i)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          <AddButton label="Añadir evento" handleChange={handleAddTrace} />
        </div>

        <button type="submit" className="addproperty-btn primary">Crear Propiedad</button>
        <button type="button" className="addproperty-btn secondary" onClick={() => navigate("/home")}>Cancelar</button>
      </form>
    </div>
  );
};

export default AddProperty;
