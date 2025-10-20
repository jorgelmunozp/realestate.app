import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title } from '../components/Title';
import { Label } from '../components/Label';
import { FiHome, FiUserCheck, FiStar, FiTrendingUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import '../assets/styles/scss/pages/AboutUs.scss';

// Imágenes para slider
const sliderImages = [
  'https://res.cloudinary.com/brickandbatten/images/c_scale,w_1157,h_422,dpr_1.6500000953674316/f_auto,q_auto/v1716481720/wordpress_assets/390381-ElderWhiteBrick-GossamerVeilTrim-UrbaneBronzeWindows-Color1-A/390381-ElderWhiteBrick-GossamerVeilTrim-UrbaneBronzeWindows-Color1-A.jpg?_i=AA',
  'https://plus.unsplash.com/premium_photo-1661488387936-daf401be9cb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1460',
  'https://www.intreasso.org/wp-content/uploads/elegir-un-agente-inmobiliario-_intreasso.jpg'
];

// Servicios
const services = [
  { icon: <FiHome />, title: 'Compra y venta', description: 'Te ayudamos a comprar y vender propiedades de manera segura.' },
  { icon: <FiUserCheck />, title: 'Asesoría personalizada', description: 'Nuestro equipo experto te acompaña en cada paso.' },
  { icon: <FiStar />, title: 'Propiedades exclusivas', description: 'Accede a inmuebles únicos en las mejores ubicaciones.' },
  { icon: <FiTrendingUp />, title: 'Gestión de alquileres', description: 'Administramos tus propiedades para maximizar rentabilidad.' }
];

export const AboutUs = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Cambio automático cada 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);

  return (
    <div className="aboutUs-container">
      <div className="aboutUs-form home-content">
        <Title title="Nosotros" />

        {/* Slider profesional */}
        <div className="aboutUs-slider">
          {sliderImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Propiedad ${idx + 1}`}
              className={idx === currentSlide ? 'active' : ''}
            />
          ))}

          {/* Flechas */}
          <button className="slider-arrow left" onClick={prevSlide}><FiChevronLeft /></button>
          <button className="slider-arrow right" onClick={nextSlide}><FiChevronRight /></button>

          {/* Indicadores */}
          <div className="slider-indicators">
            {sliderImages.map((_, idx) => (
              <span
                key={idx}
                className={`indicator ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="aboutUs-content">
          <p>Somos una inmobiliaria pensada para ti, ofreciéndote propiedades exclusivas y asesoría personalizada.</p>
          <Label text="¡Tu hogar ideal te espera!" />
        </div>

        {/* Servicios */}
        <div className="aboutUs-services">
          <h3>Nuestros Servicios</h3>
          <div className="services-grid">
            {services.map((s, idx) => (
              <div key={idx} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="aboutUs-buttons">
          <button onClick={() => navigate('/index')} className="home-accept-btn aboutUs-link-button">Ver Propiedades</button>
          <button onClick={() => navigate('/contact')} className="home-accept-btn aboutUs-link-button">Contáctanos</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
