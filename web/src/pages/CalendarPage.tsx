import { useRef, useState } from 'react'
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
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Calendario</span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">Disponibilidad y eventos referencia</h1>
        <p className="max-w-3xl text-sm text-gray-300 sm:text-base">Consulta fechas ocupadas y ventanas abiertas. El calendario muestra conciertos, bodas y galas para planificar con claridad.</p>
      </header>

      <section className="space-y-6">
        <div className="mx-auto max-w-3xl px-4">
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
        </div>
      </section>

      <section className="space-y-6">
        <div className="mx-auto max-w-3xl px-4">
          <Card title="Necesitas otra fecha" subtitle="Contáctanos para abrir agenda prioritaria en fechas especiales o fuera de horario">
            <p className="section__copy">Manejamos listas de espera y producción bajo solicitud. Si el día que buscas ya está tomado, escríbenos para evaluar opciones con flota extendida.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-6" ref={listRef}>
        <div className="mx-auto max-w-3xl px-4">
          <Card title="Eventos este mes" subtitle={`${MONTHS[currentMonth]} ${currentYear}`}>
            {eventsForMonth().length === 0 && <p>No hay eventos para este mes.</p>}
            
            {/* Desktop view - Table */}
            <div className="hidden md:block max-h-[420px] overflow-y-auto overflow-x-hidden pr-2">
              <table className="w-full border-collapse text-sm" aria-label="Eventos del mes">
                <thead>
                  <tr>
                    <th className="sticky top-0 bg-[var(--card-bg,rgba(15,16,22,0.9))] bg-opacity-90 backdrop-blur-md border-b border-white/10 px-3 py-2.5 text-left font-semibold text-[var(--color-text)]">Título</th>
                    <th className="sticky top-0 bg-[var(--card-bg,rgba(15,16,22,0.9))] bg-opacity-90 backdrop-blur-md border-b border-white/10 px-3 py-2.5 text-left font-semibold text-[var(--color-text)]">Imagen</th>
                    <th className="sticky top-0 bg-[var(--card-bg,rgba(15,16,22,0.9))] bg-opacity-90 backdrop-blur-md border-b border-white/10 px-3 py-2.5 text-left font-semibold text-[var(--color-text)]">Detalle</th>
                    <th className="sticky top-0 bg-[var(--card-bg,rgba(15,16,22,0.9))] bg-opacity-90 backdrop-blur-md border-b border-white/10 px-3 py-2.5 text-left font-semibold text-[var(--color-text)]">Fecha</th>
                    <th className="sticky top-0 bg-[var(--card-bg,rgba(15,16,22,0.9))] bg-opacity-90 backdrop-blur-md border-b border-white/10 px-3 py-2.5 text-[var(--color-text)]" aria-label="Acciones"></th>
                  </tr>
                </thead>
                <tbody>
                  {eventsForMonth().map((ev) => (
                    <tr 
                      key={ev.id} 
                      id={`event-${ev.id}`} 
                      className={`border-b border-white/5 transition-colors ${selectedEventId === ev.id ? 'bg-[rgba(201,162,77,0.06)]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="px-3 py-2.5 font-bold">{ev.title}</td>
                      <td className="px-3 py-2.5 w-[90px]">
                        {ev.imageUrl ? (
                          <SafeImage src={ev.imageUrl} alt={ev.title} width={72} height={48} />
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2.5 max-w-[360px] text-gray-400 truncate" title={ev.detail ?? ''}>{ev.detail ?? '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-gray-400">{ev.date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-2 justify-end whitespace-nowrap">
                          <button className="btn btn-ghost btn-sm rounded-lg" onClick={() => goToPackagesForEvent(ev.id)}>Ver paquetes</button>
                          <button className="btn btn-primary btn-sm rounded-lg" onClick={() => goToReserveForEvent(ev.id)}>Reservar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {eventsForMonth().map((ev) => (
                <div 
                  key={ev.id} 
                  id={`event-${ev.id}`}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedEventId === ev.id 
                      ? 'bg-[rgba(201,162,77,0.06)] border-[rgba(201,162,77,0.3)]' 
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {ev.imageUrl ? (
                        <SafeImage src={ev.imageUrl} alt={ev.title} width={72} height={48} />
                      ) : (
                        <div className="w-[72px] h-[48px] bg-white/5 rounded-lg flex items-center justify-center text-gray-500">—</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1">{ev.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">{ev.date}</p>
                    </div>
                  </div>
                  
                  {ev.detail && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{ev.detail}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm flex-1 rounded-lg" onClick={() => goToPackagesForEvent(ev.id)}>Ver paquetes</button>
                    <button className="btn btn-primary btn-sm flex-1 rounded-lg" onClick={() => goToReserveForEvent(ev.id)}>Reservar</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default CalendarPage
