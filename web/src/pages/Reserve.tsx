import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, PageHeader, Section } from '../components/Layout'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import { fetchPackages, fetchVehicles, fetchPackageExtras, fetchExtras, fetchVehicleAvailability, checkVehicleAvailability, fetchAllIncluidos, fetchPackageIncluidosGrouped } from '../api/api'
import type { PackageView, VehicleView, VehicleAvailability } from '../data/content'
import type { Incluido } from '../api/api'
import { useReservation, type ExtraOption } from '../contexts/ReservationContext'
import { useCalendarContext } from '../contexts/CalendarContext'
import { useTheme } from '../hooks/useTheme'
import { useAlert } from '../contexts/AlertContext'
import Card from '@/components/Card'

type FormState = {
  date: string
  time: string
  people: string
  origin: string
  destinationOption: string // event id or 'otro'
  customDestination: string
  notes: string
  extras: string[]
  incluidos: string[]
  vehicleId?: string
}

const buildReservationId = () => `res_${Date.now()}`

const Reserve = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedPackage, startReservation, setReservation } = useReservation()
  const { events } = useCalendarContext()
  const { theme } = useTheme()
  const { showAlert } = useAlert()

  const sortedEvents = useMemo(() => {
    return events
      .filter((ev) => ev.status === 'evento')
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])

  const [pkg, setPkg] = useState<PackageView | null>(selectedPackage)
  const [vehicles, setVehicles] = useState<VehicleView[]>([])
  const [occupiedVehicleIds, setOccupiedVehicleIds] = useState<string[]>([])
  const [extras, setExtras] = useState<ExtraOption[]>([])
  const [incluidos, setIncluidos] = useState<Incluido[]>([])
  const [incluidosGrouped, setIncluidosGrouped] = useState<Record<number, { categoria: { id: number; nombre: string }; incluidos: Incluido[] }>>({})
  const [vehicleAvailability, setVehicleAvailability] = useState<VehicleAvailability | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const initialPeople = Math.max(1, selectedPackage?.maxPeople ? Math.min(2, selectedPackage.maxPeople) : 2)

  const [form, setForm] = useState<FormState>({
    date: '',
    time: '18:00',
    people: String(initialPeople),
    origin: '',
    destinationOption: '',
    customDestination: '',
    notes: '',
    extras: [],
    incluidos: [],
    vehicleId: undefined,
  })

  useEffect(() => {
    let mounted = true
    const packageId = (location.state as { packageId?: string } | undefined)?.packageId

    const load = async () => {
      setLoading(true)
      const needsPackage = !selectedPackage || (packageId && selectedPackage.id !== packageId)
const packagesPromise = needsPackage ? fetchPackages() : Promise.resolve<PackageView[]>([])

      try {
        const [packagesData, vehiclesData] = await Promise.all([packagesPromise, fetchVehicles()])
        if (!mounted) return

        const foundPackage = needsPackage
          ? packagesData.find((p) => (packageId ? p.id === packageId : true)) || null
          : selectedPackage || null

        setPkg(foundPackage)
        if (foundPackage) {
          startReservation(foundPackage)
          setForm((prev) => {
            const prevCount = Number(prev.people)
            if (!Number.isFinite(prevCount)) return prev
            const clamped = Math.max(1, Math.min(prevCount, foundPackage.maxPeople || prevCount))
            return { ...prev, people: String(clamped) }
          })
          // Cargar extras asociados al paquete; si no hay, cargar catálogo global
          try {
            const pkgExtras = await fetchPackageExtras(foundPackage.id)
            if (pkgExtras.length > 0) setExtras(pkgExtras)
            else {
              const globalExtras = await fetchExtras()
              setExtras(globalExtras)
            }
          } catch {
            setExtras([])
          }

          // Cargar incluidos asociados al paquete; si no hay, cargar catálogo global
          try {
            const pkgIncluidos = await fetchPackageIncluidosGrouped(foundPackage.id)
            if (Object.keys(pkgIncluidos).length > 0) {
              setIncluidosGrouped(pkgIncluidos)
              // Aplanar los incluidos para el estado simple
              const allIncluidos = Object.values(pkgIncluidos).flatMap((cat) => cat.incluidos)
              setIncluidos(allIncluidos)
            } else {
              const globalIncluidos = await fetchAllIncluidos()
              setIncluidos(globalIncluidos)
              // Agrupar los incluidos globales por categoría
              const grouped = globalIncluidos.reduce((acc, inc) => {
                if (!acc[inc.categoriaId]) {
                  acc[inc.categoriaId] = {
                    categoria: { id: inc.categoriaId, nombre: inc.categoriaNombre },
                    incluidos: [],
                  }
                }
                acc[inc.categoriaId].incluidos.push(inc)
                return acc
              }, {} as Record<number, { categoria: { id: number; nombre: string }; incluidos: Incluido[] }>)
              setIncluidosGrouped(grouped)
            }
          } catch {
            setIncluidos([])
            setIncluidosGrouped({})
          }
        }
        setVehicles(vehiclesData)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [location.state, selectedPackage, startReservation])

  useEffect(() => {
    let active = true

    if (!form.date || !form.time) {
      setOccupiedVehicleIds([])
      return () => { active = false }
    }

    const start = `${form.date}T${form.time}:00`
    const [hh, mm] = form.time.split(':').map(Number)
    const endDate = new Date(`${form.date}T${form.time}:00`)
    endDate.setHours(hh + 2, mm || 0, 0, 0)
    const isoEnd = endDate.toISOString()
    const end = `${isoEnd.slice(0, 10)}T${isoEnd.slice(11, 19)}`

    fetchVehicleAvailability({ date: form.date, start, end })
      .then((ids) => {
        if (active) setOccupiedVehicleIds(ids)
      })
      .catch(() => {
        if (active) setOccupiedVehicleIds([])
      })

    return () => {
      active = false
    }
  }, [form.date, form.time])

  // Verificar disponibilidad por día (admin blocks + vehicle units)
  useEffect(() => {
    let active = true

    if (!form.vehicleId || !form.date) {
      setVehicleAvailability(null)
      return () => { active = false }
    }

    setCheckingAvailability(true)
    checkVehicleAvailability(form.vehicleId, form.date)
      .then((availability) => {
        if (active) {
          setVehicleAvailability(availability)
          setCheckingAvailability(false)
        }
      })
      .catch(() => {
        if (active) {
          setVehicleAvailability(null)
          setCheckingAvailability(false)
        }
      })

    return () => {
      active = false
    }
  }, [form.vehicleId, form.date])

  const peopleCount = Number(form.people)

  const packageVehicleIds = useMemo(() => {
    if (pkg?.vehicleIds?.length) return pkg.vehicleIds
    if (pkg?.vehicles?.length) return pkg.vehicles.map((v) => v.id)
    return []
  }, [pkg])

  const baseVehicles = useMemo(() => {
    if (packageVehicleIds.length === 0) return vehicles
    return vehicles.filter((v) => packageVehicleIds.includes(v.id))
  }, [vehicles, packageVehicleIds])

  const compatibleVehicles = useMemo(
    () => baseVehicles.filter((v) => {
      const seatsOk = !peopleCount || v.seats >= peopleCount
      const availabilityOk = !form.date || !form.time || !occupiedVehicleIds.includes(v.id)
      return seatsOk && availabilityOk
    }),
    [baseVehicles, peopleCount, form.date, form.time, occupiedVehicleIds],
  )

  useEffect(() => {
    if (form.vehicleId && !compatibleVehicles.some((v) => v.id === form.vehicleId)) {
      setForm((prev) => ({ ...prev, vehicleId: undefined }))
    }
    // Auto-select if only one vehicle available
    if (!form.vehicleId && compatibleVehicles.length === 1) {
      setForm((prev) => ({ ...prev, vehicleId: compatibleVehicles[0].id }))
    }
  }, [compatibleVehicles, form.vehicleId])

  const selectedExtras = useMemo(
    () => extras.filter((extra) => form.extras.includes(extra.id)),
    [form.extras, extras],
  )

  const selectedEvent = useMemo(() => {
    return sortedEvents.find((ev) => ev.id === form.destinationOption)
  }, [sortedEvents, form.destinationOption])

  const extrasTotal = selectedExtras.reduce((acc, extra) => acc + extra.price, 0)
  const packagePrice = pkg?.price ?? 0
  const vehicleFee = 0 // Dejarlo listo para integrar tarifas por vehículo más adelante
  const total = packagePrice + extrasTotal + vehicleFee
  const deposit = total * 0.5

  const tomorrow = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }, [])

  const availabilityHint = !form.date || !form.time
    ? 'Selecciona fecha y hora para validar disponibilidad.'
    : 'Mostrando solo vehículos disponibles en ese horario.'

  const noVehiclesMessage = !form.date || !form.time
    ? `No hay vehículos compatibles con ${form.people} personas.`
    : `No hay vehículos disponibles para ${form.people} personas en ese horario.`

  // Validación de incluidos: verifica que cada categoría tenga al menos una selección
  const validateIncluidos = (): boolean => {
    const categories = Object.values(incluidosGrouped)
    if (categories.length === 0) return true // Si no hay categorías, es válido
    
    for (const category of categories) {
      const categoryIncludoIds = category.incluidos.map(inc => inc.id)
      const hasSelection = categoryIncludoIds.some(id => form.incluidos.includes(id))
      if (!hasSelection) {
        return false
      }
    }
    return true
  }

  // Obtiene las categorías sin selección para mensajes de error
  const getMissingIncludoCategories = (): string[] => {
    const missing: string[] = []
    const categories = Object.values(incluidosGrouped)
    
    for (const category of categories) {
      const categoryIncludoIds = category.incluidos.map(inc => inc.id)
      const hasSelection = categoryIncludoIds.some(id => form.incluidos.includes(id))
      if (!hasSelection) {
        missing.push(category.categoria.nombre)
      }
    }
    return missing
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pkg) {
      navigate('/paquetes')
      return
    }
    const peopleValue = Number(form.people)
    if (!Number.isFinite(peopleValue) || peopleValue < 1) {
      showAlert('Validación', 'Ingresa un número válido de personas', 'warning')
      return
    }
    if (pkg.maxPeople && peopleValue > pkg.maxPeople) {
      showAlert('Límite de personas', `El paquete admite hasta ${pkg.maxPeople} personas`, 'warning')
      return
    }
    const selectedEvent = events.find((e) => e.id === form.destinationOption)
    const destinationText = form.destinationOption === 'otro'
      ? form.customDestination.trim()
      : (selectedEvent?.title || '')

    if (!form.date || !form.time || !form.origin.trim() || !destinationText) {
      showAlert('Campos incompletos', 'Completa fecha, horario, origen y destino para continuar', 'warning')
      return
    }

    // Validar que se haya seleccionado uno de cada categoría de incluidos
    if (!validateIncluidos()) {
      const missing = getMissingIncludoCategories()
      const categoriasText = missing.length === 1 
        ? `categoría "${missing[0]}"`
        : `categorías: ${missing.map(c => `"${c}"`).join(', ')}`
      showAlert(
        'Selección incompleta',
        `Debes seleccionar una opción para cada categoría de incluidos. Falta elegir en: ${categoriasText}`,
        'warning'
      )
      return
    }

    setSubmitting(true)
    const vehicle = vehicles.find((v) => v.id === form.vehicleId)
    const selectedIncluidos = incluidos.filter((inc) => form.incluidos.includes(inc.id))
    const reservation = {
      id: buildReservationId(),
      package: {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        category: pkg.category,
        imageUrl: pkg.imageUrl,
        maxPeople: pkg.maxPeople,
      },
      vehicle: vehicle
        ? {
            id: vehicle.id,
            name: vehicle.name,
            seats: vehicle.seats,
            rate: vehicle.rate,
            imageUrl: vehicle.imageUrl,
          }
        : undefined,
      date: form.date,
      time: form.time,
      origin: form.origin,
      destination: destinationText,
      people: peopleValue,
      extras: selectedExtras,
      incluidos: selectedIncluidos,
      total,
      deposit,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    setReservation(reservation)
    navigate('/carrito')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12 text-gray-300">Cargando reserva...</div>
      </Layout>
    )
  }

  if (!pkg) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Reserva"
          title="Selecciona un paquete"
          description="Necesitas elegir un paquete para configurar tu reserva."
        />
        <Section spacing="md">
          <Button variant="primary" onClick={() => navigate('/paquetes')}>Ver paquetes</Button>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Reserva"
        title="Configura tu experiencia"
      />
      <Section spacing="lg">
        <Card className="mb-8">
          <p className="text-gray-300">
            Completa los datos necesarios para coordinar tu servicio. La información proporcionada permite verificar disponibilidad y preparar la experiencia según tus preferencias.
          </p>
        </Card>
      </Section>

      <Section spacing="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                  <SafeImage src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-1">{pkg.category}</p>
                  <h2 className="text-xl font-bold text-white mb-1">{pkg.name}</h2>
                  <p className="text-sm text-gray-300">Capacidad hasta {pkg.maxPeople} personas</p>
                  <p className="text-lg font-bold text-amber-300 mt-1">${pkg.price}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate(`/paquetes/${pkg.id}`)}>Ver detalle</Button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>


              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-200">Selecciona vehículo</p>
                    <span className="text-xs text-gray-400">Solo opciones del paquete con suficientes asientos</span>
                  </div>
                  <p className="text-xs text-gray-500">{availabilityHint}</p>
                </div>
                <div className="space-y-3">
                  {compatibleVehicles.length === 0 && (
                    <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                      {noVehiclesMessage} Reduce el número o contáctanos para opciones especiales.
                    </div>
                  )}
                  {compatibleVehicles.map((vehicle) => (
                    <label
                      key={vehicle.id}
                      className={`flex items-center gap-4 rounded-xl border px-4 py-3 cursor-pointer transition ${
                        form.vehicleId === vehicle.id ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="vehicle"
                        value={vehicle.id}
                        checked={form.vehicleId === vehicle.id}
                        onChange={(e) => setForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
                        className="accent-amber-300"
                      />
                      <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10">
                        <SafeImage src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{vehicle.name}</p>
                        <p className="text-sm text-gray-400">{vehicle.seats} asientos</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mensaje de disponibilidad del vehículo */}
              {form.vehicleId && form.date && (
                <div className="space-y-2">
                  {checkingAvailability && (
                    <div className="rounded-lg border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-200">
                      Verificando disponibilidad...
                    </div>
                  )}
                  {!checkingAvailability && vehicleAvailability && (
                    <>
                      {vehicleAvailability.available ? (
                        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                          ✓ Vehículo disponible para esta fecha · {vehicleAvailability.cantidadDisponible} de {vehicleAvailability.cantidadTotal} unidades disponibles
                        </div>
                      ) : (
                        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                          ✗ Vehículo no disponible para esta fecha 
                          {vehicleAvailability.bloqueadoPor && ` · Motivo: ${vehicleAvailability.bloqueadoPor}`}
                          {vehicleAvailability.detalles && ` · ${vehicleAvailability.detalles}`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <p className="text-gray-300">
                  Información de reserva
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Fecha</span>
                  <input
                    type="date"
                    value={form.date}
                    min={tomorrow}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-gray-400">Solo fechas futuras</span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Horario</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Origen</span>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                    placeholder="Lugar de salida"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Destino (evento)</span>
                  <select
                    value={form.destinationOption}
                    onChange={(e) => setForm((prev) => ({ ...prev, destinationOption: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      {sortedEvents.length ? 'Selecciona un evento' : 'No hay eventos disponibles'}
                    </option>
                    {sortedEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} · {ev.date}
                      </option>
                    ))}
                    <option value="otro">Otro</option>
                  </select>
                  {form.destinationOption === 'otro' && (
                    <input
                      type="text"
                      value={form.customDestination}
                      onChange={(e) => setForm((prev) => ({ ...prev, customDestination: e.target.value }))}
                      placeholder="Especifica el destino"
                      className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                      required
                    />
                  )}
                  {selectedEvent && (
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="inline-block mr-2">Fecha: {selectedEvent.date}</span>
                      {selectedEvent.tag && <span className="inline-block mr-2">Etiqueta: {selectedEvent.tag}</span>}
                      {selectedEvent.detail && <span className="inline-block">{selectedEvent.detail}</span>}
                    </div>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Número de personas</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={pkg.maxPeople}
                    value={form.people}
                    onChange={(e) => {
                      const { value } = e.target
                      if (value === '' || /^\d+$/.test(value)) {
                        setForm((prev) => ({ ...prev, people: value }))
                      }
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    required
                  />
                  <span className="text-xs text-gray-400">Máximo {pkg.maxPeople}</span>
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-200">Extras</p>
                {extras.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
                    No hay extras disponibles en este momento
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extras.map((extra) => {
                      const checked = form.extras.includes(extra.id)
                      return (
                        <label
                          key={extra.id}
                          className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                            checked ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setForm((prev) => ({
                                ...prev,
                                extras: e.target.checked
                                  ? [...prev.extras, extra.id]
                                  : prev.extras.filter((id) => id !== extra.id),
                              }))
                            }}
                            className="accent-amber-300 mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-white font-semibold">{extra.name}</p>
                            <p className="text-sm text-gray-400">{extra.description}</p>
                            {extra.categoria && <p className="text-xs text-amber-300/60 mt-1">{extra.categoria === 'SIN_ALCOHOL' ? 'Sin alcohol' : 'Premium con alcohol'}</p>}
                          </div>
                          <span className="text-amber-300 font-semibold">+${extra.price}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Incluidos / Bebidas</p>
                {incluidos.length === 0 ? (
                  <div className={`rounded-xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-600'}`}>
                    No hay incluidos disponibles en este momento
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.values(incluidosGrouped).length === 0 ? (
                      <div className={`rounded-xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-600'}`}>
                        Sin categorías disponibles
                      </div>
                    ) : (
                      Object.values(incluidosGrouped).map((group) => (
                        <div
                          key={group.categoria.id}
                          className={`rounded-lg border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                        >
                          <p className={`mb-3 text-sm font-semibold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                            {group.categoria.nombre}
                          </p>
                          <div className="space-y-2">
                            {group.incluidos.map((incluido) => {
                              const isSelected = form.incluidos.includes(incluido.id)
                              return (
                                <label
                                  key={incluido.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 transition ${
                                    isSelected
                                      ? theme === 'dark'
                                        ? 'bg-amber-300/15 border border-amber-300/40'
                                        : 'bg-amber-100/40 border border-amber-200'
                                      : theme === 'dark'
                                        ? 'hover:bg-white/5'
                                        : 'hover:bg-gray-100'
                                  } border`}
                                >
                                  <input
                                    type="radio"
                                    name={`categoria_${group.categoria.id}`}
                                    value={incluido.id}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      // Remove any other selection from this category
                                      const otherCategories = form.incluidos.filter(
                                        (id) => !group.incluidos.find((inc) => inc.id === id)
                                      )
                                      setForm((prev) => ({
                                        ...prev,
                                        incluidos: [...otherCategories, e.target.value],
                                      }))
                                    }}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                      {incluido.nombre}
                                    </p>
                                    {incluido.descripcion && (
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {incluido.descripcion}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    )}
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Selecciona una opción por cada categoría
                    </p>
                    {!validateIncluidos() && (
                      <div className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-red-500/40 bg-red-500/10' : 'border-red-300 bg-red-50'}`}>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                          ⚠ Faltan selecciones:
                        </p>
                        <ul className={`mt-2 list-inside list-disc text-xs ${theme === 'dark' ? 'text-red-300/80' : 'text-red-600'}`}>
                          {getMissingIncludoCategories().map((cat) => (
                            <li key={cat}>{cat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-gray-200">Notas o solicitudes especiales</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                  placeholder="Ej: Decoración especial, punto de contacto, restricciones de acceso"
                />
              </label>

              <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => navigate('/paquetes')}>Volver</Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting || !form.date || !form.time || !validateIncluidos() || Boolean(form.vehicleId && vehicleAvailability && !vehicleAvailability.available)}
                >
                  {submitting ? 'Guardando...' : 'Añadir al carrito'}
                </Button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Resumen</p>
                <span className="text-xs text-amber-300">No se cobra aún</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Paquete</span>
                <span>${packagePrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Extras</span>
                <span>${extrasTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Vehículo</span>
                <span>{vehicleFee > 0 ? `$${vehicleFee.toFixed(2)}` : 'Incluido'}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-lg font-bold text-white">
                <span>Total estimado</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-amber-200">
                <span>Anticipo (50%)</span>
                <span>${deposit.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-100">
              Confirmarás en el siguiente paso. Aún no se realiza ningún cobro.
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  )
}

export default Reserve
