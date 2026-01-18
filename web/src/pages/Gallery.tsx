import { useEffect, useState } from 'react'
import SafeImage from '../components/SafeImage'
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
      <div className="page">
        <header className="section">
          <p className="eyebrow">Galería</p>
          <h1 className="display">Nuestras experiencias</h1>
        </header>
        <div className="gallery-loading">
          <p>Cargando galería...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Galería</p>
        <h1 className="display">Nuestras experiencias</h1>
        <p className="section__copy">
          Cada momento especial capturado a través de nuestro servicio de lujo. Conoce los eventos que hemos tenido el privilegio de acompañar.
        </p>
      </header>

      <section className="section">
        <div className="gallery-grid">
          {filteredImages.length === 0 ? (
            <div className="gallery-empty">
              <p className="gallery-empty__text">No hay imágenes disponibles en esta categoría</p>
            </div>
          ) : (
            filteredImages.map((img) => (
              <div key={img.id} className="gallery-card">
                <div className="gallery-card__image">
                  <SafeImage
                    src={img.url}
                    alt={img.altText || img.name}
                  />
                </div>
                <div className="gallery-card__info">
                  <h3 className="gallery-card__title">{img.name}</h3>
                  {img.description && (
                    <p className="gallery-card__description">{img.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default Gallery
