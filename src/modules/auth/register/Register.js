import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api/api';
import { Title } from '../../../components/title/Title';
import { FiUser, FiAtSign, FiLock } from "react-icons/fi";
import Swal from 'sweetalert2';
import './Register.scss';

export const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({ text: 'Registro exitoso', icon: 'success', timer: 1500, showConfirmButton: false });
        navigate('/login');
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
            customClass: {
              popup: 'home-swal-popup',  // usa tu estilo de popup
              title: 'swal-title',       // puedes agregar clase propia si quieres estilizar el título
              content: 'swal-content',    // opcional para el contenido
              confirmButton: "swal-confirm-btn"
            }
          });
        }
  };

  const handleCancel = () => navigate('/login');

  return (
    <div className="register-container">
      <div className="register-card">
        <Title title="Crear cuenta" />
        <div className="register-input-group">
          <FiUser className="register-icon" />
          <input
            type="text"
            placeholder="Nombre"
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