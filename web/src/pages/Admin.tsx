import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { InputField, TextareaField, CheckboxField } from '../components/FormField'
import ImageUpload from '../components/ImageUpload'
import { fetchPackages, fetchVehicles, fetchCalendar, createPackage, updatePackage, deletePackage, createVehicle, updateVehicle, deleteVehicle, uploadImage, fetchNotifications, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchExperiences, createExperience, updateExperience, deleteExperience, fetchSystemImages, createSystemImage, updateSystemImage, deleteSystemImage, fetchHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, createImageRecord, attachImageToPackage, attachImageToVehicle, attachImageToEvent } from '../api/api'
import { useCalendarContext } from '../contexts/CalendarContext'
import type { Package, Vehicle, CalendarSlot, Experience, SystemImage, HeroSlide } from '../data/content'

const Admin = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [systemImages, setSystemImages] = useState<SystemImage[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [pkgCategories, setPkgCategories] = useState<string[]>([])
  const [vehCategories, setVehCategories] = useState<string[]>([])
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
  const [editingEvent, setEditingEvent] = useState<CalendarSlot | null>(null)
  const [editingImage, setEditingImage] = useState<SystemImage | null>(null)
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null)
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [showVehModal, setShowVehModal] = useState(false)

  const iconButtonClasses = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'

  useEffect(() => {
    let mounted = true
    Promise.all([fetchPackages(), fetchVehicles(), fetchNotifications(), fetchExperiences(), fetchSystemImages(), fetchHeroSlides()]).then(([p, v, n, e, img, h]) => {
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

  const onCreatePackage = () => {
    setEditingPackage({ id: '', category: '', name: '', description: '', price: 0, vehicle: '', maxPeople: 1, includes: [], imageUrl: '' })
    setShowPkgModal(true)
  }

  const onEditPackage = (pkg: Package) => { setEditingPackage(pkg); setShowPkgModal(true) }

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

  const onEditEvent = (ev: CalendarSlot) => { setEditingEvent(ev); setShowEventModal(true) }

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

  const onSaveEvent = async (ev: CalendarSlot) => {
    const eventData: CalendarSlot = { ...ev, status: 'evento' }
    try {
      if (!ev.id) {
        // 1. Create event without image URL
        const evPayload = { ...eventData, imageUrl: '' }
        console.log('[ADMIN] Creating event with payload:', evPayload)
        const created = await createCalendarEvent(evPayload)
        console.log('[ADMIN] Event created from server:', created)
        console.log('[ADMIN] Event status:', created.status)
        console.log('[ADMIN] Calling addEvent with:', created)
        
        // 2. If image exists, persist it
        if (eventData.imageUrl) {
          const img = await createImageRecord({ categoria: 'EVENTO', url: eventData.imageUrl, altText: created.title })
          await attachImageToEvent(img.id, created.id, 0)
          created.imageUrl = eventData.imageUrl
        }
        addEvent(created)
        console.log('[ADMIN] addEvent called successfully')
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
        const created = await createHeroSlide(slidePayload)
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
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${slide.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
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
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-amber-500/15 text-amber-200">{e.status}</span>
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

          <section className="section" id="admin-packages">
            <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Paquetes</h2>
              </div>
              <div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={onCreatePackage}>Nuevo paquete</Button>
                  <Button variant="ghost" onClick={() => setShowPkgCatModal(true)}>Nueva categoría</Button>
                </div>
              </div>
            </div>

            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[var(--card-bg,#11131a)] shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
              <div className="hidden md:grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-white/10 to-transparent border-b border-[rgba(201,162,77,0.2)] font-semibold text-sm uppercase tracking-wide text-gray-200">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Vehículo</span>
                <span>Acciones</span>
              </div>
              {packages.map((p) => (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Nombre</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Categoría</span>
                    <span>{p.category}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Precio</span>
                    <span className="font-semibold">${p.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="md:hidden text-xs text-gray-400">Vehículo</span>
                    <span>{p.vehicle}</span>
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
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Vehículos</h2>
              </div>
              <div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={onCreateVehicle}>Nuevo vehículo</Button>
                  <Button variant="ghost" onClick={() => setShowVehCatModal(true)}>Nueva categoría</Button>
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
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${img.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
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
          <AdminPackageForm pkg={editingPackage} categories={pkgCategories} onCancel={() => { setShowPkgModal(false); setEditingPackage(null) }} onSave={onSavePackage} uploadImage={uploadImage} />
        )}
      </Modal>

      <Modal open={showVehModal} onClose={() => setShowVehModal(false)} title={editingVehicle ? 'Editar vehículo' : 'Crear vehículo'}>
        {editingVehicle && (
          <AdminVehicleForm vehicle={editingVehicle} categories={vehCategories} onCancel={() => { setShowVehModal(false); setEditingVehicle(null) }} onSave={onSaveVehicle} uploadImage={uploadImage} />
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

;

function AdminEventForm(
  { ev, onCancel, onSave, uploadImage }: { ev: CalendarSlot; onCancel: () => void; onSave: (e: CalendarSlot) => void; uploadImage: (file: File) => Promise<string> }
) {
  const [state, setState] = useState<CalendarSlot>(ev)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync form when switching between events
  useEffect(() => {
    setState(ev)
    setErrors({})
  }, [ev.id, ev])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((s) => ({ ...s, [name]: value } as CalendarSlot))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState((s) => ({ ...s, imageUrl: url }))
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

function AdminPackageForm({ pkg, categories = [], onCancel, onSave, uploadImage }: { pkg: Package; categories?: string[]; onCancel: () => void; onSave: (p: Package) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<Package>(pkg)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setState(s => ({ ...s, [name]: type === 'number' ? Number(value) : value } as any))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!state.category.trim()) newErrors.category = 'La categoría es requerida'
    if (state.price <= 0) newErrors.price = 'El precio debe ser mayor a 0'
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
    onSave(state)
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
        placeholder="Ej: Tour privado de 8 horas"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Categoría"
          required
          name="category"
          value={state.category}
          onChange={handleChange}
          error={errors.category}
          placeholder="Nueva o existente"
          list="pkg-cats"
        />
        <InputField
          label="Precio"
          required
          type="number"
          name="price"
          value={state.price}
          onChange={handleChange}
          error={errors.price}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>
      <datalist id="pkg-cats">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>
      <InputField
        label="Vehículo"
        name="vehicle"
        value={state.vehicle}
        onChange={handleChange}
        placeholder="Ej: Camioneta"
      />
      <TextareaField
        label="Descripción"
        name="description"
        value={state.description}
        onChange={handleChange}
        placeholder="Descripción detallada del paquete"
      />
      <ImageUpload
        label="Cargar imagen del paquete"
        required
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
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

function AdminVehicleForm({ vehicle, categories = [], onCancel, onSave, uploadImage }: { vehicle: Vehicle; categories?: string[]; onCancel: () => void; onSave: (v: Vehicle) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<Vehicle>(vehicle)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: name === 'seats' && type === 'number' ? Number(value) : name === 'features' ? value.split(',').map(x => x.trim()) : value
    } as any))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!state.category.trim()) newErrors.category = 'La categoría es requerida'
    if (state.seats < 1) newErrors.seats = 'Mínimo 1 asiento'
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
    onSave(state)
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
      <div className="admin-form__actions">
        <Button variant="primary" type="submit" className="admin-form__actions-primary">
          Crear
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="admin-form__actions-secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AdminImageForm({ img, onCancel, onSave, uploadImage }: { img: SystemImage; onCancel: () => void; onSave: (img: SystemImage) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<SystemImage>(img)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'order' ? Number(value) : value
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
    const imgToSave = { ...state, categoria: 'GALERIA' }
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

function AdminHeroSlideForm({ slide, onCancel, onSave, uploadImage }: { slide: HeroSlide; onCancel: () => void; onSave: (slide: HeroSlide) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<HeroSlide>(slide)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'order' ? Number(value) : value
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
    onSave(state)
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
