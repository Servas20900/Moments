import type { PackageView, VehicleView, CalendarSlotView, ExperienceView, SystemImage, HeroSlide, VehicleAvailability, VehicleBlock, MonthlyAvailability } from '../data/content'
import type { ExtraOption } from '../contexts/ReservationContext'
import { getToken as getAuthToken, saveToken, saveUser } from '../utils/auth'

// Base URL for the backend API (Spanish routes)
const rawApiUrl = import.meta.env.VITE_API_URL
if (!rawApiUrl) {
  throw new Error('VITE_API_URL is required. Set it in your environment before building.')
}
const API_URL = rawApiUrl.replace(/\/$/, '')


const getToken = () => getAuthToken() || ''
const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(init?.headers as Record<string, string> || {}),
      } as Record<string, string>,
    })

    if (!res.ok) {
      // Si es 401, limpiar token y redirigir
      if (res.status === 401) {
        const { clearToken } = await import('../utils/auth')
        clearToken()
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
      
      let errorMessage = res.statusText
      try {
        const errorData = await res.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        const text = await res.text()
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }
    throw error
  }
}

const mapPackage = (p: any): PackageView => {
  const vehicles = (p.vehicles ?? p.vehiculos)?.map((v: any) => ({
    id: v.id ?? v.vehiculo?.id,
    name: v.name ?? v.vehiculo?.nombre ?? v.nombre,
    category: v.category ?? v.vehiculo?.categoria ?? v.categoria,
    seats: v.seats ?? v.vehiculo?.asientos ?? v.asientos ?? 0,
    rate: v.rate ?? v.vehiculo?.tarifaPorHora ?? v.tarifaPorHora ?? 'Consultar',
    features: v.features ?? v.vehiculo?.features ?? [],
    imageUrl: v.imageUrl ?? v.vehiculo?.imagenUrl ?? v.imagenUrl ?? null,
  })) ?? []

  return {
    id: p.id,
    category: p.categoria || 'Paquete',
    name: p.nombre || p.name || '',
    description: p.descripcion || p.description || '',
    price: Number(p.precioBase ?? p.price ?? 0),
    vehicle: p.vehiculo || p.vehicle || vehicles[0]?.name || 'Chofer asignado',
    maxPeople: p.maxPersonas ?? p.maxPeople ?? 0,
    includes: p.incluidos ?? p.incluye ?? p.includes ?? [],
    imageUrl: p.imagenUrl || p.imageUrl || null,
    addons: p.addons,
    vehicles,
    vehicleIds: vehicles.map((v: any) => v.id).filter(Boolean),
  }
}

const mapVehicle = (v: any): VehicleView => ({
  id: v.id,
  name: v.nombre || v.name,
  category: v.categoria || v.category,
  seats: v.asientos ?? v.seats ?? 0,
  rate: v.tarifaPorHora ?? v.rate ?? 'Consultar',
  features: v.caracteristicas ?? v.features ?? [],
  imageUrl: v.imagenUrl || v.imageUrl || null,
})

const mapCalendar = (e: any): CalendarSlotView => {
  // Prefer already-mapped fields from backend, fall back to legacy ones
  const status: CalendarSlotView['status'] = e.status
    ? (e.status as CalendarSlotView['status'])
    : (() => {
        const estado = (e.estado || '').toUpperCase()
        return estado === 'RESERVADO' || estado === 'BOOKED' ? 'ocupado' : estado === 'BLOQUEADO' ? 'evento' : 'disponible'
      })()

  let dateStr = ''
  if (typeof e.date === 'string') {
    dateStr = e.date.slice(0, 10)
  } else if (e.fecha) {
    if (typeof e.fecha === 'string') dateStr = e.fecha.slice(0, 10)
    else if (e.fecha.toISOString) dateStr = e.fecha.toISOString().slice(0, 10)
  }

  return {
    id: e.id,
    date: dateStr,
    status,
    title: e.title ?? e.titulo ?? e.detalle ?? 'Evento',
    detail: e.detail ?? e.detalle,
    tag: e.tag ?? e.etiqueta,
    imageUrl: e.imageUrl ?? e.imagenUrl,
  }
}

const mapExperience = (x: any): ExperienceView => ({
  id: x.id,
  title: x.titulo || x.nombre,
  imageUrl: x.imagenUrl || x.url || null,
})

const mapExtra = (e: any): ExtraOption => ({
  id: e.id,
  name: e.name ?? e.nombre,
  price: Number(e.price ?? e.precio ?? 0),
  description: e.description ?? e.descripcion ?? '',
  categoria: e.categoria,
  estado: e.estado,
  creadoEn: e.creadoEn,
  actualizadoEn: e.actualizadoEn,
})

export const fetchPackages = async (): Promise<PackageView[]> => {
  const data = await http<any>('/paquetes')
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(mapPackage)
}

export const fetchVehicles = async (): Promise<VehicleView[]> => {
  const data = await http<any>('/vehiculos')
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(mapVehicle)
}

export const fetchVehicleAvailability = async (params: { date: string; start: string; end: string }) => {
  const query = new URLSearchParams({
    fecha: params.date,
    horaInicio: params.start,
    horaFin: params.end,
  }).toString()
  const data = await http<{ occupiedIds?: string[] }>(`/vehiculos/disponibilidad?${query}`)
  return data?.occupiedIds ?? []
}

