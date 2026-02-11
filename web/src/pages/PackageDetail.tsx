import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import { SkeletonDetail } from '../components/SkeletonLoader';
import type { PackageView } from '../data/content';
import { fetchPackages } from '../api/api';
import { useReservation } from '../contexts/ReservationContext';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startReservation } = useReservation();
  const [pkg, setPkg] = useState<PackageView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPackages()
      .then((packages) => {
        if (!mounted) return;
        const found = packages.find((p) => p.id === id);
        setPkg(found || null);
        setLoading(false);
        if (!found) setError('Paquete no encontrado');
      })
      .catch(() => mounted && (setError('No se pudo cargar el paquete'), setLoading(false)));
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

  if (error || !pkg) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Paquete"
          title="No encontrado"
          description={error || 'No se encontró el paquete solicitado.'}
        />
        <Section spacing="lg">
          <div className="text-center py-8">
            <Button
              onClick={() => navigate('/paquetes')}
              aria-label="Volver"
            >
              Volver a paquetes
            </Button>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Detalle de paquete"
        title={pkg.name}
        description={pkg.category}
      />
      <Section spacing="lg">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <Button
            variant="ghost"
            className="px-4 py-2 text-sm text-gray-200 dark:text-gray-200 border border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg hover:text-gray-100 dark:hover:text-gray-100"
            onClick={() => navigate('/paquetes')}
          >
            ← Volver a paquetes
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-100">{pkg.category}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-sky-900/40 border border-blue-300 dark:border-sky-400/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-sky-100">Capacidad {pkg.maxPeople}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-emerald-900/40 border border-green-300 dark:border-emerald-400/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-emerald-100">${pkg.price}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hero principal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 shadow-xl">
              <SafeImage
                className="w-full h-80 object-cover"
                src={pkg.imageUrl}
                alt={pkg.name}
                transformHeight={420}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{pkg.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-base whitespace-pre-line">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Desde</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-200">${pkg.price}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">Adelanto 50% para confirmar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Capacidad</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.maxPeople} personas</p>
                </div>
                <div className="rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Anticipo</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">50% para reservar</p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Qué incluye este paquete?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Este paquete incluye los servicios detallados a continuación, coordinados según la fecha y disponibilidad seleccionadas.</p>
                  <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-100">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {pkg.addons && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No incluye</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{pkg.addons}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-900/40 p-4 space-y-2">
                <h3 className="text-base font-semibold text-sky-900 dark:text-sky-100">Consumo incluido</h3>
                <p className="text-sm text-sky-800 dark:text-sky-100/90">Consumo a elegir según disponibilidad:</p>
                <ul className="space-y-1 text-sm text-sky-800 dark:text-sky-100/80 ml-4">
                  <li>• Opciones con alcohol y sin alcohol</li>
                  <li>• Opciones de snacks, entre otras cosas</li>
                </ul>
                <p className="text-xs text-sky-700 dark:text-sky-100/70 mt-2">Las opciones finales se confirman durante la coordinación del servicio.</p>
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-900/40 p-4 space-y-2">
                <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">Cobertura GAM</h3>
                <p className="text-sm text-amber-800 dark:text-amber-100/90">
                  Nuestros paquetes estándar aplican dentro del Gran Área Metropolitana
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-100/90">
                  Para servicios fuera del GAM o para coordinaciones especiales el servicio se gestiona de forma personalizada. En estos casos, es necesario contactarnos directamente para validar disponibilidad, coordinar los detalles del evento y proceder con el cobro correspondiente.
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-100/90">
                  La reserva se confirma únicamente tras la coordinación con nuestro equipo y el pago del adelanto requerido.
                </p>
              </div>

              {pkg.vehicles?.length ? (
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Vehículos disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.vehicles.map((v) => (
                      <span key={v.id} className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-1 text-sm text-gray-700 dark:text-gray-100">
                        {v.name}
                        <span className="text-xs text-gray-500 dark:text-gray-400">· {v.seats} asientos</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-800/80 p-6 space-y-4 shadow-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Precio desde</p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-200">${pkg.price}</p>
                <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">Adelanto 50% para confirmar</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Capacidad</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{pkg.maxPeople} personas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categoría</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{pkg.category}</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  startReservation(pkg);
                  navigate('/reservar', { state: { packageId: pkg.id } });
                }}
              >
                Continuar reserva
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Podrás elegir fecha, extras y confirmar tu anticipo en el siguiente paso.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 space-y-2 text-sm text-gray-600 dark:text-gray-200">
              <p className="font-semibold text-gray-900 dark:text-white">¿Tienes dudas?</p>
              <p className="text-gray-700 dark:text-gray-300">Contáctanos para ajustar horarios, rutas o necesidades especiales.</p>
              <Button variant="ghost" className="w-full">Contáctenos</Button>
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  );
};

export default PackageDetail;
