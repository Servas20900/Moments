import Card from '../components/Card'
import SafeImage from '../components/SafeImage'

const About = () => {
  const experiences = [
    {
      id: 1,
      title: 'Boda en Hacienda Los Reyes',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    },
    {
      id: 2,
      title: 'Concierto Internacional',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    },
    {
      id: 3,
      title: 'Graduación Universitaria',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    },
    {
      id: 4,
      title: 'Quinceañera de Gala',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    },
    {
      id: 5,
      title: 'Evento Corporativo',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    },
    {
      id: 6,
      title: 'Aniversario Premium',
      imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    },
  ]

  return (
    <div className="page">
      {/* Sección: Sobre Nosotros */}
      <header className="section">
        <p className="eyebrow">Sobre nosotros</p>
        <h1 className="display">Donde cada traslado es una experiencia</h1>
        <p className="section__copy">
          Moments nace de la convicción de que los eventos más importantes de tu vida merecen un nivel de servicio excepcional. 
          Somos un equipo costarricense especializado en transporte de lujo con chofer, dedicado a crear experiencias memorables 
          para bodas, graduaciones, quinceañeras, conciertos y eventos corporativos.
        </p>
      </header>

      <section className="section section--dark">
        <div className="section__grid">
          <Card title="Nuestra filosofía" subtitle="Elegancia en cada detalle">
            <p className="card__text">
              No movemos pasajeros, creamos momentos. Cada vehículo es seleccionado por su distinción, 
              cada chofer capacitado en protocolo premium, y cada ruta diseñada para maximizar comodidad y puntualidad.
            </p>
          </Card>

          <Card title="Compromiso" subtitle="Excelencia garantizada">
            <p className="card__text">
              Flota impecable, choferes profesionales uniformados, seguimiento en tiempo real y disponibilidad 24/7 
              para eventos confirmados. Tu tranquilidad es nuestra prioridad.
            </p>
          </Card>

          <Card title="Experiencia local" subtitle="Conocemos Costa Rica">
            <p className="card__text">
              Operamos en todo el territorio nacional. Desde el Estadio Nacional hasta playas privadas en Guanacaste, 
              dominamos cada ruta y optimizamos cada traslado.
            </p>
          </Card>
        </div>
      </section>

      {/* Sección: Galería de Experiencias */}
      <section className="section">
        <div className="section__header">
          <p className="eyebrow">Momentos reales</p>
          <h2 className="heading">Experiencias con nuestros clientes</h2>
          <p className="section__copy">
            Cada evento tiene su propia historia. Aquí algunos de los momentos que hemos tenido el privilegio de acompañar.
          </p>
        </div>

        <div className="gallery">
          {experiences.map((exp) => (
            <div key={exp.id} className="gallery__item">
              <SafeImage
                src={exp.imageUrl}
                alt={exp.title}
                className="gallery__image"
              />
              <div className="gallery__caption">{exp.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección: Contacto */}
      <section className="section section--dark">
        <div className="section__header">
          <p className="eyebrow">Conversemos</p>
          <h2 className="heading">Información de contacto</h2>
        </div>

        <div className="section__split">
          <Card title="Línea concierge" subtitle="Atención 24/7 para eventos confirmados">
            <ul className="list">
              <li>Tel: +506 0000 0000</li>
              <li>Email: concierge@moments.cr</li>
              <li>Oficina: Escazú, San José</li>
            </ul>
          </Card>

          <Card title="Horarios de oficina" subtitle="Cotizaciones y consultas generales">
            <ul className="list">
              <li>Lunes a viernes: 8:00 AM - 6:00 PM</li>
              <li>Sábados: 9:00 AM - 2:00 PM</li>
              <li>WhatsApp: +506 0000 0000</li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default About
