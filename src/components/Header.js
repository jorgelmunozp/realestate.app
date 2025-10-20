import { TbSmartHome } from "react-icons/tb";
import '../assets/styles/scss/components/Header.scss';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <TbSmartHome className="header-icon" size={50} />
        <h1 className="header-title">
          Real<span className="header-letter">Estate</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;