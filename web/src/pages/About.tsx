import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeImage from '../components/SafeImage'
import { fetchExperiences } from '../api/api'
import type { Experience } from '../data/content'

const About = () => {
  const navigate = useNavigate()
  const [experiences, setExperiences] = useState<Experience[]>([])

  const philosophy = [
    {
      title: 'Nuestra filosofía',
      subtitle: 'Elegancia en cada detalle',
      text: 'No movemos pasajeros, creamos momentos. Cada vehículo es seleccionado por su distinción, cada chofer capacitado en protocolo premium, y cada ruta diseñada para maximizar comodidad y puntualidad.',
    },
    {
      title: 'Compromiso',
      subtitle: 'Excelencia garantizada',
      text: 'Flota impecable, choferes profesionales uniformados, seguimiento en tiempo real y disponibilidad 24/7 para eventos confirmados. Tu tranquilidad es nuestra prioridad.',
    },
    {
      title: 'Experiencia local',
      subtitle: 'Conocemos Costa Rica',
      text: 'Operamos en todo el territorio nacional. Desde el Estadio Nacional hasta playas privadas en Guanacaste, dominamos cada ruta y optimizamos cada traslado.',
    },
  ]

  const contact = [
    {
      title: 'Línea concierge',
      subtitle: 'Atención 24/7 para eventos confirmados',
      items: ['Tel: +506 0000 0000', 'Email: concierge@moments.cr', 'Oficina: Escazú, San José'],
    },
    {
      title: 'Horarios de oficina',
      subtitle: 'Cotizaciones y consultas generales',
      items: ['Lunes a viernes: 8:00 AM - 6:00 PM', 'Sábados: 9:00 AM - 2:00 PM', 'WhatsApp: +506 0000 0000'],
    },
  ]

  useEffect(() => {
    let mounted = true
    fetchExperiences().then((e) => mounted && setExperiences(e))
    return () => { mounted = false }
  }, [])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Sobre nosotros</span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
          Donde cada traslado es una experiencia
        </h1>
        <p className="max-w-3xl text-sm text-gray-300 sm:text-base">
          Moments nace de la convicción de que los eventos más importantes de tu vida merecen un nivel de servicio excepcional.
          Somos un equipo costarricense especializado en transporte de lujo con chofer, dedicado a crear experiencias memorables
          para bodas, graduaciones, quinceañeras, conciertos y eventos corporativos.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          {philosophy.map((item) => (
            <div key={item.title} className="space-y-2 rounded-2xl border border-white/10 bg-[#10121a] p-5 shadow-md">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wide">{item.subtitle}</p>
              <p className="text-sm text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Momentos reales</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Experiencias con nuestros clientes</h2>
          <p className="max-w-2xl text-sm text-gray-300 sm:text-base">
            Cada evento tiene su propia historia. Aquí algunos de los momentos que hemos tenido el privilegio de acompañar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="group relative overflow-hidden rounded-2xl border border-white/10 shadow-lg">
              <div className="aspect-square overflow-hidden bg-black/30">
                <SafeImage
                  src={exp.imageUrl}
                  alt={exp.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4">
                <p className="text-sm font-semibold text-white">{exp.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={() => navigate('/galeria')}
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
          >
            Ver galería completa
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Conversemos</span>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Información de contacto</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {contact.map((item) => (
            <div key={item.title} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-md">
              <div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wide">{item.subtitle}</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {item.items.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
