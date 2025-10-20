import { Title } from '../components/Title';
import '../assets/styles/scss/pages/Contact.scss';

export const Contact = () => {
  const team = [
    {
      name: 'Juan Fernando Muñoz',
      email: 'juanferm0410@gmail.com',
      phone: '+57 3117863643',
      image: 'https://randomuser.me/api/portraits/men/41.jpg',
    },
    {
      name: 'María Camila Torres',
      email: 'mariacamila@gmail.com',
      phone: '+57 3205542187',
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
      name: 'Laura Martínez',
      email: 'lauramartinez@gmail.com',
      phone: '+57 3157749021',
      image: 'https://randomuser.me/api/portraits/women/46.jpg',
    },
    {
      name: 'Valentina López',
      email: 'valentina.lopez@gmail.com',
      phone: '+57 3109982311',
      image: 'https://randomuser.me/api/portraits/women/47.jpg',
    },
    {
      name: 'Santiago Henao',
      email: 'shr09@gmail.com',
      phone: '+57 3188511479',
      image: 'https://randomuser.me/api/portraits/men/42.jpg',
    },
    {
      name: 'Sofía Ramírez',
      email: 'sofia.ramirez@gmail.com',
      phone: '+57 3168834402',
      image: 'https://randomuser.me/api/portraits/women/48.jpg',
    },
  ];

  return (
    <div className="contact-container">
      <Title title="Nuestro Equipo" />
      <p className="contact-subtitle">
        Conoce al equipo detrás de <strong>Real Estate</strong>, siempre listos para ayudarte a encontrar tu nuevo hogar.
      </p>

      <div className="contact-cards">
        {team.map((member, index) => (
          <div className="contact-card" key={index}>
            <div className="contact-image-wrapper">
              <img src={member.image} alt={member.name} className="contact-photo" />
            </div>
            <div className="contact-info">
              <h3>{member.name}</h3>
              <p>{member.email}</p>
              <span className="contact-phone">
                <span className="prefix">+57</span> {member.phone.replace('+57 ', '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;
