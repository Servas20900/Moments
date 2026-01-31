import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import type { VehicleView } from '../data/content';
import { fetchVehicles } from '../api/api';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchVehicles().then((vehicles) => {
      if (!mounted) return;
      const found = vehicles.find((v) => v.id === id);
      setVehicle(found || null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Cargando vehículo...</div>
        </div>
      </Layout>
    );
  }

  if (!vehicle) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Vehículo"
          title="No encontrado"
          description="No se encontró el vehículo solicitado."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Detalle de vehículo"
        title={vehicle.name}
        description={vehicle.category}
      />
      <Section spacing="lg">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <Button
            variant="ghost"
            className="px-4 py-2 text-sm text-gray-200 border border-white/10 hover:bg-white/5 rounded-lg"
            onClick={() => navigate('/vehiculos')}
          >
            ← Volver a vehículos
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-100">{vehicle.category}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-900/40 border border-sky-400/30 px-3 py-1 text-xs font-semibold text-sky-100">{vehicle.seats} asientos</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-100">{vehicle.rate || 'Consultar'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 shadow-xl">
              <SafeImage
                className="w-full h-80 object-cover"
                src={vehicle.imageUrl}
                alt={vehicle.name}
                transformHeight={420}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">{vehicle.name}</h2>
                  <p className="text-gray-300 text-base">Vehículo premium preparado para experiencias privadas.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Tarifa</p>
                  <p className="text-3xl font-bold text-emerald-200">{vehicle.rate || 'Consultar'}</p>
                  <p className="text-xs text-amber-200 mt-1">Solicita tu cotización</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Asientos</p>
                  <p className="text-lg font-semibold text-white">{vehicle.seats}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Categoría</p>
                  <p className="text-lg font-semibold text-white">{vehicle.category}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Estado</p>
                  <p className="text-lg font-semibold text-emerald-200">Disponible</p>
                </div>
              </div>

              {vehicle.features?.length ? (
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white mb-2">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((f, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-gray-100">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-800/80 p-6 space-y-4 shadow-xl">
              <div>
                <p className="text-sm text-gray-400">Tarifa estimada</p>
                <p className="text-4xl font-bold text-emerald-200">{vehicle.rate || 'Consultar'}</p>
                <p className="text-xs text-amber-200 mt-1">Precio final según ruta y horas</p>
              </div>
              <div className="space-y-2 text-sm text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Asientos</span>
                  <span className="text-white font-semibold">{vehicle.seats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categoría</span>
                  <span className="text-white font-semibold">{vehicle.category}</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/paquetes?vehiculo=${vehicle.id}`)}
              >
                Ver paquetes disponibles
              </Button>
              <p className="text-xs text-gray-400 leading-relaxed">Cuéntanos tu ruta y horario para enviarte la cotización exacta.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-gray-200">
              <p className="font-semibold text-white">¿Necesitas ayuda?</p>
              <p className="text-gray-300">Te asesoramos con el mejor vehículo según tu evento, horario y capacidad.</p>
              <Button variant="ghost" className="w-full">Hablar con un asesor</Button>
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  );
};

export default VehicleDetail;
