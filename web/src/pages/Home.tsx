import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import PackageCard from '../components/PackageCard'
import SafeImage from '../components/SafeImage'
import VehicleCard from '../components/VehicleCard'
import { fetchPackages, fetchVehicles, fetchCalendar, fetchHeroSlides } from '../api/api'
import type { HeroSlide } from '../data/content'

const Home = () => {
  const [packages, setPackages] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  const whyItems = [
    {
      title: 'Timing impecable',
      subtitle: 'Buffers de tiempo, monitoreo de tráfico y planes alternos. Llegadas sin estrés.',
    },
    {
      title: 'Etiqueta y seguridad',
      subtitle: 'Choferes de protocolo, comunicación solo cuando se necesita y brief de seguridad previo.',
    },
    {
      title: 'Flota vehicular',
      subtitle: 'Sedanes ejecutivos y SUVs de lujo con privacidad tonalizada, confort y amenities premium.',
    },
  ]

  const steps = [
    {
      title: 'Elige fecha y paquete',
      subtitle: 'Selecciona cualquier día del año o un evento destacado. Añade vehículo y extras.',
    },
    {
      title: 'Anticipo seguro 50%',
      subtitle: 'Bloqueamos la fecha con un adelanto no reembolsable. Saldo 48h antes.',
    },
    {
      title: 'Confirmación y seguimiento',
      subtitle: 'Recordatorio 24h antes y contacto del chofer 2h antes. Soporte en vivo.',
    },
  ]

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
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:px-8">
      {slide && (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#13141a] text-white shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(160deg, rgba(11,12,16,0.88), rgba(11,12,16,0.5)), url(${slide.imageUrl})` }}
          />

          <div className="relative flex min-h-[520px] flex-col justify-between gap-10 p-8 sm:p-12">
            <div className="flex max-w-2xl flex-col gap-4">
              {slide.subtitle && (
                <span className="text-xs uppercase tracking-[0.3em] text-amber-200/80">{slide.subtitle}</span>
              )}
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {slide.title}
              </h1>
              {slide.description && (
                <p className="text-base text-gray-200 sm:text-lg">{slide.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/calendario"
                  className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
                >
                  Reservar ahora
                </Link>
                <Link
                  to="/paquetes"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  Ver paquetes
                </Link>
                <Link
                  to="/calendario"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
                >
                  Calendario
                </Link>
              </div>
            </div>

            {heroSlides.length > 1 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/20"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    aria-label="Slide anterior"
                  >
                    <FaChevronLeft size={18} />
                  </button>
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/20"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                    aria-label="Próximo slide"
                  >
                    <FaChevronRight size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2.5 rounded-full transition ${idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Por qué Moments</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Precisión, discreción y oficio</h2>
          </div>
          <p className="max-w-xl text-sm text-gray-300 sm:text-base">
            Protocolos claros, rutas testeadas y flota para experiencias premium sin improvisaciones.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {whyItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Cómo funciona</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Reserva clara y sin fricción</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-md"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{item.subtitle}</p>
            </div>
          ))}
        </div>
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
            <PackageCard key={pkg.id} item={pkg} onClick={() => {}} />
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
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-300">{ev.status}</span>
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

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Flota</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Vehículos para cada escena</h2>
          </div>
          <Link
            to="/calendario"
            className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
          >
            Consultar disponibilidad
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => {}} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/15 via-white/5 to-amber-300/10 p-6 shadow-xl backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Detalle a detalle</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Antes, durante y después</h2>
          <p className="text-sm text-gray-200 sm:text-base">
            Coordinamos con wedding planners, production managers o directamente contigo. Enviamos status silenciosos y mantenemos la línea de tiempo bajo control.
          </p>
          <ul className="space-y-2 text-sm text-gray-100">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400"></span>
              Brief de seguridad y rutas alternativas listas.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400"></span>
              Revisiones previas de clima, accesos y valet.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400"></span>
              Equipo de soporte remoto para cambios de último minuto.
            </li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 shadow-lg">
          <SafeImage
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=520&fit=crop"
            alt="Servicio Moments"
            transformHeight={520}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#10121a] p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Listo para coordinar</span>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            Reserva en minutos, con seguimiento humano y confirmación clara.
          </h3>
          <p className="text-sm text-gray-300">
            50% de anticipo para bloquear tu fecha. Confirmación por email/WhatsApp y contacto del chofer previo al evento.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/calendario"
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
          >
            Reservar
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Conocer Moments
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
