import Button from '../components/Button'
import Card from '../components/Card'
import SafeImage from '../components/SafeImage'
import { eventHighlight } from '../data/content'

const EventSpecial = () => {
  return (
    <div className="page">
      <div className="section">
        <div className="section__split">
          <div>
            <p className="eyebrow">Evento especial</p>
            <h1 className="display">Bodas, galas y celebraciones sin margen de error</h1>
            <p className="section__copy">Coordinacion completa con planners, bandas y catering. Disenamos el flujo de traslados y tiempos de llegada para mantener la calma en cada momento.</p>
            <ul className="list">
              {eventHighlight.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Button variant="primary" size="lg">Agendar llamada</Button>
          </div>
          <div className="media-frame">
            <SafeImage className="media-frame__image" src={eventHighlight.imageUrl} alt={eventHighlight.title} />
          </div>
        </div>
      </div>

      <div className="grid three">
        <Card title="Lineas de tiempo claras" subtitle="Sheet de tiempos con buffers para cada parada, carga y salida.">Tiempo monitoreado en vivo para evitar retrasos.</Card>
        <Card title="Protocolos de accesos" subtitle="Coordinamos con seguridad del venue y valet para accesos fluidos.">Vehiculos listos en puntos designados.</Card>
        <Card title="Atencion silenciosa" subtitle="Brief discreto con choferes y staff Moments para cuidar la experiencia.">Nos comunicamos solo cuando aporta.</Card>
      </div>
    </div>
  )
}

export default EventSpecial
