import type { Package, Vehicle, CalendarSlot, VehicleOccupancy, Experience, SystemImage, HeroSlide } from '../data/content'
import { getToken as getAuthToken, saveToken, saveUser } from '../utils/auth'

// Base URL for the backend API (Spanish routes)
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const FALLBACK_IMG = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

const getToken = () => getAuthToken() || ''
const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers as Record<string, string> || {}),
    } as Record<string, string>,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

const mapPackage = (p: any): Package => ({
  id: p.id,
  category: p.categoria || 'Paquete',
  name: p.nombre,
  description: p.descripcion,
  price: Number(p.precioBase ?? p.price ?? 0),
  vehicle: p.vehiculo || p.vehicle || 'Chofer asignado',
  maxPeople: p.maxPersonas ?? p.maxPeople ?? 0,
  includes: p.incluye ?? p.includes ?? ['Chofer profesional', 'Atención personalizada'],
  imageUrl: p.imagenUrl || p.imageUrl || FALLBACK_IMG,
  addons: p.addons,
})

const mapVehicle = (v: any): Vehicle => ({
  id: v.id,
  name: v.nombre || v.name,
  category: v.categoria || v.category,
  seats: v.asientos ?? v.seats ?? 0,
  rate: v.tarifaPorHora ?? v.rate ?? 'Consultar',
  features: v.features || ['Chofer certificado', 'Seguro completo'],
  imageUrl: v.imagenUrl || v.imageUrl || FALLBACK_IMG,
})

const mapCalendar = (e: any): CalendarSlot => {
  // Prefer already-mapped fields from backend, fall back to legacy ones
  const status: CalendarSlot['status'] = e.status
    ? (e.status as CalendarSlot['status'])
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

const mapExperience = (x: any): Experience => ({
  id: x.id,
  title: x.titulo || x.nombre,
  imageUrl: x.imagenUrl || x.url || FALLBACK_IMG,
})

export const fetchPackages = async (): Promise<Package[]> => {
  const data = await http<any>('/paquetes')
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(mapPackage)
}

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const data = await http<any[]>('/vehiculos')
  return data.map(mapVehicle)
}

export const fetchCalendar = async (): Promise<CalendarSlot[]> => {
  const data = await http<any[]>('/eventos')
  return data.map(mapCalendar)
}

export const fetchVehicleOccupancy = async (): Promise<VehicleOccupancy[]> => {
  const data = await http<any[]>('/vehiculos')
  const ocupaciones: VehicleOccupancy[] = []
  data.forEach((v) => {
    (v.ocupacion || []).forEach((o: any) => {
      const dateStr = (o.fecha || '').slice(0, 10)
      if (dateStr)
        ocupaciones.push({ vehicleId: v.id, date: dateStr, isOccupied: true })
    })
  })
  return ocupaciones
}

export const fetchExperiences = async (): Promise<Experience[]> => {
  const data = await http<any[]>('/experiencias')
  return data.map(mapExperience)
}

export const fetchSystemImages = async (): Promise<SystemImage[]> => {
  const exps = await fetchExperiences()
  return exps.map((e, idx) => ({
    id: e.id,
    category: 'EXPERIENCIA',
    name: e.title,
    url: e.imageUrl,
    description: '',
    altText: e.title,
    order: idx,
    isActive: true,
  }))
}

