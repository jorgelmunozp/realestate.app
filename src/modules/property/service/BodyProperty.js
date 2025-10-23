import { AddButton } from '../../../components/button/AddButton.js';
import "./BodyProperty.scss";

export const BodyProperty = ({ propertyId, itemProperty, itemOwner, itemPropertyImage, itemPropertyTrace, addTrace, handleSubmit }) => {
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
              <input type="text" name="Name" value={itemProperty.name} onChange={(e) => handleChange(e, "property")} required />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="Address" value={itemProperty.address} onChange={(e) => handleChange(e, "property")} required />
            </div>
            <div className="input-group">
              <label>Precio</label>
              <input type="number" name="Price" value={itemProperty.price} onChange={(e) => handleChange(e, "property")} min={0} required />
            </div>
            <div className="input-group">
              <label>Código interno</label>
              <input type="number" name="CodeInternal" value={itemProperty.codeInternal} onChange={(e) => handleChange(e, "property")} min={0} />
            </div>
            <div className="input-group">
              <label>Año</label>
              <input type="number" name="Year" value={itemProperty.year} onChange={(e) => handleChange(e, "property")} min={1800} />
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input type="text" name="Name" value={itemOwner.name} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input type="text" name="Address" value={itemOwner.address} onChange={(e) => handleChange(e, "owner")} />
            </div>
            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input type="date" name="Birthday" value={itemOwner.birthday} onChange={(e) => handleChange(e, "owner")} />
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
                <input type="date" name="DateSale" value={trace.dateSale} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Nombre del evento</label>
                <input type="text" name="Name" value={trace.name} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Valor</label>
                <input type="number" name="Value" value={trace.value} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
              <div className="input-group">
                <label>Impuesto</label>
                <input type="number" name="Tax" value={trace.tax} onChange={(e) => handleChange(e, "traces", index)} />
              </div>
            </div>
          ))}
        </div>
        <AddButton label={'Añadir venta'} handleChange={addTrace}/>
        <br />
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

export default BodyProperty;

// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { api } from "../../services/api/api";
// import Swal from "sweetalert2";
// import "./CrudProperty.scss";

// export const CrudProperty = () => {
//   const navigate = useNavigate();
//   const { propertyId } = useParams();

//   // Estados locales inicializados con tus JSON
//   const [itemProperty, setProperty] = useState({
//     Name: "",
//     Address: "",
//     Price: 0,
//     CodeInternal: 0,
//     Year: 0,
//     IdOwner: ""
//   });
//   const [itemOwner, setOwner] = useState({
//     Name: "",
//     Address: "",
//     Photo: "",
//     Birthday: ""
//   });
//   const [itemPropertyImage, setPropertyImage] = useState({
//     File: "",
//     Enabled: true,
//     IdProperty: ""
//   });
//   const [itemPropertyTrace, setPropertyTrace] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Cargar datos si es edición
//   useEffect(() => {
//     const FetchData = async () => {
//       if (!propertyId) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const { data: propertyData } = await api.get(`/api/property/${propertyId}`);
//         setProperty({ ...propertyData, IdOwner: propertyData.IdOwner || "" });

//         if (propertyData.IdOwner) {
//           const { data: ownerData } = await api.get(`/api/owner/${propertyData.IdOwner}`);
//           setOwner({ ...ownerData, ownerPhotoPreview: ownerData.Photo || "" });
//         }

//         const { data: imagesData } = await api.get(`/api/propertyImage/?IdProperty=${propertyId}`);
//         if (imagesData?.length > 0) {
//           setPropertyImage({ ...imagesData[0], imagePreview: imagesData[0].File ? `data:image/jpg;base64,${imagesData[0].File}` : "" });
//         }

//         const { data: tracesData } = await api.get(`/api/propertyTrace/?IdProperty=${propertyId}`);
//         if (tracesData?.length > 0) setPropertyTrace(tracesData);

//       } catch (err) {
//         console.error(err);
//         Swal.fire({ title: "Error", text: "No se pudo cargar la propiedad", icon: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };
//     FetchData();
//   }, [propertyId]);

//   // 🔹 Manejo de cambios
//   const handleChange = (e, section = "property", index = null) => {
//     const { name, value } = e.target;
//     switch (section) {
//       case "owner":
//         setOwner(prev => ({ ...prev, [name]: value }));
//         break;
//       case "propertyImage":
//         setPropertyImage(prev => ({ ...prev, [name]: value }));
//         break;
//       case "traces":
//         if (index !== null) {
//           setPropertyTrace(prev => {
//             const updated = [...prev];
//             updated[index] = { ...updated[index], [name]: value };
//             return updated;
//           });
//         }
//         break;
//       default:
//         setProperty(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   // 🔹 Convertir archivo a Base64
//   const toBase64 = file => new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result.split(",")[1]);
//     reader.onerror = error => reject(error);
//   });

//   // 🔹 Manejo de imagen del inmueble
//   const handleImageChange = async e => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const base64 = await toBase64(file);
//     const preview = URL.createObjectURL(file);
//     setPropertyImage(prev => ({ ...prev, File: base64, Enabled: true, imagePreview: preview }));
//   };

//   // 🔹 Manejo de imagen del propietario
//   const handleOwnerImageChange = async e => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const base64 = await toBase64(file);
//     const preview = URL.createObjectURL(file);
//     setOwner(prev => ({ ...prev, Photo: base64, ownerPhotoPreview: preview }));
//   };

