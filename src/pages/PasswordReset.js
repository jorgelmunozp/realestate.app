// import { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Title } from '../components/Title';
// import { Input } from '../components/Input';
// import { Label } from '../components/Label';
// import { FiLock } from "react-icons/fi";
// import { api } from '../services/api';
// import Swal from 'sweetalert2';
// import '../assets/styles/scss/pages/PasswordReset.scss';

// export const PasswordReset = () => {
//   const navigate = useNavigate();
//   const { token } = useParams();      // 👈 obtiene el token de la URL
//   const [password, setPassword] = useState('');

//   const handleReset = async () => {
//     try {
//         const response = await api.patch('/password/update', {
//           token,
//           newPassword: password,
//         });

//         // Si es exitoso, redirige a home
//         if (200 <= response.status && response.status <= 299) { 
//             console.log(response.data.message);
//             Swal.fire({
//                 text: response.data.message,
//                 icon: "success"        
//             });
//             navigate("/login")
//         }
//     } catch (error) {
//         Swal.fire({
//             text: error.response?.data.error.message || error.message,
//             icon: "error"        
//         });
//         console.error('Error user login: ', error.response?.data || error.message);
//     }
//   };

//   const handleCancel = () => {
//     navigate('/');
//   };

//   return (
//         <div className="reset-container">
//           <div className="reset-form">
//             <Title title="Crear Nueva Contraseña" />
  
//             <Label text="Contraseña" />
//             <Input Icon={FiLock} type={'password'} value={password} setState={setPassword} />
    
//             <br />
//             <button className="reset-button" onClick={handleReset}>
//               Confirmar
//             </button>
//             <button className="reset-button" onClick={handleCancel}>
//               Cancelar
//             </button>
//           </div>
//         </div>
//   )
// }

// export default PasswordReset;


import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiLock } from "react-icons/fi";
import Swal from 'sweetalert2';
import { api } from '../services/api';
import '../assets/styles/scss/pages/PasswordReset.scss';

export const PasswordReset = () => {
  const navigate = useNavigate();
  const { token } = useParams();      // Token de la URL
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    try {
      const response = await api.patch('/password/update', {
        token,
        newPassword: password,
      });

      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "✅ ¡Contraseña actualizada!",
          text: response.data.message,
          icon: "success",
          confirmButtonColor: "$blue-color"
        });
        navigate("/login");
      }
    } catch (error) {
      Swal.fire({
        title: "❌ Error",
        text: error.response?.data?.error?.message || error.message,
        icon: "error",
        confirmButtonColor: "#C00F0C"
      });
    }
  };

  const handleCancel = () => navigate('/');

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-title">Crear Nueva Contraseña</h1>

        <div className="reset-input-group">
          <FiLock className="reset-icon" />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="reset-btn primary" onClick={handleReset}>
          Confirmar
        </button>
        <button className="reset-btn secondary" onClick={handleCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PasswordReset;
