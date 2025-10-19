import { Title } from '../components/Title';
import { Label } from '../components/Label';
import '../assets/styles/scss/pages/Contact.scss';

export const Contact = () => {
  return (
        <div className="contact-container">
          <div className="contact-form">
            <Title title="Contacto" />
            <div className="contact-content">       
                <br />
                <Label text="Juan Fernando Muñoz" />
                <div>
                  <span>juanferm0410@javerianacali.edu.co</span>
                  <span>Cel: +57 3117863643</span>
                </div>
                <br /><br />
                <Label text="Santiago Henao" />
                <div>
                  <span>shr09@javerianacali.edu.co</span>
                  <span>Cel: +57 3188511479</span>
                </div>
                <br /><br />
                <Label text="Manuel Alejandro Quiceno" />
                <div>
                  <span>alejandro121@javerianacali.edu.co</span>
                  <span>Cel: +57 3233831135</span>
                </div>
                <br /><br />
                <Label text="Nicolas Guerrero" />
                <div>
                  <span>nicolasgm13@javerianacali.edu.co</span>
                  <span>Cel: +57 3166236738</span>
                </div>
            </div>
          </div>
        </div>
  )
}

export default Contact;