// ==================== VEHICLE AVAILABILITY ====================

export const checkVehicleAvailability = async (vehiculoId: string, fecha: string): Promise<VehicleAvailability> => {
  const query = new URLSearchParams({ vehiculoId, fecha }).toString()
  const data = await http<VehicleAvailability>(`/vehicle-availability/check?${query}`)
  return data
}

export const fetchVehicleBlocks = async (vehiculoId: string): Promise<VehicleBlock[]> => {
  const data = await http<VehicleBlock[]>(`/vehicle-availability/${vehiculoId}/blocks`)
  return data
}

/** @deprecated Use fetchUnifiedCalendar instead */
export const fetchMonthlyAvailability = async (
  vehiculoId: string,
  year: number,
  month: number,
): Promise<MonthlyAvailability> => {
  const query = new URLSearchParams({ year: String(year), month: String(month) }).toString()
  const data = await http<MonthlyAvailability>(`/vehicle-availability/${vehiculoId}/calendar?${query}`)
  return data
}

/** NEW: Calendario unificado con soporte para todos los vehículos o uno específico */
export const fetchUnifiedCalendar = async (
  year: number,
  month: number,
  vehiculoId?: string,
): Promise<any> => {
  const params = new URLSearchParams({ 
    year: String(year), 
    month: String(month) 
  })
  if (vehiculoId) {
    params.append('vehiculoId', vehiculoId)
  }
  const data = await http<any>(`/vehicle-availability/calendar?${params.toString()}`)
  return data
}

export const createVehicleBlock = async (data: {
  vehiculoId: string
  fecha: string
  motivo: 'RESERVADO' | 'MANTENIMIENTO' | 'BLOQUEADO_ADMIN' | 'OTRO'
  detalles?: string
  creadoPor?: string
}): Promise<VehicleBlock> => {
  const created = await http<VehicleBlock>('/vehicle-availability/block', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return created
}

export const deleteVehicleBlock = async (blockId: string): Promise<{ message: string }> => {
  const result = await http<{ message: string }>(`/vehicle-availability/block/${blockId}`, {
    method: 'DELETE',
  })
  return result
}

export const fetchCalendar = async (): Promise<CalendarSlotView[]> => {
  const data = await http<any[]>('/eventos')
  return data.map(mapCalendar)
}

export const fetchExperiences = async (): Promise<ExperienceView[]> => {
  const data = await http<any[]>('/experiencias')
  return data.map(mapExperience)
}

export const fetchSystemImages = async (): Promise<SystemImage[]> => {
  // Traer imágenes de la galería activas
  const data = await http<any>(`/imagenes?categoria=GALERIA&estado=ACTIVO`)
  const images = data?.data || data || []
  return images.map((img: any, idx: number) => ({
    id: img.id,
    category: 'GALERIA',
    name: img.altText || img.name || 'Imagen',
    url: img.url,
    description: img.description || '',
    altText: img.altText || img.name || '',
    order: img.order ?? idx,
    isActive: img.estado === 'ACTIVO',
  }))
}

export const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    // Solo traer slides activos
    const data = await http<any>(`/imagenes?categoria=LANDING_PAGE&estado=ACTIVO&take=10`)
    const images = data?.data || data || []
    return images.map((img: any, idx: number) => ({
      id: img.id,
      title: img.altText || 'Momentos Especiales',
      subtitle: img.subtitle || 'Transporte de Lujo',
      description: img.description || 'Vive la experiencia de ser trasladado en el máximo confort',
      imageUrl: img.url || '',
      order: img.order ?? idx,
      isActive: img.estado === 'ACTIVO',
    }))
  } catch (err) {
    console.warn('No se pudieron cargar hero slides', err)
    // Retornar slides por defecto
    return [
      {
        id: '1',
        title: 'Momentos Especiales',
        subtitle: 'Transporte de Lujo',
        description: 'Vive la experiencia de ser trasladado en el máximo confort',
        imageUrl: '',
        order: 0,
        isActive: true,
      },
    ]
  }
}

// Extras API
export const fetchExtras = async (): Promise<ExtraOption[]> => {
  try {
    const data = await http<any>('/extras')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapExtra)
  } catch {
    return []
  }
}

export const fetchAllExtrasAdmin = async (): Promise<ExtraOption[]> => {
  try {
    const data = await http<any>('/extras/admin/all')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapExtra)
  } catch {
    return []
  }
}

export const fetchPackageExtras = async (paqueteId: string): Promise<ExtraOption[]> => {
  try {
    const data = await http<any>(`/extras/paquetes/${paqueteId}`)
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapExtra)
  } catch {
    return []
  }
}

export const createExtra = async (extra: { nombre: string; descripcion?: string; precio: number; categoria?: string }): Promise<ExtraOption> => {
  const payload = {
    nombre: extra.nombre,
    descripcion: extra.descripcion,
    precio: extra.precio,
    categoria: extra.categoria || 'SIN_ALCOHOL',
  }
  const created = await http<any>('/extras', { method: 'POST', body: JSON.stringify(payload) })
  return mapExtra(created)
}

