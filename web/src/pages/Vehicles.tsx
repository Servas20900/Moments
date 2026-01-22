import { useEffect, useState } from 'react'
import VehicleCard from '../components/VehicleCard'
import VehicleModal from '../components/VehicleModal'
import { Layout, PageHeader, Section } from '../layout'
import type { Vehicle } from '../data/content'
import { fetchVehicles } from '../api/api'

const Vehicles = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [list, setList] = useState<Vehicle[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchVehicles().then((v) => mounted && setList(v))
    return () => { mounted = false }
  }, [])

  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedVehicle(null), 300)
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Flota Premium"
        title="Lujo, confort y disponibilidad garantizada"
        description="Cada vehículo está seleccionado por su elegancia, confort y performance. Consulta disponibilidad en tiempo real y reserva con confianza."
      />

      <Section spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 md:gap-6 items-stretch">
          {list.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => handleCardClick(vehicle)}
            />
          ))}
        </div>
      </Section>

      <VehicleModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  )
}

export default Vehicles
