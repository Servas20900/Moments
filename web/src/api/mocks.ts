import type { Package, Vehicle, CalendarSlot, VehicleOccupancy, Experience } from '../data/content'
import { packages as pkgs, vehicles as vehs, calendar as cal, vehicleOccupancy as occ, experiences as exps } from '../data/content'

const simulate = <T,>(data: T, delay = 300): Promise<T> =>
  new Promise((res) => setTimeout(() => res(data), delay))

export const fetchPackages = () => simulate<Package[]>(pkgs, 250)
export const fetchVehicles = () => simulate<Vehicle[]>(vehs, 250)
export const fetchCalendar = () => simulate<CalendarSlot[]>(cal, 250)
export const fetchVehicleOccupancy = () => simulate<VehicleOccupancy[]>(occ, 250)
export const fetchExperiences = () => simulate<Experience[]>(exps, 250)

export const createCalendarEvent = (data: Partial<CalendarSlot>) =>
  simulate<CalendarSlot>({
    ...(data as CalendarSlot),
    status: data.status ?? 'evento',
    id: data.id ?? `evt_${Math.random().toString(36).slice(2, 8)}`,
  }, 300).then((ev) => {
    cal.unshift(ev)
    return ev
  })

export const updateCalendarEvent = (id: string, patch: Partial<CalendarSlot>) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = cal.findIndex((x) => x.id === id)
    if (idx >= 0) cal[idx] = { ...cal[idx], ...patch }
    return true
  })

export const deleteCalendarEvent = (id: string) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = cal.findIndex((x) => x.id === id)
    if (idx >= 0) cal.splice(idx, 1)
    return true
  })

// Admin actions (mutate in-memory data for the mock)
export const createPackage = (data: Partial<Package>) =>
  simulate<Package>({ ...(data as Package), id: data.id ?? `pkg_${Math.random().toString(36).slice(2, 8)}` }, 300).then((p) => {
    pkgs.unshift(p)
    return p
  })

export const updatePackage = (id: string, patch: Partial<Package>) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = pkgs.findIndex((x) => x.id === id)
    if (idx >= 0) pkgs[idx] = { ...pkgs[idx], ...patch }
    return true
  })

export const deletePackage = (id: string) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = pkgs.findIndex((x) => x.id === id)
    if (idx >= 0) pkgs.splice(idx, 1)
    return true
  })

export const createVehicle = (data: Partial<Vehicle>) =>
  simulate<Vehicle>({ ...(data as Vehicle), id: data.id ?? `veh_${Math.random().toString(36).slice(2, 8)}` }, 300).then((v) => {
    vehs.unshift(v)
    return v
  })

export const updateVehicle = (id: string, patch: Partial<Vehicle>) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = vehs.findIndex((x) => x.id === id)
    if (idx >= 0) vehs[idx] = { ...vehs[idx], ...patch }
    return true
  })

export const deleteVehicle = (id: string) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = vehs.findIndex((x) => x.id === id)
    if (idx >= 0) vehs.splice(idx, 1)
    return true
  })

export const uploadImage = (fileName: string) =>
  // returns a fake cloudinary url for the uploaded image
  simulate<string>(`https://res.cloudinary.com/demo/image/upload/${fileName}`, 400)

export const submitReservation = (payload: any) =>
  new Promise<{ ok: boolean; id?: string }>((res) =>
    setTimeout(() => res({ ok: true, id: `resv_${Math.random().toString(36).slice(2, 9)}` }), 600)
  )

