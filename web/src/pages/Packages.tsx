import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PackageCard from '../components/PackageCard'
import { Layout, PageHeader, Section } from '../components/Layout'
import type { PackageView } from '../data/content'
import { fetchPackages } from '../api/api'

const Packages = () => {
  const [packages, setPackages] = useState<PackageView[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchPackages().then((p) => mounted && setPackages(p));
    return () => { mounted = false; };
  }, []);

  const categories = Array.from(new Set(packages.map(pkg => pkg.category))).sort();

  return (
    <Layout>
      <PageHeader
        eyebrow="Paquetes Moments"
        title="Diseñados para eventos que no admiten improvisación"
        description="Bodas, graduaciones, conciertos, eventos corporativos. Cada paquete incluye coordinación completa, conductor profesional y soporte 24/7 el día del evento."
      />

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
