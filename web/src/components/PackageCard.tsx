import type { Package } from '../data/content'
import SafeImage from './SafeImage'

interface PackageCardProps {
  item: Package
  onClick: () => void
}

const PackageCard = ({ item, onClick }: PackageCardProps) => {
  return (
    <div className="package-card" onClick={onClick}>
      <div className="package-card__image-wrapper">
        <SafeImage 
          className="package-card__image" 
          src={item.imageUrl}
          alt={`${item.category} - ${item.name}`}
        />
        <div className="package-card__badge">{item.category}</div>
      </div>
      
      <div className="package-card__content">
        <div className="package-card__header">
          <h3 className="package-card__title">{item.name}</h3>
          <span className="package-card__price">${item.price}</span>
        </div>
        
        <p className="package-card__description">{item.description}</p>
        
        <div className="package-card__meta">
          <span className="package-card__vehicle">{item.vehicle}</span>
          <span className="package-card__capacity">Hasta {item.maxPeople} personas</span>
        </div>
        
        <button className="package-card__cta">
          Ver detalles
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PackageCard
