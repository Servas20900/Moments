import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import type { PackageView } from '../data/content';
import { fetchPackages } from '../api/api';
import { useReservation } from '../contexts/ReservationContext';

const legalNotice = 'Requiere adelanto del 50% no reembolsable';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startReservation } = useReservation();
  const [pkg, setPkg] = useState<PackageView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPackages().then((packages) => {
      if (!mounted) return;
      const found = packages.find((p) => p.id === id);
      setPkg(found || null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Cargando paquete...</div>
        </div>
      </Layout>
    );
  }

  if (!pkg) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Paquete"
          title="No encontrado"
          description="No se encontró el paquete solicitado."
        />
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
            className="px-4 py-2 text-sm text-gray-200 border border-white/10 hover:bg-white/5 rounded-lg"
            onClick={() => navigate('/paquetes')}
          >
            ← Volver a paquetes
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-100">{pkg.category}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-900/40 border border-sky-400/30 px-3 py-1 text-xs font-semibold text-sky-100">Capacidad {pkg.maxPeople}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-100">${pkg.price}</span>
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

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">{pkg.name}</h2>
                  <p className="text-gray-300 text-base whitespace-pre-line">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Desde</p>
                  <p className="text-3xl font-bold text-emerald-200">${pkg.price}</p>
                  <p className="text-xs text-amber-200 mt-1">{legalNotice}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Capacidad</p>
                  <p className="text-lg font-semibold text-white">{pkg.maxPeople} personas</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Anticipo</p>
                  <p className="text-lg font-semibold text-white">50% para reservar</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Estado</p>
                  <p className="text-lg font-semibold text-emerald-200">Disponible</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Incluye</h3>
                  <ul className="space-y-1 text-sm text-gray-100">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {pkg.addons && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">No incluye</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{pkg.addons}</p>
                  </div>
                )}
              </div>

              {pkg.vehicles?.length ? (
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white mb-2">Vehículos disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {pkg.vehicles.map((v) => (
                      <span key={v.id} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-gray-100">
                        {v.name}
                        <span className="text-xs text-gray-400">· {v.seats} asientos</span>
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
                <p className="text-sm text-gray-400">Precio desde</p>
                <p className="text-4xl font-bold text-emerald-200">${pkg.price}</p>
                <p className="text-xs text-amber-200 mt-1">Adelanto 50% para confirmar</p>
              </div>
              <div className="space-y-2 text-sm text-gray-200">
                <div className="flex items-center justify-between">
                  <span>Capacidad</span>
                  <span className="text-white font-semibold">{pkg.maxPeople} personas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categoría</span>
                  <span className="text-white font-semibold">{pkg.category}</span>
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
              <p className="text-xs text-gray-400 leading-relaxed">Podrás elegir fecha, extras y confirmar tu anticipo en el siguiente paso.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-gray-200">
              <p className="font-semibold text-white">¿Tienes dudas?</p>
              <p className="text-gray-300">Contáctanos para ajustar horarios, rutas o necesidades especiales.</p>
              <Button variant="ghost" className="w-full">Escríbenos</Button>
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  );
};

export default PackageDetail;
