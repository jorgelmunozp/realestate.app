// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../services/api';
// import { Title } from '../components/Title';
// import { Input } from '../components/Input';
// import { FiPlus, FiSearch } from "react-icons/fi";
// import Swal from 'sweetalert2';
// import '../assets/styles/scss/pages/Home.scss';

// // ********** Crear un nuevo inmueble ********** //
// const handleNewProperty = () => {
//   const userId = sessionStorage.getItem('userId');

//   if (!userId) {
//     Swal.fire({ icon: "error", text: "No hay usuario autenticado" });
//     return;
//   }

//   Swal.fire({
//     html: `
//       <div style="margin-bottom: 10px;">
//         <label for="swal-name" style="display: block; font-family:'Itim'; text-align: left; padding-bottom:15px;">Nombre</label>
//         <input id="swal-name" class="swal2-input" placeholder="Nombre" style="width: 100%; margin: 0;">
//       </div>

//       <div style="margin-bottom: 10px;">
//         <label for="swal-date" style="display: block; font-family:'Itim'; text-align: left; padding-bottom:15px;">Fecha de entrega</label>
//         <input id="swal-date" type="date" class="swal2-input" placeholder="Fecha" style="width: 100%; margin: 0;">
//       </div>

//       <div style="margin-bottom: 10px;">
//         <label for="swal-time" style="display: block; font-family:'Itim'; text-align: left; padding-bottom:15px;">Hora de entrega</label>
//         <input id="swal-time" type="time" class="swal2-input" placeholder="Hora" style="width: 100%; margin: 0;">
//       </div>

//       <div style="margin-bottom: 10px;">
//         <label for="swal-message" style="display: block; font-family:'Itim'; text-align: left; padding-bottom:15px;">Mensaje</label>
//         <textarea id="swal-message" class="swal2-textarea" placeholder="Mensaje" style="width: 100%; margin: 0;"></textarea>
//       </div>
//     `,
//     focusConfirm: false,
//     confirmButtonText: "Crear",
//     customClass: {
//       confirmButton: 'home-accept-btn',
//     },
//     preConfirm: () => {
//       const nameTask = document.getElementById('swal-name').value;
//       const dateTask = document.getElementById('swal-date').value;
//       const timeTask = document.getElementById('swal-time').value;
//       const messageTask = document.getElementById('swal-message').value;

//       if (!nameTask || !dateTask || !timeTask || !messageTask) {
//         Swal.showValidationMessage(`Por favor completa todos los campos`);
//         return false;
//       }

