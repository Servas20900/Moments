import { useState } from 'react'
import Card from '../components/Card'
import { calendar } from '../data/content'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const CalendarPage = () => {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

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
                <div key={event.id} className={`calendar-custom__event calendar-custom__event--${event.status}`}>
                  <div className="calendar-custom__event-title">{event.title}</div>
                  {event.detail && <div className="calendar-custom__event-detail">{event.detail}</div>}
                  {event.tag && <span className="calendar-custom__event-tag">{event.tag}</span>}
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
    </div>
  )
}

export default CalendarPage
