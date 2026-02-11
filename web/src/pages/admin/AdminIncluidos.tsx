import { useEffect, useState } from 'react'
import { FaEdit, FaCheckCircle, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import Card from '../../components/Card'
import { InputField, TextareaField } from '../../components/FormField'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useTheme } from '../../hooks/useTheme'
import { useAlert } from '../../contexts/AlertContext'
import { getThemeClasses } from '../../utils/themeClasses'
import {
  fetchAllCategoriasIncluidosAdmin,
  fetchAllIncluidosAdmin,
  fetchAllCategoriasIncluidos,
  fetchPackages,
  createCategoriaIncluido,
  updateCategoriaIncluido,
  deleteCategoriaIncluido,
  deleteIncluido,
  createIncluido,
  updateIncluido,
  attachIncluidoToPackage,
  detachIncluidoFromPackage,
  type CategoriaIncluido,
  type Incluido,
  type Package,
} from '../../api/api'

const AdminIncluidos = () => {
  const { theme } = useTheme()
  const { showAlert } = useAlert()
  const themeClasses = getThemeClasses(theme)

  // Categorías state
  const [categorias, setCategorias] = useState<CategoriaIncluido[]>([])
  const [categoriasLoading, setCategoriasLoading] = useState(true)
  const [categoriasSubmitting, setCategoriasSubmitting] = useState(false)
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<CategoriaIncluido | null>(null)
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '' })
  const [categoriasErrors, setCategoriasErrors] = useState<Record<string, string>>({})
  const [confirmCategoriaDelete, setConfirmCategoriaDelete] = useState<{ open: boolean; categoria: CategoriaIncluido | null }>({ open: false, categoria: null })
  const [categoriasDeleting, setCategoriasDeleting] = useState(false)

  // Incluidos state
  const [incluidos, setIncluidos] = useState<Incluido[]>([])
  const [allCategorias, setAllCategorias] = useState<CategoriaIncluido[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [incluidosLoading, setIncluidosLoading] = useState(true)
  const [incluidosSubmitting, setIncluidosSubmitting] = useState(false)
  const [showIncluidoModal, setShowIncluidoModal] = useState(false)
  const [editingIncluido, setEditingIncluido] = useState<Incluido | null>(null)
  const [incluidoForm, setIncluidoForm] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: 0,
    packageIds: [] as string[],
  })
  const [incluidosErrors, setIncluidosErrors] = useState<Record<string, string>>({})
  const [confirmIncluidoDelete, setConfirmIncluidoDelete] = useState<{ open: boolean; incluido: Incluido | null }>({ open: false, incluido: null })
  const [incluidosDeleting, setIncluidosDeleting] = useState(false)

  // Load all data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setCategoriasLoading(true)
    setIncluidosLoading(true)
    try {
      const [cats, incs, allCats, pkgs] = await Promise.all([
        fetchAllCategoriasIncluidosAdmin(),
        fetchAllIncluidosAdmin(),
        fetchAllCategoriasIncluidosAdmin(),
        fetchPackages()
      ])
      setCategorias(cats)
      setIncluidos(incs)
      setAllCategorias(allCats)
      setPackages(pkgs)
    } catch (error) {
      console.error('Error cargando datos:', error)
      showAlert('Error', 'Error al cargar los datos', 'error')
    } finally {
      setCategoriasLoading(false)
      setIncluidosLoading(false)
    }
  }

  // Categorías section
  const filteredCategorias = categorias

  const onDeleteCategoriaClick = (categoria: CategoriaIncluido) => {
    // Validar que no tenga items asociados
    const hasIncluidos = incluidos.some((inc) => inc.categoriaId === categoria.id)
    if (hasIncluidos) {
      showAlert('No se puede eliminar', `No puedes eliminar la categoría "${categoria.nombre}" porque tiene items asociados. Primero elimina los items o cámbialos de categoría.`, 'warning')
      return
    }
    setConfirmCategoriaDelete({
      open: true,
      categoria,
    })
  }

  const handleConfirmCategoriaDelete = async () => {
    if (!confirmCategoriaDelete.categoria) return
    setCategoriasDeleting(true)
    try {
      await deleteCategoriaIncluido(confirmCategoriaDelete.categoria.id)
      setCategorias((s) => s.filter((c) => c.id !== confirmCategoriaDelete.categoria!.id))
      setConfirmCategoriaDelete({ open: false, categoria: null })
    } catch (error: any) {
      showAlert('Error', error.message || 'Error al eliminar la categoría', 'error')
    } finally {
      setCategoriasDeleting(false)
    }
  }

  const onOpenCreateCategoriaModal = () => {
    setEditingCategoria(null)
    setCategoriaForm({ nombre: '' })
    setCategoriasErrors({})
    setShowCategoriaModal(true)
  }

  const onEditCategoria = (categoria: CategoriaIncluido) => {
    setEditingCategoria(categoria)
    setCategoriaForm({ nombre: categoria.nombre })
    setCategoriasErrors({})
    setShowCategoriaModal(true)
  }

  const validateCategoria = () => {
    const newErrors: Record<string, string> = {}
    if (!categoriaForm.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    return newErrors
  }

  const onSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateCategoria()
    if (Object.keys(newErrors).length > 0) {
      setCategoriasErrors(newErrors)
      return
    }

    setCategoriasSubmitting(true)
    try {
      const payload = { nombre: categoriaForm.nombre.trim().toUpperCase() }

      if (editingCategoria) {
        const updated = await updateCategoriaIncluido(editingCategoria.id, payload)
        setCategorias((s) => s.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await createCategoriaIncluido(payload)
        setCategorias((s) => [created, ...s])
      }

      setShowCategoriaModal(false)
      setEditingCategoria(null)
      setCategoriaForm({ nombre: '' })
    } catch (error: any) {
      setCategoriasErrors({ submit: error.message || 'Error al guardar la categoría' })
    } finally {
      setCategoriasSubmitting(false)
    }
  }

  // Incluidos section
  const onOpenCreateIncluidoModal = () => {
    setEditingIncluido(null)
    setIncluidoForm({
      nombre: '',
      descripcion: '',
      categoriaId: allCategorias[0]?.id || 0,
      packageIds: [],
    })
    setIncluidosErrors({})
    setShowIncluidoModal(true)
  }

  const onEditIncluido = (incluido: Incluido) => {
    setEditingIncluido(incluido)
    setIncluidoForm({
      nombre: incluido.nombre,
      descripcion: incluido.descripcion || '',
      categoriaId: incluido.categoriaId,
      packageIds: incluido.packageIds || [],
    })
    setIncluidosErrors({})
    setShowIncluidoModal(true)
  }

  const validateIncluido = () => {
    const newErrors: Record<string, string> = {}
    if (!incluidoForm.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!incluidoForm.categoriaId) newErrors.categoriaId = 'La categoría es requerida'
    return newErrors
  }

  const onSaveIncluido = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateIncluido()
    if (Object.keys(newErrors).length > 0) {
      setIncluidosErrors(newErrors)
      return
    }

    setIncluidosSubmitting(true)
    try {
      const payload = {
        nombre: incluidoForm.nombre.trim(),
        descripcion: incluidoForm.descripcion.trim() || undefined,
        categoriaId: incluidoForm.categoriaId,
      }

      if (editingIncluido) {
        const updated = await updateIncluido(editingIncluido.id, payload)
        
        // Gestionar cambios en paquetes asociados
        const previousPackageIds = editingIncluido.packageIds || []
        const currentPackageIds = incluidoForm.packageIds
        
        // Paquetes a añadir (están en current pero no en previous)
        const toAttach = currentPackageIds.filter(id => !previousPackageIds.includes(id))
        // Paquetes a quitar (están en previous pero no en current)
        const toDetach = previousPackageIds.filter(id => !currentPackageIds.includes(id))
        
        // Ejecutar attach/detach
        for (const pkgId of toAttach) {
          await attachIncluidoToPackage(updated.id, pkgId)
        }
        for (const pkgId of toDetach) {
          await detachIncluidoFromPackage(updated.id, pkgId)
        }
        
        setIncluidos((s) => s.map((i) => (i.id === updated.id ? updated : i)))
      } else {
        const created = await createIncluido(payload)
        setIncluidos((s) => [created, ...s])
        // Asociar a todos los paquetes seleccionados
        for (const pkgId of incluidoForm.packageIds) {
          await attachIncluidoToPackage(created.id, pkgId)
        }
      }

      setShowIncluidoModal(false)
      setEditingIncluido(null)
      setIncluidoForm({
        nombre: '',
        descripcion: '',
        categoriaId: allCategorias[0]?.id || 0,
        packageIds: [],
      })
    } catch (error: any) {
      setIncluidosErrors({ submit: error.message || 'Error al guardar el incluido' })
    } finally {
      setIncluidosSubmitting(false)
    }
  }

  const handlePackageToggle = (packageId: string) => {
    setIncluidoForm((s) => ({
      ...s,
      packageIds: s.packageIds.includes(packageId)
        ? s.packageIds.filter((id) => id !== packageId)
        : [...s.packageIds, packageId],
    }))
  }

  const onDeleteIncluidoClick = (incluido: Incluido) => {
    setConfirmIncluidoDelete({
      open: true,
      incluido,
    })
  }

  const handleConfirmIncluidoDelete = async () => {
    if (!confirmIncluidoDelete.incluido) return
    setIncluidosDeleting(true)
    try {
      await deleteIncluido(confirmIncluidoDelete.incluido.id)
      setIncluidos((s) => s.filter((i) => i.id !== confirmIncluidoDelete.incluido!.id))
      setConfirmIncluidoDelete({ open: false, incluido: null })
    } catch (error: any) {
      showAlert('Error', error.message || 'Error al eliminar el incluido', 'error')
    } finally {
      setIncluidosDeleting(false)
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Incluidos / Paquetes</h1>
          <p className="section__copy">Gestiona categorías de incluidos y bebidas que forman parte de los paquetes</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="incluidos" />

          <div className="min-w-0 space-y-10">
            {/* CATEGORÍAS SECTION */}
            <section className="section">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="eyebrow">Categorías</p>
                <h2 className="section__title">Categorías de Incluidos</h2>
                <p className="text-sm text-gray-400 mt-1">Organiza los incluidos en categorías</p>
              </div>
              <Button variant="primary" onClick={onOpenCreateCategoriaModal}>
                <FaPlus className="inline mr-2" />
                Nueva Categoría
              </Button>
            </div>

            {/* Filtros */}
            <Card>
              <div className="flex gap-4 items-center">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {filteredCategorias.length} categoría{filteredCategorias.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>

            {/* Tabla */}
            <Card>
              {categoriasLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-600">Cargando categorías...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Nombre
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Estado
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Fecha Creación
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'bg-white/5 divide-white/10' : 'bg-white divide-gray-200'}`}>
                      {filteredCategorias.length === 0 ? (
                        <tr>
                          <td colSpan={4} className={`px-6 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            No hay categorías registradas
                          </td>
                        </tr>
                      ) : (
                        filteredCategorias.map((cat) => (
                          <tr key={cat.id} className={theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-50'}>
                            <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {cat.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {cat.estado === 'ACTIVO' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FaCheckCircle className="mr-1" />
                                  Activo
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                                  <FaTimesCircle className="mr-1" />
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                              {new Date(cat.creadoEn).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex gap-2.5 items-center justify-end">
                                <button
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    theme === 'dark'
                                      ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                                      : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                                  }`}
                                  aria-label={`Editar ${cat.nombre}`}
                                  onClick={() => onEditCategoria(cat)}
                                  title="Editar"
                                  type="button"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    theme === 'dark'
                                      ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                                      : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                                  }`}
                                  aria-label={`Eliminar ${cat.nombre}`}
                                  onClick={() => onDeleteCategoriaClick(cat)}
                                  title="Eliminar"
                                  type="button"
                                >
                                  <FaTrash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

        {/* INCLUIDOS SECTION */}
        <section className="section">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="eyebrow">Items</p>
                <h2 className="section__title">Items / Bebidas</h2>
                <p className="text-sm text-gray-400 mt-1">Gestiona bebidas y otros incluidos que forman parte de los paquetes</p>
              </div>
              <Button variant="primary" onClick={onOpenCreateIncluidoModal}>
                <FaPlus className="inline mr-2" />
                Nuevo Item
              </Button>
            </div>

            {/* Contador */}
            <Card>
              <div className="flex gap-4 items-center">
                <span className="text-sm text-gray-600">
                  {incluidos.length} incluido(s)
                </span>
              </div>
            </Card>

            {/* Tabla */}
            <Card>
              {incluidosLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-600">Cargando incluidos...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Nombre
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Categoría
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Descripción
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Estado
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'bg-white/5 divide-white/10' : 'bg-white divide-gray-200'}`}>
                      {incluidos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={`px-6 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            No hay incluidos registrados
                          </td>
                        </tr>
                      ) : (
                        incluidos.map((inc) => (
                          <tr key={inc.id} className={theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-50'}>
                            <td className={`px-6 py-4 whitespace-nowrap font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {inc.nombre}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                {inc.categoriaNombre}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                              {inc.descripcion || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {inc.estado === 'ACTIVO' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FaCheckCircle className="mr-1" />
                                  Activo
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                                  <FaTimesCircle className="mr-1" />
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex gap-2.5 items-center justify-end">
                                <button
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    theme === 'dark'
                                      ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                                      : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                                  }`}
                                  aria-label={`Editar ${inc.nombre}`}
                                  onClick={() => onEditIncluido(inc)}
                                  title="Editar"
                                  type="button"
                                >
                                  <FaEdit size={16} />
                                </button>
                                <button
                                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    theme === 'dark'
                                      ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
                                      : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300'
                                  }`}
                                  aria-label={`Eliminar ${inc.nombre}`}
                                  onClick={() => onDeleteIncluidoClick(inc)}
                                  title="Eliminar"
                                  type="button"
                                >
                                  <FaTrash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

        {/* Categoría Modal */}
        <Modal
          open={showCategoriaModal}
          title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
          onClose={() => setShowCategoriaModal(false)}
        >
            <form onSubmit={onSaveCategoria} className="space-y-4">
              <InputField
                label="Nombre"
                type="text"
                value={categoriaForm.nombre}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })}
                placeholder="Ej: LATAS, BOTELLAS, COMESTIBLES"
                required
              />
              {categoriasErrors.nombre && (
                <p className="text-sm text-red-600">{categoriasErrors.nombre}</p>
              )}
              {categoriasErrors.submit && (
                <p className="text-sm text-red-600">{categoriasErrors.submit}</p>
              )}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowCategoriaModal(false)} disabled={categoriasSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={categoriasSubmitting}>
                  {categoriasSubmitting ? 'Guardando...' : editingCategoria ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Modal>

        {/* Incluido Modal */}
        <Modal
          open={showIncluidoModal}
          title={editingIncluido ? 'Editar Item' : 'Nuevo Item'}
          onClose={() => setShowIncluidoModal(false)}
        >
            <form onSubmit={onSaveIncluido} className="space-y-4">
              <InputField
                label="Nombre"
                type="text"
                value={incluidoForm.nombre}
                onChange={(e) => setIncluidoForm({ ...incluidoForm, nombre: e.target.value })}
                placeholder="Ej: Coca Cola, Fanta, Snacks"
                required
              />
              {incluidosErrors.nombre && (
                <p className="text-sm text-red-600">{incluidosErrors.nombre}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={incluidoForm.categoriaId}
                  onChange={(e) => setIncluidoForm({ ...incluidoForm, categoriaId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value={0}>Seleccionar categoría</option>
                  {allCategorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {incluidosErrors.categoriaId && (
                  <p className="text-sm text-red-600 mt-1">{incluidosErrors.categoriaId}</p>
                )}
              </div>

              <TextareaField
                label="Descripción"
                value={incluidoForm.descripcion}
                onChange={(e) => setIncluidoForm({ ...incluidoForm, descripcion: e.target.value })}
                placeholder="Ej: Lata de 355ml, Botella de 500ml..."
                rows={3}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asociar a Paquetes (opcional)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {packages.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay paquetes disponibles</p>
                  ) : (
                    packages.map((pkg) => (
                      <label key={pkg.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incluidoForm.packageIds.includes(pkg.id)}
                          onChange={() => handlePackageToggle(pkg.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{pkg.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {incluidosErrors.submit && (
                <p className="text-sm text-red-600">{incluidosErrors.submit}</p>
              )}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowIncluidoModal(false)} disabled={incluidosSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={incluidosSubmitting}>
                  {incluidosSubmitting ? 'Guardando...' : editingIncluido ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Modal>

        {/* Categoría Confirmation Modal */}
        <ConfirmationModal
          open={confirmCategoriaDelete.open}
          title="Eliminar Categoría"
          message={confirmCategoriaDelete.categoria ? `¿Eliminar la categoría "${confirmCategoriaDelete.categoria.nombre}"? Esta acción no se puede deshacer.` : ''}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDangerous={true}
          isLoading={categoriasDeleting}
          onConfirm={handleConfirmCategoriaDelete}
          onCancel={() => setConfirmCategoriaDelete({ open: false, categoria: null })}
        />

        {/* Incluido Confirmation Modal */}
        <ConfirmationModal
          open={confirmIncluidoDelete.open}
          title="Eliminar Item"
          message={confirmIncluidoDelete.incluido ? `¿Eliminar el item "${confirmIncluidoDelete.incluido.nombre}"? Esta acción no se puede deshacer.` : ''}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDangerous={true}
          isLoading={incluidosDeleting}
          onConfirm={handleConfirmIncluidoDelete}
          onCancel={() => setConfirmIncluidoDelete({ open: false, incluido: null })}
        />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminIncluidos
