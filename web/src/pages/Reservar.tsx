import { useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import { submitReservation, sendConfirmationEmail, sendAdminNotification, sendWhatsAppNotification } from '../api/mocks'

const Reservar = () => {
  const [form, setForm] = useState({ name: '', email: '', event: '', details: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.email.trim()) {
      setError('Por favor completa nombre y correo')
      return
    }

    setSubmitting(true)
    try {
      const res = await submitReservation(form)
      if (!res.ok) throw new Error('submit failed')

      // send mock notifications: to client and to admin
      await Promise.all([
        sendConfirmationEmail(form.email, { id: res.id, name: form.name, email: form.email, details: form.details }),
        sendAdminNotification({ id: res.id, name: form.name, email: form.email, details: form.details }),
        // optional: WhatsApp notification to company (mock)
        sendWhatsAppNotification('+50600000000', `Nueva reserva ${res.id} - ${form.name}`),
      ])

      setSuccess(`Solicitud enviada (ID: ${res.id}). Te contactamos pronto por correo o WhatsApp.`)
      setForm({ name: '', email: '', event: '', details: '' })
    } catch (err) {
      setError('Ocurrió un error, intenta de nuevo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Contacto directo</p>
        <h1 className="display">Conversemos tu evento</h1>
        <p className="section__copy">
          Cuéntanos fecha, horarios, cantidad de pasajeros y tono del evento. Respondemos con propuesta y disponibilidad prioritaria.
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
          <form className="form" onSubmit={handleSubmit} noValidate>
            {error && <div className="form__error">{error}</div>}
            {success && <div className="form__success">{success}</div>}

            <label className="form__label">
              Nombre
              <input value={form.name} onChange={handleChange} type="text" name="name" placeholder="Nombre completo" required aria-required />
            </label>
            <label className="form__label">
              Email
              <input value={form.email} onChange={handleChange} type="email" name="email" placeholder="correo@dominio.com" required aria-required />
            </label>
            <label className="form__label">
              Evento
              <input value={form.event} onChange={handleChange} type="text" name="event" placeholder="Boda, concierto, gala" />
            </label>
            <label className="form__label">
              Detalles
              <textarea value={form.details} onChange={handleChange} name="details" rows={4} placeholder="Fecha, horarios, puntos de recogida" />
            </label>
            <Button variant="primary" type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Reservar