export const updateExtra = async (id: string, extra: Partial<{ nombre: string; descripcion?: string; precio: number; categoria?: string }>): Promise<ExtraOption> => {
  const payload = {
    nombre: extra.nombre,
    descripcion: extra.descripcion,
    precio: extra.precio,
    categoria: extra.categoria,
  }
  const updated = await http<any>(`/extras/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return mapExtra(updated)
}

export const deleteExtra = async (id: string): Promise<void> => {
  // Soft delete usando deactivate
  const payload = {}
  await http<void>(`/extras/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export const activateExtra = async (id: string): Promise<ExtraOption> => {
  const payload = {}
  const updated = await http<any>(`/extras/${id}/activate`, { method: 'PATCH', body: JSON.stringify(payload) })
  return mapExtra(updated)
}

export const deactivateExtra = async (id: string): Promise<ExtraOption> => {
  const payload = {}
  const updated = await http<any>(`/extras/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify(payload) })
  return mapExtra(updated)
}

export const getExtrasForPackageAssociation = async (paqueteId: string): Promise<{ associated: ExtraOption[]; available: ExtraOption[] }> => {
  const data = await http<any>(`/extras/admin/packages/${paqueteId}/association`)
  return {
    associated: Array.isArray(data?.associated) ? data.associated.map(mapExtra) : [],
    available: Array.isArray(data?.available) ? data.available.map(mapExtra) : [],
  }
}

export const attachExtraToPackage = async (extraId: string, paqueteId: string): Promise<void> => {
  const payload = { extraId, paqueteId }
  await http<void>('/extras/attach', { method: 'POST', body: JSON.stringify(payload) })
}

export const detachExtraFromPackage = async (extraId: string, paqueteId: string): Promise<void> => {
  await http<void>(`/extras/${extraId}/packages/${paqueteId}`, { method: 'DELETE' })
}

// ===========================================
// CATEGORÍAS DE INCLUIDOS
// ===========================================

export interface CategoriaIncluido {
  id: number
  nombre: string
  estado: 'ACTIVO' | 'INACTIVO'
  creadoEn: Date
}

const mapCategoriaIncluido = (raw: any): CategoriaIncluido => ({
  id: raw.id,
  nombre: raw.nombre,
  estado: raw.estado,
  creadoEn: new Date(raw.creadoEn),
})

export const fetchAllCategoriasIncluidos = async (): Promise<CategoriaIncluido[]> => {
  try {
    const data = await http<any>('/categorias-incluidos')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapCategoriaIncluido)
  } catch {
    return []
  }
}

export const fetchAllCategoriasIncluidosAdmin = async (): Promise<CategoriaIncluido[]> => {
  try {
    const data = await http<any>('/categorias-incluidos/admin')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapCategoriaIncluido)
  } catch {
    return []
  }
}

export const createCategoriaIncluido = async (categoria: { nombre: string }): Promise<CategoriaIncluido> => {
  const payload = { nombre: categoria.nombre }
  const created = await http<any>('/categorias-incluidos', { method: 'POST', body: JSON.stringify(payload) })
  return mapCategoriaIncluido(created)
}

export const updateCategoriaIncluido = async (id: number, categoria: Partial<{ nombre: string; estado: string }>): Promise<CategoriaIncluido> => {
  const payload: any = {}
  if (categoria.nombre !== undefined) payload.nombre = categoria.nombre
  if (categoria.estado !== undefined) payload.estado = categoria.estado
  const updated = await http<any>(`/categorias-incluidos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return mapCategoriaIncluido(updated)
}

export const activateCategoriaIncluido = async (id: number): Promise<CategoriaIncluido> => {
  const updated = await http<any>(`/categorias-incluidos/${id}/activate`, { method: 'PUT', body: JSON.stringify({}) })
  return mapCategoriaIncluido(updated)
}

export const deactivateCategoriaIncluido = async (id: number): Promise<CategoriaIncluido> => {
  const updated = await http<any>(`/categorias-incluidos/${id}/deactivate`, { method: 'PUT', body: JSON.stringify({}) })
  return mapCategoriaIncluido(updated)
}

// ===========================================
// INCLUIDOS (BEBIDAS)
// ===========================================

export interface Incluido {
  id: string
  nombre: string
  descripcion: string | null
  categoriaId: number
  categoriaNombre: string
  estado: 'ACTIVO' | 'INACTIVO'
  creadoEn: Date
  actualizadoEn: Date
  packageIds?: string[]
}

const mapIncluido = (raw: any): Incluido => ({
  id: raw.id,
  nombre: raw.nombre,
  descripcion: raw.descripcion,
  categoriaId: raw.categoriaId,
  categoriaNombre: raw.categoriaNombre,
  estado: raw.estado,
  creadoEn: new Date(raw.creadoEn),
  actualizadoEn: new Date(raw.actualizadoEn),
  packageIds: raw.packageIds,
})

export const fetchAllIncluidos = async (): Promise<Incluido[]> => {
  try {
    const data = await http<any>('/incluidos')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapIncluido)
  } catch {
    return []
  }
}

export const fetchAllIncluidosAdmin = async (): Promise<Incluido[]> => {
  try {
    const data = await http<any>('/incluidos/admin')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapIncluido)
  } catch {
    return []
  }
}

export const fetchPackageIncluidos = async (paqueteId: string): Promise<Incluido[]> => {
  try {
    const data = await http<any>(`/incluidos/package/${paqueteId}`)
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapIncluido)
  } catch {
    return []
  }
}

