import Button from '../components/Button'
import Card from '../components/Card'

const Reservar = () => {
  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Contacto directo</p>
        <h1 className="display">Conversemos tu evento</h1>
        <p className="section__copy">
          Cuéntanos fecha, horarios, cantidad de pasajeros y tono del evento. 
          Respondemos con propuesta y disponibilidad prioritaria.
        </p>
      </header>

      <div className="section__split">
        <Card title="Línea concierge" subtitle="Atención 24/7 para eventos confirmados">
          <ul className="list">
            <li>Tel: +506 0000 0000</li>
            <li>Email: concierge@moments.cr</li>
            <li>Oficina: Escazú, San José</li>
          </ul>
        </Card>

        <Card title="Especificaciones" subtitle="Envía detalles y armamos la logística">
          <form className="form">
            <label className="form__label">
              Nombre
              <input type="text" name="name" placeholder="Nombre completo" required />
            </label>
            <label className="form__label">
              Email
              <input type="email" name="email" placeholder="correo@dominio.com" required />
            </label>
            <label className="form__label">
              Evento
              <input type="text" name="event" placeholder="Boda, concierto, gala" />
            </label>
            <label className="form__label">
              Detalles
              <textarea name="details" rows={4} placeholder="Fecha, horarios, puntos de recogida" />
            </label>
            <Button variant="primary" type="submit">Enviar solicitud</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Reservar
