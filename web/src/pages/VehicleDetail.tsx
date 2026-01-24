import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, PageHeader, Section } from '../components/Layout';
import SafeImage from '../components/SafeImage';
import Button from '../components/Button';
import type { Vehicle } from '../data/content';
import { fetchVehicles } from '../api/api';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchVehicles().then((vehicles) => {
      if (!mounted) return;
      const found = vehicles.find((v: Vehicle) => v.id === id);
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
        <div className="mb-6">
          <Button
            variant="ghost"
            className="px-4 py-2 text-sm text-gray-300 border border-white/10 hover:bg-white/5 rounded-lg"
            onClick={() => navigate('/vehiculos')}
          >
            ← Volver a vehículos
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Galería de imágenes */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
              <SafeImage
                className="w-full h-64 object-cover"
                src={vehicle.imageUrl}
                alt={vehicle.name}
                transformHeight={400}
              />
            </div>
            {/* Aquí se puede expandir a galería si hay más imágenes */}
          </div>
          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">{vehicle.name}</h2>
              <div className="flex gap-3 mb-2">
                <span className="inline-block rounded-full bg-amber-400/15 px-3 py-1 text-amber-300 text-xs font-semibold">{vehicle.category}</span>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-white text-xs font-semibold">Capacidad: {vehicle.seats} personas</span>
              </div>
              {/* No hay descripción en el modelo Vehicle, así que mostramos un texto fijo o se puede agregar un campo si se requiere en el futuro */}
              <p className="text-gray-300 text-base whitespace-pre-line">{`Vehículo premium para experiencias exclusivas.`}</p>
            </div>
            <Button
              variant="primary"
              className="w-fit"
              onClick={() => navigate(`/paquetes?vehiculo=${vehicle.id}`)}
            >
              Ver paquetes disponibles
            </Button>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default VehicleDetail;