// Notifications (mock)
export const sendConfirmationEmail = (to: string, reservation: { id?: string; name?: string; email?: string; details?: any }) =>
  new Promise<{ ok: boolean }>((res) =>
    setTimeout(() => {
      // In real implementation: send email via provider (SES, SendGrid, etc.)
      const html = `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111;">
          <h2>Confirmación de reserva - Moments</h2>
          <p>Hola ${reservation.name || ''},</p>
          <p>Gracias por reservar con Moments. Tu reserva <strong>${reservation.id}</strong> ha sido registrada.</p>
          <p>Detalle: ${reservation.details ?? 'No hay detalles'}</p>
          <p>Nos pondremos en contacto para coordinar el pago y la logística.</p>
          <p>— Moments</p>
        </div>
      `
      console.info('[mocks] sendConfirmationEmail ->', { to, reservation, html })
      // store notification in memory
      notifications.unshift({ id: `n_${Math.random().toString(36).slice(2,9)}`, channel: 'email', to, message: html, timestamp: new Date().toISOString(), meta: { reservation } })
      res({ ok: true })
    }, 300)
  )

export const sendAdminNotification = (reservation: { id?: string; name?: string; email?: string; details?: any }) =>
  new Promise<{ ok: boolean }>((res) =>
    setTimeout(() => {
      console.info('[mocks] sendAdminNotification ->', { reservation })
      res({ ok: true })
    }, 300)
  )

export const sendWhatsAppNotification = (phone: string, message: string) =>
  new Promise<{ ok: boolean }>((res) =>
    setTimeout(() => {
      console.info('[mocks] sendWhatsAppNotification ->', { phone, message })
      notifications.unshift({ id: `n_${Math.random().toString(36).slice(2,9)}`, channel: 'whatsapp', to: phone, message, timestamp: new Date().toISOString(), meta: {} })
      res({ ok: true })
    }, 250)
  )

// In-memory notifications store
type Notification = { id: string; channel: 'email' | 'whatsapp' | 'admin'; to?: string; message: string; timestamp: string; meta?: any }
const notifications: Notification[] = []

export const fetchNotifications = (limit = 50) =>
  new Promise<Notification[]>((res) => setTimeout(() => res(notifications.slice(0, limit)), 200))

// Simple user/auth mocks
type User = { id: string; name: string; email: string; phone?: string }
const users: User[] = []
let currentUserId: string | null = null

export const createUser = (payload: { name: string; email: string; phone?: string; password?: string }) =>
  new Promise<{ ok: boolean; id?: string }>((res) =>
    setTimeout(() => {
      const id = `u_${Math.random().toString(36).slice(2, 9)}`
      const user: User = { id, name: payload.name, email: payload.email, phone: payload.phone }
      users.push(user)
      currentUserId = id
      notifications.unshift({ id: `n_${Math.random().toString(36).slice(2,9)}`, channel: 'admin', message: `Nuevo usuario registrado: ${user.email}`, timestamp: new Date().toISOString(), meta: { user } })
      res({ ok: true, id })
    }, 400)
  )

export const loginUser = (payload: { email: string; password?: string }) =>
  new Promise<{ ok: boolean; id?: string }>((res) =>
    setTimeout(() => {
      const user = users.find((u) => u.email === payload.email)
      if (!user) return res({ ok: false })
      currentUserId = user.id
      res({ ok: true, id: user.id })
    }, 300)
  )

export const getCurrentUser = () =>
  new Promise<User | null>((res) => setTimeout(() => res(users.find((u) => u.id === currentUserId) ?? null), 200))

export const updateUser = (id: string, patch: Partial<User>) =>
  new Promise<boolean>((res) => setTimeout(() => {
    const idx = users.findIndex(u => u.id === id)
    if (idx >= 0) users[idx] = { ...users[idx], ...patch }
    res(true)
  }, 250))


export const createExperience = (data: Partial<Experience>) =>
  simulate<Experience>({ ...(data as Experience), id: data.id ?? `exp_${Math.random().toString(36).slice(2, 8)}` }, 300).then((e) => {
    exps.unshift(e)
    return e
  })

export const updateExperience = (id: string, patch: Partial<Experience>) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = exps.findIndex((x) => x.id === id)
    if (idx >= 0) exps[idx] = { ...exps[idx], ...patch }
    return true
  })

export const deleteExperience = (id: string) =>
  simulate<boolean>(true, 250).then(() => {
    const idx = exps.findIndex((x) => x.id === id)
    if (idx >= 0) exps.splice(idx, 1)
    return true
  })

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
}
