import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../services/api/api";
import { AddButton } from "../../../components/button/AddButton.js";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import propertyDto from "../dto/PropertyDto.json";
import ownerDto from "../../owner/dto/OwnerDto.json";
import propertyImageDto from "../../propertyImage/dto/PropertyImageDto.json";
import propertyTraceDto from "../../propertyTrace/dto/PropertyTraceDto.json";
import { normalizeProperty } from "../mapper/propertyMapper";
import { normalizeOwner } from "../../owner/mapper/OwnerMapper";
import { normalizePropertyImage } from "../../propertyImage/mapper/propertyImageMapper";
import { normalizePropertyTrace } from "../../propertyTrace/mapper/propertyTraceMapper";
import Swal from "sweetalert2";
import { Box, Typography } from "@mui/material";
import "./CrudProperty.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
const ownerEndpoint = process.env.REACT_APP_ENDPOINT_OWNER;
const propertyImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;
const propertyTraceEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYTRACE;

export const CrudProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();

  const [itemProperty, setProperty] = useState(normalizeProperty(propertyDto));
  const [itemOwner, setOwner] = useState(normalizeOwner(ownerDto));
  const [itemPropertyImage, setPropertyImage] = useState(normalizePropertyImage(propertyImageDto));
  const [itemPropertyTrace, setPropertyTrace] = useState(normalizePropertyTrace(propertyTraceDto));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      try {
        const { data: propertyData } = await api.get(`${propertyEndpoint}/${propertyId}`);
        setProperty(propertyData);

        const { data: ownerData } = await api.get(`${ownerEndpoint}/${propertyData.idOwner}`);
        setOwner(ownerData);

        const { data: imageData } = await api.get(`${propertyImageEndpoint}?idProperty=${propertyId}`);
        if (Array.isArray(imageData) && imageData.length > 0) setPropertyImage(imageData[0]);

        const { data: tracesData } = await api.get(`${propertyTraceEndpoint}?idProperty=${propertyId}`);
        setPropertyTrace(Array.isArray(tracesData) ? tracesData : [tracesData]);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setError("❌ Error al cargar el inmueble");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propertyId]);

  const handleChange = (e, section = "property", index = null) => {
    const { name, value } = e.target;
    switch (section) {
      case "owner":
        setOwner((prev) => ({ ...prev, [name]: value }));
        break;
      case "propertyImage":
        setPropertyImage((prev) => ({ ...prev, [name]: value }));
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
      default:
        setProperty((prev) => ({ ...prev, [name]: value }));
        break;
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = useCallback(async (e) => {
    if (e?.target?.files?.[0]) {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      const preview = URL.createObjectURL(file);
      setPropertyImage({
        ...itemPropertyImage,
        file: base64,
        enabled: true,
        imagePreview: preview,
      });
    }
  }, [itemPropertyImage]);

  const handleOwnerImageChange = useCallback(async (e) => {
    if (e?.target?.files?.[0]) {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      const preview = URL.createObjectURL(file);
      setOwner((prev) => ({
        ...prev,
        photo: base64,
        ownerPhotoPreview: preview,
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const getCollection = async (endpoint, data, idField = "id") => {
        return data[idField]
          ? await api.patch(`${endpoint}/${data[idField]}`, data)
          : await api.post(endpoint, data);
      };

      const responseOwner = await getCollection(ownerEndpoint, itemOwner);
      const payloadProperty = { ...itemProperty, IdOwner: responseOwner.data.id };
      const responseProperty = await getCollection(propertyEndpoint, payloadProperty, "idProperty");
      const payloadImage = { ...itemPropertyImage, IdProperty: responseProperty.data.id };
      await getCollection(propertyImageEndpoint, payloadImage, "idPropertyImage");

      const updatedTraces = itemPropertyTrace.map((trace) => ({
        ...trace,
        value: Number(trace.value),
        tax: Number(trace.tax),
        idProperty: responseProperty.data.id,
      }));
      await Promise.all(
        updatedTraces.map((trace) => getCollection(propertyTraceEndpoint, trace, "idPropertyTrace"))
      );

      Swal.fire({
        title: propertyId ? "Inmueble actualizado" : "Inmueble registrado",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      navigate("/home");
    } catch (error) {
      console.error("❌ Error al guardar:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error inesperado",
      });
    }
  };

  const addTrace = () => {
    setPropertyTrace((prev) => [
      ...prev,
      { id: "", name: "", value: 0, tax: 0, dateSale: "", idProperty: "" },
    ]);
  };

  if (loading) return <p>Cargando inmueble...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

console.log("itemPropertyTrace: ", itemPropertyTrace)

  return (
    <div className="crudproperty-container">
      <form className="crudproperty-card" onSubmit={handleSubmit}>
        <h1 className="crudproperty-title">
          {propertyId ? "Editar Propiedad" : "Registrar nueva propiedad"}
        </h1>

        {/* Propiedad */}
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
                onChange={(newValue) =>
                  handleChange({
                    target: { name: "year", value: newValue ? newValue.year() : "" },
                  })
                }
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

        {/* Propietario */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <TextField name="name" label="Nombre" value={itemOwner.name} onChange={(e) => handleChange(e, "owner")} variant="outlined" />
            <TextField name="address" label="Dirección" value={itemOwner.address} onChange={(e) => handleChange(e, "owner")} variant="outlined" />
            <TextField type="date" name="birthday" label="Fecha de nacimiento" value={itemOwner.birthday} onChange={(e) => handleChange(e, "owner")} InputLabelProps={{ shrink: true }} className="input-date" />

            {/* 🔹 Imagen del propietario */}
            <div className="image-upload-container">
              {!itemOwner.ownerPhotoPreview ? (
                <Box
                  className="dropzone-box"
                  onClick={() => document.getElementById("ownerFileInput").click()}
                >
                  <Typography variant="body1" color="textSecondary">
                    Haz clic o arrastra una imagen del propietario aquí
                  </Typography>
                  <input
                    id="ownerFileInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleOwnerImageChange}
                  />
                </Box>
              ) : (
                <div className="image-preview filled">
                  <img src={itemOwner.ownerPhotoPreview} alt="Propietario" className="owner-photo" />
                  <button
                    type="button"
                    className="replace-btn"
                    onClick={() => setOwner((prev) => ({ ...prev, ownerPhotoPreview: "" }))}
                  >
                    Cambiar imagen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Imagen del inmueble */}
        <div className="form-section">
          <h2>Imagen del inmueble</h2>
          <div className="image-upload-container">
            {!itemPropertyImage.imagePreview ? (
              <Box
                className="dropzone-box"
                onClick={() => document.getElementById("propertyFileInput").click()}
              >
                <Typography variant="body1" color="textSecondary">
                  Haz clic o arrastra una imagen del inmueble aquí
                </Typography>
                <input
                  id="propertyFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Box>
            ) : (
              <div className="image-preview filled">
                <img src={itemPropertyImage.imagePreview} alt="Inmueble" className="property-image" />
                <button
                  type="button"
                  className="replace-btn"
                  onClick={() => setPropertyImage((prev) => ({ ...prev, imagePreview: "" }))}
                >
                  Cambiar imagen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Historial */}
        <div className="form-section">
          <h2>Información de venta</h2>
          {itemPropertyTrace.map((trace, index) => (
            <div key={index} className="form-grid trace-group">
              <TextField type="date" name="dateSale" label="Fecha" value={trace.dateSale} onChange={(e) => handleChange(e, "traces", index)} InputLabelProps={{ shrink: true }} className="input-date" />
              <TextField name="name" label="Nombre del evento" value={trace.name} onChange={(e) => handleChange(e, "traces", index)} />
              <TextField type="number" name="value" label="Valor" value={trace.value} onChange={(e) => handleChange(e, "traces", index)} />
              <TextField type="number" name="tax" label="Impuesto" value={trace.tax} onChange={(e) => handleChange(e, "traces", index)} />
            </div>
          ))}
        </div>

        <AddButton label="Añadir venta" handleChange={addTrace} />
        <br />
        <button type="submit" className="crudproperty-btn primary">
          {propertyId ? "Actualizar Propiedad" : "Crear Propiedad"}
        </button>
        <button
          type="button"
          className="crudproperty-btn secondary"
          onClick={() => navigate("/home")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CrudProperty;
