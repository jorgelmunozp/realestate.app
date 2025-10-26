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
import { normalizeProperty, mapPropertyToDto } from "../mapper/propertyMapper";
import { normalizeOwner, mapOwnerToDto } from "../../owner/mapper/OwnerMapper";
import { normalizePropertyImage, mapPropertyImageToDto } from "../../propertyImage/mapper/propertyImageMapper";
import { normalizePropertyTrace, mapPropertyTraceToDto } from "../../propertyTrace/mapper/propertyTraceMapper";
import "./AddProperty.scss";

export const AddProperty = () => {
  const navigate = useNavigate();
  const endpoints = {
    property: process.env.REACT_APP_ENDPOINT_PROPERTY,
    owner: process.env.REACT_APP_ENDPOINT_OWNER,
    image: process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE, // mantenemos por compatibilidad
    trace: process.env.REACT_APP_ENDPOINT_PROPERTYTRACE,
  };

  const [itemProperty, setProperty] = useState(normalizeProperty(propertyDto));
  const [itemOwner, setOwner] = useState(normalizeOwner(ownerDto));
  const [itemPropertyImage, setPropertyImage] = useState(normalizePropertyImage(propertyImageDto));
  const [itemPropertyTrace, setPropertyTrace] = useState(normalizePropertyTrace(propertyTraceDto));

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

  const clampNonNegative = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;
    if (section === "traces") {
      const newVal = name === "value" || name === "tax" ? clampNonNegative(value) : value;
      setPropertyTrace((prev) => prev.map((t, i) => (i === index ? { ...t, [name]: newVal } : t)));
    } else if (section === "owner") {
      setOwner((prev) => ({ ...prev, [name]: value }));
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

  const handleAddTrace = () => {
    setPropertyTrace((prev) => [
      ...prev,
      { name: "", value: 0, tax: 0, dateSale: "", idProperty: "" },
    ]);
  };

  const handleDeleteTrace = (index) => {
    setPropertyTrace((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validaciones requeridas
      if (!itemPropertyImage?.file) {
        Swal.fire({
          icon: "warning",
          title: "Imagen requerida",
          text: "Debes cargar la imagen de la propiedad.",
        });
        return;
      }
      if (!itemOwner?.ownerPhotoPreview && !itemOwner?.photo) {
        Swal.fire({
          icon: "warning",
          title: "Foto requerida",
          text: "Debes cargar la imagen del propietario.",
        });
        return;
      }

      // 🔹 1. Crear Propietario
      const ownerDtoPayload = mapOwnerToDto(itemOwner);
      const resOwner = await errorWrapper(api.post(endpoints.owner, ownerDtoPayload));
      const ownerId =
        resOwner?.data?.idOwner ??
        resOwner?.data?.IdOwner ??
        resOwner?.data?.id ??
        "";

      // 🔹 2. Crear Propiedad con imagen incluida
      const propertyPayload = mapPropertyToDto({
        ...itemProperty,
        idOwner: ownerId,
        price: Number(itemProperty.price),
        codeInternal: Number(itemProperty.codeInternal),
        image: {
          file: itemPropertyImage.file,
          enabled: true,
        },
      });

      const resProperty = await errorWrapper(api.post(endpoints.property, propertyPayload));
      const propertyId =
        resProperty?.data?.idProperty ??
        resProperty?.data?.IdProperty ??
        resProperty?.data?.id ??
        "";

      // 🔹 3. Crear trazas (si existen)
      const traces = (itemPropertyTrace || []).filter(
        (t) => t && (t.name || t.dateSale)
      );
      if (traces.length) {
        const dto = traces.map((t) =>
          mapPropertyTraceToDto({ ...t, idProperty: propertyId })
        );
        await errorWrapper(api.post(endpoints.trace, dto));
      }

      Swal.fire({
        icon: "success",
        title: "Propiedad creada",
        confirmButtonText: "Aceptar",
      });
      navigate("/home", { state: { refresh: true } });
    } catch (err) {
      console.error("Error al crear propiedad:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al registrar el inmueble",
      });
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
            <TextField
              name="name"
              label="Nombre"
              value={itemProperty.name}
              onChange={handleChange}
              required
            />
            <TextField
              name="address"
              label="Dirección"
              value={itemProperty.address}
              onChange={handleChange}
              required
            />
            <TextField
              name="price"
              label="Precio"
              type="number"
              value={itemProperty.price}
              onChange={handleChange}
              required
            />
            <TextField
              name="codeInternal"
              label="Código interno"
              type="number"
              value={itemProperty.codeInternal}
              onChange={handleChange}
              required
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Año"
                views={["year"]}
                value={
                  itemProperty.year
                    ? dayjs(String(itemProperty.year), "YYYY")
                    : null
                }
                onChange={(v) =>
                  handleChange({
                    target: { name: "year", value: v ? v.year() : "" },
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    className: "year-input",
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
              <Box
                className="dropzone-box"
                onClick={() =>
                  document.getElementById("propertyFileInput").click()
                }
              >
                <Typography variant="body1" color="textSecondary">
                  Haz clic o arrastra una imagen
                </Typography>
                <input
                  id="propertyFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, "property")}
                  required
                  aria-required="true"
                />
              </Box>
            ) : (
              <div className="image-preview filled">
                <img
                  src={itemPropertyImage.imagePreview}
                  alt="Inmueble"
                  className="property-image"
                />
                <div className="add-property-card-buttons">
                  <button
                    type="button"
                    className="replace-btn"
                    onClick={() =>
                      setPropertyImage((prev) => ({
                        ...prev,
                        imagePreview: "",
                        file: "",
                      }))
                    }
                  >
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
            <TextField
              name="name"
              label="Nombre"
              value={itemOwner.name}
              onChange={(e) => handleChange(e, "owner")}
              required
            />
            <TextField
              name="address"
              label="Dirección"
              value={itemOwner.address}
              onChange={(e) => handleChange(e, "owner")}
              required
            />
            <TextField
              type="date"
              name="birthday"
              label="Fecha de nacimiento"
              value={itemOwner.birthday}
              onChange={(e) => handleChange(e, "owner")}
              InputLabelProps={{ shrink: true }}
              required
            />
            <div className="image-upload-container full-width">
              {!itemOwner.ownerPhotoPreview ? (
                <Box
                  className="dropzone-box"
                  onClick={() =>
                    document.getElementById("ownerFileInput").click()
                  }
                >
                  <Typography variant="body1" color="textSecondary">
                    Cargar imagen del propietario
                  </Typography>
                  <input
                    id="ownerFileInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageChange(e, "owner")}
                    required
                    aria-required="true"
                  />
                </Box>
              ) : (
                <div className="image-preview filled">
                  <img
                    src={itemOwner.ownerPhotoPreview}
                    alt="Propietario"
                    className="owner-photo"
                  />
                  <div className="add-property-card-buttons">
                    <button
                      type="button"
                      className="replace-btn"
                      onClick={() =>
                        setOwner((prev) => ({
                          ...prev,
                          photo: "",
                          ownerPhotoPreview: "",
                        }))
                      }
                    >
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
            <div key={index} className="trace-wrapper">
              <div className="trace-grid">
                <TextField
                  type="date"
                  name="dateSale"
                  label="Fecha"
                  value={trace.dateSale}
                  onChange={(e) => handleChange(e, "traces", index)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  name="name"
                  label="Evento"
                  value={trace.name}
                  onChange={(e) => handleChange(e, "traces", index)}
                  required
                />
                <TextField
                  type="number"
                  name="value"
                  label="Valor"
                  value={trace.value}
                  onChange={(e) => handleChange(e, "traces", index)}
                  required
                />
                <TextField
                  type="number"
                  name="tax"
                  label="Impuesto"
                  value={trace.tax}
                  onChange={(e) => handleChange(e, "traces", index)}
                  required
                />
                <button
                  type="button"
                  className="trace-delete-btn"
                  onClick={() => handleDeleteTrace(index)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          <AddButton label="Añadir evento" handleChange={handleAddTrace} />
        </div>

        <button type="submit" className="addproperty-btn primary">
          Crear Propiedad
        </button>
        <button
          type="button"
          className="addproperty-btn secondary"
          onClick={() => navigate("/home")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
