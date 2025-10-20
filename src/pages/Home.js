import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Title } from '../components/Title';
import { Input } from '../components/Input';
import { FiPlus, FiSearch } from "react-icons/fi";
import Swal from 'sweetalert2';
import '../assets/styles/scss/pages/Home.scss';

const handleDeleteProperty = () => {
      Swal.fire({
        title: "Eliminar Propiedad",
        text: "Estás seguro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {

          Swal.fire({
            title: "Propiedad Eliminada",
            text: "La propiedad ha sido eliminada con éxito",
            icon: "success"
          });
        }
      });

  // Swal.fire({
  //   html: `
  //     <div class="swal-container">
  //       <label for="swal-name">Nombre</label>
  //       <input id="swal-name" class="swal2-input" placeholder="Nombre">
        
  //       <label for="swal-date">Fecha de entrega</label>
  //       <input id="swal-date" type="date" class="swal2-input">

  //       <label for="swal-time">Hora de entrega</label>
  //       <input id="swal-time" type="time" class="swal2-input">

  //       <label for="swal-message">Mensaje</label>
  //       <textarea id="swal-message" class="swal2-textarea" placeholder="Mensaje"></textarea>
  //     </div>
  //   `,
  //   focusConfirm: false,
  //   confirmButtonText: "Crear",
  //   customClass: {
  //     confirmButton: 'home-accept-btn',
  //     popup: 'home-swal-popup',
  //   },
  //   preConfirm: () => {
  //     const nameTask = document.getElementById('swal-name').value;
  //     const dateTask = document.getElementById('swal-date').value;
  //     const timeTask = document.getElementById('swal-time').value;
  //     const messageTask = document.getElementById('swal-message').value;

  //     if (!nameTask || !dateTask || !timeTask || !messageTask) {
  //       Swal.showValidationMessage(`Por favor completa todos los campos`);
  //       return false;
  //     }

  //     return { nameTask, dateTask, timeTask, messageTask };
  //   }
  // }).then(async (result) => {
  //   if (result.isConfirmed) {
  //     try {
  //       const response = await api.post(`/api/property`, {
  //         name: result.value.nameTask,
  //         date: result.value.dateTask,
  //         time: result.value.timeTask,
  //         message: result.value.messageTask,
  //       });

  //       if (response.status >= 200 && response.status < 300) {
  //         Swal.fire({
  //           icon: "success",
  //           title: "Tarea creada",
  //           html: `
  //             <div style="text-align: left; margin-left: 5vw;">
  //               <p><strong>Nombre:</strong> ${result.value.nameTask}</p>
  //               <p><strong>Fecha:</strong> ${result.value.dateTask}</p>
  //               <p><strong>Hora:</strong> ${result.value.timeTask}</p>
  //               <p><strong>Mensaje:</strong> ${result.value.messageTask}</p>
  //             </div>
  //           `
  //         });
  //       }

  //     } catch (error) {
  //       Swal.fire({
  //         text: error.response?.data?.error?.message || error.message,
  //         icon: "error"
  //       });
  //       console.error('Error al crear tarea:', error);
  //     }
  //   }
  // });
};

export const Home = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [properties, setProperties] = useState([]);
  const [queryPropertyName, setQueryPropertyName] = useState("");
  const [pagination, setPagination] = useState({
    last_page: 1,
    limit: 6,
    page: 1,
    total: 0,
  });

  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) {
        navigate('/index');
        return;
      }

      try {
        api.interceptors.request.use(
          (config) => {
            const token = sessionStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
          },
          (error) => Promise.reject(error)
        );

        const response = await api.get(`/api/property?page=${pagination.page}&limit=${pagination.limit}`);
        setProperties(response.data.data || []);
        setPagination(response.data.meta || pagination);

      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setProperties([]);
      }
    };

    fetchItems();
  }, [pagination, navigate, userId]);

  const handleOpenProperty = (propertyId) => {
    navigate(`/api/property/${propertyId}`);
  };

  const handleUpdateProperty = (propertyId) => {
    navigate(`/crud-property/${propertyId}`);
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.last_page) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <Title title="Inmuebles" />
          <button className="home-add-btn" onClick={()=>navigate('/crud-property')}><FiPlus /></button>
        </div>

        <div className="home-search">
          <Input
            Icon={FiSearch}
            type="search"
            placeholder="Buscar inmueble..."
            value={queryPropertyName}
            setState={setQueryPropertyName}
          />
        </div>

        <div className="home-grid">
          {properties
            .filter(property => property.name.toLowerCase().includes(queryPropertyName.toLowerCase()))
            .map((property, index) => (
              <div key={`property${index}`} className="home-property-card">
                <img className="home-property-card-img" src={property.images[0]?.file} alt={`property${index}`} />
                <div className="home-property-card-info">
                  <h3>{property.name}</h3>
                </div>
                <div className="home-property-card-buttons">
                  <button onClick={() => handleUpdateProperty(property.idProperty)}>✏️</button>
                  <button onClick={() => handleDeleteProperty(property.idProperty)}>❌</button>
                </div>
              </div>
            ))}
        </div>

        <div className="home-pagination">
          <button disabled={pagination.page === 1} onClick={handlePrevPage} className="home-page-btn">← <span>Anterior</span></button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button disabled={pagination.page === pagination.last_page} onClick={handleNextPage} className="home-page-btn"><span>Siguiente</span> →</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
