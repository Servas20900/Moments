import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import { InputField, TextareaField } from '../../components/FormField'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useTheme } from '../../hooks/useTheme'
import { fetchPackages, fetchAllExtrasAdmin, createExtra, updateExtra, deactivateExtra, activateExtra, attachExtraToPackage } from '../../api/api'
import type { Package } from '../../data/content'
import type { ExtraOption } from '../../contexts/ReservationContext'

const AdminPackageExtras = () => {
  const { theme } = useTheme()
  const [packages, setPackages] = useState<Package[]>([])
  const [extras, setExtras] = useState<ExtraOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExtra, setEditingExtra] = useState<ExtraOption | null>(null)
  const [filter, setFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS')
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; extra: ExtraOption | null }>({ open: false, extra: null })

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    packageIds: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pkgs, exts] = await Promise.all([fetchPackages(), fetchAllExtrasAdmin()])
      setPackages(pkgs)
      setExtras(exts)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExtras = extras.filter((e) => {
    if (filter === 'TODOS') return true
    return e.estado === filter
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((s) => ({ ...s, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handlePackageToggle = (packageId: string) => {
    setFormData((s) => ({
      ...s,
      packageIds: s.packageIds.includes(packageId)
        ? s.packageIds.filter((id) => id !== packageId)
        : [...s.packageIds, packageId],
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.precio || parseFloat(formData.precio) <= 0) newErrors.precio = 'El precio debe ser mayor a 0'
    return newErrors
  }

  const onOpenCreate = () => {
    setEditingExtra(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      packageIds: [],
    })
    setErrors({})
    setShowModal(true)
  }

  const onOpenEdit = (extra: ExtraOption) => {
    setEditingExtra(extra)
    setFormData({
      nombre: extra.name,
      descripcion: extra.description || '',
      precio: extra.price.toString(),
      packageIds: [],
    })
    setErrors({})
    setShowModal(true)
  }

  const onSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      precio: parseFloat(formData.precio),
    }

    try {
      if (editingExtra) {
        // Editar
        const updated = await updateExtra(editingExtra.id, payload)
        setExtras((s) => s.map((x) => (x.id === editingExtra.id ? updated : x)))
      } else {
        // Crear
        const created = await createExtra(payload)
        setExtras((s) => [created, ...s])
        // Asociar a todos los paquetes seleccionados
        for (const pkgId of formData.packageIds) {
          await attachExtraToPackage(created.id, pkgId)
        }
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error guardando extra:', error)
    }
  }

  const onToggleStatus = async (extra: ExtraOption) => {
    try {
      const isActive = extra.estado === 'ACTIVO'
      const updated = isActive
        ? await deactivateExtra(extra.id)
        : await activateExtra(extra.id)
      setExtras((s) => s.map((x) => (x.id === extra.id ? updated : x)))
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'No se pudo cambiar el estado'}`)
    }
  }

  const onDeleteExtra = (extra: ExtraOption) => {
    setConfirmDelete({ open: true, extra })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete.extra) return
    setIsDeleting(true)
    try {
      await deactivateExtra(confirmDelete.extra.id)
      setExtras((s) => s.filter((x) => x.id !== confirmDelete.extra!.id))
      setConfirmDelete({ open: false, extra: null })
    } catch (error) {
      console.error('Error eliminando extra:', error)
      setConfirmDelete({ open: false, extra: null })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="text-center">Cargando...</p>
      </div>
    )
  }

  const bgClass = theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'
  const cardBgClass = theme === 'dark' ? 'bg-[var(--card-bg,#11131a)] border-white/10' : 'bg-white border-gray-200'
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Gestion de Extras</h1>
          <p className="section__copy">Crea y gestiona extras. Al crearlos puedes asociarlos a un paquete.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="extras" />

          <div className="min-w-0 space-y-10">
            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Contenido</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="section__title mb-0">Extras</h2>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-gray-200">{extras.length} total</span>
                  </div>
                </div>
                <Button variant="primary" onClick={onOpenCreate}>
                  Nuevo Extra
                </Button>
              </div>

              {/* Filtros */}
              <div className="mb-6 flex gap-2 flex-wrap">
                {(['TODOS', 'ACTIVO', 'INACTIVO'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      filter === f
                        ? 'bg-amber-300/20 border border-amber-300/50 text-amber-300'
                        : theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                          : 'bg-gray-200 border border-gray-300 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {f === 'TODOS' ? 'Todos' : f === 'ACTIVO' ? 'Activos' : 'Inactivos'}
                  </button>
                ))}
              </div>

              {/* Tabla de Extras */}
              <div className={`w-full border rounded-xl overflow-hidden shadow-lg ${cardBgClass}`}>
                <div className={`hidden md:grid grid-cols-5 gap-3 p-4 bg-gradient-to-r border-b font-semibold text-sm uppercase tracking-wide ${
                  theme === 'dark'
                    ? 'from-white/10 to-transparent border-[rgba(201,162,77,0.2)] text-gray-200'
                    : 'from-amber-100 to-transparent border-amber-200 text-gray-700'
                }`}>
                  <span>Nombre</span>
                  <span>Precio</span>
                  <span>Estado</span>
                  <span>Descripción</span>
                  <span>Acciones</span>
                </div>

                {filteredExtras.length === 0 ? (
                  <div className={`p-8 text-center ${textMutedClass}`}>
                    No hay extras {filter !== 'TODOS' ? `${filter.toLowerCase()}s` : ''}.
                  </div>
                ) : (
                  filteredExtras.map((extra) => (
                    <div
                      key={extra.id}
                      className={`grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b last:border-b-0 transition-colors ${
                        theme === 'dark'
                          ? 'border-white/5 hover:bg-white/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between md:block">
                        <span className={`md:hidden text-xs ${textMutedClass}`}>Nombre</span>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {extra.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:block">
                        <span className={`md:hidden text-xs ${textMutedClass}`}>Precio</span>
                        <span className="font-semibold text-amber-300">${extra.price.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between md:block">
                        <span className={`md:hidden text-xs ${textMutedClass}`}>Estado</span>
                        <button
                          onClick={() => onToggleStatus(extra)}
                          className={`inline-flex px-3 py-1 text-[11px] rounded-full font-semibold transition ${
                            extra.estado === 'ACTIVO'
                              ? 'bg-green-300/10 text-green-300 border border-green-300/20 hover:bg-green-300/20'
                              : 'bg-red-300/10 text-red-300 border border-red-300/20 hover:bg-red-300/20'
                          }`}
                        >
                          {extra.estado || 'ACTIVO'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between md:block">
                        <span className={`md:hidden text-xs ${textMutedClass}`}>Descripción</span>
                        <span className={`text-[11px] truncate ${textSecondaryClass}`}>
                          {extra.description || '—'}
                        </span>
                      </div>

                      <div className="flex gap-2.5 items-center justify-end md:justify-end">
                        <button
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                            theme === 'dark'
                              ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                              : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                          }`}
                          aria-label={`Editar ${extra.name}`}
                          onClick={() => onOpenEdit(extra)}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                            theme === 'dark'
                              ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                              : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                          }`}
                          aria-label={`Eliminar ${extra.name}`}
                          onClick={() => onDeleteExtra(extra)}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingExtra ? 'Editar Extra' : 'Crear Extra'}>
        <form className="grid gap-5 p-2" onSubmit={onSaveExtra}>
          <InputField
            label="Nombre"
            required
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            error={errors.nombre}
            placeholder="Ej: Botella de vino"
          />

          <TextareaField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción del extra (opcional)"
          />

          <InputField
            label="Precio"
            required
            type="number"
            step="0.01"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            error={errors.precio}
            placeholder="0.00"
          />

          <div>
            <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Asociar a paquetes {formData.packageIds.length > 0 && `(${formData.packageIds.length})`}
            </label>
            <div className={`space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3 ${
              theme === 'dark'
                ? 'border-white/10 bg-white/5'
                : 'border-gray-300 bg-gray-100'
            }`}>
              {packages.length === 0 ? (
                <p className={`text-xs ${textMutedClass}`}>No hay paquetes disponibles</p>
              ) : (
                packages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded transition ${
                      theme === 'dark'
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.packageIds.includes(pkg.id)}
                      onChange={() => handlePackageToggle(pkg.id)}
                      className="w-4 h-4 rounded accent-amber-300"
                    />
                    <span className="text-sm flex-1">{pkg.name}</span>
                    <span className="text-xs text-amber-300">${pkg.price.toFixed(2)}</span>
                  </label>
                ))
              )}
            </div>
            {formData.packageIds.length > 0 && (
              <p className="text-xs text-amber-300/70 mt-2">
                {formData.packageIds.length} paquete{formData.packageIds.length !== 1 ? 's' : ''} seleccionado{formData.packageIds.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-white/10">
            <Button variant="primary" type="submit" className="flex-1">
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="flex-1"
              type="button"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={confirmDelete.open}
        title="Eliminar Extra"
        message={`¿Estás seguro de que deseas eliminar "${confirmDelete.extra?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ open: false, extra: null })}
      />
    </div>
  )
}

export default AdminPackageExtras
