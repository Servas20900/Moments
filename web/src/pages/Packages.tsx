import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PackageCard from '../components/PackageCard'
import { Layout, PageHeader, Section } from '../layout'
import type { Package } from '../data/content'
import { fetchPackages } from '../api/api'

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchPackages().then((p) => mounted && setPackages(p));
    return () => { mounted = false; };
  }, []);

  const categories = Array.from(new Set(packages.map(pkg => pkg.category)));

  return (
    <Layout>
      <PageHeader
        eyebrow="Paquetes Moments"
        title="Diseñados para eventos que no admiten improvisación"
        description="Bodas, graduaciones, conciertos, eventos corporativos. Cada paquete incluye coordinación completa, conductor profesional y soporte 24/7 el día del evento."
      />

      {categories.map((category) => (
        <Section key={category} spacing="lg">
          <div className="mb-0">
            <h2 className="heading">{category}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-8 md:gap-6 items-stretch">
            {packages
              .filter((pkg) => pkg.category === category)
              .map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  item={pkg}
                  onClick={() => navigate(`/paquetes/${pkg.id}`)}
                />
              ))}
          </div>
        </Section>
      ))}
    </Layout>
  )
}

export default Packages
