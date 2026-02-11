import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaPhone, FaEnvelope } from 'react-icons/fa'
import SafeImage from '../components/SafeImage'
import { Layout } from '../components/Layout'
import { fetchExperiences } from '../api/api'
import type { ExperienceView } from '../data/content'

const About = () => {
  const [experiences, setExperiences] = useState<ExperienceView[]>([])

  const philosophy = [
    {
      title: 'Hacer de cada traslado un momento',
      subtitle: 'Nuestra filosofía',
      text: 'En Moments creemos que los momentos importantes merecen algo más que llegar a tiempo. Creemos en crear una experiencia donde el cliente se sienta atendido, acompañado y valorado desde el primer contacto hasta el final del servicio. No trasladamos pasajeros. Creamos momentos que se recuerdan.',
    },
    {
      title: 'Excelencia en cada servicio',
      subtitle: 'Compromiso',
      text: 'Nuestra prioridad es brindar tranquilidad. Contamos con flota en óptimas condiciones, choferes profesionales uniformados y seguimiento durante el servicio. La coordinación se realiza previamente por los canales oficiales, asegurando claridad en cada etapa del proceso.',
    },
    {
      title: 'Conocemos Costa Rica',
      subtitle: 'Experiencia local',
      text: 'Operamos dentro del Gran Área Metropolitana (GAM) y ofrecemos servicios personalizados fuera de esta zona bajo cotización previa. Conocemos rutas, accesos y tiempos clave para eventos, celebraciones privadas y experiencias especiales.',
    },
  ]

  const contact = [
    {
      title: 'Atención para eventos confirmados',
      subtitle: 'Soporte y seguimiento',
      items: [
        { icon: FaPhone, text: '+506 8566 6276' },
        { icon: FaEnvelope, text: 'contact@momentswrld.com' },
      ],
    },
  ]

  useEffect(() => {
    let mounted = true
    fetchExperiences().then((e) => mounted && setExperiences(e))
    return () => { mounted = false }
  }, [])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Sobre nosotros</span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl mt-2">
              Transformando el transporte en una experiencia premium
            </h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-2">El origen de Moments</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Moments nace de una idea clara: darle a cada persona la sensación de ser la protagonista de su propio momento.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-2">Nuestra visión</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Inspirados en el nivel de cuidado, precisión y elegancia con el que se trasladan experiencias de alto perfil, creamos un servicio donde el transporte deja de ser un trámite y se convierte en parte del recuerdo.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-2">Lo que ofrecemos</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Ofrecemos servicios privados con chofer personal para eventos y ocasiones especiales, cuidando cada detalle del recorrido para que el cliente viva su experiencia con seguridad, comodidad y tranquilidad.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-2">Nuestro compromiso</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Cada servicio es coordinado cuidadosamente según el paquete seleccionado, garantizando puntualidad, atención personalizada y un trato acorde a la importancia del momento.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {philosophy.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wide mt-1">{item.subtitle}</p>
                <p className="text-sm text-gray-300 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 mt-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Momentos reales</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl mt-2">Experiencias que hemos acompañado</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              Cada servicio es distinto, porque cada ocasión lo es.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              Desde celebraciones íntimas hasta eventos especiales, hemos tenido el privilegio de acompañar momentos que se viven una sola vez.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Aquí compartimos algunos de esos recuerdos que nuestros clientes confiaron en nosotros.
            </p>
            <Link
              to="/galeria"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
            >
              Ver galería de imágenes
            </Link>
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
        </div>

        <div className="space-y-6 mt-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Conversemos</span>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl mt-2">Información de contacto</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur mb-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              Si tenés una fecha importante o necesitás coordinar un servicio, estamos para ayudarte.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            {contact.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-amber-300/80 font-medium uppercase tracking-wide mt-1">{item.subtitle}</p>
                </div>
                <div className="space-y-3">
                  {item.items.map((item, idx) => {
                    const IconComponent = item.icon
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <IconComponent size={20} className="text-amber-300 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default About
