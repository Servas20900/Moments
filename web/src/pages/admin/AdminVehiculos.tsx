import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { AdminVehicleForm, CreateCategoryForm } from '../../components/admin/AdminForms'
import { useTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/themeClasses'
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle, uploadImage, createImageRecord, attachImageToVehicle } from '../../api/api'
import type { Vehicle } from '../../data/content'

const AdminVehiculos = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehCategories, setVehCategories] = useState<string[]>([])
  const [vehCatInputs, setVehCatInputs] = useState<Record<string, string>>({})
  const [vehCatEditing, setVehCatEditing] = useState<Record<string, boolean>>({})
  const [newVehCategory, setNewVehCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' })

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showVehModal, setShowVehModal] = useState(false)
  const [showVehCatModal, setShowVehCatModal] = useState(false)

  const iconButtonClasses = theme === 'dark'
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-700 transition hover:border-gray-400 hover:bg-gray-300'

  useEffect(() => {
    let mounted = true
    fetchVehicles().then((v) => {
      if (!mounted) return
      setVehicles(v)
      setVehCategories(Array.from(new Set(v.map(x => x.category))).filter(Boolean))
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setVehCategories(Array.from(new Set(vehicles.map((x) => x.category))).filter(Boolean))
  }, [vehicles])

  useEffect(() => {
    setVehCatInputs((prev) => {
      const next: Record<string, string> = {}
      vehCategories.forEach((c) => { next[c] = prev[c] ?? c })
      return next
    })
    setVehCatEditing((prev) => {
      const next: Record<string, boolean> = {}
      vehCategories.forEach((c) => { next[c] = prev[c] ?? false })
      return next
    })
  }, [vehCategories])

  const fallbackCategory = 'Sin categoria'

  const addCategory = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setAlertMessage({ open: true, title: 'Error', message: 'Ingresa un nombre de categoria' })
      return
    }
    if (vehCategories.includes(trimmed)) {
      setAlertMessage({ open: true, title: 'Error', message: 'Ya existe esa categoria de vehiculo' })
      return
    }
    setVehCategories((s) => [...s, trimmed])
    setVehCatInputs((s) => ({ ...s, [trimmed]: trimmed }))
    setVehCatEditing((s) => ({ ...s, [trimmed]: false }))
    setNewVehCategory('')
  }

  const renameCategory = async (from: string) => {
    const to = (vehCatInputs[from] ?? from).trim()
    if (!to) {
      setAlertMessage({ open: true, title: 'Error', message: 'El nombre no puede quedar vacio' })
      return
    }
    if (to === from) return

    const prevCats = vehCategories
    const prevVehicles = vehicles
    const updatedCats = prevCats.map((c) => (c === from ? to : c))
    const updatedVehicles = prevVehicles.map((v) => (v.category === from ? { ...v, category: to } : v))

    setVehCategories(updatedCats)
    setVehicles(updatedVehicles)
    setVehCatInputs((s) => {
      const next = { ...s }
      delete next[from]
      next[to] = to
      return next
    })
    setVehCatEditing((s) => {
      const next = { ...s }
      delete next[from]
      next[to] = false
      return next
    })

    try {
      const affected = updatedVehicles.filter((v) => v.category === to)
      await Promise.all(affected.map((v) => updateVehicle(v.id, { category: to } as any)))
    } catch (e) {
      setAlertMessage({ open: true, title: 'Error', message: `No se pudo renombrar: ${e instanceof Error ? e.message : 'Error desconocido'}` })
      setVehCategories(prevCats)
      setVehicles(prevVehicles)
      setVehCatInputs((s) => ({ ...s, [from]: from }))
      setVehCatEditing((s) => ({ ...s, [from]: false }))
    }
  }

  const deleteCategory = async (name: string) => {
    if (!confirm(`Eliminar la categoria "${name}"? Los elementos asociados se moveran a "${fallbackCategory}".`)) return
    const prevCats = vehCategories
    const prevVehicles = vehicles
    const updatedCats = prevCats.filter((c) => c !== name)
    if (!updatedCats.includes(fallbackCategory)) updatedCats.push(fallbackCategory)
    const updatedVehicles = prevVehicles.map((v) => (v.category === name ? { ...v, category: fallbackCategory } : v))

    setVehCategories(updatedCats)
    setVehicles(updatedVehicles)
    setVehCatEditing((s) => {
      const next = { ...s }
      delete next[name]
      next[fallbackCategory] = false
      return next
    })

    try {
      const affected = updatedVehicles.filter((v) => v.category === fallbackCategory)
      await Promise.all(affected.map((v) => updateVehicle(v.id, { category: fallbackCategory } as any)))
    } catch (e) {
      setAlertMessage({ open: true, title: 'Error', message: `No se pudo eliminar la categoria: ${e instanceof Error ? e.message : 'Error desconocido'}` })
      setVehCategories(prevCats)
      setVehicles(prevVehicles)
    }
  }

  const onCreateVehicle = () => {
    setEditingVehicle({ id: '', name: '', category: '', seats: 1, rate: '', features: [], imageUrl: '' })
    setShowVehModal(true)
  }

  const onEditVehicle = (v: Vehicle) => { setEditingVehicle(v); setShowVehModal(true) }

  const onDeleteVehicle = async (id: string) => {
    if (!confirm('Eliminar vehiculo?')) return
    await deleteVehicle(id)
    setVehicles((s) => s.filter((x) => x.id !== id))
  }

  const onSaveVehicle = async (vehicle: Vehicle) => {
    try {
      if (!vehicle.id) {
        const created = await createVehicle({ ...vehicle, imageUrl: '' })

        if (vehicle.imageUrl) {
          const img = await createImageRecord({ categoria: 'VEHICULO', url: vehicle.imageUrl, altText: created.name })
          await attachImageToVehicle(img.id, created.id, 0)
          created.imageUrl = vehicle.imageUrl
        }

        setVehicles((s) => [created, ...s])
      } else {
        await updateVehicle(vehicle.id, { ...vehicle, imageUrl: '' })

        if (vehicle.imageUrl) {
          const img = await createImageRecord({ categoria: 'VEHICULO', url: vehicle.imageUrl, altText: vehicle.name })
          await attachImageToVehicle(img.id, vehicle.id, 0)
        }

        setVehicles((s) => s.map((x) => (x.id === vehicle.id ? vehicle : x)))
      }
    } catch (e) {
      setAlertMessage({
        open: true,
        title: 'Error',
        message: `No se pudo guardar el vehiculo: ${e instanceof Error ? e.message : 'Error desconocido'}`,
      })
    } finally {
      setShowVehModal(false)
      setEditingVehicle(null)
    }
  }

  const vehCategoryStats = vehCategories.map((c) => ({ name: c, count: vehicles.filter((v) => v.category === c).length }))

  if (loading) return <div className="page"><p>Cargando vehiculos...</p></div>

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Gestion de Vehiculos</h1>
          <p className="section__copy">Administra los vehiculos y sus categorias.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="vehiculos" />

          <div className="min-w-0 space-y-10">
            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Organizacion</p>
                  <h2 className="section__title">Categorias de Vehiculos</h2>
                  <p className="text-sm text-gray-400">Crea, edita o elimina categorias para organizar la flota.</p>
                </div>
                <div>
                  <Button variant="primary" onClick={() => setShowVehCatModal(true)}>Nueva categoria</Button>
                </div>
              </div>

              <Card title="Categorias" subtitle="Etiquetas para agrupar vehiculos">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newVehCategory}
                      onChange={(e) => setNewVehCategory(e.target.value)}
                      placeholder="Nueva categoria de vehiculo"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    />
                    <Button variant="primary" onClick={() => addCategory(newVehCategory)}>Crear</Button>
                  </div>

                  <div className="space-y-3">
                    {vehCategoryStats.length === 0 && <p className="text-sm text-gray-400">Aun no hay categorias. Crea la primera.</p>}
                    {vehCategoryStats.map((cat) => (
                      <div key={cat.name} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            value={vehCatInputs[cat.name] ?? cat.name}
                            onChange={(e) => setVehCatInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                            disabled={!vehCatEditing[cat.name]}
                            className={`flex-1 min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none ${vehCatEditing[cat.name] ? '' : 'opacity-70 cursor-not-allowed'}`}
                          />
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200 shrink-0">{cat.count} vehiculos</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                          <span className="text-xs text-gray-400">Usada en {cat.count} vehiculos</span>
                          <div className="flex gap-2 flex-wrap sm:justify-end shrink-0">
                            {!vehCatEditing[cat.name] && (
                              <Button variant="ghost" onClick={() => setVehCatEditing((s) => ({ ...s, [cat.name]: true }))}>Editar</Button>
                            )}
                            {vehCatEditing[cat.name] && (
                              <Button
                                variant="primary"
                                onClick={() => renameCategory(cat.name)}
                                disabled={(vehCatInputs[cat.name] ?? cat.name).trim() === cat.name}
                              >
                                Guardar
                              </Button>
                            )}
                            {vehCatEditing[cat.name] && (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setVehCatInputs((s) => ({ ...s, [cat.name]: cat.name }))
                                  setVehCatEditing((s) => ({ ...s, [cat.name]: false }))
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
                    <h2 className="section__title mb-0">Vehiculos</h2>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-gray-200">{vehicles.length} activos</span>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="primary" onClick={onCreateVehicle}>Nuevo vehiculo</Button>
                    <Button variant="ghost" onClick={() => navigate('/admin/disponibilidad-vehiculos')}>Disponibilidad</Button>
                  </div>
                </div>
              </div>

              <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
                <div className="hidden md:grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                  <span>Nombre</span>
                  <span>Categoria</span>
                  <span>Asientos</span>
                  <span>Acciones</span>
                </div>
                {vehicles.map((v) => (
                  <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between md:block">
                      <span className="md:hidden text-xs text-gray-400">Nombre</span>
                      <span>{v.name}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className="md:hidden text-xs text-gray-400">Categoria</span>
                      <span>{v.category}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className="md:hidden text-xs text-gray-400">Asientos</span>
                      <span>{v.seats}</span>
                    </div>
                    <div className="flex gap-2.5 items-center justify-end md:justify-end">
                      <button className={iconButtonClasses} aria-label={`Editar ${v.name}`} onClick={() => onEditVehicle(v)}>
                        <FaEdit size={16} />
                      </button>
                      <button className={iconButtonClasses} aria-label={`Eliminar ${v.name}`} onClick={() => onDeleteVehicle(v.id)}>
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

      <Modal open={showVehModal} onClose={() => setShowVehModal(false)} title={editingVehicle ? 'Editar vehiculo' : 'Crear vehiculo'}>
        {editingVehicle && (
          <AdminVehicleForm
            key={editingVehicle.id || 'new'}
            vehicle={editingVehicle}
            categories={vehCategories}
            onCancel={() => { setShowVehModal(false); setEditingVehicle(null) }}
            onSave={onSaveVehicle}
            uploadImage={uploadImage}
          />
        )}
      </Modal>

      <Modal open={showVehCatModal} onClose={() => setShowVehCatModal(false)} title="Crear categoria de vehiculo">
        <CreateCategoryForm onCreate={(name) => { if (!vehCategories.includes(name)) setVehCategories(s => [name, ...s]); setShowVehCatModal(false) }} onCancel={() => setShowVehCatModal(false)} />
      </Modal>

      <ConfirmationModal
        open={alertMessage.open}
        title={alertMessage.title}
        message={alertMessage.message}
        confirmText="OK"
        cancelText=""
        isDangerous={false}
        onConfirm={() => setAlertMessage({ open: false, title: '', message: '' })}
        onCancel={() => setAlertMessage({ open: false, title: '', message: '' })}
      />
    </div>
  )
}

export default AdminVehiculos
