import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api/api.js";
import { AddButton } from '../../../components/button/AddButton.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import propertyDto from "../dto/PropertyDto.json";
import ownerDto from "../../owner/dto/OwnerDto.json";
import propertyImageDto from "../../propertyImage/dto/PropertyImageDto.json";
import propertyTraceDto from "../../propertyTrace/dto/PropertyTraceDto.json";
import { normalizeProperty } from "../mapper/propertyMapper.js";
import Swal from 'sweetalert2';
import "./AddProperty.scss";

const propertyEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTY;
const ownerEndpoint = process.env.REACT_APP_ENDPOINT_OWNER;
const propertImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;
const propertTraceEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYTRACE;

export const AddProperty = () => {
  const navigate = useNavigate();
  const [itemProperty, setProperty] = useState() ;
  const [itemOwner, setOwner] = useState();
  const [itemPropertyImage, setPropertyImage] = useState(propertyImageDto);
  const [itemPropertyTrace, setPropertyTrace] = useState(propertyTraceDto);
  const [error, setError] = useState(null);
  
  console.log(itemProperty)
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
      setPropertyImage({
        ...itemPropertyImage,
        File: base64,
        Enabled: true,
        imagePreview: preview,
      });
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
        ownerPhotoPreview: preview,
      }));
    }
  };

  // 🔹 Envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payloadOwner = { ...itemOwner };
      const responseOwner = await api.post(`${ownerEndpoint}`, payloadOwner);

      const payloadProperty = { ...itemProperty, IdOwner:responseOwner.data.id };
      const responseProperty = await api.post(`${propertyEndpoint}`, payloadProperty);
     
      const payloadPropertyImage = { ...itemPropertyImage, IdProperty:responseProperty.data.id };
      
      itemPropertyTrace[0].Value = Number(itemPropertyTrace[0].Value);
      itemPropertyTrace[0].Tax = Number(itemPropertyTrace[0].Tax);
      itemPropertyTrace[0].IdProperty = responseProperty.data.id;
      const payloadPropertyTrace = [ ...itemPropertyTrace];
 
      let responsePropertyImage = null;
      let responsePropertyTrace = null;

      if(responseProperty.data.id) {
        responsePropertyImage = await api.post(`${propertImageEndpoint}`, payloadPropertyImage);
        responsePropertyTrace = await api.post(`${propertTraceEndpoint}`, payloadPropertyTrace);
      }

      if((200 <= responseOwner.status && responseOwner.status <= 299)
        && (200 <= responseProperty.status && responseProperty.status <= 299)
        && (200 <= responsePropertyImage.status && responsePropertyImage.status <= 299)
        && (200 <= responsePropertyTrace.status && responsePropertyTrace.status <= 299)
      ) {
        Swal.fire({
          title: "Inmueble Registrado",
          confirmButtonText: "Aceptar",
          icon: "success"
        });
        navigate("/home");
      }
    } catch (error) {
        console.error('Error: ', error.response?.data?.errors);

        const errors = error.response?.data?.errors;
        let errorHtml = '';

        if (errors) {
          errorHtml = '<ul style="padding-left: 20px; text-align: justify; margin: 0;">';
          for (const key in errors) {
            if (errors[key] && errors[key].length > 0) {
              for (const msg of errors[key]) {
                errorHtml += `<li style="margin-bottom: 6px; color: #d33;">${msg}</li>`;
              }
            }
          }
          errorHtml += '</ul>';
        } else {
          errorHtml = '<span style="color: #d33;">Ocurrió un error inesperado</span>';
        }

        Swal.fire({
          html: errorHtml,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
  };

  const addTrace = () => {
    setPropertyTrace(prev => [
      ...prev,
      { id: "", name: "", value: 0, tax: 0, dateSale: "", idProperty: "" },
    ]);
  };

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <div className="crudproperty-container">
      <form className="crudproperty-card" onSubmit={handleSubmit}>
        <h1 className="crudproperty-title">{"Registrar Inmueble"}</h1>

        {/* Property */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <div className="input-group">
              <TextField type="text" name="Name" label="Nombre" value={itemProperty.Name} onChange={(e) => handleChange(e, "property")} variant="outlined" />
            </div>
            <div className="input-group">
              <TextField type="text" name="Address" label="Dirección" value={itemProperty.Address} onChange={(e) => handleChange(e, "property")} variant="outlined" />
            </div>
            <div className="input-group">
              <label>Precio</label>
              {/* <input type="number" name="Price" value={itemProperty.Price} defaultValue={itemProperty.price} onChange={(e) => handleChange(e, "property")} min={0} required /> */}
              <TextField type="number" label="Precio" value={itemProperty.Price} onChange={(e) => handleChange(e, "property")} itemProp={ {inputProps: { min: 0 }} } variant="outlined" />
            </div>
            <div className="input-group">
              <label>Código interno</label>
              <input type="number" name="CodeInternal" value={itemProperty.CodeInternal} defaultValue={itemProperty.codeInternal} onChange={(e) => handleChange(e, "property")} min={0} />
            </div>
            <div className="input-group">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Año" views={ ["year"] } value={ itemProperty.year ? dayjs(String(itemProperty.year), "YYYY") : null } onChange={ (newValue) =>  handleChange({ target: { name: "year", value: newValue ? newValue.year() : "", }, }, "property") } slotProps={ { textField: { fullWidth: true, size: "small", className: "year-input" },} } />
              </LocalizationProvider>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="Name" value={itemOwner.Name} defaultValue={itemOwner.name} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="Address" value={itemOwner.Address} defaultValue={itemOwner.address} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input type="date" name="Birthday" value={itemOwner.Birthday} defaultValue={itemOwner.birthday} onChange={(e) => handleChange(e, "owner")} />
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
          {Array.isArray(itemPropertyTrace) && itemPropertyTrace.map((trace, index) => (
            <div key={index} className="form-grid trace-group">
              <h3>Venta #{index + 1}</h3>
              <div className="input-group">
                <label>Fecha</label>
                <input type="date" name="DateSale" value={trace.DateSale} defaultValue={trace.dateSale} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Nombre del evento</label>
                <input type="text" name="Name" value={trace.Name} defaultValue={trace.name} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Valor</label>
                <input type="number" name="Value" value={trace.Value} defaultValue={trace.value} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Impuesto</label>
                <input type="number" name="Tax" value={trace.Tax} defaultValue={trace.tax} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton label={'Añadir venta'} handleChange={addTrace}/>
        <br />
        <button type="submit" className="crudproperty-btn primary">
          {"Crear Propiedad"}
        </button>
        <button type="button" className="crudproperty-btn secondary" onClick={() => navigate("/home")}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default AddProperty;