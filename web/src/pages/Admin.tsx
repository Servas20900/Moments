import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { InputField, TextareaField, CheckboxField } from '../components/FormField'
import ImageUpload from '../components/ImageUpload'
import { fetchPackages, fetchVehicles, createPackage, updatePackage, deletePackage, createVehicle, updateVehicle, deleteVehicle, uploadImage, fetchNotifications, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchExperiences, fetchSystemImages, createSystemImage, updateSystemImage, deleteSystemImage, fetchHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, createImageRecord, attachImageToPackage, attachImageToVehicle, attachImageToEvent } from '../api/api'
import { useCalendarContext } from '../contexts/CalendarContext'
import type { Package, Vehicle, CalendarSlotView, SystemImage, HeroSlide } from '../data/content'

const Admin = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [systemImages, setSystemImages] = useState<SystemImage[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [pkgCategories, setPkgCategories] = useState<string[]>([])
  const [vehCategories, setVehCategories] = useState<string[]>([])
  const [pkgCatInputs, setPkgCatInputs] = useState<Record<string, string>>({})
  const [vehCatInputs, setVehCatInputs] = useState<Record<string, string>>({})
  const [pkgCatEditing, setPkgCatEditing] = useState<Record<string, boolean>>({})
  const [vehCatEditing, setVehCatEditing] = useState<Record<string, boolean>>({})
  const [newPkgCategory, setNewPkgCategory] = useState('')
  const [newVehCategory, setNewVehCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Use Calendar Context
  const { events, addEvent, updateEvent, removeEvent } = useCalendarContext()

  const [showPkgCatModal, setShowPkgCatModal] = useState(false)
  const [showVehCatModal, setShowVehCatModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  const [showHeroModal, setShowHeroModal] = useState(false)

  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarSlotView | null>(null)
  const [editingImage, setEditingImage] = useState<SystemImage | null>(null)
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null)
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [showVehModal, setShowVehModal] = useState(false)

  const iconButtonClasses = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'

  useEffect(() => {
    let mounted = true
    Promise.all([fetchPackages(), fetchVehicles(), fetchNotifications(), fetchExperiences(), fetchSystemImages(), fetchHeroSlides()]).then(([p, v, n, _exp, img, h]) => {
      if (!mounted) return
      setPackages(p)
      setVehicles(v)
      setSystemImages(img)
      setHeroSlides(h)
      setNotifications(n)
      setPkgCategories(Array.from(new Set(p.map(x => x.category))).filter(Boolean))
      setVehCategories(Array.from(new Set(v.map(x => x.category))).filter(Boolean))
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setPkgCategories(Array.from(new Set(packages.map((x) => x.category))).filter(Boolean))
  }, [packages])

  useEffect(() => {
    setVehCategories(Array.from(new Set(vehicles.map((x) => x.category))).filter(Boolean))
  }, [vehicles])

  useEffect(() => {
    setPkgCatInputs((prev) => {
      const next: Record<string, string> = {}
      pkgCategories.forEach((c) => { next[c] = prev[c] ?? c })
      return next
    })
    setVehCatInputs((prev) => {
      const next: Record<string, string> = {}
      vehCategories.forEach((c) => { next[c] = prev[c] ?? c })
      return next
    })
    setPkgCatEditing((prev) => {
      const next: Record<string, boolean> = {}
      pkgCategories.forEach((c) => { next[c] = prev[c] ?? false })
      return next
    })
    setVehCatEditing((prev) => {
      const next: Record<string, boolean> = {}
      vehCategories.forEach((c) => { next[c] = prev[c] ?? false })
      return next
    })
  }, [pkgCategories, vehCategories])

  const fallbackCategory = 'Sin categoría'

  const addCategory = (type: 'package' | 'vehicle', name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      alert('Ingresa un nombre de categoría')
      return
    }
    if (type === 'package') {
      if (pkgCategories.includes(trimmed)) {
        alert('Ya existe esa categoría de paquete')
        return
      }
      setPkgCategories((s) => [...s, trimmed])
      setPkgCatInputs((s) => ({ ...s, [trimmed]: trimmed }))
      setPkgCatEditing((s) => ({ ...s, [trimmed]: false }))
      setNewPkgCategory('')
    } else {
      if (vehCategories.includes(trimmed)) {
        alert('Ya existe esa categoría de vehículo')
        return
      }
      setVehCategories((s) => [...s, trimmed])
      setVehCatInputs((s) => ({ ...s, [trimmed]: trimmed }))
      setVehCatEditing((s) => ({ ...s, [trimmed]: false }))
      setNewVehCategory('')
    }
  }

  const renameCategory = async (type: 'package' | 'vehicle', from: string) => {
    const inputs = type === 'package' ? pkgCatInputs : vehCatInputs
    const to = (inputs[from] ?? from).trim()
    if (!to) {
      alert('El nombre no puede quedar vacío')
      return
    }
    if (to === from) return

    if (type === 'package') {
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
        alert(`No se pudo renombrar: ${e instanceof Error ? e.message : 'Error desconocido'}`)
        setPkgCategories(prevCats)
        setPackages(prevPackages)
        setPkgCatInputs((s) => ({ ...s, [from]: from }))
        setPkgCatEditing((s) => ({ ...s, [from]: false }))
      }
    } else {
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
        alert(`No se pudo renombrar: ${e instanceof Error ? e.message : 'Error desconocido'}`)
        setVehCategories(prevCats)
        setVehicles(prevVehicles)
        setVehCatInputs((s) => ({ ...s, [from]: from }))
        setVehCatEditing((s) => ({ ...s, [from]: false }))
      }
    }
  }

  const deleteCategory = async (type: 'package' | 'vehicle', name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los elementos asociados se moverán a "${fallbackCategory}".`)) return
    if (type === 'package') {
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
        alert(`No se pudo eliminar la categoría: ${e instanceof Error ? e.message : 'Error desconocido'}`)
        setPkgCategories(prevCats)
        setPackages(prevPackages)
      }
    } else {
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
        alert(`No se pudo eliminar la categoría: ${e instanceof Error ? e.message : 'Error desconocido'}`)
        setVehCategories(prevCats)
        setVehicles(prevVehicles)
      }
    }
  }

  const pkgCategoryStats = pkgCategories.map((c) => ({ name: c, count: packages.filter((p) => p.category === c).length }))
  const vehCategoryStats = vehCategories.map((c) => ({ name: c, count: vehicles.filter((v) => v.category === c).length }))

  const onCreatePackage = () => {
    setEditingPackage({ id: '', category: '', name: '', description: '', price: 0, vehicle: '', maxPeople: 1, includes: [], imageUrl: '', vehicleIds: [] })
    setShowPkgModal(true)
  }

  const onEditPackage = (pkg: Package) => {
    setEditingPackage({ ...pkg })
    setShowPkgModal(true)
  }

  const onDeletePackage = async (id: string) => {
    if (!confirm('Eliminar paquete?')) return
    await deletePackage(id)
    setPackages((s) => s.filter((x) => x.id !== id))
  }

  const onSavePackage = async (pkg: Package) => {
    try {
      if (!pkg.id) {
        // 1. Create package without image URL
        const pkgPayload = { ...pkg, imageUrl: '' }
        const created = await createPackage(pkgPayload)
        
        // 2. If image exists, persist it first in Imagen table
        if (pkg.imageUrl) {
          const img = await createImageRecord({ categoria: 'PAQUETE', url: pkg.imageUrl, altText: created.name })
          // 3. Attach image to package
          await attachImageToPackage(img.id, created.id, 0)
          // 4. Refresh with image from BD relation
          created.imageUrl = pkg.imageUrl
        }
        setPackages((s) => [created, ...s])
      } else {
        // Update package
        const pkgPayload = { ...pkg, imageUrl: '' }
        await updatePackage(pkg.id, pkgPayload)
        
        // If image exists, persist it
        if (pkg.imageUrl) {
          const img = await createImageRecord({ categoria: 'PAQUETE', url: pkg.imageUrl, altText: pkg.name })
          await attachImageToPackage(img.id, pkg.id, 0)
          pkg.imageUrl = pkg.imageUrl // Keep it for display
        }
        setPackages((s) => s.map((x) => (x.id === pkg.id ? pkg : x)))
      }
    } catch (e) {
      console.error('Error guardando paquete:', e)
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo guardar'}`)
    } finally {
      setShowPkgModal(false)
      setEditingPackage(null)
    }
  }

  const onCreateVehicle = () => {
    setEditingVehicle({ id: '', name: '', category: '', seats: 1, rate: '', features: [], imageUrl: '' })
    setShowVehModal(true)
  }

  const onEditVehicle = (v: Vehicle) => { setEditingVehicle(v); setShowVehModal(true) }

  const onDeleteVehicle = async (id: string) => {
    if (!confirm('Eliminar vehículo?')) return
    await deleteVehicle(id)
    setVehicles((s) => s.filter((x) => x.id !== id))
  }

  const onSaveVehicle = async (v: Vehicle) => {
    try {
      if (!v.id) {
        // 1. Create vehicle without image URL
        const vPayload = { ...v, imageUrl: '' }
        const created = await createVehicle(vPayload)
        
        // 2. If image exists, persist it
        if (v.imageUrl) {
          const img = await createImageRecord({ categoria: 'VEHICULO', url: v.imageUrl, altText: created.name })
          await attachImageToVehicle(img.id, created.id, 0)
          created.imageUrl = v.imageUrl
        }
        setVehicles((s) => [created, ...s])
      } else {
        // Update vehicle
        const vPayload = { ...v, imageUrl: '' }
        await updateVehicle(v.id, vPayload)
        
        if (v.imageUrl) {
          const img = await createImageRecord({ categoria: 'VEHICULO', url: v.imageUrl, altText: v.name })
          await attachImageToVehicle(img.id, v.id, 0)
          v.imageUrl = v.imageUrl
        }
        setVehicles((s) => s.map((x) => (x.id === v.id ? v : x)))
      }
    } catch (e) {
      console.error('Error guardando vehículo:', e)
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo guardar'}`)
    } finally {
      setShowVehModal(false)
      setEditingVehicle(null)
    }
  }

  const onCreateEvent = () => {
    setEditingEvent({ id: '', date: '', status: 'evento', title: '', detail: '', tag: '', imageUrl: '' })
    setShowEventModal(true)
  }

  const onEditEvent = (ev: CalendarSlotView) => { setEditingEvent(ev); setShowEventModal(true) }

  const onDeleteEvent = async (id: string) => {
    if (!confirm('Eliminar evento?')) return
    try {
      await deleteCalendarEvent(id)
      removeEvent(id)
    } catch (e) {
      console.error('Error eliminando evento:', e)
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo eliminar'}`)
    }
  }

  const onSaveEvent = async (ev: CalendarSlotView) => {
    const eventData: CalendarSlotView = { ...ev, status: 'evento' }
    try {
      if (!ev.id) {
        // 1. Create event without image URL
        const evPayload = { ...eventData, imageUrl: '' }
        const created = await createCalendarEvent(evPayload)
        
        // 2. If image exists, persist it
        if (eventData.imageUrl) {
          const img = await createImageRecord({ categoria: 'EVENTO', url: eventData.imageUrl, altText: created.title })
          await attachImageToEvent(img.id, created.id, 0)
          created.imageUrl = eventData.imageUrl
        }
        addEvent(created)
      } else {
        // Update event
        const evPayload = { ...eventData, imageUrl: '' }
        await updateCalendarEvent(ev.id, evPayload)
        
        if (eventData.imageUrl) {
          const img = await createImageRecord({ categoria: 'EVENTO', url: eventData.imageUrl, altText: eventData.title })
          await attachImageToEvent(img.id, eventData.id, 0)
        }
        updateEvent(eventData.id, eventData)
      }
    } catch (e) {
      console.error('Error guardando evento:', e)
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo guardar'}`)
    } finally {
      setShowEventModal(false)
      setEditingEvent(null)
    }
  }

  const onCreateImage = () => {
    setEditingImage({ id: '', category: 'LANDING_PAGE', name: '', description: '', url: '', altText: '', order: 0, isActive: true })
    setShowImgModal(true)
  }

  const onEditImage = (img: SystemImage) => { setEditingImage(img); setShowImgModal(true) }

  const onDeleteImage = async (id: string) => {
    if (!confirm('Eliminar imagen?')) return
    await deleteSystemImage(id)
    setSystemImages((s) => s.filter((x) => x.id !== id))
  }

  const onSaveImage = async (img: SystemImage) => {
    if (!img.id) {
      const created = await createSystemImage(img)
      setSystemImages((s) => [created, ...s])
    } else {
      await updateSystemImage(img.id, img)
      setSystemImages((s) => s.map((x) => (x.id === img.id ? img : x)))
    }
    setShowImgModal(false)
    setEditingImage(null)
  }

  const onCreateHero = () => {
    setEditingHero({ id: '', title: '', subtitle: '', description: '', imageUrl: '', order: heroSlides.length + 1, isActive: true })
    setShowHeroModal(true)
  }

  const onEditHero = (slide: HeroSlide) => { setEditingHero(slide); setShowHeroModal(true) }

  const onDeleteHero = async (id: string) => {
    if (!confirm('Eliminar slide?')) return
    await deleteHeroSlide(id)
    // Recargar slides desde el backend para reflejar el estado real
    const updatedSlides = await fetchHeroSlides()
    setHeroSlides(updatedSlides)
  }

  const onSaveHero = async (slide: HeroSlide) => {
    try {
      let updatedSlides: HeroSlide[] = []
      if (!slide.id) {
        // Crear slide
        const slidePayload = { ...slide }
        await createHeroSlide(slidePayload)
        updatedSlides = await fetchHeroSlides()
        setHeroSlides(updatedSlides)
      } else {
        // Editar slide
        await updateHeroSlide(slide.id, slide)
        updatedSlides = await fetchHeroSlides()
        setHeroSlides(updatedSlides)
      }
    } catch (e) {
      console.error('Error guardando hero slide:', e)
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo guardar'}`)
    } finally {
      setShowHeroModal(false)
      setEditingHero(null)
    }
  }

  if (loading) return <div className="page"><p>Cargando administrador...</p></div>

  return (
    <div className="page admin-page">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <header className="section">
          <p className="eyebrow">Admin</p>
          <h1 className="display">Panel administrativo</h1>
          <p className="section__copy">Crea, edita o elimina paquetes, vehículos y contenido. Las acciones pegan a la API.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <aside className="bg-[var(--card-bg,#11131a)] border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.3)] self-start max-w-xs">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Secciones</p>
            <div className="grid gap-2">
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-hero')?.scrollIntoView({ behavior: 'smooth' })}>Hero Carousel</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-events')?.scrollIntoView({ behavior: 'smooth' })}>Eventos</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-categories')?.scrollIntoView({ behavior: 'smooth' })}>Categorías</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-packages')?.scrollIntoView({ behavior: 'smooth' })}>Paquetes</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-vehicles')?.scrollIntoView({ behavior: 'smooth' })}>Vehículos</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-images')?.scrollIntoView({ behavior: 'smooth' })}>Imágenes del Sistema</button>
              <button className="text-left bg-white/5 border border-white/10 text-white px-3 py-2 rounded-xl cursor-pointer transition-colors hover:border-white/20 hover:bg-white/10 text-sm" onClick={() => document.getElementById('admin-notifications')?.scrollIntoView({ behavior: 'smooth' })}>Notificaciones</button>
            </div>
          </aside>

          <div className="min-w-0">
          <section className="section" id="admin-hero">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Landing</p>
                <h2 className="section__title">Hero Carousel</h2>
              </div>
              <div>
                <Button variant="primary" onClick={onCreateHero}>Nuevo slide</Button>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Título</span>
                <span>Orden</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {heroSlides.map((slide) => (
                <div key={slide.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Título</span>
                    <span>{slide.title}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Orden</span>
                    <span>{slide.order}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Estado</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${slide.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
                      {slide.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2.5 items-center justify-end md:justify-end">
                    <button className={iconButtonClasses} aria-label={`Editar ${slide.title}`} onClick={() => onEditHero(slide)}>
                      <FaEdit size={16} />
                    </button>
                    <button className={iconButtonClasses} aria-label={`Eliminar ${slide.title}`} onClick={() => onDeleteHero(slide.id)}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-events">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Calendario</p>
                <h2 className="section__title">Eventos</h2>
              </div>
              <div>
                <Button variant="primary" onClick={onCreateEvent}>Nuevo evento</Button>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Fecha</span>
                <span>Título</span>
                <span>Tag</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {events.map((e) => (
                <div key={e.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Fecha</span>
                    <span>{e.date}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Título</span>
                    <span>{e.title}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Tag</span>
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-white/10 text-white">{e.tag || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Estado</span>
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-200">{e.status}</span>
                  </div>
                  <div className="flex gap-2.5 items-center justify-end md:justify-end">
                    <button className={iconButtonClasses} aria-label={`Editar ${e.title}`} onClick={() => onEditEvent(e)}>
                      <FaEdit size={16} />
                    </button>
                    <button className={iconButtonClasses} aria-label={`Eliminar ${e.title}`} onClick={() => onDeleteEvent(e.id)}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-categories">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Organización</p>
                <h2 className="section__title">Categorías</h2>
                <p className="text-sm text-gray-400">Crea, edita o elimina categorías de paquetes y vehículos para mantener ordenado el catálogo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Paquetes" subtitle="Etiquetas para agrupar paquetes">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newPkgCategory}
                      onChange={(e) => setNewPkgCategory(e.target.value)}
                      placeholder="Nueva categoría de paquete"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    />
                    <Button variant="primary" onClick={() => addCategory('package', newPkgCategory)}>Crear</Button>
                  </div>

                  <div className="space-y-3">
                    {pkgCategoryStats.length === 0 && <p className="text-sm text-gray-400">Aún no hay categorías. Crea la primera para organizar tus paquetes.</p>}
                    {pkgCategoryStats.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            value={pkgCatInputs[cat.name] ?? cat.name}
                            onChange={(e) => setPkgCatInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                            disabled={!pkgCatEditing[cat.name]}
                            className={`flex-1 min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none ${pkgCatEditing[cat.name] ? '' : 'opacity-70 cursor-not-allowed'}`}
                          />
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200 shrink-0">{cat.count} paquetes</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                          <span className="text-xs text-gray-400">Usada en {cat.count} paquetes</span>
                          <div className="flex gap-2 flex-wrap sm:justify-end shrink-0">
                            {!pkgCatEditing[cat.name] && (
                              <Button variant="ghost" onClick={() => setPkgCatEditing((s) => ({ ...s, [cat.name]: true }))}>Editar</Button>
                            )}
                            {pkgCatEditing[cat.name] && (
                              <Button
                                variant="primary"
                                onClick={() => renameCategory('package', cat.name)}
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
                            <Button variant="ghost" onClick={() => deleteCategory('package', cat.name)}>Eliminar</Button>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="Vehículos" subtitle="Etiquetas para agrupar vehículos">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newVehCategory}
                      onChange={(e) => setNewVehCategory(e.target.value)}
                      placeholder="Nueva categoría de vehículo"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    />
                    <Button variant="primary" onClick={() => addCategory('vehicle', newVehCategory)}>Crear</Button>
                  </div>

                  <div className="space-y-3">
                    {vehCategoryStats.length === 0 && <p className="text-sm text-gray-400">Aún no hay categorías. Crea la primera para organizar tus vehículos.</p>}
                    {vehCategoryStats.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                          <input
                            type="text"
                            value={vehCatInputs[cat.name] ?? cat.name}
                            onChange={(e) => setVehCatInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                            disabled={!vehCatEditing[cat.name]}
                            className={`flex-1 min-w-0 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none ${vehCatEditing[cat.name] ? '' : 'opacity-70 cursor-not-allowed'}`}
                          />
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200 shrink-0">{cat.count} vehículos</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                          <span className="text-xs text-gray-400">Usada en {cat.count} vehículos</span>
                          <div className="flex gap-2 flex-wrap sm:justify-end shrink-0">
                            {!vehCatEditing[cat.name] && (
                              <Button variant="ghost" onClick={() => setVehCatEditing((s) => ({ ...s, [cat.name]: true }))}>Editar</Button>
                            )}
                            {vehCatEditing[cat.name] && (
                              <Button
                                variant="primary"
                                onClick={() => renameCategory('vehicle', cat.name)}
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
                            <Button variant="ghost" onClick={() => deleteCategory('vehicle', cat.name)}>Eliminar</Button>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="section" id="admin-packages">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="eyebrow">Contenido</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="section__title mb-0">Paquetes</h2>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-gray-200">{packages.length} activos</span>
                </div>
              </div>
              <div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={onCreatePackage}>Nuevo paquete</Button>
                </div>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-6 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Vehículos</span>
                <span>Incluye</span>
                <span>Acciones</span>
              </div>
              {packages.map((p) => (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Nombre</span>
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Categoría</span>
                    <span className="inline-flex px-2.5 py-1 text-[11px] rounded-full bg-white/10 text-gray-100">{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Precio</span>
                    <span className="font-semibold text-emerald-200">${p.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Vehículos</span>
                    <div className="flex flex-wrap gap-1">
                      {(p.vehicles || []).slice(0,3).map((v) => (
                        <span key={v.id} className="inline-flex px-2 py-0.5 text-[11px] rounded-full bg-slate-900/60 border border-white/10 text-gray-200">{v.name}</span>
                      ))}
                      {(p.vehicleIds?.length || 0) > 3 && <span className="text-[11px] text-gray-400">+{(p.vehicleIds?.length || 0) - 3} más</span>}
                      {(!p.vehicles || p.vehicles.length === 0) && <span className="text-[11px] text-gray-400">—</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Incluye</span>
                    <span className="text-[11px] text-gray-300 truncate">{p.includes?.[0] ?? '—'}</span>
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

          <section className="section" id="admin-vehicles">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="eyebrow">Contenido</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="section__title mb-0">Vehículos</h2>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] text-gray-200">{vehicles.length} activos</span>
                </div>
              </div>
              <div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={onCreateVehicle}>Nuevo vehículo</Button>
                </div>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Tarifa</span>
                <span>Asientos</span>
                <span>Acciones</span>
              </div>
              {vehicles.map((v) => (
                <div key={v.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Nombre</span>
                    <span>{v.name}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Categoría</span>
                    <span>{v.category}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Tarifa</span>
                    <span>{v.rate}</span>
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

          <section className="section" id="admin-images">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Galería y Experiencias</h2>
              </div>
              <div>
                <Button variant="primary" onClick={onCreateImage}>Nueva imagen</Button>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Nombre</span>
                <span>Orden</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {systemImages.map((img) => (
                <div key={img.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Nombre</span>
                    <span>{img.name}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Orden</span>
                    <span>{img.order}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Estado</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${img.isActive ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
                      {img.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="flex gap-2.5 items-center justify-end md:justify-end">
                    <button className={iconButtonClasses} aria-label={`Editar ${img.name}`} onClick={() => onEditImage(img)}>
                      <FaEdit size={16} />
                    </button>
                    <button className={iconButtonClasses} aria-label={`Eliminar ${img.name}`} onClick={() => onDeleteImage(img.id)}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-notifications">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Sistema</p>
                <h2 className="section__title">Notificaciones</h2>
              </div>
              <div>
                <Button variant="primary" onClick={async () => setNotifications(await fetchNotifications())}>Refrescar</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {notifications.length === 0 && <Card><p>No hay notificaciones aún.</p></Card>}
              {notifications.map((n) => (
                <Card key={n.id} title={`${n.channel.toUpperCase()} · ${new Date(n.timestamp).toLocaleString()}`} subtitle={n.to}>
                  <div dangerouslySetInnerHTML={{ __html: typeof n.message === 'string' ? n.message : String(n.message) }} />
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent?.id ? 'Editar evento' : 'Crear evento'}>
        {editingEvent && <AdminEventForm key={editingEvent.id || 'new'} ev={editingEvent} onCancel={() => { setShowEventModal(false); setEditingEvent(null) }} onSave={onSaveEvent} uploadImage={uploadImage} />}
      </Modal>

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

      <Modal open={showVehModal} onClose={() => setShowVehModal(false)} title={editingVehicle ? 'Editar vehículo' : 'Crear vehículo'}>
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

      <Modal open={showImgModal} onClose={() => setShowImgModal(false)} title={editingImage ? 'Editar imagen' : 'Crear imagen'}>
        {editingImage && (
          <AdminImageForm img={editingImage} onCancel={() => { setShowImgModal(false); setEditingImage(null) }} onSave={onSaveImage} uploadImage={uploadImage} />
        )}
      </Modal>

      <Modal open={showPkgCatModal} onClose={() => setShowPkgCatModal(false)} title="Crear categoría de paquete">
        <CreateCategoryForm onCreate={(name) => { if (!pkgCategories.includes(name)) setPkgCategories(s => [name, ...s]); setShowPkgCatModal(false) }} onCancel={() => setShowPkgCatModal(false)} />
      </Modal>

      <Modal open={showVehCatModal} onClose={() => setShowVehCatModal(false)} title="Crear categoría de vehículo">
        <CreateCategoryForm onCreate={(name) => { if (!vehCategories.includes(name)) setVehCategories(s => [name, ...s]); setShowVehCatModal(false) }} onCancel={() => setShowVehCatModal(false)} />
      </Modal>

      <Modal open={showHeroModal} onClose={() => setShowHeroModal(false)} title={editingHero ? 'Editar slide del hero' : 'Crear slide del hero'}>
        {editingHero && (
          <AdminHeroSlideForm slide={editingHero} onCancel={() => { setShowHeroModal(false); setEditingHero(null) }} onSave={onSaveHero} uploadImage={uploadImage} />
        )}
      </Modal>
      </div>
    </div>
  )
}

function AdminEventForm(
  { ev, onCancel, onSave, uploadImage }: { ev: CalendarSlotView; onCancel: () => void; onSave: (e: CalendarSlotView) => void; uploadImage: (file: File) => Promise<string> }
) {
  const [state, setState] = useState<CalendarSlotView>({
    ...ev,
    title: ev.title || '',
    date: ev.date || '',
    status: ev.status || 'evento',
    detail: ev.detail || '',
    tag: ev.tag || '',
    imageUrl: ev.imageUrl || '',
    id: ev.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync form when switching between events
  useEffect(() => {
    setState(ev)
    setErrors({})
  }, [ev.id, ev])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((s: CalendarSlotView) => ({ ...s, [name]: value } as CalendarSlotView))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState((s: CalendarSlotView) => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.title.trim()) newErrors.title = 'El título es requerido'
    if (!state.date.trim()) newErrors.date = 'La fecha es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSave(state)
  }

  return (
    <form className="grid gap-5 p-2" onSubmit={handleSubmit}>
      <InputField
        label="Título"
        required
        name="title"
        value={state.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Evento especial"
      />
      <InputField
        label="Fecha"
        required
        type="date"
        name="date"
        value={state.date}
        onChange={handleChange}
        error={errors.date}
      />
      <InputField
        label="Tag"
        name="tag"
        value={state.tag ?? ''}
        onChange={handleChange}
        placeholder="Ej: especial, promoción"
      />
      <TextareaField
        label="Detalle"
        name="detail"
        value={state.detail ?? ''}
        onChange={handleChange}
        placeholder="Descripción del evento"
      />
      <ImageUpload
        label="Cargar imagen"
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AdminPackageForm({ pkg, categories = [], vehiclesList = [], onCancel, onSave, uploadImage }: { pkg: Package; categories?: string[]; vehiclesList?: Vehicle[]; onCancel: () => void; onSave: (p: Package) => void; uploadImage: (file: File) => Promise<string> }) {
  const [name, setName] = useState(pkg.name || '')
  const [category, setCategory] = useState(pkg.category || '')
  const [description, setDescription] = useState(pkg.description || '')
  const [price, setPrice] = useState(pkg.price?.toString() || '')
  const [maxPeople, setMaxPeople] = useState(pkg.maxPeople?.toString() || '')
  const [imageUrl, setImageUrl] = useState(pkg.imageUrl || '')
  const [includesText, setIncludesText] = useState(pkg.includes?.join(', ') || '')
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(pkg.vehicleIds || pkg.vehicles?.map((v) => v.id) || [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync when pkg changes (for edit mode)
  useEffect(() => {
    setName(pkg.name || '')
    setCategory(pkg.category || '')
    setDescription(pkg.description || '')
    setPrice(pkg.price?.toString() || '')
    setMaxPeople(pkg.maxPeople?.toString() || '')
    setImageUrl(pkg.imageUrl || '')
    setIncludesText(pkg.includes?.join(', ') || '')
    setSelectedVehicleIds(pkg.vehicleIds || pkg.vehicles?.map((v) => v.id) || [])
    setErrors({})
  }, [pkg.id])

  const allCategories = Array.from(new Set([...categories, category].filter(Boolean)))

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    if (!category.trim()) newErrors.category = 'La categoría es requerida'
    const priceNum = Number(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) newErrors.price = 'El precio debe ser mayor a 0'
    const maxPeopleNum = Number(maxPeople)
    if (!maxPeople || isNaN(maxPeopleNum) || maxPeopleNum < 1) newErrors.maxPeople = 'Capacidad mínima 1'
    if (!imageUrl) newErrors.imageUrl = 'La imagen es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const includesArray = includesText.split(',').map((x) => x.trim()).filter(Boolean)

    onSave({
      id: pkg.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      maxPeople: Number(maxPeople),
      imageUrl,
      includes: includesArray,
      vehicle: pkg.vehicle || '',
      vehicleIds: selectedVehicleIds,
      vehicles: pkg.vehicles || [],
    })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
        }}
        error={errors.name}
        placeholder="Ej: Tour privado de 8 horas"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-white">
          <span>Categoría <span className="text-red-400">*</span></span>
          <select
            name="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
            required
          >
            <option value="">Selecciona una categoría</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <span className="text-xs text-red-400">{errors.category}</span>}
        </label>
        <InputField
          label="Precio"
          required
          type="text"
          inputMode="decimal"
          name="price"
          value={price}
          onChange={(e) => {
            const val = e.target.value
            if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
              setPrice(val)
              if (errors.price) setErrors((prev) => ({ ...prev, price: '' }))
            }
          }}
          error={errors.price}
          placeholder="0.00"
        />
        <InputField
          label="Capacidad (personas)"
          required
          type="text"
          inputMode="numeric"
          name="maxPeople"
          value={maxPeople}
          onChange={(e) => {
            const val = e.target.value
            if (/^\d*$/.test(val)) {
              setMaxPeople(val)
              if (errors.maxPeople) setErrors((prev) => ({ ...prev, maxPeople: '' }))
            }
          }}
          error={errors.maxPeople}
        />
      </div>
      <TextareaField
        label="Incluye (separado por comas)"
        name="includes"
        value={includesText}
        onChange={(e) => setIncludesText(e.target.value)}
        placeholder="Chofer profesional, Botella de vino, Decoración"
      />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">Vehículos asignados</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
          {vehiclesList.map((v) => (
            <label key={v.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10">
              <input
                type="checkbox"
                checked={selectedVehicleIds.includes(v.id)}
                onChange={() => toggleVehicle(v.id)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-300 focus:ring-amber-300/60"
              />
              <div className="space-y-1">
                <p className="text-sm text-white font-semibold">{v.name}</p>
                <p className="text-xs text-gray-300">{v.seats} asientos · {v.rate || 'Tarifa variable'}</p>
                <p className="text-xs text-gray-400">{v.category}</p>
              </div>
            </label>
          ))}
          {vehiclesList.length === 0 && <p className="text-sm text-gray-400">No hay vehículos cargados.</p>}
        </div>
      </div>
      <TextareaField
        label="Descripción"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción detallada del paquete"
      />
      <ImageUpload
        label="Cargar imagen del paquete"
        required
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url)
          if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: '' }))
        }}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AdminVehicleForm({ vehicle, categories = [], onCancel, onSave, uploadImage }: { vehicle: Vehicle; categories?: string[]; onCancel: () => void; onSave: (v: Vehicle) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<Vehicle>({
    ...vehicle,
    name: vehicle.name || '',
    category: vehicle.category || '',
    seats: vehicle.seats ?? 1,
    rate: vehicle.rate || '',
    features: vehicle.features || [],
    imageUrl: vehicle.imageUrl || '',
    id: vehicle.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (name === 'features') {
      setState((s) => ({ ...s, features: value.split(',').map((x) => x.trim()) }))
      if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
      return
    }

    if (type === 'number' && name === 'seats') {
      if (/^\d*$/.test(value)) {
        setState((s) => ({ ...s, seats: value } as any))
      }
    } else {
      setState((s) => ({ ...s, [name]: value } as any))
    }
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!state.category.trim()) newErrors.category = 'La categoría es requerida'
    const seatsValue = typeof state.seats === 'string' ? Number(state.seats) : state.seats
    if (!Number.isFinite(seatsValue) || seatsValue < 1) newErrors.seats = 'Mínimo 1 asiento'
    const rateStr = typeof state.rate === 'string' ? state.rate : String(state.rate || '')
    if (!rateStr.trim()) newErrors.rate = 'La tarifa es requerida'
    if (!state.imageUrl) newErrors.imageUrl = 'La imagen es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const seatsValue = typeof state.seats === 'string' ? Number(state.seats) : state.seats
    onSave({ ...state, seats: seatsValue })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={state.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Camioneta Escalade"
      />
      <div className="admin-form__group-row">
        <InputField
          label="Categoría"
          required
          name="category"
          value={state.category}
          onChange={handleChange}
          error={errors.category}
          placeholder="Nueva o existente"
          list="veh-cats"
        />
        <InputField
          label="Asientos"
          required
          type="number"
          name="seats"
          value={state.seats}
          onChange={handleChange}
          error={errors.seats}
          min="1"
        />
      </div>
      <datalist id="veh-cats">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>
      <InputField
        label="Tarifa"
        required
        name="rate"
        value={state.rate}
        onChange={handleChange}
        error={errors.rate}
        placeholder="Ej: $150/hora"
      />
      <TextareaField
        label="Características (separadas por comas)"
        name="features"
        value={state.features.join(', ')}
        onChange={handleChange}
        placeholder="Aire acondicionado, WiFi, Mini bar"
      />
      <ImageUpload
        label="Cargar imagen del vehículo"
        required
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function CreateCategoryForm({ onCreate, onCancel }: { onCreate: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la categoría es requerido')
      return
    }
    onCreate(name.trim())
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre de categoría"
        required
        value={name}
        onChange={handleChange}
        error={error}
        placeholder="Ej: Tours Privados"
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Crear
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AdminImageForm({ img, onCancel, onSave, uploadImage }: { img: SystemImage; onCancel: () => void; onSave: (img: SystemImage) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<SystemImage>({
    ...img,
    name: img.name || '',
    description: img.description || '',
    url: img.url || '',
    altText: img.altText || '',
    order: img.order ?? 0,
    isActive: img.isActive ?? true,
    id: img.id || '',
    category: img.category || 'GALERIA',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'order' ? value : value
    }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, url }))
    if (errors.url) setErrors(e => ({ ...e, url: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!state.url) newErrors.url = 'La imagen es requerida'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    // Siempre guardar como imagen de galería
    const orderValue = typeof state.order === 'string' ? Number(state.order) : state.order
    const normalizedOrder = Number.isFinite(orderValue) ? Number(orderValue) : 0
    const imgToSave = { ...state, order: normalizedOrder, categoria: 'GALERIA' }
    await createImageRecord({ categoria: 'GALERIA', url: imgToSave.url, altText: imgToSave.name })
    onSave(imgToSave)
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={state.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Galería inicio"
      />
      <TextareaField
        label="Descripción"
        name="description"
        value={state.description ?? ''}
        onChange={handleChange}
        placeholder="Descripción opcional"
      />
      <ImageUpload
        label="Cargar imagen"
        required
        value={state.url}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.url}
      />
      <InputField
        label="Texto alternativo"
        name="altText"
        value={state.altText ?? ''}
        onChange={handleChange}
        placeholder="Descripción para accesibilidad"
      />
      <InputField
        label="Orden"
        type="number"
        name="order"
        value={state.order}
        onChange={handleChange}
        min="0"
      />
      <CheckboxField
        label="Mostrar en galería"
        name="isActive"
        checked={state.isActive}
        onChange={handleChange}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AdminHeroSlideForm({ slide, onCancel, onSave, uploadImage }: { slide: HeroSlide; onCancel: () => void; onSave: (slide: HeroSlide) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<HeroSlide>({
    ...slide,
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    description: slide.description || '',
    imageUrl: slide.imageUrl || '',
    order: Number(slide.order ?? 0),
    isActive: slide.isActive ?? true,
    id: slide.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'order'
          ? Number(value)
          : value
    }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.title.trim()) newErrors.title = 'El título es requerido'
    if (!(state.subtitle ?? '').trim()) newErrors.subtitle = 'El subtítulo es requerido'
    if (!(state.description ?? '').trim()) newErrors.description = 'La descripción es requerida'
    if (!state.imageUrl) newErrors.imageUrl = 'La imagen es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const orderValue = typeof state.order === 'string' ? Number(state.order) : state.order
    const normalizedOrder = Number.isFinite(orderValue) ? Number(orderValue) : 0
    onSave({ ...state, order: normalizedOrder })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Título"
        required
        name="title"
        value={state.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Descubre Momentos"
      />
      <InputField
        label="Subtítulo"
        required
        name="subtitle"
        value={state.subtitle}
        onChange={handleChange}
        error={errors.subtitle}
        placeholder="Ej: Experiencias inolvidables"
      />
      <TextareaField
        label="Descripción"
        required
        name="description"
        value={state.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Descripción del slide"
      />
      <ImageUpload
        label="Cargar imagen del slide"
        required
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="admin-form__group-row">
        <InputField
          label="Orden"
          type="number"
          name="order"
          value={state.order}
          onChange={handleChange}
          min="1"
        />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <CheckboxField
            label="Slide activo"
            name="isActive"
            checked={state.isActive}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="admin-form__actions">
        <Button variant="primary" type="submit" className="admin-form__actions-primary">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="admin-form__actions-secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default Admin
