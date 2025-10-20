import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import '../../assets/styles/scss/pages/crud/NewProperty.scss';

export const NewProperty = () => {
  const navigate = useNavigate();

  const [property, setProperty] = useState({
    name: '',
    address: '',
    price: '',
    codeInternal: '',
    year: '',
    owner: {
      name: '',
      address: '',
      photoFile: null,
      photoPreview: null,
      birthday: '',
    },
    imageFile: null,
    imagePreview: null,
    traces: [
      {
        dateSale: '',
        name: '',
        value: '',
        tax: '',
      },
    ],
  });

  // 🔹 Maneja cambios generales y anidados
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setProperty((prev) => {
      if (section === 'owner') {
        return { ...prev, owner: { ...prev.owner, [name]: value } };
      }
      if (section === 'traces') {
        return { ...prev, traces: [{ ...prev.traces[0], [name]: value }] };
      }
      return { ...prev, [name]: value };
    });
  };

  // 🔹 Imagen del inmueble
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setProperty((prev) => ({
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
      setProperty((prev) => ({
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
      formData.append('name', property.name);
      formData.append('address', property.address);
      formData.append('price', property.price);
      formData.append('codeInternal', property.codeInternal);
      formData.append('year', property.year);

      // Datos del propietario
      Object.entries(property.owner).forEach(([key, value]) => {
        if (key !== 'photoFile' && key !== 'photoPreview') {
          formData.append(`owner[${key}]`, value);
        }
      });

      // Imagen del propietario
      if (property.owner.photoFile) {
        formData.append('ownerPhoto', property.owner.photoFile);
      }

      // Imagen del inmueble
      if (property.imageFile) {
        formData.append('image', property.imageFile);
      }

      // Datos de venta
      Object.entries(property.traces[0]).forEach(([key, value]) => {
        formData.append(`traces[0][${key}]`, value);
      });

      await api.post('/api/property', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/home');
    } catch (error) {
      console.error('Error creating property:', error.response?.data || error.message);
    }
  };

  return (
    <div className="newproperty-container">
      <form className="newproperty-card" onSubmit={handleSubmit}>
        <h1 className="newproperty-title">Registrar nueva propiedad</h1>

        {/* Sección: Datos generales */}
        <div className="form-section">
          <h2>Datos generales</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                placeholder="Loft en Chapinero"
                value={property.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                placeholder="Calle 60 #9-30, Bogotá"
                value={property.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Precio</label>
              <input
                type="number"
                name="price"
                placeholder="1150000000"
                value={property.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Código interno</label>
              <input
                type="number"
                name="codeInternal"
                placeholder="21"
                value={property.codeInternal}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Año</label>
              <input
                type="number"
                name="year"
                placeholder="2024"
                value={property.year}
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
                placeholder="Daniel Rincón"
                value={property.owner.name}
                onChange={(e) => handleChange(e, 'owner')}
              />
            </div>
            <div className="input-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                placeholder="Carrera 10, Bogotá"
                value={property.owner.address}
                onChange={(e) => handleChange(e, 'owner')}
              />
            </div>

            <div className="input-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                name="birthday"
                value={property.owner.birthday}
                onChange={(e) => handleChange(e, 'owner')}
              />
            </div>

            <div className="input-group">
              <label>Foto del propietario</label>
              <input type="file" accept="image/*" onChange={handleOwnerImageChange} />
              {property.owner.photoPreview && (
                <div className="image-preview">
                  <img className='owner-photo' src={property.owner.photoPreview} alt="Foto del propietario" />
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
              {property.imagePreview && (
                <div className="image-preview">
                  <img className='property-image' src={property.imagePreview} alt="Vista previa del inmueble" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Información de venta */}
        <div className="form-section">
          <h2>Información de venta</h2>
          <div className="form-grid">
            <div className="input-group">
              <label>Fecha de venta</label>
              <input
                type="date"
                name="dateSale"
                value={property.traces[0].dateSale}
                onChange={(e) => handleChange(e, 'traces')}
              />
            </div>
            <div className="input-group">
              <label>Nombre del evento</label>
              <input
                type="text"
                name="name"
                placeholder="Compra Inicial"
                value={property.traces[0].name}
                onChange={(e) => handleChange(e, 'traces')}
              />
            </div>
            <div className="input-group">
              <label>Valor</label>
              <input
                type="number"
                name="value"
                placeholder="1150000000"
                value={property.traces[0].value}
                onChange={(e) => handleChange(e, 'traces')}
              />
            </div>
            <div className="input-group">
              <label>Impuesto</label>
              <input
                type="number"
                name="tax"
                placeholder="23000000"
                value={property.traces[0].tax}
                onChange={(e) => handleChange(e, 'traces')}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="newproperty-btn primary">
          Crear Propiedad
        </button>
        <button
          type="button"
          className="newproperty-btn secondary"
          onClick={() => navigate('/home')}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};
