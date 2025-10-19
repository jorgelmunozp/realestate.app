import { Title } from '../components/Title';
import { Label } from '../components/Label';
import '../assets/styles/scss/pages/AboutUs.scss';

export const AboutUs = () => {
  return (
        <div className="aboutUs-container">
          <div className="aboutUs-form">
            <Title title="Nosotros" />
            <div className='aboutUs-content'>       
              <p>Somos una inmobiliaria pensada para ti</p>
              <p>Te ayudamos a organizar tus horarios y tareas diarias en un solo lugar</p>
              <p>Nuestro objetivo es facilitar tu día a día y ayudarte a aprovechar mejor tu tiempo</p>
              <Label text="Organiza tu vida, mejora tu estudio" />
            </div>
          </div>
        </div>
  )
}

export default AboutUs;