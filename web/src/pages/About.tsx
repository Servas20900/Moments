import { useEffect, useState } from 'react'
import Card from '../components/Card'
import SafeImage from '../components/SafeImage'
import { fetchExperiences } from '../api/mocks'
import type { Experience } from '../data/content'

const About = () => {
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    let mounted = true
    fetchExperiences().then((e) => mounted && setExperiences(e))
    return () => { mounted = false }
  }, [])

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