export const fetchPackageIncluidosGrouped = async (paqueteId: string): Promise<Record<number, { categoria: { id: number; nombre: string }; incluidos: Incluido[] }>> => {
  try {
    const data = await http<any>(`/incluidos/package/${paqueteId}/grouped`)
    return data || {}
  } catch {
    return {}
  }
}

export const createIncluido = async (incluido: { nombre: string; descripcion?: string; categoriaId: number }): Promise<Incluido> => {
  const payload = {
    nombre: incluido.nombre,
    descripcion: incluido.descripcion,
    categoriaId: incluido.categoriaId,
  }
  const created = await http<any>('/incluidos', { method: 'POST', body: JSON.stringify(payload) })
  return mapIncluido(created)
}

export const updateIncluido = async (id: string, incluido: Partial<{ nombre: string; descripcion?: string; categoriaId: number }>): Promise<Incluido> => {
  const payload: any = {}
  if (incluido.nombre !== undefined) payload.nombre = incluido.nombre
  if (incluido.descripcion !== undefined) payload.descripcion = incluido.descripcion
  if (incluido.categoriaId !== undefined) payload.categoriaId = incluido.categoriaId
  const updated = await http<any>(`/incluidos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return mapIncluido(updated)
}

export const activateIncluido = async (id: string): Promise<Incluido> => {
  const updated = await http<any>(`/incluidos/${id}/activate`, { method: 'PUT', body: JSON.stringify({}) })
  return mapIncluido(updated)
}

export const deactivateIncluido = async (id: string): Promise<Incluido> => {
  const updated = await http<any>(`/incluidos/${id}/deactivate`, { method: 'PUT', body: JSON.stringify({}) })
  return mapIncluido(updated)
}

export const attachIncluidoToPackage = async (incluidoId: string, paqueteId: string): Promise<void> => {
  const payload = { incluidoId, paqueteId }
  await http<void>('/incluidos/attach', { method: 'POST', body: JSON.stringify(payload) })
}

export const detachIncluidoFromPackage = async (incluidoId: string, paqueteId: string): Promise<void> => {
  await http<void>(`/incluidos/${incluidoId}/packages/${paqueteId}`, { method: 'DELETE' })
}

export const deleteCategoriaIncluido = async (id: number): Promise<void> => {
  await http<void>(`/categorias-incluidos/${id}`, { method: 'DELETE' })
}

export const deleteIncluido = async (id: string): Promise<void> => {
  await http<void>(`/incluidos/${id}`, { method: 'DELETE' })
}

export const createCalendarEvent = async (data: Partial<CalendarSlotView>) => {
  const payload = {
    titulo: data.title || 'Evento',
    fecha: data.date,
    estado: data.status === 'evento' ? 'BLOQUEADO' : data.status === 'ocupado' ? 'RESERVADO' : 'DISPONIBLE',
    detalle: data.detail,
    etiqueta: data.tag,
    imagenUrl: data.imageUrl,
  }
  const created = await http<any>('/eventos', { method: 'POST', body: JSON.stringify(payload) })
  const mapped = mapCalendar(created)
  return mapped
}

export const updateCalendarEvent = async (id: string, patch: Partial<CalendarSlotView>) => {
  const payload = {
    ...(patch.title && { titulo: patch.title }),
    ...(patch.date && { fecha: patch.date }),
    ...(patch.status && { estado: patch.status.toUpperCase() }),
    ...(patch.detail && { detalle: patch.detail }),
    ...(patch.tag && { etiqueta: patch.tag }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
  }
  await http(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deleteCalendarEvent = async (id: string) => {
  await http(`/eventos/${id}`, { method: 'DELETE' })
  return true
}

export const createPackage = async (data: Partial<PackageView>) => {
  // Obtener categorías y usar la primera disponible
  let categoriaId = 1
  try {
    const categories = await http<any[]>('/paquetes/categorias/list')
    if (categories && categories.length > 0) {
      categoriaId = categories[0].id
    }
  } catch (e) {
    console.warn('No se pudieron cargar categorías, usando ID 1 por defecto', e)
  }

  const payload = {
    categoriaId,
    nombre: data.name,
    descripcion: data.description || '',
    precioBase: data.price ?? 0,
    maxPersonas: data.maxPeople ?? 0,
    imagenUrl: data.imageUrl || '',
    incluidos: data.includes || [],
    vehicleIds: data.vehicleIds,
  }
  const created = await http<any>('/paquetes', { method: 'POST', body: JSON.stringify(payload) })
  return mapPackage(created)
}

export const updatePackage = async (id: string, patch: Partial<PackageView>) => {
  const payload = {
    ...(patch.name && { nombre: patch.name }),
    ...(patch.description && { descripcion: patch.description }),
    ...(patch.category && { categoria: patch.category }),
    ...(patch.price !== undefined && { precioBase: patch.price }),
    ...(patch.maxPeople !== undefined && { maxPersonas: patch.maxPeople }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
    ...(patch.vehicle && { vehiculo: patch.vehicle }),
    ...(patch.includes !== undefined && { incluidos: patch.includes }),
    ...(patch.vehicleIds && { vehicleIds: patch.vehicleIds }),
  }
  const updated = await http<any>(`/paquetes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return mapPackage(updated)
}

export const deletePackage = async (id: string) => {
  await http(`/paquetes/${id}`, { method: 'DELETE' })
  return true
}

export const createVehicle = async (data: Partial<VehicleView>) => {
  const payload = {
    nombre: data.name,
    categoria: data.category || 'General',
    asientos: data.seats || 0,
    tarifaPorHora: typeof data.rate === 'string' ? parseFloat(data.rate) || 0 : data.rate || 0,
    imagenUrl: data.imageUrl || '',
    caracteristicas: data.features || [],
  }
  const created = await http<any>('/vehiculos', { method: 'POST', body: JSON.stringify(payload) })
  return mapVehicle(created)
}

export const updateVehicle = async (id: string, patch: Partial<VehicleView>) => {
  const payload = {
    ...(patch.name && { nombre: patch.name }),
    ...(patch.category && { categoria: patch.category }),
    ...(patch.seats !== undefined && { asientos: patch.seats }),
    ...(patch.rate && { tarifaPorHora: typeof patch.rate === 'string' ? parseFloat(patch.rate) || 0 : patch.rate }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
    ...(patch.features && { caracteristicas: patch.features }),
  }
  await http(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deleteVehicle = async (id: string) => {
  await http(`/vehiculos/${id}`, { method: 'DELETE' })
  return true
}

export const uploadImage = async (file: File | string): Promise<string> => {
  // Allow passing an existing URL string
  if (typeof file === 'string') return file

  const formData = new FormData()
  formData.append('file', file)
  const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'moments'
  formData.append('folder', folder)

  try {
    const res = await fetch(`${API_URL}/imagenes/upload`, {
      method: 'POST',
      headers: {
        ...authHeaders(), // Authorization only; no Content-Type so browser sets boundary
      } as Record<string, string>,
      body: formData,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Upload failed: ${text || res.statusText}`)
    }
    const data = await res.json() as { url: string }
    return data.url || ''
  } catch (err) {
    console.error('Error uploading via backend:', err)
    return ''
  }
}

// Imagenes API (nuevo modelo)
export const createImageRecord = async (params: { categoria: 'PAQUETE' | 'VEHICULO' | 'EVENTO' | 'GALERIA' | 'EXPERIENCIA' | 'LANDING_PAGE'; url: string; altText?: string }) => {
  const res = await http<any>('/imagenes', { method: 'POST', body: JSON.stringify(params) })
  return res as { id: string; url: string }
}

export const attachImageToPackage = async (imagenId: string, paqueteId: string, orden = 0) => {
  await http(`/imagenes/${imagenId}/paquetes`, { method: 'POST', body: JSON.stringify({ paqueteId, orden }) })
  return true
}

export const attachImageToVehicle = async (imagenId: string, vehiculoId: string, orden = 0) => {
  await http(`/imagenes/${imagenId}/vehiculos`, { method: 'POST', body: JSON.stringify({ vehiculoId, orden }) })
  return true
}

export const attachImageToEvent = async (imagenId: string, eventoId: string, orden = 0) => {
  await http(`/imagenes/${imagenId}/eventos`, { method: 'POST', body: JSON.stringify({ eventoId, orden }) })
  return true
}

export const submitReservation = async (payload: any) => {
  const fecha = new Date()
  const fechaStr = payload.fechaEvento || payload.date || fecha.toISOString().slice(0, 10)

  const body = {
    nombre: payload.nombre || payload.name || 'Invitado',
    email: payload.email,
    telefono: payload.telefono || payload.phone || '00000000',
    tipoIdentificacion: payload.tipoIdentificacion || payload.identificationType,
    numeroIdentificacion: payload.numeroIdentificacion || payload.identificacion,
    tipoEvento: payload.tipoEvento || payload.event || 'Evento',
    fechaEvento: payload.fechaEvento || fechaStr,
    horaInicio: payload.horaInicio || `${fechaStr}T18:00:00`,
    horaFin: payload.horaFin || `${fechaStr}T20:00:00`,
    origen: payload.origen || payload.origin || 'Pendiente',
    destino: payload.destino || payload.destination || 'Pendiente',
    numeroPersonas: Number(payload.numeroPersonas) || 2,
    paqueteId: payload.paqueteId,
    vehiculoId: payload.vehiculoId ?? null,
    tipoPago: payload.tipoPago || 'TARJETA',
    precioBase: payload.precioBase ?? 0,
    precioTotal: payload.precioTotal ?? 0,
    anticipo: payload.anticipo ?? 0,
    restante: payload.restante ?? 0,
    notasInternas: payload.notasInternas || payload.notes,
    extras: Array.isArray(payload.extras)
      ? payload.extras.map((x: any) => ({
          extraId: x.extraId || x.id,
          cantidad: Number(x.cantidad ?? 1),
          precioUnitario: Number(x.precioUnitario ?? x.price ?? 0),
        }))
      : undefined,
    incluidos: Array.isArray(payload.incluidos)
      ? payload.incluidos.map((x: any) => ({
          incluidoId: x.incluidoId || x.id,
        }))
      : undefined,
  }

  const res = await http<{ id: string; numeroFactura: string }>('/reservas', { method: 'POST', body: JSON.stringify(body) })
  return { ok: true, id: (res as any).id, numeroFactura: (res as any).numeroFactura }
}

export const sendConfirmationEmail = async (_email: string, _data: any) => ({ ok: true })
export const sendAdminNotification = async (_data: any) => ({ ok: true })
export const sendWhatsAppNotification = async (_phone: string, _message: string) => ({ ok: true })

export const fetchNotifications = async () => {
  const token = getToken()
  if (!token) {
    return []
  }
  // Notificaciones deshabilitadas temporalmente - endpoint no implementado
  return []
}

export const createUser = async (payload: { name: string; email: string; phone?: string; password?: string }) => {
  try {
    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres')
    }
    if (!payload.email) {
      throw new Error('El email es requerido')
    }
    if (!payload.password || payload.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    const res = await http<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre: payload.name.trim(),
        email: payload.email.toLowerCase().trim(),
        telefono: payload.phone?.trim() || '00000000',
        contrasena: payload.password,
      }),
    })
    
    if (!res?.token && !res?.access_token) {
      throw new Error('Respuesta inválida del servidor')
    }
    
    saveToken({
      token: res.token ?? res.access_token,
      expiresIn: res.expiresIn || 86400,
      userId: res.user?.id ?? res.id,
      email: res.user?.email ?? res.email,
    })
    saveUser({
      id: res.user?.id ?? res.id,
      email: res.user?.email ?? res.email,
      nombre: res.user?.nombre ?? payload.name,
      telefono: payload.phone,
      estaActivo: true,
    })
    
    return { ok: true, id: res.user?.id ?? res.id }
  } catch (error) {
    console.error('[API] Register error:', error)
    throw error
  }
}

export const loginUser = async (payload: { email: string; password?: string }) => {
  try {
    if (!payload.email) {
      throw new Error('El email es requerido')
    }
    if (!payload.password) {
      throw new Error('La contraseña es requerida')
    }

    const res = await http<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: payload.email.toLowerCase().trim(), 
        contrasena: payload.password 
      }),
    })
    
    if (!res?.token && !res?.access_token) {
      throw new Error('Respuesta inválida del servidor')
    }
    
    saveToken({
      token: res.token ?? res.access_token,
      expiresIn: res.expiresIn || 86400,
      userId: res.user?.id ?? res.id,
      email: res.user?.email ?? res.email,
    })
    saveUser({
      id: res.user?.id ?? res.id,
      email: res.user?.email ?? res.email,
      nombre: res.user?.nombre ?? res.email,
      estaActivo: true,
      roles: res.user?.roles ?? [],
    })
    
    return { ok: true, id: res.user?.id ?? res.id }
  } catch (error) {
    console.error('[API] Login error:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  const token = getToken()
  if (!token) return null
  try {
    const me = await http<any>('/auth/me')
    return me
  } catch {
    return null
  }
}

export const updateUser = async (_id: string, patch: Partial<{ name: string; phone: string }>) => {
  await http('/usuarios/perfil', {
    method: 'PUT',
    body: JSON.stringify({
      ...(patch.name && { nombre: patch.name }),
      ...(patch.phone && { telefono: patch.phone }),
    }),
  })
  return true
}

export const changePassword = async (passwordAntigua: string, nuevaPassword: string, confirmarPassword: string) => {
  await http('/usuarios/cambiar-contrasena', {
    method: 'POST',
    body: JSON.stringify({
      passwordAntigua,
      nuevaPassword,
      confirmarPassword,
    }),
  })
  return true
}

export const createExperience = async (data: Partial<ExperienceView>) => {
  const payload = {
    titulo: data.title,
    imagenUrl: data.imageUrl,
  }
  const created = await http<any>('/experiencias', { method: 'POST', body: JSON.stringify(payload) })
  return mapExperience(created)
}

export const updateExperience = async (id: string, patch: Partial<ExperienceView>) => {
  const payload = {
    ...(patch.title && { titulo: patch.title }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
  }
  await http(`/experiencias/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deleteExperience = async (id: string) => {
  await http(`/experiencias/${id}`, { method: 'DELETE' })
  return true
}

export const createSystemImage = async (data: Partial<SystemImage>) => {
  // Crear registro de imagen en la tabla Imagen
  const payload = {
    categoria: data.category || 'GALERIA',
    url: data.url,
    altText: data.name || data.altText,
  }
  const imgRes = await http<any>('/imagenes', { method: 'POST', body: JSON.stringify(payload) })
  return {
    id: imgRes.id,
    category: imgRes.categoria,
    name: imgRes.altText || '',
    description: imgRes.description || '',
    url: imgRes.url,
    altText: imgRes.altText || '',
    order: data.order || 0,
    isActive: imgRes.estado === 'ACTIVO',
  } as SystemImage
}

export const updateSystemImage = async (id: string, data: Partial<SystemImage>) => {
  // Actualizar registro de imagen en la tabla Imagen
  const payload: any = {}
  if (data.url) payload.url = data.url
  if (data.name || data.altText) payload.altText = data.name || data.altText
  if (data.category) payload.categoria = data.category
  await http(`/imagenes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deleteSystemImage = async (id: string) => {
  await http(`/imagenes/${id}`, { method: 'DELETE' })
  return true
}
export const createHeroSlide = async (data: Partial<HeroSlide>) => {
  // Crear registro de imagen en la tabla Imagen con categoria LANDING_PAGE
  const payload = {
    categoria: 'LANDING_PAGE',
    url: data.imageUrl,
    altText: data.title,
  }
  const imgRes = await http<any>('/imagenes', { method: 'POST', body: JSON.stringify(payload) })
  // Crear slide en la tabla HeroSlide si existe, o usar el registro de imagen como slide
  // Si el backend solo usa la tabla Imagen para los slides, solo retorna el registro
  return {
    id: imgRes.id,
    title: data.title ?? '',
    subtitle: data.subtitle ?? '',
    description: data.description ?? '',
    imageUrl: imgRes.url,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  } as HeroSlide
}

export const updateHeroSlide = async (id: string, data: Partial<HeroSlide>) => {
  // Actualizar registro de imagen en la tabla Imagen
  const payload: any = {}
  if (data.title) payload.altText = data.title
  if (data.imageUrl) payload.url = data.imageUrl
  if (data.subtitle) payload.subtitle = data.subtitle
  if (data.description) payload.description = data.description
  if (data.order !== undefined) payload.order = data.order
  if (data.isActive !== undefined) payload.isActive = data.isActive
  await http(`/imagenes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deleteHeroSlide = async (id: string) => {
  // Elimina la imagen completamente de la base de datos
  await http(`/imagenes/${id}`, { method: 'DELETE' })
  return true
}

// ==================== RESERVATIONS ADMIN ====================

export interface ReservationView {
  id: string
  nombre: string
  email: string
  telefono: string
  estado: 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
  fechaEvento: string
  horaInicio: string
  horaFin: string
  numeroPersonas: number
  precioBase: number
  precioTotal: number
  anticipo: number
  restante: number
  paqueteId: string
  vehiculoId: string
  tipoPago: string
  origenReserva?: 'WEB' | 'ADMIN' | 'WHATSAPP' | 'INSTAGRAM' | 'CORREO' | 'MANUAL' | 'CORPORATIVO'
  notasInternas?: string
  hasConflict?: boolean
  vehiculoNombre?: string
  paqueteNombre?: string
}

export const fetchReservations = async (filters?: {
  vehiculoId?: string
  estado?: string
  desde?: string
  hasta?: string
}): Promise<ReservationView[]> => {
  const params = new URLSearchParams()
  if (filters?.vehiculoId) params.append('vehiculoId', filters.vehiculoId)
  if (filters?.estado) params.append('estado', filters.estado)
  if (filters?.desde) params.append('desde', filters.desde)
  if (filters?.hasta) params.append('hasta', filters.hasta)
  
  const query = params.toString()
  const data = await http<any[]>(`/reservas${query ? `?${query}` : ''}`)
  return data
}

export const confirmAdelanto = async (reservaId: string): Promise<ReservationView> => {
  const data = await http<ReservationView>(`/reservas/${reservaId}/pago/adelanto`, { method: 'PATCH' })
  return data
}

export const confirmPagoCompleto = async (reservaId: string): Promise<ReservationView> => {
  const data = await http<ReservationView>(`/reservas/${reservaId}/pago/completo`, { method: 'PATCH' })
  return data
}

// ==================== ADMIN RESERVATIONS ====================

export interface CreateManualReservationData {
  nombre: string
  email: string
  telefono: string
  identificacion?: string
  notasInternas?: string
  paqueteId: string
  vehiculoId: string
  conductorId?: string
  tipoEvento: string
  fechaEvento: string
  horaInicio: string
  horaFin: string
  origen: string
  destino: string
  numeroPersonas: number
  tipoPago: 'TARJETA' | 'SINPE' | 'TRANSFERENCIA'
  origenReserva: 'WEB' | 'ADMIN' | 'WHATSAPP' | 'INSTAGRAM' | 'CORREO' | 'MANUAL' | 'CORPORATIVO'
  anticipo?: number
  estadoInicial: 'PAGO_PENDIENTE' | 'PAGO_PARCIAL' | 'CONFIRMADA'
  extras?: Array<{
    extraId: string
    cantidad: number
  }>
  comentario?: string
}

export const createManualReservation = async (data: CreateManualReservationData): Promise<ReservationView> => {
  const result = await http<ReservationView>('/reservas/admin/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return result
}

export interface MarkPaymentCompleteData {
  tipoPago: 'SINPE' | 'TRANSFERENCIA' | 'TARJETA' | 'EFECTIVO'
  referenciaExterna?: string
  comentario?: string
}

export const markPaymentCompleteManual = async (
  reservaId: string,
  data: MarkPaymentCompleteData,
): Promise<ReservationView> => {
  const result = await http<ReservationView>(`/reservas/${reservaId}/admin/pago-completo-manual`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return result
}

export interface UpdateReservationData {
  conductor?: string
  horaInicio?: string
  horaFin?: string
  vehiculoId?: string
  estado?: 'CANCELADA' | 'COMPLETADA'
  observaciones?: string
}

export const updateReservation = async (
  reservaId: string,
  data: UpdateReservationData,
): Promise<ReservationView> => {
  const result = await http<ReservationView>(`/reservas/${reservaId}/admin`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return result
}

// ==================== TABLA ADMINISTRATIVA DE RESERVAS ====================

export interface AdminReservationRow extends ReservationView {
  // Campos operativos adicionales
  contactoCliente: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
  adelantoRecibido: boolean
  pagoCompleto: boolean
  choferAsignado: boolean
  eventoRealizado: boolean
  tipoEvento: string
  origen: string
  destino: string
  identificacion?: string
  // Datos relacionados
  paquete?: {
    id: string
    nombre: string
    precioBase: number
  }
  vehiculo?: {
    id: string
    nombre: string
    categoria: string
  }
  conductor?: {
    id: string
    nombre: string
    telefono: string
  }
  // Extras
  extras?: Array<{
    id: string
    nombre: string
    cantidad: number
    precioUnitario: number
  }>
  // Indicadores calculados
  esProximo?: boolean
  esPasado?: boolean
  tieneConflicto?: boolean
}

export interface ReservationsTableFilters {
  vehiculoId?: string
  estadoPago?: 'pendiente' | 'parcial' | 'completo'
  tipoEvento?: 'futuro' | 'hoy' | 'pasado'
  origenReserva?: string
  contactoCliente?: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
  conConflictos?: boolean
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
  sortBy?: 'fechaEvento' | 'actualizadoEn' | 'conflictos'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReservationsTableResponse {
  data: AdminReservationRow[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const fetchAdminReservationsTable = async (
  filters?: ReservationsTableFilters
): Promise<ReservationsTableResponse> => {
  const params = new URLSearchParams()
  
  if (filters?.vehiculoId) params.append('vehiculoId', filters.vehiculoId)
  if (filters?.estadoPago) params.append('estadoPago', filters.estadoPago)
  if (filters?.tipoEvento) params.append('tipoEvento', filters.tipoEvento)
  if (filters?.origenReserva) params.append('origenReserva', filters.origenReserva)
  if (filters?.contactoCliente) params.append('contactoCliente', filters.contactoCliente)
  if (filters?.conConflictos !== undefined) params.append('conConflictos', String(filters.conConflictos))
  if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
  if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
  if (filters?.busqueda) params.append('busqueda', filters.busqueda)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))
  
  const query = params.toString()
  const data = await http<ReservationsTableResponse>(`/reservas/admin/table${query ? `?${query}` : ''}`)
  return data
}

export const updateContactoCliente = async (
  reservaId: string,
  contactoCliente: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
): Promise<AdminReservationRow> => {
  const result = await http<AdminReservationRow>(`/reservas/${reservaId}/admin/contacto-cliente`, {
    method: 'PATCH',
    body: JSON.stringify({ contactoCliente }),
  })
  return result
}

export const updateAdelantoRecibido = async (
  reservaId: string,
  adelantoRecibido: boolean
): Promise<AdminReservationRow> => {
  const result = await http<AdminReservationRow>(`/reservas/${reservaId}/admin/adelanto-recibido`, {
    method: 'PATCH',
    body: JSON.stringify({ adelantoRecibido }),
  })
  return result
}

export const updatePagoCompleto = async (
  reservaId: string,
  pagoCompleto: boolean
): Promise<AdminReservationRow> => {
  const result = await http<AdminReservationRow>(`/reservas/${reservaId}/admin/pago-completo`, {
    method: 'PATCH',
    body: JSON.stringify({ pagoCompleto }),
  })
  return result
}

export const updateChoferAsignado = async (
  reservaId: string,
  choferAsignado: boolean
): Promise<AdminReservationRow> => {
  const result = await http<AdminReservationRow>(`/reservas/${reservaId}/admin/chofer-asignado`, {
    method: 'PATCH',
    body: JSON.stringify({ choferAsignado }),
  })
  return result
}

export const updateEventoRealizado = async (
  reservaId: string,
  eventoRealizado: boolean
): Promise<AdminReservationRow> => {
  const result = await http<AdminReservationRow>(`/reservas/${reservaId}/admin/evento-realizado`, {
    method: 'PATCH',
    body: JSON.stringify({ eventoRealizado }),
  })
  return result
}


export default {
  fetchPackages,
  fetchVehicles,
  fetchVehicleAvailability,
  checkVehicleAvailability,
  fetchVehicleBlocks,
  fetchMonthlyAvailability,
  fetchUnifiedCalendar,
  sendConfirmationEmail,
  sendAdminNotification,
  sendWhatsAppNotification,
  fetchExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  fetchSystemImages,
  createSystemImage,
  updateSystemImage,
  deleteSystemImage,
  fetchHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  createPackage,
  updatePackage,
  deletePackage,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  uploadImage,
  fetchNotifications,
  createUser,
  loginUser,
  getCurrentUser,
  updateUser,
  fetchReservations,
  confirmAdelanto,
  confirmPagoCompleto,
  createManualReservation,
  markPaymentCompleteManual,
  updateReservation,
  // Tabla administrativa
  fetchAdminReservationsTable,
  updateContactoCliente,
  updateAdelantoRecibido,
  updatePagoCompleto,
  updateChoferAsignado,
  updateEventoRealizado,
}
