import { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { AdminHeroSlideForm, AdminImageForm } from '../../components/admin/AdminForms'
import { useTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/themeClasses'
import { fetchSystemImages, createSystemImage, updateSystemImage, deleteSystemImage, fetchHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadImage } from '../../api/api'
import type { SystemImage, HeroSlide } from '../../data/content'

const AdminSistema = () => {
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)
  const [systemImages, setSystemImages] = useState<SystemImage[]>([])
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; type: 'image' | 'hero' }>({ open: false, id: '', type: 'image' })
  const [isDeleting, setIsDeleting] = useState(false)

  const [showImgModal, setShowImgModal] = useState(false)
  const [showHeroModal, setShowHeroModal] = useState(false)
  const [editingImage, setEditingImage] = useState<SystemImage | null>(null)
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null)

  const iconButtonClasses = theme === 'dark'
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-700 transition hover:border-gray-400 hover:bg-gray-300'

  useEffect(() => {
    let mounted = true
    Promise.all([fetchSystemImages(), fetchHeroSlides()]).then(([img, h]) => {
      if (!mounted) return
      setSystemImages(img)
      setHeroSlides(h)
      setLoading(false)
    }).catch(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const onCreateImage = () => {
    setEditingImage({ id: '', category: 'LANDING_PAGE', name: '', description: '', url: '', altText: '', order: 0, isActive: true })
    setShowImgModal(true)
  }

  const onEditImage = (img: SystemImage) => { setEditingImage(img); setShowImgModal(true) }

  const onDeleteImage = (id: string) => {
    setConfirmDelete({ open: true, id, type: 'image' })
  }

  const handleConfirmDeleteImage = async () => {
    setIsDeleting(true)
    try {
      await deleteSystemImage(confirmDelete.id)
      setSystemImages((s) => s.filter((x) => x.id !== confirmDelete.id))
      setConfirmDelete({ open: false, id: '', type: 'image' })
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      setConfirmDelete({ open: false, id: '', type: 'image' })
    } finally {
      setIsDeleting(false)
    }
  }

  const onDeleteHero = (id: string) => {
    setConfirmDelete({ open: true, id, type: 'hero' })
  }

  const handleConfirmDeleteHero = async () => {
    setIsDeleting(true)
    try {
      await deleteHeroSlide(confirmDelete.id)
      setHeroSlides((s) => s.filter((x) => x.id !== confirmDelete.id))
      setConfirmDelete({ open: false, id: '', type: 'image' })
    } catch (error) {
      console.error('Error eliminando slide:', error)
      setConfirmDelete({ open: false, id: '', type: 'image' })
    } finally {
      setIsDeleting(false)
    }
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

  const onSaveHero = async (slide: HeroSlide) => {
    try {
      if (!slide.id) {
        await createHeroSlide({ ...slide })
      } else {
        await updateHeroSlide(slide.id, slide)
      }
      const updatedSlides = await fetchHeroSlides()
      setHeroSlides(updatedSlides)
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : 'No se pudo guardar'}`)
    } finally {
      setShowHeroModal(false)
      setEditingHero(null)
    }
  }

  if (loading) return <div className="page"><p>Cargando configuracion...</p></div>

  const bgClass = theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Configuracion del Sistema</h1>
          <p className="section__copy">Gestiona el hero y la galeria del sistema.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="sistema" />

          <div className="min-w-0 space-y-10">
            <section className="section">
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
                  <span>Titulo</span>
                  <span>Orden</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 p-3.5 items-start md:items-center border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between md:block">
                      <span className="md:hidden text-xs text-gray-400">Titulo</span>
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

            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Contenido</p>
                  <h2 className="section__title">Galeria y Experiencias</h2>
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
          </div>
        </div>
      </div>

      <Modal open={showImgModal} onClose={() => setShowImgModal(false)} title={editingImage ? 'Editar imagen' : 'Crear imagen'}>
        {editingImage && (
          <AdminImageForm img={editingImage} onCancel={() => { setShowImgModal(false); setEditingImage(null) }} onSave={onSaveImage} uploadImage={uploadImage} />
        )}
      </Modal>

      <Modal open={showHeroModal} onClose={() => setShowHeroModal(false)} title={editingHero ? 'Editar slide del hero' : 'Crear slide del hero'}>
        {editingHero && (
          <AdminHeroSlideForm slide={editingHero} onCancel={() => { setShowHeroModal(false); setEditingHero(null) }} onSave={onSaveHero} uploadImage={uploadImage} />
        )}
      </Modal>

      <ConfirmationModal
        open={confirmDelete.open}
        title={confirmDelete.type === 'image' ? 'Eliminar Imagen' : 'Eliminar Slide'}
        message={`¿Estás seguro de que deseas eliminar este ${confirmDelete.type === 'image' ? 'elemento' : 'slide'}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete.type === 'image' ? handleConfirmDeleteImage : handleConfirmDeleteHero}
        onCancel={() => setConfirmDelete({ open: false, id: '', type: 'image' })}
      />
    </div>
  )
}

export default AdminSistema
