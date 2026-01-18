import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Package } from '../data/content'
import Button from './Button'
import SafeImage from './SafeImage'

interface PackageModalProps {
  package: Package
  isOpen: boolean
  onClose: () => void
}

const PackageModal = ({ package: pkg, isOpen, onClose }: PackageModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const navigate = useNavigate()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="package-modal" onClick={onClose}>
      <div className="package-modal__backdrop" />
      
      <div className="package-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="package-modal__close" onClick={onClose} aria-label="Cerrar modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="package-modal__image-wrapper">
          <SafeImage 
            src={pkg.imageUrl}
            alt={`${pkg.category} - ${pkg.name}`}
            className="package-modal__image"
          />
          <div className="package-modal__badge">{pkg.category}</div>
        </div>

        <div className="package-modal__content">
          <div className="package-modal__header">
            <div>
              <h2 className="package-modal__title">{pkg.name}</h2>
              <p className="package-modal__description">{pkg.description}</p>
            </div>
            <div className="package-modal__price-tag">
              <span className="package-modal__price-label">Desde</span>
              <span className="package-modal__price">${pkg.price}</span>
            </div>
          </div>

          <div className="package-modal__details">
            <div className="package-modal__detail-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C6.13401 2 3 5.13401 3 9C3 12.866 6.13401 16 10 16C13.866 16 17 12.866 17 9C17 5.13401 13.866 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6V9L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <span className="package-modal__detail-label">Vehículo</span>
                <span className="package-modal__detail-value">{pkg.vehicle}</span>
              </div>
            </div>

            <div className="package-modal__detail-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 16C3 13.2386 5.68629 11 9 11H11C14.3137 11 17 13.2386 17 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <span className="package-modal__detail-label">Capacidad</span>
                <span className="package-modal__detail-value">Hasta {pkg.maxPeople} personas</span>
              </div>
            </div>
          </div>

          <div className="package-modal__includes">
            <h3 className="package-modal__includes-title">Incluye</h3>
            <ul className="package-modal__includes-list">
              {pkg.includes.map((item, index) => (
                <li key={index} className="package-modal__includes-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#c9a24d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {pkg.addons && (
            <div className="package-modal__addons">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{pkg.addons}</span>
            </div>
          )}

          <div className="package-modal__actions">
            <Button variant="primary" onClick={() => navigate('/paquetes')}>
              Reservar este paquete
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Seguir explorando
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageModal
