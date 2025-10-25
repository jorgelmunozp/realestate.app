import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../../../services/api/api";
import { errorWrapper } from "../../../services/api/errorWrapper";
import { AddButton } from "../../../components/button/AddButton.js";
import { FiTrash2 } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
import "./EditProperty.scss";

export const EditProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const location = useLocation();
  const endpoints = {
    property: process.env.REACT_APP_ENDPOINT_PROPERTY,
    owner: process.env.REACT_APP_ENDPOINT_OWNER,
    image: process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE,
    trace: process.env.REACT_APP_ENDPOINT_PROPERTYTRACE,
  };

  const [itemProperty, setProperty] = useState(null);
  const [itemOwner, setOwner] = useState({});
  const [itemPropertyImage, setPropertyImage] = useState({});
  const [itemPropertyTrace, setPropertyTrace] = useState([]);
  const [loading, setLoading] = useState(true);
  const [traceAlert, setTraceAlert] = useState({ message: "", severity: "success" });

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

  useEffect(() => {
    const loadAll = async () => {
      try {
        const needsRefresh = location.state?.refresh === true;
        const resProperty = await errorWrapper(
          api.get(`${endpoints.property}/${propertyId}${needsRefresh ? `?refresh=true` : ``}`)
        );
        setProperty(resProperty.data);

        const resOwner = await errorWrapper(
          api.get(`${endpoints.owner}/${resProperty.data.idOwner}${needsRefresh ? `?refresh=true` : ``}`)
        );
        setOwner(resOwner.data);

        const resImage = await errorWrapper(
          api.get(`${endpoints.image}?idProperty=${propertyId}${needsRefresh ? `&refresh=true` : ``}`)
        );
        const image = resImage.data[0] || {};
        setPropertyImage({
          ...image,
          imagePreview:
            image.file || image.fileBase64
              ? `data:image/jpeg;base64,${image.file || image.fileBase64}`
              : image.url || "",
        });

        const resTraces = await errorWrapper(
          api.get(`${endpoints.trace}?idProperty=${propertyId}${needsRefresh ? `&refresh=true` : ``}`)
        );
        setPropertyTrace(resTraces.data || []);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los datos" });
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [propertyId]);

  const clampNonNegative = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;
    if (section === "owner") {
      setOwner((prev) => ({ ...prev, [name]: value }));
    } else if (section === "traces") {
      const newVal = (name === "value" || name === "tax") ? clampNonNegative(value) : value;
      setPropertyTrace((prev) => prev.map((t, i) => (i === index ? { ...t, [name]: newVal } : t)));
    } else {
      const newVal = (name === "price" || name === "codeInternal") ? clampNonNegative(value) : value;
      setProperty((prev) => ({ ...prev, [name]: newVal }));
    }
  };

  const handleImageChange = async (e, type = "property") => {
    if (!e?.target?.files?.[0]) return;
    const file = e.target.files[0];
    const base64 = await toBase64(file);
    const preview = URL.createObjectURL(file);

    if (type === "owner")
      setOwner((prev) => ({ ...prev, photo: base64, ownerPhotoPreview: preview }));
    else
      setPropertyImage((prev) => ({ ...prev, file: base64, enabled: true, imagePreview: preview }));
  };

  const handleAddTrace = () => {
    setPropertyTrace((prev) => [
      ...prev,
      { name: "", value: 0, tax: 0, dateSale: "", idProperty: propertyId },
    ]);
  };

  const handleDeleteTrace = async (index) => {
    const trace = itemPropertyTrace[index];
    try {
      if (trace?.idPropertyTrace) {
        await errorWrapper( api.delete(`${endpoints.trace}/${trace.idPropertyTrace}`) );
      }
      setPropertyTrace((prev) => prev.filter((_, i) => i !== index));
      setTraceAlert({ message: "Traza eliminada correctamente", severity: "success" });
    } catch (err) {
      console.error("Error al eliminar traza:", err);
      setTraceAlert({ message: "No se pudo eliminar la traza", severity: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Actualizar propietario
      await errorWrapper( api.patch(`${endpoints.owner}/${itemOwner.idOwner}`, itemOwner) );

      // Actualizar propiedad
      await errorWrapper( api.patch(`${endpoints.property}/${propertyId}`, itemProperty) );

      // Actualizar imagen (si existe archivo)
      if (itemPropertyImage?.file && itemPropertyImage?.idPropertyImage) {
        await errorWrapper( api.patch(`${endpoints.image}/${itemPropertyImage.idPropertyImage}`, itemPropertyImage) );
      }

      // Actualizar o crear trazas
      for (const trace of itemPropertyTrace) {
        if (trace.idPropertyTrace) {
          // ✅ Corregido: ahora llama correctamente con el id del trace, no con ?idProperty
          await errorWrapper( api.patch(`${endpoints.trace}/${trace.idPropertyTrace}`, trace) );
        } else {
          await errorWrapper( api.post(endpoints.trace, [trace]) );
        }
      }

      // Confirmación final
      Swal.fire({
        title: "Propiedad actualizada",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      navigate("/home", { state: { refresh: true } });
    } catch (error) {
      console.error("❌ Error al actualizar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar la propiedad",
      });
    }
  };


  if (loading)
    return (
      <div className="container-loader full-screen">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );

  if (!itemProperty)
    return <p style={{ textAlign: "center", color: "red" }}>Propiedad no encontrada</p>;

  return (
    <div className="addproperty-container">
      <form className="addproperty-card" onSubmit={handleSubmit}>
        <h1 className="addproperty-title">Editar propiedad</h1>

        {/* --- Datos generales --- */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemProperty.name || ""} onChange={handleChange} required />
            <TextField name="address" label="Dirección" value={itemProperty.address || ""} onChange={handleChange} required />
            <TextField name="price" label="Precio" type="number" value={itemProperty.price || 0} onChange={handleChange} required />
            <TextField name="codeInternal" label="Código interno" type="number" value={itemProperty.codeInternal || 0} onChange={handleChange} />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Año"
                views={["year"]}
                value={itemProperty.year ? dayjs(String(itemProperty.year), "YYYY") : null}
                onChange={(v) => handleChange({ target: { name: "year", value: v ? v.year() : "" } })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    className: "year-input",
                    InputLabelProps: { shrink: true },
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
                <Typography variant="body1" color="textSecondary">
                  Haz clic o arrastra una imagen
                </Typography>
                <input id="propertyFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "property")} />
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
            <TextField name="name" label="Nombre" value={itemOwner.name || ""} onChange={(e) => handleChange(e, "owner")} />
            <TextField name="address" label="Dirección" value={itemOwner.address || ""} onChange={(e) => handleChange(e, "owner")} />
            <TextField type="date" name="birthday" label="Fecha de nacimiento" value={itemOwner.birthday || ""} onChange={(e) => handleChange(e, "owner")} InputLabelProps={{ shrink: true }} />
            <div className="image-upload-container full-width">
              {!itemOwner.ownerPhotoPreview && !itemOwner.photo ? (
                <Box className="dropzone-box" onClick={() => document.getElementById("ownerFileInput").click()}>
                  <Typography variant="body1" color="textSecondary">Cargar imagen del propietario</Typography>
                  <input id="ownerFileInput" type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "owner")} />
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
            <div key={index} className="trace-wrapper">
              <div className="trace-grid">
                <TextField type="date" name="dateSale" label="Fecha" value={trace.dateSale || ""} onChange={(e) => handleChange(e, "traces", index)} InputLabelProps={{ shrink: true }} />
                <TextField name="name" label="Evento" value={trace.name || ""} onChange={(e) => handleChange(e, "traces", index)} />
                <TextField type="number" name="value" label="Valor" value={trace.value || 0} onChange={(e) => handleChange(e, "traces", index)} />
                <TextField type="number" name="tax" label="Impuesto" value={trace.tax || 0} onChange={(e) => handleChange(e, "traces", index)} />
                <button type="button" className="trace-delete-btn" onClick={() => handleDeleteTrace(index)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {traceAlert.message && (
            <Box className="trace-alert" sx={{ mb: 2 }}>
              <Alert
                severity={traceAlert.severity}
                onClose={() => setTraceAlert({ message: "", severity: "success" })}
              >
                {traceAlert.message}
              </Alert>
            </Box>
          )}
          <AddButton label="Añadir evento" handleChange={handleAddTrace} />
        </div>

        <button type="submit" className="addproperty-btn primary">Actualizar Propiedad</button>
        <button type="button" className="addproperty-btn secondary" onClick={() => navigate("/home")}>Cancelar</button>
      </form>
    </div>
  );
};

export default EditProperty;

