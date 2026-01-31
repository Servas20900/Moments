/**
 * Tipos generados automáticamente desde el backend.
 * 
 * Para regenerar cuando el backend cambie:
 * 1. Asegúrate de que el backend esté corriendo: cd backend && npm run start:dev
 * 2. Ejecuta: npm run generate:types
 * 
 * Los tipos base vienen de @/types/api generados desde OpenAPI.
 * Aquí solo definimos tipos complementarios específicos del frontend.
 */

import type { components } from '@/types/api'

// Tipos base del backend - DTOs para autenticación y entidades
export type RegisterDto = components['schemas']['RegisterDto']
export type LoginDto = components['schemas']['LoginDto']
export type CreateVehicleDto = components['schemas']['CreateVehicleDto']
export type UpdateVehicleDto = components['schemas']['UpdateVehicleDto']
export type CreateImageDto = components['schemas']['CreateImageDto']
export type UpdateImageDto = components['schemas']['UpdateImageDto']
export type CreateReservationDto = components['schemas']['CreateReservationDto']

// Tipos de entidades completas (respuestas de la API)
// Nota: Estos tipos locales complementan los generados desde OpenAPI; la documentación completa en Swagger se seguirá
// en el backend con @ApiBody() donde aplique.
// Modelos de vista (UI) derivados del backend
export type PackageView = {
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
  vehicles?: VehicleView[]
  vehicleIds?: string[]
}

export type VehicleView = {
  id: string
  name: string
  category: string
  seats: number
  rate: string
  features: string[]
  imageUrl: string
}

export type CalendarSlotView = {
  id: string
  date: string
  status: 'ocupado' | 'disponible' | 'evento'
  title: string
  detail?: string
  tag?: string
  imageUrl?: string
}

export type ExperienceView = {
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

// Alias legacy names usados en Admin
export type Package = PackageView
export type Vehicle = VehicleView
