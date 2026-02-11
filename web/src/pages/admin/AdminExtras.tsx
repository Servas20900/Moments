import { useEffect, useState } from 'react'
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaBox } from 'react-icons/fa'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import { InputField, TextareaField } from '../../components/FormField'
import { fetchAllExtrasAdmin, createExtra, updateExtra, deactivateExtra, activateExtra } from '../../api/api'
import type { ExtraOption } from '../../contexts/ReservationContext'

const AdminExtras = () => {
  const [extras, setExtras] = useState<ExtraOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingExtra, setEditingExtra] = useState<ExtraOption | null>(null)
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS')

  // Form state
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'SIN_ALCOHOL' as 'SIN_ALCOHOL' | 'PREMIUM_ALCOHOL',
  })

  useEffect(() => {
    loadExtras()
  }, [])

  const loadExtras = async () => {
    setLoading(true)
    try {
      const data = await fetchAllExtrasAdmin()
      setExtras(data)
    } catch (error) {
      console.error('Error cargando extras:', error)
      alert('Error al cargar los extras')
    } finally {
      setLoading(false)
    }
  }

  const filteredExtras = extras.filter((e) => {
    if (filterStatus === 'TODOS') return true
    return e.estado === filterStatus
  })

  const onOpenCreateModal = () => {
    setEditingExtra(null)
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: 'SIN_ALCOHOL',
    })
    setShowModal(true)
  }

  const onEditExtra = (extra: ExtraOption) => {
    setEditingExtra(extra)
    setForm({
      nombre: extra.name,
      descripcion: extra.description || '',
      precio: String(extra.price),
      categoria: (extra.categoria || 'SIN_ALCOHOL') as 'SIN_ALCOHOL' | 'PREMIUM_ALCOHOL',
    })
    setShowModal(true)
  }

  const onSaveExtra = async () => {
    if (!form.nombre.trim() || !form.precio) {
      alert('Nombre y precio son requeridos')
      return
    }

    const precio = parseFloat(form.precio)
    if (isNaN(precio) || precio < 0) {
      alert('Precio debe ser un número válido')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        precio,
        categoria: form.categoria,
      }

      if (editingExtra) {
        const updated = await updateExtra(editingExtra.id, payload)
        setExtras((s) => s.map((e) => (e.id === updated.id ? updated : e)))
      } else {
        const created = await createExtra(payload)
        setExtras((s) => [created, ...s])
      }

      setShowModal(false)
      setEditingExtra(null)
    } catch (error) {
      console.error('Error guardando extra:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'No se pudo guardar'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const onToggleStatus = async (extra: ExtraOption) => {
    try {
      const updated =
        extra.estado === 'ACTIVO'
          ? await deactivateExtra(extra.id)
          : await activateExtra(extra.id)
      setExtras((s) => s.map((e) => (e.id === updated.id ? updated : e)))
    } catch (error) {
      console.error('Error toggling status:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'No se pudo cambiar estado'}`)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-center">Cargando extras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Administración</p>
              <h1 className="display">Gestión de Extras</h1>
              <p className="mt-2 text-sm text-gray-400">Crea, edita y gestiona los extras opcionales para tus paquetes</p>
            </div>
            <Button onClick={onOpenCreateModal} className="flex items-center gap-2">
              <FaPlus /> Crear Extra
            </Button>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(['TODOS', 'ACTIVO', 'INACTIVO'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-amber-300/20 border border-amber-300/50 text-amber-300'
                  : 'bg-white/5 border border-white/10 text-white hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Extras List */}
        {filteredExtras.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <FaBox className="h-12 w-12 text-gray-500" />
              <p className="text-gray-400">No hay extras para mostrar</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredExtras.map((extra) => (
              <Card key={extra.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white">{extra.name}</h3>
                  <p className="text-sm text-gray-400">{extra.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-300">
                      ${extra.price.toFixed(2)}
                    </span>
                    <span className="inline-block rounded-full bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      {extra.categoria || 'SIN_ALCOHOL'}
                    </span>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        extra.estado === 'ACTIVO'
                          ? 'bg-green-300/10 text-green-300'
                          : 'bg-red-300/10 text-red-300'
                      }`}
                    >
                      {extra.estado === 'ACTIVO' ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditExtra(extra)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-300 transition hover:border-amber-300/50 hover:bg-amber-300/20"
                    title="Editar"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(extra)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                      extra.estado === 'ACTIVO'
                        ? 'border-red-300/30 bg-red-300/10 text-red-300 hover:border-red-300/50 hover:bg-red-300/20'
                        : 'border-green-300/30 bg-green-300/10 text-green-300 hover:border-green-300/50 hover:bg-green-300/20'
                    }`}
                    title={extra.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                  >
                    {extra.estado === 'ACTIVO' ? (
                      <FaTimesCircle className="h-4 w-4" />
                    ) : (
                      <FaCheckCircle className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingExtra ? 'Editar Extra' : 'Crear Extra'}>
          <div className="space-y-4">
            <InputField
              label="Nombre del Extra"
              placeholder="Ej: Champagne Premium"
              value={form.nombre}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            />

            <TextareaField
              label="Descripción"
              placeholder="Ej: Botella de Champagne Veuve Clicquot"
              value={form.descripcion}
              onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
              rows={3}
            />

            <InputField
              label="Precio ($)"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm((s) => ({ ...s, precio: e.target.value }))}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    categoria: e.target.value as 'SIN_ALCOHOL' | 'PREMIUM_ALCOHOL',
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition focus:border-amber-300/50 focus:outline-none"
              >
                <option value="SIN_ALCOHOL">Sin Alcohol</option>
                <option value="PREMIUM_ALCOHOL">Premium Alcohol</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={onSaveExtra}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Guardando...' : editingExtra ? 'Actualizar' : 'Crear'}
              </Button>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AdminExtras
