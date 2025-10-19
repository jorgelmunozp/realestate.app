// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Title } from '../components/Title';
// import { Input } from '../components/Input';
// import { Label } from '../components/Label';
// import { FiUser, FiAtSign, FiLock, FiSettings } from "react-icons/fi";
// import { api } from '../services/api';
// import Swal from 'sweetalert2';
// import '../assets/styles/scss/pages/Register.scss';

// export const Register = () => {
//   const navigate = useNavigate();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rol, setRol] = useState('');
  
// const handleRegister = async () => {
//     try {
//         const response = await api.post('/api/auth/register', {
//             name,
//             email,
//             password,
//             rol,
//         });

//         // Si es exitoso, redirige a home
//         if (200 <= response.status && response.status <= 299) { 
//             console.log(response.data);
//             navigate('/home'); 
//         }

//     } catch (error) {
//         Swal.fire({ text: error.response?.data.error.message || error.message, icon: "error" });
//         console.error('Error creating user: ', error.response?.data || error.message);
//     }
//   };

//   const handleCancel = () => {
//     navigate('/');
//   };

//   return (
//     <div className="register-container">
//       <div className="register-form">
//         <Title title="Registrarse" />
//         <br /><br />
//         <Input Icon={FiUser} type={'text'} placeholder={'Nombre'} value={name} setState={setName} />
//         <br />
//         <Input Icon={FiAtSign} type={'text'} placeholder={'Correo'} value={email} setState={setEmail} />
//         <br />
//         <Input Icon={FiLock} value={password} placeholder={'Contraseña'} type={'password'} setState={setPassword} />

//         <Label text="Rol" />
//         <Input Icon={FiSettings} type={'text'} placeholder={'Rol'} value={rol} setState={setRol} />

//         <br />
//         <button className="register-button" onClick={handleRegister}>
//           Crear cuenta
//         </button>
//         <button className="register-button" onClick={handleCancel}>
//           Cancelar
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Register;




import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiAtSign, FiLock, FiSettings } from "react-icons/fi";
import { api } from '../services/api';
import Swal from 'sweetalert2';
import '../assets/styles/scss/pages/Register.scss';

export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');

  const handleRegister = async () => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password, rol });
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ text: 'Registro exitoso', icon: 'success', timer: 1500, showConfirmButton: false });
        navigate('/home');
      }
    } catch (error) {
      Swal.fire({
        text: error.response?.data?.error?.message || 'Error al registrar usuario',
        icon: 'error',
      });
      console.error('Error creating user: ', error.response?.data || error.message);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Crear cuenta</h1>

        <div className="register-input-group">
          <FiUser className="register-icon" />
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="register-input-group">
          <FiAtSign className="register-icon" />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="register-input-group">
          <FiLock className="register-icon" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="register-input-group">
          <FiSettings className="register-icon" />
          <input
            type="text"
            placeholder="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          />
        </div>

        <button className="register-btn primary" onClick={handleRegister}>
          Crear cuenta
        </button>

        <button className="register-btn secondary" onClick={handleCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default Register;