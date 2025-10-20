import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import propertyDto from "./PropertyDto.json";
import "../../assets/styles/scss/pages/crud/CrudProperty.scss";

export const CrudProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();

  const url = propertyId ? `/api/property/${propertyId}` : null;
  const { data, loading, error } = useFetch(url, [propertyId]);

  const [item, setItem] = useState(propertyDto);

  // 🔹 Actualiza el item cuando se obtienen los datos y precarga imágenes si existen
  useEffect(() => {
    if (data) {
      setItem((prev) => ({
        ...data,
        imagePreview: data.images[0].file || prev.imagePreview || null,
        owner: {
          ...data.owner,
          photoPreview: data.owner?.photo || prev.owner.photoPreview || null,
        },
      }));
    }
  }, [data]);

  // 🔹 Maneja cambios generales y anidados
  const handleChange = (e, section, index = null) => {
    const { name, value } = e.target;
    setItem((prev) => {
      if (section === "owner") {
        return { ...prev, owner: { ...prev.owner, [name]: value } };
      }
      if (section === "traces" && index !== null) {
        const updatedTraces = [...prev.traces];
        updatedTraces[index] = { ...updatedTraces[index], [name]: value };
        return { ...prev, traces: updatedTraces };
      }
      return { ...prev, [name]: value };
    });
  };

  // 🔹 Imagen del inmueble
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setItem((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: preview,
      }));
    }
  };

  // 🔹 Imagen del propietario
  const handleOwnerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setItem((prev) => ({
        ...prev,
        owner: {
          ...prev.owner,
          photoFile: file,
          photoPreview: preview,
        },
      }));
    }
  };

  // 🔹 Envío de formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Datos principales
      formData.append("name", item.name);
      formData.append("address", item.address);
      formData.append("price", item.price);
      formData.append("codeInternal", item.codeInternal);
      formData.append("year", item.year);

      // Datos del propietario
      Object.entries(item.owner).forEach(([key, value]) => {
        if (key !== "photoFile" && key !== "photoPreview") {
          formData.append(`owner[${key}]`, value);
        }
      });

      // Imagen del propietario
      if (item.owner.photoFile) {
        formData.append("ownerPhoto", item.owner.photoFile);
      }

      // Imagen del inmueble
      if (item.imageFile) {
        formData.append("image", item.imageFile);
      }

      // Datos de venta (traces dinámicos)
      item.traces.forEach((trace, i) => {
        Object.entries(trace).forEach(([key, value]) => {
          formData.append(`traces[${i}][${key}]`, value);
        });
      });

      await api.post("/api/property", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/home");
    } catch (error) {
      console.error("Error creating property:", error.response?.data || error.message);
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
    return <p style={{ textAlign: "center", color: "red" }}>Error al cargar la propiedad</p>;
  }

  return (
    <div className="crudproperty-container">
      <form className="crudproperty-card" onSubmit={handleSubmit}>
        <h1 className="crudproperty-title">
          {propertyId ? "Editar Propiedad" : "Registrar nueva propiedad"}
        </h1>

        {/* Sección: Datos generales */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={item.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Precio</label>
              <input
                type="number"
                name="price"
                value={item.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Código interno</label>
              <input
                type="number"
                name="codeInternal"
                value={item.codeInternal}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Año</label>
              <input
                type="number"
                name="year"
                value={item.year}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Sección: Propietario */}
        <div className="form-section">
          <h2>Propietario</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={item.owner.name}
                onChange={(e) => handleChange(e, "owner")}
              />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={item.owner.address}
                onChange={(e) => handleChange(e, "owner")}
              />
            </div>

            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="birthday"
                value={item.owner.birthday}
                onChange={(e) => handleChange(e, "owner")}
              />
            </div>

            <div className="input-group">
              <label>Foto del propietario</label>
              <input type="file" accept="image/*" onChange={handleOwnerImageChange} />
              {item.owner.photoPreview && (
                <div className="image-preview">
                  <img
                    className="owner-photo"
                    src={item.owner.photoPreview}
                    alt="Foto del propietario"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Imagen del inmueble */}
        <div className="form-section">
          <h2>Imagen del inmueble</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Subir imagen</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {item.imagePreview && (
                <div className="image-preview">
                  <img
                    className="property-image"
                    src={item.imagePreview}
                    alt="Vista previa del inmueble"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Información de venta */}
        <div className="form-section">
          <h2>Información de venta</h2>
          {item.traces.map((trace, index) => (
            <div key={index} className="form-grid trace-group">
              <h3>Venta #{index + 1}</h3>

              <div className="input-group">
                <label>Fecha de venta</label>
                <input
                  type="date"
                  name="dateSale"
                  value={trace.dateSale}
                  onChange={(e) => handleChange(e, "traces", index)}
                />
              </div>

              <div className="input-group">
                <label>Nombre del evento</label>
                <input
                  type="text"
                  name="name"
                  value={trace.name}
                  onChange={(e) => handleChange(e, "traces", index)}
                />
              </div>

              <div className="input-group">
                <label>Valor</label>
                <input
                  type="number"
                  name="value"
                  value={trace.value}
                  onChange={(e) => handleChange(e, "traces", index)}
                />
              </div>

              <div className="input-group">
                <label>Impuesto</label>
                <input
                  type="number"
                  name="tax"
                  value={trace.tax}
                  onChange={(e) => handleChange(e, "traces", index)}
                />
              </div>
            </div>
          ))}
        </div>

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
