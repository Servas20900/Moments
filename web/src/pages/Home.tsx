import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaClock, FaShieldAlt, FaCar } from 'react-icons/fa'
import PackageCard from '../components/PackageCard'
import VehicleCard from '../components/VehicleCard'
import { fetchPackages, fetchVehicles, fetchCalendar, fetchHeroSlides } from '../api/api'
import type { HeroSlide, Vehicle, PackageView } from '../data/content'

const Home = () => {
  const navigate = useNavigate()
  const [packages, setPackages] = useState<PackageView[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroLoading, setHeroLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const whyItems = [
    {
      icon: FaClock,
      title: 'Puntualidad sin estrés',
      subtitle: 'Gestionamos tiempos, tráfico y rutas con anticipación para asegurar llegadas puntuales y sin contratiempos.',
    },
    {
      icon: FaShieldAlt,
      title: 'Discreción y protocolo',
      subtitle: 'Choferes capacitados, comunicación profesional y atención solo cuando es necesaria.',
    },
    {
      icon: FaCar,
      title: 'Flota premium',
      subtitle: 'Sedanes ejecutivos y SUVs de lujo, seleccionados según el tipo de evento y disponibilidad.',
    },
  ]

  const steps = [
    {
      title: 'Elige fecha y paquete',
      subtitle: 'Selecciona la fecha de tu evento y el paquete que mejor se adapte a tu ocasión. La disponibilidad se muestra en tiempo real.',
    },
    {
      title: 'Reserva con adelanto',
      subtitle: 'La fecha se bloquea con un adelanto del 50% o con el pago total del 100%. El adelanto no es reembolsable.',
    },
    {
      title: 'Coordinación previa al evento',
      subtitle: 'Recibirás confirmación por correo electrónico o WhatsApp para coordinar los detalles finales del servicio.',
    },
    { isFinal: true, note: 'No se realizan reprogramaciones una vez confirmada la reserva.' },
  ]

  useEffect(() => {
    let mounted = true
    fetchPackages().then((p) => mounted && setPackages(p))
    fetchVehicles().then((v) => mounted && setVehicles(v))
    fetchCalendar().then((c) => mounted && setEvents(c.filter((e) => e.status === 'evento')))
    fetchHeroSlides()
      .then((h) => {
        if (mounted) {
          const active = h.filter(s => s.isActive).sort((a, b) => a.order - b.order)
          setHeroSlides(active)
          setHeroLoading(false)
        }
      })
      .catch(() => mounted && setHeroLoading(false))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (heroSlides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  // Precargar imagen del slide actual
  useEffect(() => {
    if (!heroSlides[currentSlide]?.imageUrl) return
    setImageLoaded(false)
    const img = new Image()
    img.src = heroSlides[currentSlide].imageUrl
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageLoaded(true) // Mostrar aunque falle
  }, [currentSlide, heroSlides])

  const slide = heroSlides[currentSlide]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:px-8">
      {heroLoading || !slide ? (
        <section className="hero-shell relative overflow-hidden rounded-2xl border border-white/10 bg-[#13141a] text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
          <div className="relative flex min-h-[520px] flex-col justify-between gap-10 p-8 sm:p-12">
            <div className="flex max-w-2xl flex-col gap-4">
              <div className="h-4 w-48 bg-slate-600 rounded animate-pulse" />
              <div className="h-12 w-full max-w-xl bg-slate-600 rounded animate-pulse" />
              <div className="h-6 w-full max-w-lg bg-slate-600 rounded animate-pulse mt-2" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-36 bg-slate-600 rounded-full animate-pulse" />
              <div className="h-10 w-36 bg-slate-600 rounded-full animate-pulse" />
            </div>
          </div>
        </section>
      ) : (
        <section className="hero-shell relative overflow-hidden rounded-2xl border border-white/10 bg-[#13141a] text-white shadow-2xl">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
          )}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `linear-gradient(160deg, rgba(11,12,16,0.88), rgba(11,12,16,0.5)), url(${slide.imageUrl})` }}
          />
          <div className="hero-scrim" aria-hidden="true" />

          <div className="relative flex min-h-[520px] flex-col justify-between gap-10 p-8 sm:p-12">
            <div className="hero-copy flex max-w-2xl flex-col gap-4">
              {slide.subtitle && (
                <span className="hero-kicker text-xs uppercase tracking-[0.3em]">{slide.subtitle}</span>
              )}
              <h1 className="hero-title text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {slide.title}
              </h1>
              {slide.description && (
                <p className="hero-description text-base sm:text-lg">{slide.description}</p>
              )}
            </div>
            {/* Botones en la parte inferior del slide */}
            <div className="flex flex-wrap gap-3 mt-8 justify-start">
              <Link
                to="/paquetes"
                className="hero-cta hero-cta--primary inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
              >
                Ver paquetes
              </Link>
              <Link
                to="/vehiculos"
                className="hero-cta hero-cta--ghost inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold transition hover:border-white/40 hover:bg-white/10"
              >
                Ver vehículos
              </Link>
              <Link
                to="/calendario"
                className="hero-cta hero-cta--ghost inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5"
              >
                Calendario
              </Link>
            </div>
            {/* Flechas para cambiar de slide */}
            {heroSlides.length > 1 && (
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-8 pointer-events-none">
                <button
                  className="hero-arrow flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/40 hover:bg-white/20 pointer-events-auto"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Slide anterior"
                  style={{ zIndex: 2 }}
                >
                  <FaChevronLeft size={18} />
                </button>
                <button
                  className="hero-arrow flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:border-white/40 hover:bg-white/20 pointer-events-auto"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  aria-label="Próximo slide"
                  style={{ zIndex: 2 }}
                >
                  <FaChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Por qué Moments</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Por qué Moments</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Precisión, discreción y experiencia en cada servicio</h3>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            En Moments nos especializamos en transporte privado premium para eventos y ocasiones especiales. Cada servicio es cuidadosamente coordinado, desde la planificación de rutas hasta la atención durante el recorrido, garantizando puntualidad, comodidad y una experiencia acorde al momento.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {whyItems.map((item) => {
            const IconComponent = item.icon
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur"
              >
                <div className="text-2xl mb-2 text-amber-300">
                  <IconComponent size={28} />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{item.subtitle}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Cómo funciona</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Cómo funciona el servicio</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <h3 className="text-xl font-semibold text-white">Un proceso claro desde la reserva hasta el día del evento</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.slice(0, 3).map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-md"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{item.subtitle}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 p-4 rounded-lg border border-white/5 bg-white/[0.02]">
          📌 No se realizan reprogramaciones una vez confirmada la reserva.
        </p>
      </section>

      <section className="grid gap-8 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/15 via-white/5 to-amber-300/10 p-6 shadow-xl backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Horario y atención</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Horario y atención</h2>
          <p className="text-sm text-gray-200 sm:text-base">
            Atención personalizada con un plazo máximo de respuesta de hasta 48 horas.
            <br className="mt-3" />
            La coordinación del servicio se realiza vía correo electrónico y WhatsApp.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#10121a] p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex-1 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Listo para coordinar</span>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            Listo para coordinar tu experiencia
          </h3>
          <p className="text-sm text-gray-300">
            Reserva en minutos con acompañamiento humano y confirmación clara.
            <br className="mt-2" />
            El adelanto del 50% asegura tu fecha y permite iniciar la coordinación del servicio.
          </p>
        </div>
        <Link
          to="/reservar"
          className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-400/25 transition hover:bg-amber-300 whitespace-nowrap"
        >
          Reservar ahora
        </Link>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Paquetes sugeridos</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Experiencias llave en mano</h2>
          </div>
          <Link
            to="/paquetes"
            className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {packages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} item={pkg} onClick={() => navigate(`/paquetes/${pkg.id}`)} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Flota</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Vehículos para cada escena</h2>
          </div>
          <Link
            to="/vehiculos"
            className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => navigate(`/vehiculos/${vehicle.id}`)} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Agenda y eventos</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Inspírate con próximas fechas</h2>
          </div>
          <Link
            to="/calendario"
            className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
          >
            Ver calendario
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {events.slice(0, 3).map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-200">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">Evento</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-gray-300">{ev.date}</span>
              </div>
              <div className="text-lg font-semibold text-white">{ev.title}</div>
              {ev.detail && <div className="text-sm text-gray-300">{ev.detail}</div>}
              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  to="/calendario"
                  className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
                >
                  Reservar
                </Link>
                <Link
                  to={`/paquetes?event=${ev.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  Ver paquetes
                </Link>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              No hay eventos destacados para mostrar.
            </p>
          )}
        </div>
      </section>

    </div>
  )
}

export default Home
