import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Button from '../components/Button'
import Card from '../components/Card'
import PackageCard from '../components/PackageCard'
import SafeImage from '../components/SafeImage'
import VehicleCard from '../components/VehicleCard'
import { cloudinaryUrl } from '../utils/media'
import { fetchPackages, fetchVehicles, fetchCalendar, fetchHeroSlides } from '../api/mocks'
import type { HeroSlide } from '../data/content'

const Home = () => {
  const [packages, setPackages] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    let mounted = true
    fetchPackages().then((p) => mounted && setPackages(p))
    fetchVehicles().then((v) => mounted && setVehicles(v))
    fetchCalendar().then((c) => mounted && setEvents(c.filter((e) => e.status === 'evento')))
    fetchHeroSlides().then((h) => {
      if (mounted) {
        const active = h.filter(s => s.isActive).sort((a, b) => a.order - b.order)
        setHeroSlides(active)
      }
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (heroSlides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const slide = heroSlides[currentSlide]

  return (
    <div className="page">
      {slide && (
        <section className="hero">
          <div className="hero__bg" style={{ backgroundImage: `linear-gradient(160deg, rgba(11,12,16,0.85), rgba(11,12,16,0.4)), url(${slide.imageUrl})` }} />
          <div className="hero__content">
            {slide.subtitle && <p className="eyebrow">{slide.subtitle}</p>}
            <h1 className="display">{slide.title}</h1>
            {slide.description && (
              <p className="lede">
                {slide.description}
              </p>
            )}
            <div className="hero__actions">
              <Link to="/reservar" className="btn btn-primary btn-lg">Reservar ahora</Link>
              <Link to="/paquetes" className="btn btn-ghost btn-lg">Ver paquetes</Link>
              <Link to="/calendario" className="btn btn-ghost btn-lg">Calendario</Link>
            </div>
          </div>
          
          {heroSlides.length > 1 && (
            <>
              <button
                className="hero__nav hero__nav--prev"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                aria-label="Slide anterior"
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                className="hero__nav hero__nav--next"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                aria-label="Próximo slide"
              >
                <FaChevronRight size={24} />
              </button>
            </>
          )}
          
          {heroSlides.length > 1 && (
            <div className="hero__pagination">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  className={`hero__dot ${idx === currentSlide ? 'hero__dot--active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Por qué Moments</p>
            <h2 className="section__title">Precisión, discreción y oficio</h2>
          </div>
          <p className="section__copy">Protocolos claros, rutas testeadas y flota para experiencias premium sin improvisaciones.</p>
        </header>
        <div className="grid three">
          <Card title="Timing impecable" subtitle="Buffers de tiempo, monitoreo de tráfico y planes alternos. Llegadas sin estrés." />
          <Card title="Etiqueta y seguridad" subtitle="Choferes de protocolo, comunicación solo cuando se necesita y brief de seguridad previo." />
          <Card title="Flota vehicular" subtitle="Sedanes ejecutivos y SUVs de lujo con privacidad tonalizada, confort y amenities premium." />
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="section__title">Reserva clara y sin fricción</h2>
          </div>
        </header>
        <div className="steps-grid">
          <Card title="Elige fecha y paquete" subtitle="Selecciona cualquier día del año o un evento destacado. Añade vehículo y extras." />
          <Card title="Anticipo seguro 50%" subtitle="Bloqueamos la fecha con un adelanto no reembolsable. Saldo 48h antes." />
          <Card title="Confirmación y seguimiento" subtitle="Recordatorio 24h antes y contacto del chofer 2h antes. Soporte en vivo." />
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
            <PackageCard key={pkg.id} item={pkg} onClick={() => {}} />
          ))}
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Agenda y eventos</p>
            <h2 className="section__title">Inspírate con próximas fechas</h2>
          </div>
          <Link to="/calendario" className="link">Ver calendario</Link>
        </header>
        <div className="event-preview">
          {events.slice(0, 3).map((ev) => (
            <div key={ev.id} className="event-preview__item">
              <div className="event-preview__meta">
                <span className="pill">{ev.status}</span>
                <span className="pill pill-muted">{ev.date}</span>
              </div>
              <div className="event-preview__title">{ev.title}</div>
              {ev.detail && <div className="event-preview__detail">{ev.detail}</div>}
              <div className="event-preview__actions">
                <Link to={`/reservar?event=${ev.id}`} className="btn btn-primary btn-sm">Reservar</Link>
                <Link to={`/paquetes?event=${ev.id}`} className="btn btn-ghost btn-sm">Ver paquetes</Link>
              </div>
            </div>
          ))}
          {events.length === 0 && <p>No hay eventos destacados para mostrar.</p>}
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <div>
            <p className="eyebrow">Flota</p>
            <h2 className="section__title">Vehículos para cada escena</h2>
          </div>
          <Link to="/contacto" className="link">Consultar disponibilidad</Link>
        </header>
        <div className="grid three">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => {}} />
          ))}
        </div>
      </section>

      <section className="section accent">
        <div className="section__split">
          <div>
            <p className="eyebrow">Detalle a detalle</p>
            <h2 className="section__title">Antes, durante y después</h2>
            <p className="section__copy">Coordinamos con wedding planners, production managers o directamente contigo. Enviamos status silenciosos y mantenemos la línea de tiempo bajo control.</p>
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

      <section className="section">
        <div className="cta-band">
          <div>
            <p className="eyebrow">Listo para coordinar</p>
            <h3 className="section__title">Reserva en minutos, con seguimiento humano y confirmación clara.</h3>
            <p className="section__copy">50% de anticipo para bloquear tu fecha. Confirmación por email/WhatsApp y contacto del chofer previo al evento.</p>
          </div>
          <div className="cta-band__actions">
            <Link to="/reservar" className="btn btn-primary btn-lg">Reservar</Link>
            <Link to="/about" className="btn btn-ghost btn-lg">Conocer Moments</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
