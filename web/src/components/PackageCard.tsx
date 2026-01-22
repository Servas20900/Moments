import type { Package } from '../data/content'
import SafeImage from './SafeImage'

interface PackageCardProps {
  item: Package
  onClick: () => void
}

const PackageCard = ({ item, onClick }: PackageCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-[var(--color-surface)] border border-[rgba(201,162,77,0.12)] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-strong hover:border-[rgba(201,162,77,0.3)] hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Image Wrapper */}
      <div className="relative w-full aspect-video overflow-hidden">
        <SafeImage 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          src={item.imageUrl}
          alt={`${item.category} - ${item.name}`}
        />
        {/* Badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-[rgba(11,12,16,0.92)] backdrop-blur-[10px] border border-[rgba(201,162,77,0.3)] rounded-sm font-semibold text-xs text-[#c9a24d] uppercase tracking-widest">
          {item.category}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5.5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg font-bold">{item.name}</h3>
          <span className="text-lg font-bold text-[#c9a24d] whitespace-nowrap">${item.price}</span>
        </div>
        
        {/* Description */}
        <p className="m-0 mb-2 text-gray-400 text-sm leading-snug line-clamp-2">{item.description}</p>
        
        {/* Meta */}
        <div className="flex flex-col gap-1 pt-2 border-t border-white/10 text-xs mt-auto mb-2">
          <span className="text-white font-semibold">{item.vehicle}</span>
          <span className="text-gray-400">Hasta {item.maxPeople} personas</span>
        </div>
        
        {/* CTA Button */}
        <button className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[rgba(201,162,77,0.08)] border border-[rgba(201,162,77,0.2)] rounded-md text-[#c9a24d] font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(201,162,77,0.15)] hover:border-[rgba(201,162,77,0.4)]">
          Ver detalles
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PackageCard
