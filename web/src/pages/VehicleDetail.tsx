import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import { SkeletonDetail } from '../components/SkeletonLoader';
import type { VehicleView } from '../data/content';
import { fetchVehicles } from '../api/api';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchVehicles()
      .then((vehicles) => {
        if (!mounted) return;
        const found = vehicles.find((v) => v.id === id);
        setVehicle(found || null);
        setLoading(false);
        if (!found) setError('Vehículo no encontrado');
      })
      .catch(() => mounted && (setError('No se pudo cargar el vehículo'), setLoading(false)));
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Section spacing="lg">
          <SkeletonDetail showImage />
        </Section>
      </Layout>
    );
  }

  if (error || !vehicle) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Vehículo"
          title="No encontrado"
          description={error || 'No se encontró el vehículo solicitado.'}
        />
        <Section spacing="lg">
          <div className="text-center py-8">
            <Button
              onClick={() => navigate('/vehiculos')}
              aria-label="Volver"
            >
              Volver a vehículos
            </Button>
          </div>
        </Section>
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
            className="px-4 py-2 text-sm text-gray-200 dark:text-gray-200 border border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg hover:text-gray-100 dark:hover:text-gray-100"
            onClick={() => navigate('/vehiculos')}
          >
            ← Volver a vehículos
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-300 dark:text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-100">{vehicle.category}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-sky-900/40 border border-blue-300 dark:border-sky-400/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-sky-100">{vehicle.seats} asientos</span>
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

              </div>

              {vehicle.features?.length ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Características incluidas</h3>
                  <p className="text-sm text-gray-300 mb-3">Este vehículo incluye las características y comodidades detalladas a continuación.</p>
                  <ul className="space-y-1 text-sm text-gray-100">
                    {vehicle.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-800/80 p-6 space-y-4 shadow-xl">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Asientos</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{vehicle.seats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categoría</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{vehicle.category}</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/paquetes?vehiculo=${vehicle.id}`)}
              >
                Ver paquetes disponibles
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Cuéntanos tu ruta y horario para enviarte la cotización exacta.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 space-y-2 text-sm text-gray-600 dark:text-gray-200">
              <p className="font-semibold text-gray-900 dark:text-white">¿Necesitas ayuda?</p>
              <p className="text-gray-700 dark:text-gray-300">Te asesoramos con el mejor vehículo según tu evento, horario y capacidad.</p>
              <Button variant="ghost" className="w-full">Hablar con un asesor</Button>
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  );
};

export default VehicleDetail;
