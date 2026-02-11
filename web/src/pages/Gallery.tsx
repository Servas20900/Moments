import { useEffect, useState } from 'react'
import SafeImage from '../components/SafeImage'
import { Layout, PageHeader, Section } from '../components/Layout'
import { fetchSystemImages } from '../api/api'
import type { SystemImage } from '../data/content'

const Gallery = () => {
  const [images, setImages] = useState<SystemImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchSystemImages().then((imgs) => {
      if (mounted) {
        const galleryImages = imgs.filter(img => img.isActive)
        setImages(galleryImages)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [])

  const filteredImages = images

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-16 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">Galería</span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">Nuestras experiencias</h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Cargando galería...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Galería"
        title="Algunas experiencias hablan por sí solas"
        description="Nuestra galería muestra momentos reales coordinados por Moments, reflejando el estilo, la elegancia y la atención al detalle de cada servicio."
      />

      <Section spacing="lg">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.length === 0 ? (
            <div className="col-span-full flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12">
              <p className="text-gray-400">No hay imágenes disponibles en esta categoría</p>
            </div>
          ) : (
            filteredImages.map((img) => (
              <div 
                key={img.id} 
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-lg transition-all hover:border-white/20 hover:shadow-2xl"
              >
                <div className="aspect-square overflow-hidden bg-black/30">
                  <SafeImage
                    src={img.url}
                    alt={img.altText || img.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="text-base font-semibold text-white">{img.name}</h3>
                  {img.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{img.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Section>
    </Layout>
  )
}

export default Gallery
