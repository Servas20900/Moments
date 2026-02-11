import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PackageCard from '../components/PackageCard'
import Card from '../components/Card'
import { Layout, PageHeader, Section } from '../components/Layout'
import type { PackageView } from '../data/content'
import { fetchPackages } from '../api/api'
import { SkeletonGrid } from '../components/SkeletonLoader'

const Packages = () => {
  const [packages, setPackages] = useState<PackageView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchPackages()
      .then((p) => mounted && (setPackages(p), setLoading(false)))
      .catch(() => mounted && (setError('No se pudieron cargar los paquetes'), setLoading(false)));
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Paquetes Moments"
          title="Diseñados para distintos eventos y celebraciones"
        />
        <Section spacing="lg">
          <SkeletonGrid count={6} showImage />
        </Section>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Paquetes Moments"
          title="Diseñados para distintos eventos y celebraciones"
        />
        <Section spacing="lg">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
            <p className="text-red-200 font-semibold">{error}</p>
            <button
              onClick={() => {
                setLoading(true)
                setError(null)
                fetchPackages()
                  .then((p) => (setPackages(p), setLoading(false)))
                  .catch(() => setError('No se pudieron cargar los paquetes'))
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

  const categories = Array.from(new Set(packages.map(pkg => pkg.category))).sort();

  return (
    <Layout>
      <PageHeader
        eyebrow="Paquetes Moments"
        title="Diseñados para distintos eventos y celebraciones"
      />

      <Section spacing="lg">
        <div className="mx-auto max-w-6xl px-4 mb-16">
          <Card title="Nuestros paquetes" subtitle="Diseñados para distintos eventos">
            <p className="text-gray-300">
              Todos los paquetes requieren un adelanto del 50% para reservar la fecha.
            </p>
            <p className="text-gray-300 mt-3">
              También puedes optar por pagar el 100% desde el inicio.
            </p>
          </Card>
        </div>
      </Section>

      {categories.map((category) => {
        const list = packages.filter((pkg) => pkg.category === category)
        return (
          <Section key={category} spacing="lg">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-100">{category}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-gray-200">{list.length} opciones</span>
              </div>
              <span className="text-sm text-gray-400">Coordinación incluida · Anticipo 50%</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 md:gap-6 items-stretch">
              {list.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  item={pkg}
                  onClick={() => navigate(`/paquetes/${pkg.id}`)}
                />
              ))}
            </div>
          </Section>
        )
      })}
    </Layout>
  )
}

export default Packages