//       return { nameTask, dateTask, timeTask, messageTask };
//     }
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         const response = await api.post(`/users/${userId}/tasks`, {
//           name: result.value.nameTask,
//           date: result.value.dateTask,
//           time: result.value.timeTask,
//           message: result.value.messageTask,
//         });

//         if (response.status >= 200 && response.status < 300) {
//           Swal.fire({
//             icon: "success",
//             title: "Tarea creada",
//             html: `
//               <div style="text-align: left; margin-left: 5vw;">
//                 <p><strong>Nombre:</strong> ${result.value.nameTask}</p>
//                 <p><strong>Fecha:</strong> ${result.value.dateTask}</p>
//                 <p><strong>Hora:</strong> ${result.value.timeTask}</p>
//                 <p><strong>Mensaje:</strong> ${result.value.messageTask}</p>
//               </div>
//             `
//           });
//         }

//       } catch (error) {
//         Swal.fire({
//           text: error.response?.data?.error?.message || error.message,
//           icon: "error"
//         });
//         console.error('Error al crear tarea:', error);
//       }
//     }
//   });
// };


// // ********** Componente Home ********** //
// export const Home = () => {
//   const navigate = useNavigate();
//   const [properties, setProperties] = useState([]);
//   const [queryPropertyName, setQueryPropertyName] = useState("");
//   const [pagination, setPagination] = useState({
//     last_page: 1,
//     limit: 6,
//     page: 1,
//     total: 0,
//   });

//   const userId = sessionStorage.getItem('userId');

//   useEffect(() => {
//     const fetchTasks = async () => {
//       if (!userId) {
//         console.warn("No session, redirecting to login...");
//         navigate('/login');
//         return;
//       }

//       try {
//         // Añadir token dinámicamente
//         api.interceptors.request.use(
//           (config) => {
//             const token = sessionStorage.getItem('token');
//             if (token) config.headers.Authorization = `Bearer ${token}`;
//             return config;
//           },
//           (error) => Promise.reject(error)
//         );

//         const response = await api.get(
//           `/api/property?page=${pagination.page}&limit=${pagination.limit}`
//         );
//         setProperties(response.data.data || []);
//         setPagination(response.data.meta || pagination);

//       } catch (error) {
//         console.error('Error fetching data:', error.response?.data || error.message);
//         setProperties([]);
//       }
//     };

//     fetchTasks();
//   }, [pagination, navigate, userId]);

//   // ********** Abrir un inmueble ********** //
//   const handleOpenProperty = (propertyId) => {
//     navigate(`/api/property/${propertyId}`);
//   };

//   // ********** Paginación ********** //
//   const handleNextPage = () => {
//     if (pagination.page < pagination.last_page) {
//       setPagination(prev => ({ ...prev, page: prev.page + 1 }));
//     }
//   };

//   const handlePrevPage = () => {
//     if (pagination.page > 1) {
//       setPagination(prev => ({ ...prev, page: prev.page - 1 }));
//     }
//   };

//   return (
//     <div className="home-container">
//       <div className="home-form">
//         <div className='home-header'>
//           <Title title="Inmuebles" />
//           <button onClick={handleNewProperty}><FiPlus /></button>
//         </div>

//         <div className='home-search'>
//           <Input Icon={FiSearch} type='search' placeholder='Buscar inmueble...' value={queryPropertyName} setState={setQueryPropertyName} />
//         </div>

//         <div className='home-item-container'>
//           {properties
//             .filter(property => property.name.toLowerCase().includes(queryPropertyName.toLowerCase()))
//             .map((property, index) => (
//                 <button key={`property${index}`} className='home-item-card' onClick={() => handleOpenProperty(property.idProperty)} >
//                     <img className='home-item-image' src={property.images[0].file} width={110} alt={`property${index}`} />
//                     <div className='home-item-info' >
//                       <p className='home-item-name'>{property.name}</p>
//                       <p>{property.price}</p>
//                     </div>
//                 </button>

//             ))}
//         </div>

//         {/* ----- Controles de paginación ----- */}
//         <div className="home-pagination">
//           <button disabled={pagination.page === 1} onClick={handlePrevPage} className='home-page-btn' >
//             ← <span className='home-pagination-label'>Anterior</span>
//           </button>
//           <span>
//             Página {pagination.page} de {pagination.last_page}
//           </span>
//           <button disabled={pagination.page === pagination.last_page} onClick={handleNextPage} className='home-page-btn' >
//             <span className='home-pagination-label'>Siguiente</span> →
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;




import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Title } from '../components/Title';
import { Input } from '../components/Input';
import { FiPlus, FiSearch } from "react-icons/fi";
import Swal from 'sweetalert2';
import '../assets/styles/scss/pages/Home.scss';

const handleNewProperty = () => {
  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    Swal.fire({ icon: "error", text: "No hay usuario autenticado" });
    return;
  }

  Swal.fire({
    html: `
      <div class="swal-container">
        <label for="swal-name">Nombre</label>
        <input id="swal-name" class="swal2-input" placeholder="Nombre">
        
        <label for="swal-date">Fecha de entrega</label>
        <input id="swal-date" type="date" class="swal2-input">

        <label for="swal-time">Hora de entrega</label>
        <input id="swal-time" type="time" class="swal2-input">

        <label for="swal-message">Mensaje</label>
        <textarea id="swal-message" class="swal2-textarea" placeholder="Mensaje"></textarea>
      </div>
    `,
    focusConfirm: false,
    confirmButtonText: "Crear",
    customClass: {
      confirmButton: 'home-accept-btn',
      popup: 'home-swal-popup',
    },
    preConfirm: () => {
      const nameTask = document.getElementById('swal-name').value;
      const dateTask = document.getElementById('swal-date').value;
      const timeTask = document.getElementById('swal-time').value;
      const messageTask = document.getElementById('swal-message').value;

      if (!nameTask || !dateTask || !timeTask || !messageTask) {
        Swal.showValidationMessage(`Por favor completa todos los campos`);
        return false;
      }

      return { nameTask, dateTask, timeTask, messageTask };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.post(`/api/property`, {
          name: result.value.nameTask,
          date: result.value.dateTask,
          time: result.value.timeTask,
          message: result.value.messageTask,
        });

        if (response.status >= 200 && response.status < 300) {
          Swal.fire({
            icon: "success",
            title: "Tarea creada",
            html: `
              <div style="text-align: left; margin-left: 5vw;">
                <p><strong>Nombre:</strong> ${result.value.nameTask}</p>
                <p><strong>Fecha:</strong> ${result.value.dateTask}</p>
                <p><strong>Hora:</strong> ${result.value.timeTask}</p>
                <p><strong>Mensaje:</strong> ${result.value.messageTask}</p>
              </div>
            `
          });
        }

      } catch (error) {
        Swal.fire({
          text: error.response?.data?.error?.message || error.message,
          icon: "error"
        });
        console.error('Error al crear tarea:', error);
      }
    }
  });
};

export const Home = () => {
  const navigate = useNavigate();
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
    const fetchTasks = async () => {
      if (!userId) {
        navigate('/login');
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

    fetchTasks();
  }, [pagination, navigate, userId]);

  const handleOpenProperty = (propertyId) => {
    navigate(`/api/property/${propertyId}`);
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
          <Title title="🏘️ Inmuebles Disponibles" />
          <button className="home-add-btn" onClick={handleNewProperty}><FiPlus /></button>
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
              <div key={`property${index}`} className="property-card" onClick={() => handleOpenProperty(property.idProperty)}>
                <img className="property-card-img" src={property.images[0]?.file} alt={`property${index}`} />
                <div className="property-card-info">
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                  <p className="price">${property.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="home-pagination">
          <button disabled={pagination.page === 1} onClick={handlePrevPage} className="home-page-btn">← Anterior</button>
          <span>Página {pagination.page} de {pagination.last_page}</span>
          <button disabled={pagination.page === pagination.last_page} onClick={handleNextPage} className="home-page-btn">Siguiente →</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
