import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import { Layout, PageHeader, Section } from '../components/Layout'
import type { Vehicle } from '../data/content'
import { fetchVehicles } from '../api/api'

const Vehicles = () => {
  const [list, setList] = useState<Vehicle[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchVehicles().then((v) => mounted && setList(v));
    return () => { mounted = false; };
  }, []);

  const handleCardClick = (vehicle: Vehicle) => {
    navigate(`/vehiculos/${vehicle.id}`);
  };

  const categories = Array.from(new Set(list.map((v) => v.category))).sort()

  return (
    <Layout>
      <PageHeader
        eyebrow="Flota Premium"
        title="Lujo, confort y disponibilidad garantizada"
        description="Cada vehículo está seleccionado por su elegancia, confort y performance. Consulta disponibilidad en tiempo real y reserva con confianza."
      />

      {categories.map((cat) => {
        const items = list.filter((v) => v.category === cat)
        return (
          <Section key={cat} spacing="lg">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-100">{cat}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-gray-200">{items.length} vehículos</span>
              </div>
              <span className="text-sm text-gray-400">Conductores certificados · Seguro incluido</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 md:gap-6 items-stretch">
              {items.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => handleCardClick(vehicle)}
                />
              ))}
            </div>
          </Section>
        )
      })}
    </Layout>
  );
}

export default Vehicles
