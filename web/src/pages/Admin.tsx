import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../components/Button'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { fetchPackages, fetchVehicles, fetchCalendar, createPackage, updatePackage, deletePackage, createVehicle, updateVehicle, deleteVehicle, uploadImage, fetchNotifications, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, fetchExperiences, createExperience, updateExperience, deleteExperience, fetchSystemImages, createSystemImage, updateSystemImage, deleteSystemImage, fetchHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '../api/mocks'
import type { Package, Vehicle, CalendarSlot, Experience, SystemImage, HeroSlide } from '../data/content'

const Admin = () => {
  const [packages, setPackages] = useState<Package[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [systemImages, setSystemImages] = useState<SystemImage[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [pkgCategories, setPkgCategories] = useState<string[]>([])
  const [vehCategories, setVehCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [events, setEvents] = useState<CalendarSlot[]>([])

  const [showPkgCatModal, setShowPkgCatModal] = useState(false)
  const [showVehCatModal, setShowVehCatModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  const [showHeroModal, setShowHeroModal] = useState(false)

  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarSlot | null>(null)
  const [editingExp, setEditingExp] = useState<Experience | null>(null)
  const [editingImage, setEditingImage] = useState<SystemImage | null>(null)
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null)
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [showVehModal, setShowVehModal] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchPackages(), fetchVehicles(), fetchCalendar(), fetchNotifications(), fetchExperiences(), fetchSystemImages(), fetchHeroSlides()]).then(([p, v, c, n, e, img, h]) => {
      if (!mounted) return
      setPackages(p)
      setVehicles(v)
      setExperiences(e)
      setSystemImages(img)
      setHeroSlides(h)
      setEvents(c)
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
    if (!pkg.id) {
      const created = await createPackage(pkg)
      setPackages((s) => [created, ...s])
    } else {
      await updatePackage(pkg.id, pkg)
      setPackages((s) => s.map((x) => (x.id === pkg.id ? pkg : x)))
    }
    setShowPkgModal(false)
    setEditingPackage(null)
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
    if (!v.id) {
      const created = await createVehicle(v)
      setVehicles((s) => [created, ...s])
    } else {
      await updateVehicle(v.id, v)
      setVehicles((s) => s.map((x) => (x.id === v.id ? v : x)))
    }
    setShowVehModal(false)
    setEditingVehicle(null)
  }

  const onCreateEvent = () => {
    setEditingEvent({ id: '', date: '', status: 'evento', title: '', detail: '', tag: '', imageUrl: '' })
    setShowEventModal(true)
  }

  const onEditEvent = (ev: CalendarSlot) => { setEditingEvent(ev); setShowEventModal(true) }

  const onDeleteEvent = async (id: string) => {
    if (!confirm('Eliminar evento?')) return
    await deleteCalendarEvent(id)
    setEvents((s) => s.filter((x) => x.id !== id))
  }

  const onSaveEvent = async (ev: CalendarSlot) => {
    if (!ev.id) {
      const created = await createCalendarEvent(ev)
      setEvents((s) => [created, ...s])
    } else {
      await updateCalendarEvent(ev.id, ev)
      setEvents((s) => s.map((x) => (x.id === ev.id ? ev : x)))
    }
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const onCreateExp = () => {
    setEditingExp({ id: '', title: '', imageUrl: '' })
    setShowExpModal(true)
  }

  const onEditExp = (exp: Experience) => { setEditingExp(exp); setShowExpModal(true) }

  const onDeleteExp = async (id: string) => {
    if (!confirm('Eliminar experiencia?')) return
    await deleteExperience(id)
    setExperiences((s) => s.filter((x) => x.id !== id))
  }

  const onSaveExp = async (exp: Experience) => {
    if (!exp.id) {
      const created = await createExperience(exp)
      setExperiences((s) => [created, ...s])
    } else {
      await updateExperience(exp.id, exp)
      setExperiences((s) => s.map((x) => (x.id === exp.id ? exp : x)))
    }
    setShowExpModal(false)
    setEditingExp(null)
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
    setHeroSlides((s) => s.filter((x) => x.id !== id))
  }

  const onSaveHero = async (slide: HeroSlide) => {
    if (!slide.id) {
      const created = await createHeroSlide(slide)
      setHeroSlides((s) => [created, ...s])
    } else {
      await updateHeroSlide(slide.id, slide)
      setHeroSlides((s) => s.map((x) => (x.id === slide.id ? slide : x)))
    }
    setShowHeroModal(false)
    setEditingHero(null)
  }

  if (loading) return <div className="page"><p>Cargando administrador...</p></div>

  return (
    <div className="page admin-page">
      <header className="section">
        <p className="eyebrow">Admin</p>
        <h1 className="display">Panel administrativo (mock)</h1>
        <p className="section__copy">Crea, edita o elimina paquetes y vehículos. Las acciones afectan datos en memoria (mocks).</p>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__title">Secciones</p>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-hero')?.scrollIntoView({ behavior: 'smooth' })}>Hero Carousel</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-events')?.scrollIntoView({ behavior: 'smooth' })}>Eventos</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-packages')?.scrollIntoView({ behavior: 'smooth' })}>Paquetes</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-vehicles')?.scrollIntoView({ behavior: 'smooth' })}>Vehículos</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-experiences')?.scrollIntoView({ behavior: 'smooth' })}>Experiencias</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-images')?.scrollIntoView({ behavior: 'smooth' })}>Imágenes del Sistema</button>
          <button className="admin-sidebar__link" onClick={() => document.getElementById('admin-notifications')?.scrollIntoView({ behavior: 'smooth' })}>Notificaciones</button>
        </aside>

        <div className="admin-main">
          <section className="section" id="admin-hero">
            <div className="section__header">
              <div>
                <p className="eyebrow">Landing</p>
                <h2 className="section__title">Hero Carousel</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreateHero}>Nuevo slide</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Título</span>
                <span>Orden</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {heroSlides.map((slide) => (
                <div key={slide.id} className="admin-table__row">
                  <span>{slide.title}</span>
                  <span>{slide.order}</span>
                  <span>{slide.isActive ? '✓ Activo' : '✗ Inactivo'}</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${slide.title}`} onClick={() => onEditHero(slide)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${slide.title}`} onClick={() => onDeleteHero(slide.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-events">
            <div className="section__header">
              <div>
                <p className="eyebrow">Calendario</p>
                <h2 className="section__title">Eventos</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreateEvent}>Nuevo evento</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Fecha</span>
                <span>Título</span>
                <span>Tag</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {events.map((e) => (
                <div key={e.id} className="admin-table__row">
                  <span>{e.date}</span>
                  <span>{e.title}</span>
                  <span>{e.tag || '-'}</span>
                  <span>{e.status}</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${e.title}`} onClick={() => onEditEvent(e)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${e.title}`} onClick={() => onDeleteEvent(e.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-packages">
            <div className="section__header">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Paquetes</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreatePackage}>Nuevo paquete</Button>
                <Button variant="ghost" onClick={() => setShowPkgCatModal(true)} className="ml-sm">Nueva categoría</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Precio</span>
                <span>Vehículo</span>
                <span>Acciones</span>
              </div>
              {packages.map((p) => (
                <div key={p.id} className="admin-table__row">
                  <span>{p.name}</span>
                  <span>{p.category}</span>
                  <span>${p.price}</span>
                  <span>{p.vehicle}</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${p.name}`} onClick={() => onEditPackage(p)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${p.name}`} onClick={() => onDeletePackage(p.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-vehicles">
            <div className="section__header">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Vehículos</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreateVehicle}>Nuevo vehículo</Button>
                <Button variant="ghost" onClick={() => setShowVehCatModal(true)} className="ml-sm">Nueva categoría</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Nombre</span>
                <span>Categoría</span>
                <span>Tarifa</span>
                <span>Asientos</span>
                <span>Acciones</span>
              </div>
              {vehicles.map((v) => (
                <div key={v.id} className="admin-table__row">
                  <span>{v.name}</span>
                  <span>{v.category}</span>
                  <span>{v.rate}</span>
                  <span>{v.seats}</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${v.name}`} onClick={() => onEditVehicle(v)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${v.name}`} onClick={() => onDeleteVehicle(v.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-experiences">
            <div className="section__header">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Experiencias</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreateExp}>Nueva experiencia</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Título</span>
                <span>Imagen URL</span>
                <span>Acciones</span>
              </div>
              {experiences.map((exp) => (
                <div key={exp.id} className="admin-table__row">
                  <span>{exp.title}</span>
                  <span className="text-sm text-muted">{exp.imageUrl.substring(0, 40)}...</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${exp.title}`} onClick={() => onEditExp(exp)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${exp.title}`} onClick={() => onDeleteExp(exp.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-images">
            <div className="section__header">
              <div>
                <p className="eyebrow">Contenido</p>
                <h2 className="section__title">Galería y Experiencias</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={onCreateImage}>Nueva imagen</Button>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-table__head">
                <span>Nombre</span>
                <span>Orden</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {systemImages.map((img) => (
                <div key={img.id} className="admin-table__row">
                  <span>{img.name}</span>
                  <span>{img.order}</span>
                  <span>{img.isActive ? '✓ Activa' : '✗ Inactiva'}</span>
                  <span className="admin-table__actions">
                    <button className="btn btn-ghost btn-sm" aria-label={`Editar ${img.name}`} onClick={() => onEditImage(img)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Eliminar ${img.name}`} onClick={() => onDeleteImage(img.id)}>
                      <FaTrash size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="admin-notifications">
            <div className="section__header">
              <div>
                <p className="eyebrow">Sistema</p>
                <h2 className="section__title">Notificaciones</h2>
              </div>
              <div>
                <Button variant="ghost" onClick={async () => setNotifications(await fetchNotifications())}>Refrescar</Button>
              </div>
            </div>

            <div className="grid one">
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

      <Modal open={showEventModal} onClose={() => setShowEventModal(false)} title={editingEvent ? 'Editar evento' : 'Crear evento'}>
        {editingEvent && (
          <AdminEventForm ev={editingEvent} onCancel={() => { setShowEventModal(false); setEditingEvent(null) }} onSave={onSaveEvent} uploadImage={uploadImage} />
        )}
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

      <Modal open={showExpModal} onClose={() => setShowExpModal(false)} title={editingExp ? 'Editar experiencia' : 'Crear experiencia'}>
        {editingExp && (
          <AdminExperienceForm exp={editingExp} onCancel={() => { setShowExpModal(false); setEditingExp(null) }} onSave={onSaveExp} uploadImage={uploadImage} />
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
  )
}

function AdminEventForm({ ev, onCancel, onSave, uploadImage }: { ev: CalendarSlot; onCancel: () => void; onSave: (e: CalendarSlot) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<CalendarSlot>(ev)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setState(s => ({ ...s, [e.target.name]: e.target.value } as any))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, imageUrl: url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(evForm) => { evForm.preventDefault(); onSave(state) }}>
      <label className="form__label">Título<input name="title" value={state.title} onChange={handleChange} /></label>
      <label className="form__label">Fecha<input name="date" type="date" value={state.date} onChange={handleChange} /></label>
      <label className="form__label">Estado
        <select name="status" value={state.status} onChange={handleChange}>
          <option value="evento">Evento</option>
          <option value="disponible">Disponible</option>
          <option value="ocupado">Ocupado</option>
        </select>
      </label>
      <label className="form__label">Tag<input name="tag" value={state.tag ?? ''} onChange={handleChange} /></label>
      <label className="form__label">Detalle<textarea name="detail" value={state.detail ?? ''} onChange={handleChange} /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminPackageForm({ pkg, categories = [], onCancel, onSave, uploadImage }: { pkg: Package; categories?: string[]; onCancel: () => void; onSave: (p: Package) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<Package>(pkg)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState(s => ({ ...s, [e.target.name]: e.target.value } as any))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, imageUrl: url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(ev) => { ev.preventDefault(); onSave(state) }}>
      <label className="form__label">Nombre<input name="name" value={state.name} onChange={handleChange} /></label>
      <label className="form__label">Categoría
        <input name="category" list="pkg-cats" value={state.category} onChange={handleChange} />
        <datalist id="pkg-cats">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label className="form__label">Precio<input name="price" value={String(state.price)} onChange={(e) => setState(s => ({ ...s, price: Number(e.target.value) }))} /></label>
      <label className="form__label">Vehículo<input name="vehicle" value={state.vehicle} onChange={handleChange} /></label>
      <label className="form__label">Descripción<textarea name="description" value={state.description} onChange={handleChange} /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminVehicleForm({ vehicle, categories = [], onCancel, onSave, uploadImage }: { vehicle: Vehicle; categories?: string[]; onCancel: () => void; onSave: (v: Vehicle) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<Vehicle>(vehicle)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState(s => ({ ...s, [e.target.name]: e.target.value } as any))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, imageUrl: url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(ev) => { ev.preventDefault(); onSave(state) }}>
      <label className="form__label">Nombre<input name="name" value={state.name} onChange={handleChange} /></label>
      <label className="form__label">Categoría
        <input name="category" list="veh-cats" value={state.category} onChange={handleChange} />
        <datalist id="veh-cats">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
      <label className="form__label">Asientos<input name="seats" value={String(state.seats)} onChange={(e) => setState(s => ({ ...s, seats: Number(e.target.value) }))} /></label>
      <label className="form__label">Tarifa<input name="rate" value={state.rate} onChange={handleChange} /></label>
      <label className="form__label">Características<textarea name="features" value={state.features.join(', ')} onChange={(e) => setState(s => ({ ...s, features: e.target.value.split(',').map(x => x.trim()) }))} /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function CreateCategoryForm({ onCreate, onCancel }: { onCreate: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (name.trim()) onCreate(name.trim()) }}>
      <label className="form__label">Nombre de categoría<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Crear</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminExperienceForm({ exp, onCancel, onSave, uploadImage }: { exp: Experience; onCancel: () => void; onSave: (e: Experience) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<Experience>(exp)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState(s => ({ ...s, [e.target.name]: e.target.value }))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, imageUrl: url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(evForm) => { evForm.preventDefault(); onSave(state) }}>
      <label className="form__label">Título<input name="title" value={state.title} onChange={handleChange} /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminImageForm({ img, onCancel, onSave, uploadImage }: { img: SystemImage; onCancel: () => void; onSave: (img: SystemImage) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<SystemImage>(img)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setState(s => ({ ...s, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'order') {
      setState(s => ({ ...s, order: Number(value) }))
    } else {
      setState(s => ({ ...s, [name]: value }))
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(evForm) => { evForm.preventDefault(); onSave(state) }}>
      <label className="form__label">Nombre<input name="name" value={state.name} onChange={handleChange} required /></label>
      <label className="form__label">Descripción<textarea name="description" value={state.description ?? ''} onChange={handleChange} /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} required /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <label className="form__label">Texto alternativo<input name="altText" value={state.altText ?? ''} onChange={handleChange} placeholder="Descripción de la imagen" /></label>
      <label className="form__label">Orden<input name="order" type="number" value={state.order} onChange={handleChange} /></label>
      <label className="form__label form__label--checkbox">
        <input name="isActive" type="checkbox" checked={state.isActive} onChange={handleChange} />
        <span>Mostrar en galería</span>
      </label>
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

function AdminHeroSlideForm({ slide, onCancel, onSave, uploadImage }: { slide: HeroSlide; onCancel: () => void; onSave: (slide: HeroSlide) => void; uploadImage: (f: string) => Promise<string> }) {
  const [state, setState] = useState<HeroSlide>(slide)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setState(s => ({ ...s, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'order') {
      setState(s => ({ ...s, order: Number(value) }))
    } else {
      setState(s => ({ ...s, [name]: value }))
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file.name)
    setState(s => ({ ...s, imageUrl: url }))
    setUploading(false)
  }

  return (
    <form className="form" onSubmit={(evForm) => { evForm.preventDefault(); onSave(state) }}>
      <label className="form__label">Título<input name="title" value={state.title} onChange={handleChange} required /></label>
      <label className="form__label">Subtítulo<input name="subtitle" value={state.subtitle} onChange={handleChange} required /></label>
      <label className="form__label">Descripción<textarea name="description" value={state.description} onChange={handleChange} required /></label>
      <label className="form__label">Cargar imagen<input type="file" onChange={handleUpload} required /></label>
      {uploading && <div>Subiendo imagen...</div>}
      <label className="form__label">Orden<input name="order" type="number" value={state.order} onChange={handleChange} required /></label>
      <label className="form__label form__label--checkbox">
        <input name="isActive" type="checkbox" checked={state.isActive} onChange={handleChange} />
        <span>Slide activo</span>
      </label>
      <div className="stack mt-md">
        <Button variant="primary" type="submit">Guardar</Button>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}

export default Admin
