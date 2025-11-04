import { TbSmartHome } from "react-icons/tb";
import './Header.scss';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <TbSmartHome className="header-icon" size={52.5} strokeWidth={2.5} />
        <h1 className="header-title">
          Real<span className="header-letter">Estate</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;



// import { useState, useEffect } from 'react';
// import './Header.scss'; // Asegúrate de tener un archivo CSS para los estilos

// export function Header() {
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 10) { // Umbral de scroll. Ajusta este valor según necesites
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);

//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   return (
//     <header className={isScrolled ? 'header scrolled' : 'header'}>
//       <div className="logo">Tu Logo</div>
//       <nav>
//         {/* Contenido de tu menú */}
//         <a href="#">Inicio</a>
//         <a href="#">Acerca de</a>
//         <a href="#">Contacto</a>
//       </nav>
//     </header>
//   );
// }

// export default Header;
