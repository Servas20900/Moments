import { useEffect, useState } from 'react'
import { FaFilter } from 'react-icons/fa'
import { HiTruck } from 'react-icons/hi'
import Button from '../../components/Button'
import Card from '../../components/Card'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useTheme } from '../../hooks/useTheme'
import { 
  fetchVehicles,
  fetchPackages,
  fetchUnifiedCalendar,
  fetchVehicleBlocks, 
  createVehicleBlock, 
  deleteVehicleBlock
} from '../../api/api'
import type { VehicleView, VehicleBlock, PackageView } from '../../data/content'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const AdminVehicleAvailability = () => {
  const { theme } = useTheme()
  const today = new Date()
  
  // ============== ESTADO GLOBAL ==============
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  
  const [vehicles, setVehicles] = useState<VehicleView[]>([])
  const [packages, setPackages] = useState<PackageView[]>([])
  const [calendarData, setCalendarData] = useState<any>(null)
  const [blocks, setBlocks] = useState<VehicleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(false)
  
  // ============== FILTROS GLOBALES ==============
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('') // '' = TODOS
  
  // ============== BLOQUEOS ==============
  const [blockForm, setBlockForm] = useState({
    fecha: '',
    motivo: 'BLOQUEADO_ADMIN' as 'RESERVADO' | 'MANTENIMIENTO' | 'BLOQUEADO_ADMIN' | 'OTRO',
    detalles: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // ============== CARGA INICIAL ==============
  useEffect(() => {
    let mounted = true
    Promise.all([fetchVehicles(), fetchPackages()])
      .then(([v, p]) => {
        if (!mounted) return
        setVehicles(v)
        setPackages(p)
        setLoading(false)
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  // ============== CARGAR CALENDARIO ==============
  useEffect(() => {
    loadData()
  }, [selectedVehicleId, currentMonth, currentYear])

  const loadData = async () => {
    setCalendarLoading(true)
    try {
      // Cargar calendario
      const calendar = await fetchUnifiedCalendar(currentYear, currentMonth + 1, selectedVehicleId || undefined)
      setCalendarData(calendar)

      // Si hay vehículo seleccionado, cargar sus bloqueos
      if (selectedVehicleId) {
        const vehicleBlocks = await fetchVehicleBlocks(selectedVehicleId)
        setBlocks(vehicleBlocks)
      } else {
        setBlocks([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setCalendarLoading(false)
    }
  }

  // ============== BLOQUEOS ==============
  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleId) {
      alert('Selecciona un vehículo específico para crear un bloqueo')
      return
    }
    if (!blockForm.fecha) {
      alert('Completa la fecha del bloqueo')
      return
    }

    setSubmitting(true)
    try {
      await createVehicleBlock({
        vehiculoId: selectedVehicleId,
        fecha: blockForm.fecha,
        motivo: blockForm.motivo,
        detalles: blockForm.detalles || undefined,
        creadoPor: 'Admin',
      })
      alert('Bloqueo creado exitosamente')
      setBlockForm({ fecha: '', motivo: 'BLOQUEADO_ADMIN', detalles: '' })
      loadData()
    } catch (error: any) {
      alert(error.message || 'Error al crear bloqueo')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('¿Eliminar este bloqueo?')) return
    try {
      await deleteVehicleBlock(blockId)
      alert('Bloqueo eliminado')
      loadData()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar bloqueo')
    }
  }

  // ============== NAVEGACIÓN DE CALENDARIO ==============
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  // ============== RENDERIZADO DE CALENDARIO ==============
  const renderCalendarDays = () => {
    if (!calendarData?.days) return []

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    const days = []

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-custom__day calendar-custom__day--empty" />)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = calendarData.days.find((d: any) => d.date === dateKey)
      const todayClass = isToday(day) ? 'calendar-custom__day--today' : ''
      
      let statusClass = ''
      let statusText = ''
      let statusColor = ''
      
      if (dayData) {
        const color = dayData.color || 'green'
        
        if (color === 'red') {
          statusClass = 'bg-red-500/20 border-red-500/50'
          statusText = dayData.statusText || 'No disponible'
          statusColor = 'text-red-300'
        } else if (color === 'yellow') {
          statusClass = 'bg-yellow-500/20 border-yellow-500/50'
          statusText = dayData.statusText || 'Alta ocupación'
          statusColor = 'text-yellow-300'
        } else if (color === 'blue') {
          statusClass = 'bg-blue-500/20 border-blue-500/50'
          statusText = dayData.statusText || 'Ocupación parcial'
          statusColor = 'text-blue-300'
        } else {
          statusClass = 'bg-emerald-500/20 border-emerald-500/50'
          statusText = dayData.statusText || 'Disponible'
          statusColor = 'text-emerald-300'
        }
      }

      days.push(
        <div key={day} className={`calendar-custom__day ${todayClass} ${statusClass}`}>
          <div className="calendar-custom__day-number">{day}</div>
          {dayData && (
            <div className="mt-1">
              <div className={`text-[10px] font-semibold ${statusColor}`}>
                {statusText}
              </div>
              {dayData.totalReservas > 0 && (
                <div className="text-[9px] text-gray-400 mt-0.5">
                  {dayData.totalReservas} reserva{dayData.totalReservas > 1 ? 's' : ''}
                </div>
              )}
              {dayData.disponibles !== undefined && (
                <div className="text-[9px] text-gray-500 mt-0.5">
                  {dayData.disponibles} disp.
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)

  // ============== LOADING STATE ==============
  if (loading) {
    return <div className="page"><p>Cargando disponibilidad...</p></div>
  }

  if (vehicles.length === 0) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-12">
            <h1 className="display">Disponibilidad de Vehículos</h1>
            <p className="section__copy">No hay vehículos registrados</p>
          </header>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Disponibilidad de Vehículos y Paquetes</h1>
          <p className="section__copy">Visualiza el calendario de disponibilidad y qué vehículos utiliza cada paquete</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="disponibilidad" />

          <div className="min-w-0 space-y-10">
            {/* =============== FILTROS GLOBALES =============== */}
            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="eyebrow">Filtros</p>
                  <h2 className="section__title">Filtro de Vehículo</h2>
                  <p className="text-sm text-gray-400 mt-1">Selecciona un vehículo para ver su calendario</p>
                </div>
              </div>

              <Card>
                <div className="grid grid-cols-1 gap-4">
            {/* Filtro de Vehículo */}
            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-200 flex items-center gap-2">
                <FaFilter size={12} />
                Vehículo
              </span>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
              >
                <option value="">Todos los vehículos</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.category}
                  </option>
                ))}
              </select>
            </label>
            </div>

            {selectedVehicle && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-300 font-semibold">Vista filtrada:</p>
                    <p className="text-white font-medium">{selectedVehicle.name}</p>
                    <p className="text-xs text-gray-400">{selectedVehicle.category} · {selectedVehicle.seats} asientos</p>
                  </div>
                  {calendarData?.cantidadTotal && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Unidades disponibles</p>
                      <p className="text-2xl font-bold text-amber-300">{calendarData.cantidadTotal}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedVehicleId && calendarData && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Total Vehículos</p>
                  <p className="text-2xl font-bold text-white">{calendarData.totalVehiculos || vehicles.length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Total Unidades</p>
                  <p className="text-2xl font-bold text-amber-300">{calendarData.totalUnidades || 0}</p>
                </div>
              </div>
            )}
              </Card>
            </section>

            {/* =============== CALENDARIO =============== */}
            <section className="section">
              <div className="section__header mb-6">
                <p className="eyebrow">Visualización</p>
                <h2 className="section__title">Calendario de Disponibilidad</h2>
                <p className="text-sm text-gray-400 mt-1">{MONTHS[currentMonth]} {currentYear} {selectedVehicleId ? '· ' + selectedVehicle?.name : '· Vista Global'}</p>
              </div>

              <Card>
            {calendarLoading ? (
              <div className="text-center py-8 text-gray-400">Cargando calendario...</div>
            ) : (
              <>
                <div className="calendar-custom">
                  <div className="calendar-custom__header">
                    <h2 className="calendar-custom__title">
                      {MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <div className="calendar-custom__controls">
                      <button className="calendar-custom__btn" onClick={previousMonth} aria-label="Mes anterior">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className="calendar-custom__btn" onClick={nextMonth} aria-label="Siguiente mes">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="calendar-custom__legend">
                    <div className="calendar-custom__legend-item">
                      <div className="calendar-custom__legend-dot" style={{ background: 'rgb(16 185 129)' }} />
                      <span>Disponible</span>
                    </div>
                    <div className="calendar-custom__legend-item">
                      <div className="calendar-custom__legend-dot" style={{ background: 'rgb(59 130 246)' }} />
                      <span>Ocupación parcial</span>
                    </div>
                    <div className="calendar-custom__legend-item">
                      <div className="calendar-custom__legend-dot" style={{ background: 'rgb(234 179 8)' }} />
                      <span>Alta ocupación</span>
                    </div>
                    <div className="calendar-custom__legend-item">
                      <div className="calendar-custom__legend-dot" style={{ background: 'rgb(239 68 68)' }} />
                      <span>No disponible</span>
                    </div>
                  </div>

                  <div className="calendar-custom__weekdays">
                    {DAYS.map(day => (
                      <div key={day} className="calendar-custom__weekday">{day}</div>
                    ))}
                  </div>

                  <div className="calendar-custom__grid">
                    {renderCalendarDays()}
                  </div>
                </div>
              </>
            )}
              </Card>
            </section>

            {/* =============== RELACIÓN PAQUETES - VEHÍCULOS =============== */}
            <section className="section">
              <div className="section__header mb-6">
                <p className="eyebrow">Información Visual</p>
                <h2 className="section__title">Paquetes y Vehículos Asociados</h2>
                <p className="text-sm text-gray-400 mt-1">Vista de qué vehículos utiliza cada paquete</p>
              </div>

              <Card>
                {packages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No hay paquetes configurados
                  </div>
                ) : (
                  <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-white/10 to-transparent border-b border-white/10">
                          <tr className="text-left uppercase tracking-wide text-[10px] font-semibold text-gray-400">
                            <th className="px-4 py-3.5">Paquete</th>
                            <th className="px-4 py-3.5">Categoría</th>
                            <th className="px-4 py-3.5">Vehículos Asociados</th>
                            <th className="px-4 py-3.5 text-center">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {packages.map((pkg) => {
                            const packageVehicles = vehicles.filter(v => pkg.vehicleIds?.includes(v.id))
                            return (
                              <tr key={pkg.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    {pkg.imageUrl && (
                                      <img 
                                        src={pkg.imageUrl} 
                                        alt={pkg.name}
                                        className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                      />
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold text-white">{pkg.name}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">Max {pkg.maxPeople} personas</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                    {pkg.category}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  {packageVehicles.length === 0 ? (
                                    <span className="text-xs text-gray-500 italic">Sin vehículos asignados</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {packageVehicles.map(vehicle => (
                                        <span 
                                          key={vehicle.id}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white"
                                        >
                                          <HiTruck className="w-3.5 h-3.5 text-gray-400" />
                                          {vehicle.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-sm">
                                    {packageVehicles.length}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            {/* =============== BLOQUEOS MANUALES =============== */}
            {selectedVehicleId && (
              <>
                <section className="section">
                  <div className="section__header mb-6">
                    <p className="eyebrow">Bloqueos</p>
                    <h2 className="section__title">Crear Bloqueo Manual</h2>
                    <p className="text-sm text-gray-400 mt-1">Solo disponible con vehículo específico seleccionado</p>
                  </div>

                  <Card>
              <form onSubmit={handleCreateBlock} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-200">Fecha</span>
                    <input
                      type="date"
                      value={blockForm.fecha}
                      onChange={(e) => setBlockForm((prev) => ({ ...prev, fecha: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-gray-200">Motivo</span>
                    <select
                      value={blockForm.motivo}
                      onChange={(e) => setBlockForm((prev) => ({ ...prev, motivo: e.target.value as any }))}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    >
                      <option value="BLOQUEADO_ADMIN">Bloqueado por Admin</option>
                      <option value="MANTENIMIENTO">Mantenimiento</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Detalles (opcional)</span>
                  <textarea
                    value={blockForm.detalles}
                    onChange={(e) => setBlockForm((prev) => ({ ...prev, detalles: e.target.value }))}
                    rows={2}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    placeholder="Ej: Servicio programado, evento privado..."
                  />
                </label>

                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Bloqueo'}
                </Button>
                  </form>
                  </Card>
                </section>

                <section className="section">
                  <div className="section__header mb-6">
                    <p className="eyebrow">Gestión</p>
                    <h2 className="section__title">Bloqueos Vigentes</h2>
                    <p className="text-sm text-gray-400 mt-1">{blocks.length} bloqueo{blocks.length !== 1 ? 's' : ''}</p>
                  </div>

                  <Card>
              {blocks.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No hay bloqueos vigentes para este vehículo</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{block.fecha}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            block.motivo === 'BLOQUEADO_ADMIN' ? 'bg-red-500/20 text-red-300' :
                            block.motivo === 'MANTENIMIENTO' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {block.motivo}
                          </span>
                        </div>
                        {block.detalles && (
                          <p className="text-sm text-gray-400">{block.detalles}</p>
                        )}
                        {block.creadoPor && (
                          <p className="text-xs text-gray-500 mt-1">Por: {block.creadoPor}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  </div>
                )}
                  </Card>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminVehicleAvailability
