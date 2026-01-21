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
// TODO: El backend debería exponer estos DTOs en Swagger usando @ApiBody() en los controladores
// Por ahora mantenemos definiciones locales para la UI
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
