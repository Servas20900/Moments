import { useEffect, useState } from 'react'
import PackageCard from '../components/PackageCard'
import PackageModal from '../components/PackageModal'
import type { Package } from '../data/content'
import { fetchPackages } from '../api/api'

const Packages = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    let mounted = true
    fetchPackages().then((p) => mounted && setPackages(p))
    return () => { mounted = false }
  }, [])

  const categories = Array.from(new Set(packages.map(pkg => pkg.category)))

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Paquetes Moments</p>
        <h1 className="display">Diseñados para eventos que no admiten improvisación</h1>
        <p className="section__copy">
          Selecciona el paquete que mejor se ajusta a tu evento. Todos incluyen chofer profesional, 
          atención personalizada y la garantía Moments.
        </p>
      </header>

      {categories.map((category) => (
        <section key={category} className="section">
          <div className="section__header">
            <h2 className="heading">{category}</h2>
          </div>
          
          <div className="packages-grid">
            {packages
              .filter((pkg) => pkg.category === category)
              .map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  item={pkg} 
                  onClick={() => setSelectedPackage(pkg)}
                />
              ))}
          </div>
        </section>
      ))}

      <PackageModal 
        package={selectedPackage!}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
      />
    </div>
  )
}

export default Packages
