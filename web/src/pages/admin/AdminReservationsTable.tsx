import { useState, useEffect } from 'react'
import { 
  fetchAdminReservationsTable, 
  updateContactoCliente, 
  updateAdelantoRecibido, 
  updatePagoCompleto, 
  updateChoferAsignado, 
  updateEventoRealizado 
} from '../../api/api'
import type { AdminReservationRow, ReservationsTableFilters } from '../../api/api'
import Button from '../../components/Button'
import { 
  HiUser, 
  HiCalendar, 
  HiTruck, 
  HiCreditCard, 
  HiCheckCircle, 
  HiExclamationCircle,
  HiEye,
  HiChatAlt2,
  HiDocumentText,
  HiSearch,
  HiFilter,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown
} from 'react-icons/hi'

function AdminReservationsTable() {
  const [reservas, setReservas] = useState<AdminReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 })
  const [filters, setFilters] = useState<ReservationsTableFilters>({
    page: 1,
    limit: 25,
    sortBy: 'fechaEvento',
    sortOrder: 'asc',
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Cargar datos
  useEffect(() => {
    loadReservations()
  }, [filters])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const response = await fetchAdminReservationsTable(filters)
      setReservas(response.data)
      setMeta(response.meta)
    } catch (error) {
      console.error('Error cargando reservas:', error)
      alert('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, busqueda: searchTerm, page: 1 }))
  }

  const toggleRowExpanded = (reservaId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(reservaId)) {
      newExpanded.delete(reservaId)
    } else {
      newExpanded.add(reservaId)
    }
    setExpandedRows(newExpanded)
  }

  const handleUpdateContacto = async (reservaId: string, nuevoEstado: 'PENDIENTE' | 'CONTACTADO' | 'CONFIRMADO') => {
    try {
      setUpdatingId(reservaId)
      await updateContactoCliente(reservaId, nuevoEstado)
      await loadReservations()
    } catch (error) {
      console.error('Error actualizando contacto:', error)
      alert('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateAdelanto = async (reservaId: string, recibido: boolean) => {
    try {
      setUpdatingId(reservaId)
      await updateAdelantoRecibido(reservaId, recibido)
      await loadReservations()
    } catch (error) {
      console.error('Error actualizando adelanto:', error)
      alert('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdatePagoCompleto = async (reservaId: string, completo: boolean) => {
    try {
      setUpdatingId(reservaId)
      await updatePagoCompleto(reservaId, completo)
      await loadReservations()
    } catch (error) {
      console.error('Error actualizando pago completo:', error)
      alert('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateChofer = async (reservaId: string, asignado: boolean) => {
    try {
      setUpdatingId(reservaId)
      await updateChoferAsignado(reservaId, asignado)
      await loadReservations()
    } catch (error) {
      console.error('Error actualizando chofer:', error)
      alert('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateEvento = async (reservaId: string, realizado: boolean) => {
    try {
      setUpdatingId(reservaId)
      await updateEventoRealizado(reservaId, realizado)
      await loadReservations()
    } catch (error) {
      console.error('Error actualizando evento:', error)
      alert('Error al actualizar')
    } finally {
      setUpdatingId(null)
    }
  }

  const getEstadoEventoBadge = (fecha: string) => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaEvento = new Date(fecha)
    fechaEvento.setHours(0, 0, 0, 0)

    if (fechaEvento.getTime() === hoy.getTime()) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">HOY</span>
    } else if (fechaEvento > hoy) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">PRÓXIMO</span>
    } else {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">PASADO</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0e13] to-[#1a1625] p-4 lg:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-1">Gestión de Reservas</h1>
          <p className="text-sm text-gray-400">Control operativo y seguimiento</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar por cliente, email, teléfono..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                />
              </div>
            </div>

            {/* Estado de pago */}
            <div>
              <select
                value={filters.estadoPago || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, estadoPago: e.target.value as any, page: 1 }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:border-amber-400/50 focus:outline-none"
              >
                <option value="">Estado de pago</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="completo">Completo</option>
              </select>
            </div>

            {/* Tipo de evento */}
            <div>
              <select
                value={filters.tipoEvento || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, tipoEvento: e.target.value as any, page: 1 }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:border-amber-400/50 focus:outline-none"
              >
                <option value="">Todos los eventos</option>
                <option value="futuro">Futuros</option>
                <option value="hoy">Hoy</option>
                <option value="pasado">Pasados</option>
              </select>
            </div>

            {/* Contacto */}
            <div>
              <select
                value={filters.contactoCliente || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, contactoCliente: e.target.value as any, page: 1 }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:border-amber-400/50 focus:outline-none"
              >
                <option value="">Estado contacto</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="CONFIRMADO">Confirmado</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setFilters({ page: 1, limit: 25, sortBy: 'fechaEvento', sortOrder: 'asc' })
                setSearchTerm('')
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <HiFilter className="w-3 h-3" />
              Limpiar filtros
            </button>
            <span className="text-xs text-gray-500">{meta.total} reservas totales</span>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
            <p className="text-gray-400 text-sm mt-3">Cargando reservas...</p>
          </div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No hay reservas que mostrar</p>
          </div>
        ) : (
          <>
            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Evento / Vehículo</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Financiero</th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Operativo</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-12">Estado</th>
                      <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-20">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reservas.map((reserva) => (
                      <>
                        <tr key={reserva.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Cliente */}
                          <td className="px-3 py-3">
                            <div className="flex items-start gap-2">
                              <HiUser className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{reserva.nombre}</p>
                                <p className="text-xs text-gray-400 truncate">{reserva.email}</p>
                                <p className="text-xs text-gray-500 truncate">{reserva.telefono}</p>
                              </div>
                            </div>
                          </td>

                          {/* Evento / Vehículo */}
                          <td className="px-3 py-3">
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2">
                                <HiCalendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white">{new Date(reserva.fechaEvento).toLocaleDateString('es-CR')}</p>
                                  <p className="text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(reserva.horaInicio).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })} - {new Date(reserva.horaFin).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <HiTruck className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-white truncate">{reserva.vehiculo?.nombre || reserva.vehiculoNombre || '—'}</p>
                                  <p className="text-xs text-gray-500 truncate">{reserva.paquete?.nombre || reserva.paqueteNombre || '—'}</p>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Financiero */}
                          <td className="px-3 py-3">
                            <div className="flex items-start gap-2">
                              <HiCreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs min-w-0">
                                <span className="text-gray-500">Total:</span>
                                <span className="text-white font-medium">${reserva.precioTotal.toFixed(2)}</span>
                                
                                <span className="text-gray-500">Restante:</span>
                                <span className="text-gray-400">${reserva.restante.toFixed(2)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Operativo */}
                          <td className="px-3 py-3">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="flex flex-col gap-1">
                                <select
                                  value={reserva.contactoCliente}
                                  onChange={(e) => handleUpdateContacto(reserva.id, e.target.value as any)}
                                  disabled={updatingId === reserva.id}
                                  className="text-[9px] rounded px-1 py-0.5 border border-white/10 bg-white/5 text-white focus:border-amber-400/50 focus:outline-none disabled:opacity-50"
                                  title="Contacto con cliente"
                                >
                                  <option value="PENDIENTE">Pend.</option>
                                  <option value="CONTACTADO">Contactado</option>
                                  <option value="CONFIRMADO">Confirm.</option>
                                </select>
                                <select
                                  value={reserva.pagoCompleto ? 'si' : 'no'}
                                  onChange={(e) => handleUpdatePagoCompleto(reserva.id, e.target.value === 'si')}
                                  disabled={updatingId === reserva.id}
                                  className={`text-[9px] rounded px-1 py-0.5 border focus:outline-none disabled:opacity-50 ${
                                    reserva.pagoCompleto 
                                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                      : 'bg-white/5 border-white/10 text-white'
                                  }`}
                                  title="Pago 100%"
                                >
                                  <option value="no">Pago: No</option>
                                  <option value="si">Pago: Sí</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <select
                                  value={reserva.adelantoRecibido ? 'si' : 'no'}
                                  onChange={(e) => handleUpdateAdelanto(reserva.id, e.target.value === 'si')}
                                  disabled={updatingId === reserva.id}
                                  className={`text-[9px] rounded px-1 py-0.5 border focus:outline-none disabled:opacity-50 ${
                                    reserva.adelantoRecibido 
                                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                      : 'bg-white/5 border-white/10 text-white'
                                  }`}
                                  title="Adelanto recibido"
                                >
                                  <option value="no">Adelanto: No</option>
                                  <option value="si">Adelanto: Sí</option>
                                </select>
                                <select
                                  value={reserva.eventoRealizado ? 'si' : 'no'}
                                  onChange={(e) => handleUpdateEvento(reserva.id, e.target.value === 'si')}
                                  disabled={updatingId === reserva.id}
                                  className={`text-[9px] rounded px-1 py-0.5 border focus:outline-none disabled:opacity-50 ${
                                    reserva.eventoRealizado 
                                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                      : 'bg-white/5 border-white/10 text-white'
                                  }`}
                                  title="Evento realizado"
                                >
                                  <option value="no">Evento: No</option>
                                  <option value="si">Evento: Sí</option>
                                </select>
                              </div>
                            </div>
                          </td>

                          {/* Estado/Conflicto */}
                          <td className="px-3 py-3 text-center">
                            {reserva.tieneConflicto ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30" title="Conflicto de horario">
                                <HiExclamationCircle className="w-5 h-5 text-red-400" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30" title="Sin conflictos">
                                <HiCheckCircle className="w-5 h-5 text-green-400" />
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-0.5">
                              {(reserva.extras?.length ?? 0) > 0 && (
                                <button
                                  onClick={() => toggleRowExpanded(reserva.id)}
                                  className="p-1.5 rounded hover:bg-white/10 transition-colors group"
                                  title="Ver extras"
                                >
                                  <HiChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform ${expandedRows.has(reserva.id) ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                              <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors group"
                                title="Ver detalle"
                              >
                                <HiEye className="w-4 h-4 text-gray-400 group-hover:text-white" />
                              </button>
                              <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors group"
                                title="Conversación"
                              >
                                <HiChatAlt2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                              </button>
                              <button
                                className="p-1.5 rounded hover:bg-white/10 transition-colors group"
                                title="Auditoría"
                              >
                                <HiDocumentText className="w-4 h-4 text-gray-400 group-hover:text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Fila de Extras expandida */}
                        {expandedRows.has(reserva.id) && (reserva.extras?.length ?? 0) > 0 && (
                          <tr className="bg-amber-400/5 border-t border-amber-400/20">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-amber-300">Extras incluidos en esta reserva:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {reserva.extras?.map((extra, index) => (
                                    <div key={index} className="flex flex-col gap-1 rounded-lg bg-white/5 border border-amber-400/20 p-3">
                                      <p className="text-sm font-medium text-white">{extra.nombre}</p>
                                      <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Cantidad: <strong className="text-white">{extra.cantidad}</strong></span>
                                        <span>Precio unit: <strong className="text-amber-300">${extra.precioUnitario.toFixed(2)}</strong></span>
                                      </div>
                                      <div className="text-xs text-amber-200">
                                        Subtotal: <strong>${(extra.cantidad * extra.precioUnitario).toFixed(2)}</strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {reserva.extras && (
                                  <div className="border-t border-amber-400/20 pt-2 text-sm font-semibold text-amber-300">
                                    Total de extras: ${(reserva.extras.reduce((acc, e) => acc + (e.cantidad * e.precioUnitario), 0)).toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Mostrando {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                  disabled={meta.page === 1}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white px-3">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(meta.totalPages, (prev.page || 1) + 1) }))}
                  disabled={meta.page === meta.totalPages}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminReservationsTable

