import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Vehicle } from '../data/content'
import { fetchVehicleOccupancy } from '../api/api'
import SafeImage from './SafeImage'
import Button from './Button'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface VehicleModalProps {
  vehicle: Vehicle | null
  isOpen: boolean
  onClose: () => void
}

const VehicleModal = ({ vehicle, isOpen, onClose }: VehicleModalProps) => {
  if (!isOpen || !vehicle) return null

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const navigate = useNavigate()

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

  const [occupancy, setOccupancy] = useState<{ vehicleId: string; date: string; isOccupied: boolean }[]>([])

  useEffect(() => {
    let mounted = true
    fetchVehicleOccupancy().then((o) => mounted && setOccupancy(o))
    return () => { mounted = false }
  }, [])

  const getOccupancyForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const occItem = occupancy.find(
      (o) => o.vehicleId === vehicle.id && o.date === dateStr
    )
    return occItem ? occItem.isOccupied : false
  }

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const renderCalendarDays = () => {
    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="vehicle-modal__calendar-day vehicle-modal__calendar-day--empty" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const occupied = getOccupancyForDate(day)
      const todayClass = isToday(day) ? 'vehicle-modal__calendar-day--today' : ''
      const occupiedClass = occupied ? 'vehicle-modal__calendar-day--occupied' : 'vehicle-modal__calendar-day--available'

      days.push(
        <div key={day} className={`vehicle-modal__calendar-day ${occupiedClass} ${todayClass}`}>
          <span className="vehicle-modal__calendar-day-number">{day}</span>
          {occupied && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: '4px' }}>
            <circle cx="6" cy="6" r="4" fill="currentColor" />
          </svg>}
        </div>
      )
    }

    return days
  }

  return (
    <>
      <div className="vehicle-modal__backdrop" onClick={onClose} />
      <div className="vehicle-modal__container">
        <div className="vehicle-modal__panel">
          <button className="vehicle-modal__close" onClick={onClose} aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="vehicle-modal__content">
          <div className="vehicle-modal__image-container">
            <SafeImage
              className="vehicle-modal__image"
              src={vehicle.imageUrl}
              alt={vehicle.name}
              transformHeight={520}
            />
          </div>

          <div className="vehicle-modal__body">
            <h2 className="vehicle-modal__title">{vehicle.name}</h2>
            <p className="vehicle-modal__category">{vehicle.category}</p>

            <div className="vehicle-modal__specs">
              <div className="vehicle-modal__spec">
                <span className="vehicle-modal__spec-label">Capacidad</span>
                <span className="vehicle-modal__spec-value">{vehicle.seats} pasajeros</span>
              </div>
              <div className="vehicle-modal__spec">
                <span className="vehicle-modal__spec-label">Tarifa</span>
                <span className="vehicle-modal__spec-value">{vehicle.rate}</span>
              </div>
            </div>

            <div className="vehicle-modal__features">
              <h3 className="vehicle-modal__section-title">Características</h3>
              <ul className="vehicle-modal__feature-list">
                {vehicle.features.map((feature, index) => (
                  <li key={index} className="vehicle-modal__feature-item">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M17.5 5.5L8.5 15L3.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="vehicle-modal__calendar-section">
              <h3 className="vehicle-modal__section-title">Disponibilidad</h3>
              
              <div className="vehicle-modal__calendar-header">
                <h4 className="vehicle-modal__calendar-title">
                  {MONTHS[currentMonth]} {currentYear}
                </h4>
                <div className="vehicle-modal__calendar-controls">
                  <button className="vehicle-modal__calendar-btn" onClick={previousMonth} aria-label="Mes anterior">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="vehicle-modal__calendar-btn" onClick={nextMonth} aria-label="Siguiente mes">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="vehicle-modal__calendar-legend">
                <div className="vehicle-modal__legend-item">
                  <div className="vehicle-modal__legend-dot vehicle-modal__legend-dot--available" />
                  <span>Disponible</span>
                </div>
                <div className="vehicle-modal__legend-item">
                  <div className="vehicle-modal__legend-dot vehicle-modal__legend-dot--occupied" />
                  <span>Ocupado</span>
                </div>
              </div>

              <div className="vehicle-modal__calendar-weekdays">
                {DAYS.map(day => (
                  <div key={day} className="vehicle-modal__calendar-weekday">{day}</div>
                ))}
              </div>

              <div className="vehicle-modal__calendar-grid">
                {renderCalendarDays()}
              </div>
            </div>

            <div className="vehicle-modal__actions">
              <Button
                variant="primary"
                size="lg"
                className="vehicle-modal__action-btn"
                onClick={() => navigate('/calendario')}
              >
                Reservar {vehicle.name}
              </Button>
              <Button variant="ghost" size="lg" className="vehicle-modal__action-btn" onClick={onClose}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default VehicleModal
