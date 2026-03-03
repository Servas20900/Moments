import type { PackageView, VehicleView, CalendarSlotView, VehicleOccupancy, ExperienceView, SystemImage, HeroSlide, VehicleBlock, CategoriaIncluido, Incluido } from '../data/content'
import type { ExtraOption } from '../contexts/ReservationContext'
import type { Notification } from '../data/content'
import { getToken as getAuthToken, saveToken, saveUser } from '../utils/auth'

// Base URL for the backend API (Spanish routes)
const rawApiUrl = import.meta.env.VITE_API_URL
if (!rawApiUrl) {
  throw new Error('VITE_API_URL is required. Set it in your environment before building.')
}
const API_URL = rawApiUrl.replace(/\/$/, '')
const FALLBACK_IMG = ''

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

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      throw new Error(text.startsWith('<!doctype') || text.startsWith('<html')
        ? 'Respuesta inválida del servidor (HTML en vez de JSON).'
        : 'Respuesta inválida del servidor.')
    }

    return (await res.json()) as T
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }
    throw error
  }
}

const mapPackage = (p: any): PackageView => {
  const categoryName =
    (typeof p.category === 'string' && p.category.trim()) ||
    (typeof p.categoria === 'string' && p.categoria.trim()) ||
    (typeof p.categoria?.nombre === 'string' && p.categoria.nombre.trim()) ||
    'Paquete'

  const vehicles = (p.vehicles ?? p.vehiculos)?.map((v: any) => ({
    id: v.id ?? v.vehiculo?.id,
    name: v.name ?? v.vehiculo?.nombre ?? v.nombre,
    category: v.category ?? v.vehiculo?.categoria ?? v.categoria,
    seats: v.seats ?? v.vehiculo?.asientos ?? v.asientos ?? 0,
    features: v.features ?? v.vehiculo?.features ?? [],
    imageUrl: v.imageUrl ?? v.vehiculo?.imagenUrl ?? v.imagenUrl ?? FALLBACK_IMG,
  })) ?? []

  return {
    id: p.id,
    category: categoryName,
    name: p.nombre || p.name || '',
    description: p.descripcion || p.description || '',
    price: Number(p.precioBase ?? p.price ?? 0),
    vehicle: p.vehiculo || p.vehicle || vehicles[0]?.name || 'Chofer asignado',
    maxPeople: p.maxPersonas ?? p.maxPeople ?? 0,
    includes: p.incluidos ?? p.incluye ?? p.includes ?? ['Chofer profesional', 'Atención personalizada'],
    imageUrl: p.imagenUrl || p.imageUrl || FALLBACK_IMG,
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
  quantity: v.cantidad ?? v.quantity ?? 1,
  features: v.features || ['Chofer certificado', 'Seguro completo'],
  imageUrl: v.imagenUrl || v.imageUrl || FALLBACK_IMG,
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
  imageUrl: x.imagenUrl || x.url || FALLBACK_IMG,
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

const PACKAGES_CACHE_TTL_MS = 30_000
let packagesCache: { data: PackageView[]; expiresAt: number } | null = null
let packagesInFlight: Promise<PackageView[]> | null = null

const invalidatePackagesCache = () => {
  packagesCache = null
  packagesInFlight = null
}

export const fetchPackages = async (): Promise<PackageView[]> => {
  const now = Date.now()
  if (packagesCache && packagesCache.expiresAt > now) {
    return packagesCache.data
  }

  if (packagesInFlight) {
    return packagesInFlight
  }

  packagesInFlight = http<any>('/paquetes')
    .then((data) => {
      const list = Array.isArray(data) ? data : data?.data ?? []
      const mapped = list.map(mapPackage)
      packagesCache = {
        data: mapped,
        expiresAt: Date.now() + PACKAGES_CACHE_TTL_MS,
      }
      return mapped
    })
    .finally(() => {
      packagesInFlight = null
    })

  return packagesInFlight
}

export const fetchVehicles = async (): Promise<VehicleView[]> => {
  const data = await http<any>('/vehiculos')
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(mapVehicle)
}

export const fetchVehicleAvailability = async (vehiculoId: string, fecha: string): Promise<{
  cantidad: number
  ocupados: number
  disponibles: number
  bloqueado: boolean
}> => {
  const data = await http<any>(`/vehicle-availability/check?vehiculoId=${encodeURIComponent(vehiculoId)}&fecha=${encodeURIComponent(fecha)}`)
  if (!data) return { cantidad: 0, ocupados: 0, disponibles: 0, bloqueado: true }
  const cantidadTotal = data.cantidadTotal ?? 0
  const cantidadDisponible = data.cantidadDisponible ?? 0
  return {
    cantidad: cantidadTotal,
    ocupados: Math.max(0, cantidadTotal - cantidadDisponible),
    disponibles: cantidadDisponible,
    bloqueado: data.available === false,
  }
}

export const fetchCalendar = async (): Promise<CalendarSlotView[]> => {
  const data = await http<any[]>('/eventos')
  return data.map(mapCalendar)
}

export const fetchVehicleOccupancy = async (): Promise<VehicleOccupancy[]> => {
  const data = await http<any>('/vehiculos')
  const list = Array.isArray(data) ? data : data?.data ?? []
  const ocupaciones: VehicleOccupancy[] = []
  list.forEach((v: any) => {
    (v.ocupacion || []).forEach((o: any) => {
      const dateStr = (o.fecha || '').slice(0, 10)
      if (dateStr)
        ocupaciones.push({ vehicleId: v.id, date: dateStr, isOccupied: true })
    })
  })
  return ocupaciones
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
      imageUrl: img.url || FALLBACK_IMG,
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
        imageUrl: FALLBACK_IMG,
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

export const fetchPackageExtras = async (paqueteId: string): Promise<ExtraOption[]> => {
  try {
    const data = await http<any>(`/extras/paquetes/${paqueteId}`)
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map(mapExtra)
  } catch {
    return []
  }
}

export const fetchAllExtrasAdmin = async (): Promise<ExtraOption[]> => {
  const data = await http<any>('/extras/admin/all')
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(mapExtra)
}

export const createExtra = async (payload: {
  nombre: string
  descripcion?: string
  precio: number
  categoria?: 'SIN_ALCOHOL' | 'PREMIUM_ALCOHOL'
}): Promise<ExtraOption> => {
  const data = await http<any>('/extras', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapExtra(data)
}

export const updateExtra = async (
  id: string,
  payload: {
    nombre?: string
    descripcion?: string
    precio?: number
    categoria?: 'SIN_ALCOHOL' | 'PREMIUM_ALCOHOL'
  }
): Promise<ExtraOption> => {
  const data = await http<any>(`/extras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapExtra(data)
}

export const deactivateExtra = async (id: string): Promise<ExtraOption> => {
  const data = await http<any>(`/extras/${id}/deactivate`, {
    method: 'PATCH',
  })
  return mapExtra(data)
}

export const activateExtra = async (id: string): Promise<ExtraOption> => {
  const data = await http<any>(`/extras/${id}/activate`, {
    method: 'PATCH',
  })
  return mapExtra(data)
}

export const attachExtraToPackage = async (extraId: string, paqueteId: string): Promise<void> => {
  await http<any>('/extras/attach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraId, paqueteId }),
  })
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
  const input = data as Partial<PackageView> & { categoriaId?: number }
  const payload = {
    categoriaId: input.categoriaId ?? 1,
    categoria: data.category,
    nombre: data.name,
    descripcion: data.description || '',
    precioBase: data.price ?? 0,
    maxPersonas: data.maxPeople ?? 0,
    imagenUrl: data.imageUrl || '',
    vehicleIds: data.vehicleIds,
  }
  const created = await http<any>('/paquetes', { method: 'POST', body: JSON.stringify(payload) })
  invalidatePackagesCache()
  return mapPackage(created)
}

export const updatePackage = async (id: string, patch: Partial<PackageView>) => {
  const input = patch as Partial<PackageView> & { categoriaId?: number }
  const payload = {
    ...(input.categoriaId !== undefined && { categoriaId: input.categoriaId }),
    ...(patch.name && { nombre: patch.name }),
    ...(patch.description && { descripcion: patch.description }),
    ...(patch.category && { categoria: patch.category }),
    ...(patch.price !== undefined && { precioBase: patch.price }),
    ...(patch.maxPeople !== undefined && { maxPersonas: patch.maxPeople }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
    ...(patch.vehicle && { vehiculo: patch.vehicle }),
    ...(patch.includes && { incluye: patch.includes }),
    ...(patch.vehicleIds !== undefined && { vehicleIds: patch.vehicleIds }),
  }
  const updated = await http<any>(`/paquetes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  invalidatePackagesCache()
  return mapPackage(updated)
}

export const deletePackage = async (id: string) => {
  await http(`/paquetes/${id}`, { method: 'DELETE' })
  invalidatePackagesCache()
  return true
}

export type PackageCategory = {
  id: number
  name: string
  estado?: string
}

export const fetchPackageCategories = async (): Promise<PackageCategory[]> => {
  const res = await http<any[]>('/paquetes/categorias')
  const list = Array.isArray(res) ? res : []
  return list.map((item) => ({
    id: Number(item.id),
    name: String(item.nombre ?? item.name ?? ''),
    estado: item.estado,
  }))
}

export const createPackageCategory = async (name: string): Promise<PackageCategory> => {
  const created = await http<any>('/paquetes/categorias', {
    method: 'POST',
    body: JSON.stringify({ nombre: name }),
  })
  return {
    id: Number(created.id),
    name: String(created.nombre ?? created.name ?? ''),
    estado: created.estado,
  }
}

export const updatePackageCategory = async (id: number, name: string): Promise<PackageCategory> => {
  const updated = await http<any>(`/paquetes/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nombre: name }),
  })
  return {
    id: Number(updated.id),
    name: String(updated.nombre ?? updated.name ?? ''),
    estado: updated.estado,
  }
}

export const deletePackageCategory = async (id: number, fallbackCategoryId: number) => {
  await http(`/paquetes/categorias/${id}?fallbackCategoryId=${fallbackCategoryId}`, {
    method: 'DELETE',
  })
  return true
}

export const createVehicle = async (data: Partial<VehicleView>) => {
  const payload = {
    nombre: data.name,
    categoria: data.category || 'General',
    asientos: data.seats || 0,
    cantidad: data.quantity ?? 1,
    imagenUrl: data.imageUrl || '',
  }
  const created = await http<any>('/vehiculos', { method: 'POST', body: JSON.stringify(payload) })
  return mapVehicle(created)
}

export const updateVehicle = async (id: string, patch: Partial<VehicleView>) => {
  const payload = {
    ...(patch.name && { nombre: patch.name }),
    ...(patch.category && { categoria: patch.category }),
    ...(patch.seats !== undefined && { asientos: patch.seats }),
    ...(patch.quantity !== undefined && { cantidad: patch.quantity }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
  }
  const updated = await http<any>(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return mapVehicle(updated)
}

export const deleteVehicle = async (id: string) => {
  await http(`/vehiculos/${id}`, { method: 'DELETE' })
  return true
}

// Vehicle Availability API
export const fetchUnifiedCalendar = async (year: number, month: number, vehiculoId?: string) => {
  const params = new URLSearchParams({ year: String(year), month: String(month) })
  if (vehiculoId) params.append('vehiculoId', vehiculoId)
  const res = await http(`/vehicle-availability/calendar?${params.toString()}`)
  return res
}

export const fetchVehicleBlocks = async (vehiculoId: string) => {
  const res = await http<VehicleBlock[]>(`/vehicle-availability/${vehiculoId}/blocks`)
  return res
}

export const createVehicleBlock = async (data: {
  vehiculoId: string
  fecha: string
  motivo: 'RESERVADO' | 'MANTENIMIENTO' | 'BLOQUEADO_ADMIN' | 'OTRO'
  detalles?: string
  creadoPor?: string
}) => {
  const res = await http('/vehicle-availability/block', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export const deleteVehicleBlock = async (id: string) => {
  await http(`/vehicle-availability/block/${id}`, { method: 'DELETE' })
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
    if (!data.url) {
      throw new Error('No URL returned from server')
    }
    return data.url
  } catch (err) {
    console.error('Error uploading via backend:', err)
    throw err
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

// --- Admin Reservations Table (panel de reservas) ---

export type ReservationsTableFilters = {
  page?: number
  limit?: number
  sortBy?: 'fechaEvento' | 'actualizadoEn' | 'conflictos'
  sortOrder?: 'asc' | 'desc'
  busqueda?: string
  estadoPago?: 'pendiente' | 'parcial' | 'completo'
  tipoEvento?: 'futuro' | 'hoy' | 'pasado'
  origenReserva?: string
  contactoCliente?: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
  vehiculoId?: string
}

export type AdminReservationRow = {
  id: string
  numeroFactura?: string | null
  nombre: string
  email: string
  telefono: string
  estado: string
  fechaEvento: string
  numeroPersonas: number
  precioTotal: number
  paqueteId: string
  vehiculoId: string | null
  restante?: number
  contactoCliente?: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
  adelantoRecibido?: boolean
  pagoCompleto?: boolean
  eventoRealizado?: boolean
  vehiculo?: { nombre: string }
  vehiculoNombre?: string
  paquete?: { nombre: string }
  paqueteNombre?: string
  tieneConflicto?: boolean
  extras?: Array<{ nombre: string; cantidad: number; precioUnitario: number }>
}

export const fetchAdminReservationsTable = async (
  filters: ReservationsTableFilters
): Promise<{ data: AdminReservationRow[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
  const params = new URLSearchParams()
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.limit != null) params.set('limit', String(filters.limit))
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  if (filters.busqueda) params.set('busqueda', filters.busqueda)
  if (filters.estadoPago) params.set('estadoPago', filters.estadoPago)
  if (filters.tipoEvento) params.set('tipoEvento', filters.tipoEvento)
  if (filters.origenReserva) params.set('origenReserva', filters.origenReserva)
  if (filters.contactoCliente) params.set('contactoCliente', filters.contactoCliente)
  if (filters.vehiculoId) params.set('vehiculoId', filters.vehiculoId)
  const qs = params.toString()
  const url = `/reservas/admin/table${qs ? `?${qs}` : ''}`
  const res = await http<{ items: AdminReservationRow[]; pagination: { total: number; page: number; limit: number; pages: number } }>(url)
  return {
    data: res.items ?? [],
    meta: {
      total: res.pagination?.total ?? 0,
      page: res.pagination?.page ?? 1,
      limit: res.pagination?.limit ?? 25,
      totalPages: res.pagination?.pages ?? 0,
    },
  }
}

export const updateContactoCliente = async (
  reservaId: string,
  contactoCliente: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO'
): Promise<void> => {
  await http(`/reservas/${reservaId}/admin/contacto-cliente`, {
    method: 'PATCH',
    body: JSON.stringify({ contactoCliente }),
  })
}

export const updateAdelantoRecibido = async (reservaId: string, adelantoRecibido: boolean): Promise<void> => {
  await http(`/reservas/${reservaId}/admin/adelanto-recibido`, {
    method: 'PATCH',
    body: JSON.stringify({ adelantoRecibido }),
  })
}

export const updatePagoCompleto = async (reservaId: string, pagoCompleto: boolean): Promise<void> => {
  await http(`/reservas/${reservaId}/admin/pago-completo`, {
    method: 'PATCH',
    body: JSON.stringify({ pagoCompleto }),
  })
}

export const updateEventoRealizado = async (reservaId: string, eventoRealizado: boolean): Promise<void> => {
  await http(`/reservas/${reservaId}/admin/evento-realizado`, {
    method: 'PATCH',
    body: JSON.stringify({ eventoRealizado }),
  })
}

// --- Fin Admin Reservations ---

export const submitReservation = async (payload: any) => {
  const fecha = new Date()
  const fechaStr = payload.date || fecha.toISOString().slice(0, 10)

  const body = {
    nombre: payload.name || payload.nombre || 'Invitado',
    email: payload.email,
    telefono: payload.phone || payload.telefono || '00000000',
    identificacion: payload.identificacion,
    tipoEvento: payload.event || payload.tipoEvento || 'Evento',
    fechaEvento: fechaStr,
    origen: payload.origen || 'Pendiente',
    destino: payload.destino || 'Pendiente',
    numeroPersonas: Number(payload.numeroPersonas) || 2,
    paqueteId: payload.paqueteId,
    vehiculoId: payload.vehiculoId,
    tipoPago: payload.tipoPago || 'TARJETA',
    aceptoTerminos: payload.aceptoTerminos === true,
    terminosVersion: payload.terminosVersion || 'v1-2026-03',
    precioBase: payload.precioBase ?? 0,
    precioTotal: payload.precioTotal ?? 0,
    anticipo: payload.anticipo ?? 0,
    restante: payload.restante ?? 0,
    extras: Array.isArray(payload.extras)
      ? payload.extras.map((x: any) => ({
          extraId: x.extraId || x.id,
          cantidad: Number(x.cantidad ?? 1),
          precioUnitario: Number(x.precioUnitario ?? x.price ?? 0),
        }))
      : undefined,
  }

  const res = await http<{ id: string; numeroFactura?: string | null }>('/reservas', { method: 'POST', body: JSON.stringify(body) })
  return { ok: true, id: (res as any).id, numeroFactura: (res as any).numeroFactura ?? null }
}

export const sendConfirmationEmail = async (_email: string, _data: any) => ({ ok: true })
export const sendAdminNotification = async (_data: any) => ({ ok: true })
export const sendWhatsAppNotification = async (_phone: string, _message: string) => ({ ok: true })

export const fetchNotifications = async (): Promise<Notification[]> => {
  const token = getToken()
  if (!token) {
    return []
  }
  try {
    const data = await http<any>('/notificaciones')
    const list = Array.isArray(data) ? data : data?.data ?? []
    return list.map((n: any) => ({
      id: n.id,
      usuarioId: n.usuarioId,
      titulo: n.titulo,
      mensaje: n.mensaje,
      tipo: n.tipo || 'RESERVA',
      reservaId: n.reservaId,
      leida: n.leida ?? false,
      creadoEn: n.creadoEn,
    }))
  } catch (err) {
    console.warn('No se pudieron cargar notificaciones', err)
    return []
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const data = await http<any>(`/notificaciones/${notificationId}/leer`, {
    method: 'PATCH',
  })
  return {
    id: data.id,
    usuarioId: data.usuarioId,
    titulo: data.titulo,
    mensaje: data.mensaje,
    tipo: data.tipo || 'RESERVA',
    reservaId: data.reservaId,
    leida: data.leida ?? true,
    creadoEn: data.creadoEn,
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await http<any>('/notificaciones/marcar-todas-leidas', {
    method: 'PATCH',
  })
}

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await http<any>(`/notificaciones/${notificationId}`, {
    method: 'DELETE',
  })
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

export const requestPasswordReset = async (email: string) => {
  if (!email || !email.trim()) {
    throw new Error('El email es requerido')
  }

  const res = await http<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  })

  return res
}

export const resetPasswordWithToken = async (payload: {
  token: string
  nuevaPassword: string
  confirmarPassword: string
}) => {
  if (!payload.token?.trim()) {
    throw new Error('Token inválido')
  }

  if (!payload.nuevaPassword || !payload.confirmarPassword) {
    throw new Error('Debes completar ambas contraseñas')
  }

  const res = await http<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token: payload.token.trim(),
      nuevaPassword: payload.nuevaPassword,
      confirmarPassword: payload.confirmarPassword,
    }),
  })

  return res
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

type PaymentMethodPayload = {
  tipo: 'TARJETA' | 'SINPE' | 'TRANSFERENCIA'
  referencia: string
}

// Intento de alta de método de pago; mostrará error claro si el backend aún no expone el endpoint
export const addPaymentMethod = async (payload: PaymentMethodPayload) => {
  const body = {
    tipoPago: payload.tipo,
    referencia: payload.referencia,
  }
  return http('/usuarios/metodos-pago', {
    method: 'POST',
    body: JSON.stringify(body),
  })
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

export const createSystemImage = async (data: Partial<SystemImage>) => ({ ...data, id: crypto.randomUUID() }) as SystemImage
export const updateSystemImage = async (_id: string, _data: Partial<SystemImage>) => true
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

// Categorías de Incluidos API
export const fetchAllCategoriasIncluidosAdmin = async () => {
  const res = await http<CategoriaIncluido[]>('/categorias-incluidos/admin')
  return res
}

export const createCategoriaIncluido = async (data: { nombre: string }) => {
  const res = await http<CategoriaIncluido>('/categorias-incluidos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export const updateCategoriaIncluido = async (id: number, data: { nombre?: string }) => {
  const res = await http<CategoriaIncluido>(`/categorias-incluidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res
}

export const deleteCategoriaIncluido = async (id: number) => {
  await http(`/categorias-incluidos/${id}`, { method: 'DELETE' })
  return true
}

// Incluidos API
export const fetchAllIncluidosAdmin = async () => {
  const res = await http<Incluido[]>('/incluidos/admin')
  return res
}

export const createIncluido = async (data: { nombre: string; descripcion?: string; categoriaId: number }) => {
  const res = await http<Incluido>('/incluidos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export const updateIncluido = async (id: string, data: { nombre?: string; descripcion?: string; categoriaId?: number }) => {
  const res = await http<Incluido>(`/incluidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res
}

export const deleteIncluido = async (id: string) => {
  await http(`/incluidos/${id}`, { method: 'DELETE' })
  return true
}

export const attachIncluidoToPackage = async (incluidoId: string, paqueteId: string) => {
  const res = await http('/incluidos/attach', {
    method: 'POST',
    body: JSON.stringify({ incluidoId, paqueteId }),
  })
  return res
}

export const detachIncluidoFromPackage = async (incluidoId: string, paqueteId: string) => {
  await http(`/incluidos/${incluidoId}/packages/${paqueteId}`, { method: 'DELETE' })
  return true
}

// Re-export types
export type { CategoriaIncluido, Incluido } from '../data/content'

export default {
  fetchPackages,
  fetchVehicles,
  fetchCalendar,
  fetchVehicleOccupancy,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  submitReservation,
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
  addPaymentMethod,
}
