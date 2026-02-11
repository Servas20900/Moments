import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { AdminPackageForm, CreateCategoryForm } from '../../components/admin/AdminForms'
import { useTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/themeClasses'
import { fetchPackages, fetchVehicles, createPackage, updatePackage, deletePackage, uploadImage, createImageRecord, attachImageToPackage } from '../../api/api'
import type { Package, Vehicle } from '../../data/content'

const AdminPaquetes = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)
  const [packages, setPackages] = useState<Package[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pkgCategories, setPkgCategories] = useState<string[]>([])
  const [pkgCatInputs, setPkgCatInputs] = useState<Record<string, string>>({})
  const [pkgCatEditing, setPkgCatEditing] = useState<Record<string, boolean>>({})
  const [newPkgCategory, setNewPkgCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' })

  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [showPkgCatModal, setShowPkgCatModal] = useState(false)

  const iconButtonClasses = theme === 'dark'
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-700 transition hover:border-gray-400 hover:bg-gray-300'

  useEffect(() => {
    let mounted = true
    Promise.all([fetchPackages(), fetchVehicles()]).then(([p, v]) => {
      if (!mounted) return
      setPackages(p)
      setVehicles(v)
      setPkgCategories(Array.from(new Set(p.map(x => x.category))).filter(Boolean))
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setPkgCategories(Array.from(new Set(packages.map((x) => x.category))).filter(Boolean))
  }, [packages])

  useEffect(() => {
    setPkgCatInputs((prev) => {
      const next: Record<string, string> = {}
      pkgCategories.forEach((c) => { next[c] = prev[c] ?? c })
      return next
    })
    setPkgCatEditing((prev) => {
      const next: Record<string, boolean> = {}
      pkgCategories.forEach((c) => { next[c] = prev[c] ?? false })
      return next
    })
  }, [pkgCategories])

  const fallbackCategory = 'Sin categoria'

  const addCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setAlertMessage({ open: true, title: 'Error', message: 'Ingresa un nombre de categoria' })
      return
    }
    if (pkgCategories.includes(trimmed)) {
      setAlertMessage({ open: true, title: 'Error', message: 'Ya existe esa categoria de paquete' })
      return
    }
    setPkgCategories((s) => [...s, trimmed])
    setPkgCatInputs((s) => ({ ...s, [trimmed]: trimmed }))
    setPkgCatEditing((s) => ({ ...s, [trimmed]: false }))
    setNewPkgCategory('')
  }

  const renameCategory = async (from: string) => {
    const to = (pkgCatInputs[from] ?? from).trim()
    if (!to) {
      setAlertMessage({ open: true, title: 'Error', message: 'El nombre no puede quedar vacio' })
      return
    }
    if (to === from) return

    const prevCats = pkgCategories
    const prevPackages = packages
    const updatedCats = prevCats.map((c) => (c === from ? to : c))
    const updatedPackages = prevPackages.map((p) => (p.category === from ? { ...p, category: to } : p))

    setPkgCategories(updatedCats)
    setPackages(updatedPackages)
    setPkgCatInputs((s) => {
      const next = { ...s }
      delete next[from]
      next[to] = to
      return next
    })
    setPkgCatEditing((s) => {
      const next = { ...s }
      delete next[from]
      next[to] = false
      return next
    })

    try {
      const affected = updatedPackages.filter((p) => p.category === to)
      await Promise.all(affected.map((p) => updatePackage(p.id, { category: to } as any)))
    } catch (e) {
      setAlertMessage({ open: true, title: 'Error', message: `No se pudo renombrar: ${e instanceof Error ? e.message : 'Error desconocido'}` })
      setPkgCategories(prevCats)
      setPackages(prevPackages)
      setPkgCatInputs((s) => ({ ...s, [from]: from }))
      setPkgCatEditing((s) => ({ ...s, [from]: false }))
    }
  }

  const deleteCategory = async (name: string) => {
    if (!confirm(`Eliminar la categoria "${name}"? Los elementos asociados se moveran a "${fallbackCategory}".`)) return
    const prevCats = pkgCategories
    const prevPackages = packages
    const updatedCats = prevCats.filter((c) => c !== name)
    if (!updatedCats.includes(fallbackCategory)) updatedCats.push(fallbackCategory)
    const updatedPackages = prevPackages.map((p) => (p.category === name ? { ...p, category: fallbackCategory } : p))

    setPkgCategories(updatedCats)
    setPackages(updatedPackages)
    setPkgCatEditing((s) => {
      const next = { ...s }
      delete next[name]
      next[fallbackCategory] = false
      return next
    })

    try {
      const affected = updatedPackages.filter((p) => p.category === fallbackCategory)
      await Promise.all(affected.map((p) => updatePackage(p.id, { category: fallbackCategory } as any)))
    } catch (e) {
      setAlertMessage({ open: true, title: 'Error', message: `No se pudo eliminar la categoria: ${e instanceof Error ? e.message : 'Error desconocido'}` })
      setPkgCategories(prevCats)
      setPackages(prevPackages)
    }
  }

  const onCreatePackage = () => {
    setEditingPackage({ id: '', category: '', name: '', description: '', price: 0, vehicle: '', maxPeople: 1, includes: [], imageUrl: '', vehicleIds: [] })
    setShowPkgModal(true)
  }

  const onEditPackage = (pkg: Package) => {
    setEditingPackage({ ...pkg })
    setShowPkgModal(true)
  }

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const onDeletePackage = (id: string) => {
    setConfirmDelete({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return
    setIsDeleting(true)
    try {
      await deletePackage(confirmDelete.id)
      setPackages((s) => s.filter((x) => x.id !== confirmDelete.id))
      setConfirmDelete({ open: false, id: '' })
    } finally {
      setIsDeleting(false)
    }
  }

  const onSavePackage = async (pkg: Package) => {
    try {
      if (!pkg.id) {
        const created = await createPackage({ ...pkg, imageUrl: '' })

        if (pkg.imageUrl) {
          const img = await createImageRecord({ categoria: 'PAQUETE', url: pkg.imageUrl, altText: created.name })
          await attachImageToPackage(img.id, created.id, 0)
          created.imageUrl = pkg.imageUrl
        }

        setPackages((s) => [created, ...s])
      } else {
        await updatePackage(pkg.id, { ...pkg, imageUrl: '' })

        if (pkg.imageUrl) {
          const img = await createImageRecord({ categoria: 'PAQUETE', url: pkg.imageUrl, altText: pkg.name })
          await attachImageToPackage(img.id, pkg.id, 0)
        }

        setPackages((s) => s.map((x) => (x.id === pkg.id ? pkg : x)))
      }
    } catch (e) {
      setAlertMessage({
        open: true,
        title: 'Error',
        message: `No se pudo guardar el paquete: ${e instanceof Error ? e.message : 'Error desconocido'}`,
      })
    } finally {
      setShowPkgModal(false)
      setEditingPackage(null)
    }
  }

  const pkgCategoryStats = pkgCategories.map((c) => ({ name: c, count: packages.filter((p) => p.category === c).length }))

  if (loading) return <div className="page"><p>Cargando paquetes...</p></div>

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Gestion de Paquetes</h1>
          <p className="section__copy">Administra los paquetes y sus categorias.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="paquetes" />

          <div className="min-w-0 space-y-10">
            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Organizacion</p>
                  <h2 className="section__title">Categorias de Paquetes</h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Crea, edita o elimina categorias para organizar el catalogo.</p>
                </div>
                <div>
                  <Button variant="primary" onClick={() => setShowPkgCatModal(true)}>Nueva categoria</Button>
                </div>
              </div>

              <Card title="Categorias" subtitle="Etiquetas para agrupar paquetes">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newPkgCategory}
                      onChange={(e) => setNewPkgCategory(e.target.value)}
                      placeholder="Nueva categoria de paquete"
                      className={`flex-1 rounded-lg border px-3 py-2 focus:outline-none ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white focus:border-amber-300/60'
                          : 'border-gray-300 bg-gray-50 text-gray-900 focus:border-amber-300'
                      }`}
                    />
                    <Button variant="primary" onClick={() => addCategory(newPkgCategory)}>Crear</Button>
                  </div>

                  <div className="space-y-3">
                    {pkgCategoryStats.length === 0 && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Aun no hay categorias. Crea la primera.</p>}
                    {pkgCategoryStats.map((cat) => (
                      <div key={cat.name} className={`flex flex-col gap-2 rounded-lg border px-3 py-3 ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5'
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            value={pkgCatInputs[cat.name] ?? cat.name}
                            onChange={(e) => setPkgCatInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                            disabled={!pkgCatEditing[cat.name]}
                            className={`flex-1 min-w-0 rounded-lg border px-3 py-2 focus:outline-none ${
                              theme === 'dark'
                                ? `border-white/10 bg-black/20 text-white focus:border-amber-300/60 ${pkgCatEditing[cat.name] ? '' : 'opacity-70 cursor-not-allowed'}`
                                : `border-gray-300 bg-gray-100 text-gray-900 focus:border-amber-300 ${pkgCatEditing[cat.name] ? '' : 'opacity-70 cursor-not-allowed'}`
                            }`}
                          />
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs shrink-0 ${
                            theme === 'dark'
                              ? 'bg-white/10 text-gray-200'
                              : 'bg-gray-200 text-gray-700'
                          }`}>{cat.count} paquetes</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Usada en {cat.count} paquetes</span>
                          <div className="flex gap-2 flex-wrap sm:justify-end shrink-0">
                            {!pkgCatEditing[cat.name] && (
                              <Button variant="ghost" onClick={() => setPkgCatEditing((s) => ({ ...s, [cat.name]: true }))}>Editar</Button>
                            )}
                            {pkgCatEditing[cat.name] && (
                              <Button
                                variant="primary"
                                onClick={() => renameCategory(cat.name)}
                                disabled={(pkgCatInputs[cat.name] ?? cat.name).trim() === cat.name}
                              >
                                Guardar
                              </Button>
                            )}
                            {pkgCatEditing[cat.name] && (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setPkgCatInputs((s) => ({ ...s, [cat.name]: cat.name }))
                                  setPkgCatEditing((s) => ({ ...s, [cat.name]: false }))
                                }}
                              >
                                Cancelar
                              </Button>
                            )}
                            <Button variant="ghost" onClick={() => deleteCategory(cat.name)}>Eliminar</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="eyebrow">Contenido</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="section__title mb-0">Paquetes</h2>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-gray-200'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}>{packages.length} activos</span>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="primary" onClick={onCreatePackage}>Nuevo paquete</Button>
                  </div>
                </div>
              </div>

              <div className={`w-full border rounded-xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.35)] ${
                theme === 'dark'
                  ? 'border-white/10 bg-[var(--card-bg,#11131a)]'
                  : 'border-gray-200 bg-white'
              }`}>
                <div className={`hidden md:grid grid-cols-6 gap-3 p-4 font-semibold text-sm uppercase tracking-wide ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] text-gray-200'
                    : 'bg-gray-100 border-b border-gray-300 text-gray-700'
                }`}>
                  <span>Nombre</span>
                  <span>Categoria</span>
                  <span>Precio</span>
                  <span>Vehiculos</span>
                  <span>Incluye</span>
                  <span>Acciones</span>
                </div>
                {packages.map((p) => (
                  <div key={p.id} className={`grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b last:border-b-0 transition-colors ${
                    theme === 'dark'
                      ? 'border-white/5 hover:bg-white/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between md:block">
                      <span className={`md:hidden text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className={`md:hidden text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Categoria</span>
                      <span className={`inline-flex px-2.5 py-1 text-[11px] rounded-full ${
                        theme === 'dark'
                          ? 'bg-white/10 text-gray-100'
                          : 'bg-gray-200 text-gray-700'
                      }`}>{p.category}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className={`md:hidden text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Precio</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-600'}`}>${p.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className={`md:hidden text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Vehiculos</span>
                      <div className="flex flex-wrap gap-1">
                        {(p.vehicles || []).slice(0,3).map((v) => (
                          <span key={v.id} className={`inline-flex px-2 py-0.5 text-[11px] rounded-full border ${
                            theme === 'dark'
                              ? 'bg-slate-900/60 border-white/10 text-gray-200'
                              : 'bg-gray-200 border-gray-300 text-gray-700'
                          }`}>{v.name}</span>
                        ))}
                        {(p.vehicleIds?.length || 0) > 3 && <span className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>+{(p.vehicleIds?.length || 0) - 3} mas</span>}
                        {(!p.vehicles || p.vehicles.length === 0) && <span className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>—</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className={`md:hidden text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Incluye</span>
                      <span className={`text-[11px] truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.includes?.[0] ?? '—'}</span>
                    </div>
                    <div className="flex gap-2.5 items-center justify-end md:justify-end">
                      <button className={iconButtonClasses} aria-label={`Editar ${p.name}`} onClick={() => onEditPackage(p)}>
                        <FaEdit size={16} />
                      </button>
                      <button className={iconButtonClasses} aria-label={`Eliminar ${p.name}`} onClick={() => onDeletePackage(p.id)}>
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Modal open={showPkgModal} onClose={() => setShowPkgModal(false)} title={editingPackage ? 'Editar paquete' : 'Crear paquete'}>
        {editingPackage && (
          <AdminPackageForm
            key={editingPackage.id || 'new'}
            pkg={editingPackage}
            categories={pkgCategories}
            vehiclesList={vehicles}
            onCancel={() => { setShowPkgModal(false); setEditingPackage(null) }}
            onSave={onSavePackage}
            uploadImage={uploadImage}
          />
        )}
      </Modal>

      <Modal open={showPkgCatModal} onClose={() => setShowPkgCatModal(false)} title="Crear categoria de paquete">
        <CreateCategoryForm onCreate={(name) => { if (!pkgCategories.includes(name)) setPkgCategories(s => [name, ...s]); setShowPkgCatModal(false) }} onCancel={() => setShowPkgCatModal(false)} />
      </Modal>

      <ConfirmationModal
        open={confirmDelete.open}
        title="Eliminar Paquete"
        message="¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ open: false, id: '' })}
      />
    </div>
  )
}

export default AdminPaquetes
