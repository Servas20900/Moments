import type { Vehicle } from '../data/content'
import SafeImage from './SafeImage'

interface VehicleCardProps {
  vehicle: Vehicle
  onClick: () => void
}

const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col bg-[var(--color-surface)] border border-[rgba(201,162,77,0.15)] rounded-lg overflow-hidden transition-all duration-300 cursor-pointer hover:border-[rgba(201,162,77,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1 h-full"
    >
      {/* Image Wrapper */}
      <div className="relative overflow-hidden aspect-video">
        <SafeImage
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={vehicle.imageUrl}
          alt={vehicle.name}
        />
        {/* Badge */}
        <div className="absolute top-3 right-3 bg-[rgba(0,0,0,0.7)] backdrop-blur-[12px] border border-[rgba(201,162,77,0.3)] px-3 py-2 rounded-md text-sm font-semibold text-[#c9a24d]">
          {vehicle.seats} pasajeros
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 gap-4.5">
        <div>
          <h3 className="m-0 font-bold text-xl">{vehicle.name}</h3>
          <p className="m-0 text-gray-400 text-sm">{vehicle.category}</p>
          <p className="m-0 text-lg font-bold text-[#c9a24d]">{vehicle.rate}</p>

          <div className="flex flex-col gap-2 mt-auto">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#c9a24d] flex-shrink-0">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#c9a24d] border-none rounded-md text-[var(--color-bg)] font-bold cursor-pointer transition-all duration-300 mt-3 hover:bg-[#d4b05f] hover:translate-x-1">
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
