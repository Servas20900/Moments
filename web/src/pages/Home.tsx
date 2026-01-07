import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import PackageCard from '../components/PackageCard'
import SafeImage from '../components/SafeImage'
import VehicleCard from '../components/VehicleCard'
import { heroImage, packages, vehicles } from '../data/content'
import { cloudinaryUrl } from '../utils/media'

const Home = () => {
  const heroUrl = cloudinaryUrl(heroImage, { width: 1800, height: 960 })

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: `linear-gradient(160deg, rgba(11,12,16,0.85), rgba(11,12,16,0.4)), url(${heroUrl})` }} />
        <div className="hero__content">
          <p className="eyebrow">Chauffeur experiences Costa Rica</p>
          <h1 className="display">Momentos que no se compran. Se viven.</h1>
          <p className="lede">
            Traslados de lujo con chofer, atencion silenciosa y detalles que mantienen la calma en eventos, conciertos y celebraciones privadas.
          </p>
          <div className="hero__actions">
            <Button variant="primary" size="lg">Reservar</Button>
            <Link to="/calendario" className="btn btn-ghost btn-lg">Ver calendario</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Por que Moments</p>
            <h2 className="section__title">Precision, discrecion y oficio</h2>
          </div>
          <p className="section__copy">Protocolos claros, rutas testeadas y flota curada para experiencias premium con cero friccion.</p>
        </header>
        <div className="grid three">
          <Card title="Timing impecable" subtitle="Buffers de tiempo y monitoreo de trafico en vivo para cumplir agenda sin stress." />
          <Card title="Choferes de protocolo" subtitle="Entrenados en trato premium, etiqueta y comunicacion solo cuando se requiere." />
          <Card title="Flota curada" subtitle="Sedanes ejecutivos y SUVs de lujo con privacidad tonalizada y confort absoluto." />
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Paquetes sugeridos</p>
            <h2 className="section__title">Experiencias llave en mano</h2>
          </div>
          <Link to="/paquetes" className="link">Ver todos</Link>
        </header>
        <div className="grid three">
          {packages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} item={pkg} />
          ))}
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Flota</p>
            <h2 className="section__title">Vehiculos para cada escena</h2>
          </div>
          <Link to="/contacto" className="link">Consultar disponibilidad</Link>
        </header>
        <div className="grid three">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      <section className="section accent">
        <div className="section__split">
          <div>
            <p className="eyebrow">Detalle a detalle</p>
            <h2 className="section__title">Antes, durante y despues</h2>
            <p className="section__copy">Coordinamos con wedding planners, production managers o directamente contigo. Enviamos status silenciosos y mantenemos la linea de tiempo bajo control.</p>
            <div className="stack">
              <div className="bullet">Brief de seguridad y rutas alternativas listas.</div>
              <div className="bullet">Revisiones previas de clima, accesos y valet.</div>
              <div className="bullet">Equipo de soporte remoto para cambios de ultimo minuto.</div>
            </div>
          </div>
          <div className="media-frame">
            <SafeImage className="media-frame__image" publicId="samples/landscapes/architecture-beach" alt="Servicio Moments" transformHeight={520} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