//   // 🔹 Envío del formulario
//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       if (propertyId) {
//         await api.patch(`/api/owner/${itemOwner.Id || itemOwner.id}`, itemOwner);
//         await api.patch(`/api/property/${propertyId}`, { ...itemProperty, IdOwner: itemOwner.Id || itemOwner.id });
//         if (itemPropertyImage?.IdProperty) {
//           await api.patch(`/api/propertyImage/${itemPropertyImage.IdProperty}`, itemPropertyImage);
//         }
//         await Promise.all(itemPropertyTrace.map(trace => api.patch(`/api/propertyTrace/${trace.IdProperty}`, trace)));
//         Swal.fire({ title: "Propiedad Actualizada", icon: "success" });
//       } else {
//         const resOwner = await api.post("/api/owner", itemOwner);
//         const resProperty = await api.post("/api/property", { ...itemProperty, IdOwner: resOwner.data.Id || resOwner.data.id });
//         await api.post("/api/propertyImage", { ...itemPropertyImage, IdProperty: resProperty.data.Id || resProperty.data.id });
//         await api.post("/api/propertyTrace", itemPropertyTrace.map(trace => ({
//           ...trace,
//           Value: Number(trace.Value),
//           Tax: Number(trace.Tax),
//           IdProperty: resProperty.data.Id || resProperty.data.id
//         })));
//         Swal.fire({ title: "Propiedad Registrada", icon: "success" });
//       }
//       navigate("/home");
//     } catch (err) {
//       console.error(err);
//       Swal.fire({ title: "Error", text: "No se pudo guardar la propiedad", icon: "error" });
//     }
//   };

//   if (loading) return (
//     <div className="container-loader">
//       <div className="spinner"></div>
//       <p>Cargando propiedad...</p>
//     </div>
//   );

//   return (
//     <div className="crudproperty-container">
//       <form className="crudproperty-card" onSubmit={handleSubmit}>
//         <h1>{propertyId ? "Editar Propiedad" : "Registrar nueva propiedad"}</h1>

//         {/* DATOS GENERALES */}
//         <div className="form-section">
//           <h2>Datos generales</h2>
//           <div className="form-grid">
//             <input type="text" name="Name" value={itemProperty.Name} onChange={e => handleChange(e, "property")} placeholder="Nombre" required />
//             <input type="text" name="Address" value={itemProperty.Address} onChange={e => handleChange(e, "property")} placeholder="Dirección" required />
//             <input type="number" name="Price" value={itemProperty.Price} onChange={e => handleChange(e, "property")} placeholder="Precio" min={0} required />
//             <input type="number" name="CodeInternal" value={itemProperty.CodeInternal} onChange={e => handleChange(e, "property")} placeholder="Código interno" />
//             <input type="number" name="Year" value={itemProperty.Year} onChange={e => handleChange(e, "property")} placeholder="Año" min={1800} />
//           </div>
//         </div>

//         {/* PROPIETARIO */}
//         <div className="form-section">
//           <h2>Propietario</h2>
//           <div className="form-grid">
//             <input type="text" name="Name" value={itemOwner.Name} onChange={e => handleChange(e, "owner")} placeholder="Nombre" />
//             <input type="text" name="Address" value={itemOwner.Address} onChange={e => handleChange(e, "owner")} placeholder="Dirección" />
//             <input type="date" name="Birthday" value={itemOwner.Birthday} onChange={e => handleChange(e, "owner")} />
//             <input type="file" accept="image/*" onChange={handleOwnerImageChange} />
//             {itemOwner.ownerPhotoPreview && <img src={itemOwner.ownerPhotoPreview} alt="propietario" className="owner-photo" />}
//           </div>
//         </div>

//         {/* IMAGEN INMUEBLE */}
//         <div className="form-section">
//           <h2>Imagen del inmueble</h2>
//           <input type="file" accept="image/*" onChange={handleImageChange} />
//           {itemPropertyImage.imagePreview && <img src={itemPropertyImage.imagePreview} alt="inmueble" className="property-image" />}
//         </div>

//         {/* HISTORIAL DE TRANSACCIONES */}
//         <div className="form-section">
//           <h2>Historial de ventas</h2>
//           {itemPropertyTrace.map((trace, index) => (
//             <div key={index} className="form-grid trace-group">
//               <input type="date" name="DateSale" value={trace.DateSale} onChange={e => handleChange(e, "traces", index)} />
//               <input type="text" name="Name" value={trace.Name} onChange={e => handleChange(e, "traces", index)} placeholder="Nombre del evento" />
//               <input type="number" name="Value" value={trace.Value} onChange={e => handleChange(e, "traces", index)} placeholder="Valor" />
//               <input type="number" name="Tax" value={trace.Tax} onChange={e => handleChange(e, "traces", index)} placeholder="Impuesto" />
//             </div>
//           ))}
//         </div>

//         <button type="submit" className="crudproperty-btn primary">{propertyId ? "Actualizar Propiedad" : "Crear Propiedad"}</button>
//         <button type="button" className="crudproperty-btn secondary" onClick={() => navigate("/home")}>Cancelar</button>
//       </form>
//     </div>
//   );
// };

// export default CrudProperty;
