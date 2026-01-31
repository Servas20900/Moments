import type { PackageView, VehicleView, CalendarSlotView, ExperienceView, SystemImage, HeroSlide } from '../data/content'
import type { ExtraOption } from '../contexts/ReservationContext'
import { getToken as getAuthToken, saveToken, saveUser } from '../utils/auth'

// Base URL for the backend API (Spanish routes)
const rawApiUrl = import.meta.env.VITE_API_URL
if (!rawApiUrl) {
  throw new Error('VITE_API_URL is required. Set it in your environment before building.')
}
const API_URL = rawApiUrl.replace(/\/$/, '')
const FALLBACK_IMG = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

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
    imageUrl: v.imageUrl ?? v.vehiculo?.imagenUrl ?? v.imagenUrl ?? FALLBACK_IMG,
  })) ?? []

  return {
    id: p.id,
    category: p.categoria || 'Paquete',
    name: p.nombre || p.name || '',
    description: p.descripcion || p.description || '',
    price: Number(p.precioBase ?? p.price ?? 0),
    vehicle: p.vehiculo || p.vehicle || vehicles[0]?.name || 'Chofer asignado',
    maxPeople: p.maxPersonas ?? p.maxPeople ?? 0,
    includes: p.incluye ?? p.includes ?? ['Chofer profesional', 'Atención personalizada'],
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
  rate: v.tarifaPorHora ?? v.rate ?? 'Consultar',
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
  const payload = {
    categoriaId: 1, // Asignar categoría por defecto
    categoria: data.category,
    nombre: data.name,
    descripcion: data.description || '',
    precioBase: data.price ?? 0,
    maxPersonas: data.maxPeople ?? 0,
    imagenUrl: data.imageUrl || '',
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
    ...(patch.includes && { incluye: patch.includes }),
    ...(patch.vehicleIds && { vehicleIds: patch.vehicleIds }),
  }
  await http(`/paquetes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  return true
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

export default {
  fetchPackages,
  fetchVehicles,
  fetchCalendar,
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
