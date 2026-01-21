import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeImage from '../components/SafeImage'
import Card from '../components/Card'
import { useCalendarContext } from '../contexts/CalendarContext'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const CalendarPage = () => {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  // Use Calendar Context instead of local state
  const { events: calendar } = useCalendarContext()

  // Debug: log when events change
  useEffect(() => {
    console.log('[CalendarPage] Events updated:', calendar.length, 'events')
    console.log('[CalendarPage] Calendar events:', calendar)
  }, [calendar])

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendar.filter(event => event.date === dateStr && event.status === 'evento')
  }

  const eventsForMonth = () => {
    const monthStr = String(currentMonth + 1).padStart(2, '0')
    return calendar.filter((e) => e.status === 'evento' && e.date.startsWith(`${currentYear}-${monthStr}`))
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setTimeout(() => {
      const el = document.getElementById(`event-${eventId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  const goToPackagesForEvent = (eventId: string) => {
    navigate(`/paquetes?event=${encodeURIComponent(eventId)}`)
  }

  const goToReserveForEvent = (eventId: string) => {
    navigate(`/paquetes?event=${encodeURIComponent(eventId)}`)
  }

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-custom__day calendar-custom__day--empty" />)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day)
      const hasEvents = events.length > 0
      const todayClass = isToday(day) ? 'calendar-custom__day--today' : ''

      days.push(
        <div key={day} className={`calendar-custom__day ${todayClass}`}>
          <div className="calendar-custom__day-number">{day}</div>
          {hasEvents && (
            <div className="calendar-custom__events">
              {events.map((event) => (
                <div
                  key={event.id}
                  id={`mini-${event.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEventClick(event.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEventClick(event.id) }}
                  className={`calendar-custom__event calendar-custom__event--${event.status}`}>
                  <span className="calendar-custom__event-tag">{event.tag || 'Evento'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Calendario</p>
        <h1 className="display">Disponibilidad y eventos referencia</h1>
        <p className="section__copy">Consulta fechas ocupadas y ventanas abiertas. El calendario muestra conciertos, bodas y galas para planificar con claridad.</p>
      </header>

      <div className="calendar-custom">
        <div className="calendar-custom__header">
          <h2 className="calendar-custom__title">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="calendar-custom__controls">
            <button className="calendar-custom__btn" onClick={previousMonth} aria-label="Mes anterior">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="calendar-custom__btn" onClick={nextMonth} aria-label="Siguiente mes">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="calendar-custom__legend">
          <div className="calendar-custom__legend-item">
            <div className="calendar-custom__legend-dot calendar-custom__legend-dot--evento" />
            <span>Evento país</span>
          </div>
        </div>

        <div className="calendar-custom__weekdays">
          {DAYS.map(day => (
            <div key={day} className="calendar-custom__weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-custom__grid">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="section">
        <Card title="Necesitas otra fecha" subtitle="Contáctanos para abrir agenda prioritaria en fechas especiales o fuera de horario">
          <p className="section__copy">Manejamos listas de espera y producción bajo solicitud. Si el día que buscas ya está tomado, escríbenos para evaluar opciones con flota extendida.</p>
        </Card>
      </div>

      <div className="section" ref={listRef}>
        <Card title="Eventos este mes" subtitle={`${MONTHS[currentMonth]} ${currentYear}`}>
          {eventsForMonth().length === 0 && <p>No hay eventos para este mes.</p>}
          <div className="events-table-wrapper">
            <table className="events-table" aria-label="Eventos del mes">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Imagen</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                {eventsForMonth().map((ev) => (
                  <tr key={ev.id} id={`event-${ev.id}`} className={selectedEventId === ev.id ? 'is-selected' : ''}>
                    <td className="events-table__title">{ev.title}</td>
                    <td className="events-table__image">
                      {ev.imageUrl ? (
                        <SafeImage src={ev.imageUrl} alt={ev.title} width={72} height={48} />
                      ) : '—'}
                    </td>
                    <td className="events-table__detail" title={ev.detail ?? ''}>{ev.detail ?? '—'}</td>
                    <td className="events-table__date">{ev.date}</td>
                    <td className="events-table__actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => goToPackagesForEvent(ev.id)}>Ver paquetes</button>
                      <button className="btn btn-primary btn-sm" onClick={() => goToReserveForEvent(ev.id)}>Reservar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CalendarPage
