import { useState } from 'react'
import VehicleCard from '../components/VehicleCard'
import VehicleModal from '../components/VehicleModal'
import { vehicles } from '../data/content'
import type { Vehicle } from '../data/content'

const Vehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedVehicle(null), 300)
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Flota Premium</p>
        <h1 className="display">Lujo, confort y disponibilidad garantizada</h1>
        <p className="section__copy">Cada vehículo está seleccionado por su elegancia, confort y performance. Consulta disponibilidad en tiempo real y reserva con confianza.</p>
      </header>

      <section className="section">
        <div className="grid vehicles">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => handleCardClick(vehicle)}
            />
          ))}
        </div>
      </section>

      <VehicleModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Vehicles
