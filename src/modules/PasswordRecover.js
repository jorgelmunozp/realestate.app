import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Title } from '../components/title/Title';
import { FiAtSign } from "react-icons/fi";
import Swal from 'sweetalert2';

import '../assets/styles/scss/modules/PasswordRecover.scss';

export const PasswordRecover = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleRecover = async () => {
    try {
      const response = await api.post('/password/recover', { email });
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "✅ ¡Correo enviado!",
          text: response.data.message,
          icon: "success",
          confirmButtonColor: "$blue-color"
        });
        navigate('/index');
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error?.message || error.message,
        icon: "error",
        confirmButtonColor: "#C00F0C"
      });
    }
  };

  const handleCancel = () => navigate('/login');

  return (
    <div className="recover-container">
      <div className="recover-card">
        <Title title="Recuperar Contraseña" />
        <div className="recover-input-group">
          <FiAtSign className="recover-icon" />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="recover-btn primary" onClick={handleRecover}>
          Enviar enlace
        </button>
        <button className="recover-btn secondary" onClick={handleCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PasswordRecover;