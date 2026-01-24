import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import type { Package } from '../data/content';
import { fetchPackages } from '../api/api';

const legalNotice = 'Requiere adelanto del 50% no reembolsable';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchPackages().then((packages) => {
      if (!mounted) return;
      const found = packages.find((p: Package) => p.id === id);
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
        <div className="mb-6">
          <Button
            variant="ghost"
            className="px-4 py-2 text-sm text-gray-300 border border-white/10 hover:bg-white/5 rounded-lg"
            onClick={() => navigate('/paquetes')}
          >
            ← Volver a paquetes
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Hero principal */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
              <SafeImage
                className="w-full h-64 object-cover"
                src={pkg.imageUrl}
                alt={pkg.name}
                transformHeight={400}
              />
            </div>
            {/* Galería secundaria: si hay más imágenes, aquí se pueden mostrar */}
          </div>
          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">{pkg.name}</h2>
              <div className="flex gap-3 mb-2">
                <span className="inline-block rounded-full bg-amber-400/15 px-3 py-1 text-amber-300 text-xs font-semibold">{pkg.category}</span>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-white text-xs font-semibold">Capacidad: {pkg.maxPeople} personas</span>
                <span className="inline-block rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300 text-xs font-semibold">${pkg.price}</span>
              </div>
              <p className="text-gray-300 text-base whitespace-pre-line mb-4">{pkg.description}</p>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Incluye</h3>
                <ul className="list-disc list-inside text-gray-200 text-sm">
                  {pkg.includes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              {/* Aquí podrías mostrar "No incluye" si hay un campo addons o similar */}
              {pkg.addons && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">No incluye</h3>
                  <p className="text-gray-400 text-sm whitespace-pre-line">{pkg.addons}</p>
                </div>
              )}
              <div className="mt-2 mb-4">
                <span className="inline-block rounded bg-amber-200/20 text-amber-400 px-3 py-1 text-xs font-semibold">{legalNotice}</span>
              </div>
            </div>
            <Button
              variant="primary"
              className="w-fit"
              onClick={() => alert('Continuar reserva (placeholder)')}
            >
              Continuar reserva
            </Button>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default PackageDetail;
