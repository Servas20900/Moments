import type { Vehicle } from '../data/content'
import SafeImage from './SafeImage'

interface VehicleCardProps {
  vehicle: Vehicle
  onClick: () => void
}

const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="vehicle-card__image-wrapper">
        <SafeImage
          className="vehicle-card__image"
          src={vehicle.imageUrl}
          alt={vehicle.name}
        />
        <div className="vehicle-card__badge">{vehicle.seats} pasajeros</div>
      </div>

      <div className="vehicle-card__content">
        <div>
          <h3 className="vehicle-card__title">{vehicle.name}</h3>
          <p className="vehicle-card__category">{vehicle.category}</p>
          <p className="vehicle-card__rate">{vehicle.rate}</p>

          <div className="vehicle-card__features">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="vehicle-card__feature">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="vehicle-card__cta">
          Ver disponibilidad
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8H12.5M12.5 8L9.5 5M12.5 8L9.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default VehicleCard
