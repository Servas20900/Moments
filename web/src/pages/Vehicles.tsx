import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import Card from '../components/Card'
import { Layout, PageHeader, Section } from '../components/Layout'
import type { Vehicle } from '../data/content'
import { fetchVehicles } from '../api/api'
import { SkeletonGrid } from '../components/SkeletonLoader'

const Vehicles = () => {
  const [list, setList] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchVehicles()
      .then((v) => mounted && (setList(v), setLoading(false)))
      .catch(() => mounted && (setError('No se pudieron cargar los vehículos'), setLoading(false)));
    return () => { mounted = false; };
  }, []);

  const handleCardClick = (vehicle: Vehicle) => {
    navigate(`/vehiculos/${vehicle.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <Section spacing="lg">
          <Card>
            <p className="text-base text-gray-300 leading-relaxed max-w-3xl">
              Cada vehículo está seleccionado por su elegancia, confort y performance. 
              Consulta disponibilidad en tiempo real y reserva con confianza.
            </p>
          </Card>
        </Section>
        <Section spacing="lg">
          <SkeletonGrid count={6} showImage />
        </Section>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Section spacing="lg">
          <Card>
            <h2 className="text-3xl font-semibold text-white leading-tight">
              Lujo, confort y disponibilidad garantizada
            </h2>

            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              Cada vehículo está seleccionado por su elegancia, confort y performance.
              Consulta disponibilidad en tiempo real y reserva con confianza.
            </p>
          </Card>
        </Section>

        <Section spacing="lg">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
            <p className="text-red-200 font-semibold">{error}</p>
            <button
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchVehicles()
                  .then((v) => (setList(v), setLoading(false)))
                  .catch(() => setError('No se pudieron cargar los vehículos'))
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        </Section>
      </Layout>
    )
  }

  const categories = Array.from(new Set(list.map((v) => v.category))).sort()

  return (
    <Layout>
      <PageHeader
        eyebrow="Flota Premium"
        title="Lujo, confort y disponibilidad garantizada"
      />

      <Section spacing="lg">
        <div className="mb-16">
          <Card>
            <p className="text-gray-300">
              Cada vehículo está seleccionado por su elegancia, confort y performance.
              Consulta disponibilidad en tiempo real y reserva con confianza.
            </p>
          </Card>
        </div>
      </Section>


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