export const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    // Cargar imágenes con categoría LANDING_PAGE desde la tabla Imagen
    const data = await http<any>('/imagenes?categoria=LANDING_PAGE&take=10')
    const images = data?.data || data || []
    return images.map((img: any, idx: number) => ({
      id: img.id,
      title: img.altText || 'Momentos Especiales',
      subtitle: 'Transporte de Lujo',
      description: 'Vive la experiencia de ser trasladado en el máximo confort',
      imageUrl: img.url || FALLBACK_IMG,
      order: idx,
      isActive: true,
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

export const createCalendarEvent = async (data: Partial<CalendarSlot>) => {
  const payload = {
    titulo: data.title || 'Evento',
    fecha: data.date,
    estado: data.status === 'evento' ? 'BLOQUEADO' : data.status === 'ocupado' ? 'RESERVADO' : 'DISPONIBLE',
    detalle: data.detail,
    etiqueta: data.tag,
    imagenUrl: data.imageUrl,
  }
  console.log('[API] Creating event with payload:', payload)
  const created = await http<any>('/eventos', { method: 'POST', body: JSON.stringify(payload) })
  console.log('[API] Raw response from server:', created)
  const mapped = mapCalendar(created)
  console.log('[API] Mapped event:', mapped)
  return mapped
}

export const updateCalendarEvent = async (id: string, patch: Partial<CalendarSlot>) => {
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

export const createPackage = async (data: Partial<Package>) => {
  const payload = {
    categoriaId: 1, // Asignar categoría por defecto
    nombre: data.name,
    descripcion: data.description || '',
    precioBase: data.price ?? 0,
    maxPersonas: data.maxPeople ?? 0,
    imagenUrl: data.imageUrl || '',
  }
  const created = await http<any>('/paquetes', { method: 'POST', body: JSON.stringify(payload) })
  return mapPackage(created)
}

export const updatePackage = async (id: string, patch: Partial<Package>) => {
  const payload = {
    ...(patch.name && { nombre: patch.name }),
    ...(patch.description && { descripcion: patch.description }),
    ...(patch.price !== undefined && { precioBase: patch.price }),
    ...(patch.maxPeople !== undefined && { maxPersonas: patch.maxPeople }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
    ...(patch.vehicle && { vehiculo: patch.vehicle }),
    ...(patch.includes && { incluye: patch.includes }),
  }
  await http(`/paquetes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
}

export const deletePackage = async (id: string) => {
  await http(`/paquetes/${id}`, { method: 'DELETE' })
  return true
}

export const createVehicle = async (data: Partial<Vehicle>) => {
  const payload = {
    nombre: data.name,
    categoria: data.category || 'General',
    asientos: data.seats || 0,
    tarifaPorHora: typeof data.rate === 'string' ? parseFloat(data.rate) || 0 : data.rate || 0,
    imagenUrl: data.imageUrl || '',
  }
  const created = await http<any>('/vehiculos', { method: 'POST', body: JSON.stringify(payload) })
  return mapVehicle(created)
}

export const updateVehicle = async (id: string, patch: Partial<Vehicle>) => {
  const payload = {
    ...(patch.name && { nombre: patch.name }),
    ...(patch.category && { categoria: patch.category }),
    ...(patch.seats !== undefined && { asientos: patch.seats }),
    ...(patch.rate && { tarifaPorHora: typeof patch.rate === 'string' ? parseFloat(patch.rate) || 0 : patch.rate }),
    ...(patch.imageUrl && { imagenUrl: patch.imageUrl }),
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
    return data.url || FALLBACK_IMG
  } catch (err) {
    console.error('Error uploading via backend:', err)
    return FALLBACK_IMG
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
  const fechaStr = payload.date || fecha.toISOString().slice(0, 10)

  const body = {
    nombre: payload.name || payload.nombre || 'Invitado',
    email: payload.email,
    telefono: payload.phone || payload.telefono || '00000000',
    identificacion: payload.identificacion,
    tipoEvento: payload.event || payload.tipoEvento || 'Evento',
    fechaEvento: fechaStr,
    horaInicio: payload.horaInicio || `${fechaStr}T18:00:00`,
    horaFin: payload.horaFin || `${fechaStr}T20:00:00`,
    origen: payload.origen || 'Pendiente',
    destino: payload.destino || 'Pendiente',
    numeroPersonas: Number(payload.numeroPersonas) || 2,
    paqueteId: payload.paqueteId,
    vehiculoId: payload.vehiculoId,
    tipoPago: payload.tipoPago || 'TARJETA',
  }

  const res = await http<{ id: string }>('/reservas', { method: 'POST', body: JSON.stringify(body) })
  return { ok: true, id: (res as any).id }
}

export const sendConfirmationEmail = async (_email: string, _data: any) => ({ ok: true })
export const sendAdminNotification = async (_data: any) => ({ ok: true })
export const sendWhatsAppNotification = async (_phone: string, _message: string) => ({ ok: true })

export const fetchNotifications = async () => {
  const token = getToken()
  if (!token) {
    return []
  }
  try {
    const data = await http<any[]>('/usuarios/notificaciones')
    return data
  } catch (err) {
    console.warn('No se pudieron cargar notificaciones', err)
    return []
  }
}

export const createUser = async (payload: { name: string; email: string; phone?: string; password?: string }) => {
  const res = await http<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nombre: payload.name,
      email: payload.email,
      contrasena: payload.password || 'Moments123!',
      telefono: payload.phone || '00000000',
    }),
  })
  if (res?.token || res?.access_token) {
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
  }
  return { ok: true, id: res.user?.id ?? res.id }
}

export const loginUser = async (payload: { email: string; password?: string }) => {
  const res = await http<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: payload.email, contrasena: payload.password || 'Moments123!' }),
  })
  if (res?.token || res?.access_token) {
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
    })
  }
  return { ok: true, id: res.user?.id ?? res.id }
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

export const createExperience = async (data: Partial<Experience>) => {
  const payload = {
    titulo: data.title,
    imagenUrl: data.imageUrl,
  }
  const created = await http<any>('/experiencias', { method: 'POST', body: JSON.stringify(payload) })
  return mapExperience(created)
}

export const updateExperience = async (id: string, patch: Partial<Experience>) => {
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
export const deleteSystemImage = async (_id: string) => true
export const createHeroSlide = async (data: Partial<HeroSlide>) => ({ ...data, id: crypto.randomUUID(), order: 0, isActive: true }) as HeroSlide
export const updateHeroSlide = async (_id: string, _data: Partial<HeroSlide>) => true
export const deleteHeroSlide = async (_id: string) => true

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
}
