export type Package = {
  id: string
  category: string
  name: string
  description: string
  price: number
  vehicle: string
  maxPeople: number
  includes: string[]
  imageUrl: string
  addons?: string
}

export type Vehicle = {
  id: string
  name: string
  category: string
  seats: number
  rate: string
  features: string[]
  imageUrl: string
}

export type CalendarSlot = {
  id: string
  date: string
  status: 'ocupado' | 'disponible' | 'evento'
  title: string
  detail?: string
  tag?: string
  imageUrl?: string
}

export type Experience = {
  id: string
  title: string
  imageUrl: string
}

export type HeroSlide = {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  order: number
  isActive: boolean
}

export type SystemImage = {
  id: string
  category: 'LANDING_PAGE' | 'EXPERIENCIA' | 'GALERIA'
  name: string
  description?: string
  url: string
  altText?: string
  order: number
  isActive: boolean
}
export type VehicleOccupancy = {
  vehicleId: string
  date: string
  isOccupied: boolean
}
// Tipos compartidos para datos provenientes de la API. No hay datos mock locales.
