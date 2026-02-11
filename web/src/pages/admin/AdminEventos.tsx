import { useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import ConfirmationModal from '../../components/ConfirmationModal'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, createImageRecord, attachImageToEvent, uploadImage } from '../../api/api'
import { useCalendarContext } from '../../contexts/CalendarContext'
import { useTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/themeClasses'
import { AdminEventForm } from '../../components/admin/AdminForms'
import type { CalendarSlotView } from '../../data/content'

const AdminEventos = () => {
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)
  const { events, addEvent, updateEvent, removeEvent } = useCalendarContext()
  const [editingEvent, setEditingEvent] = useState<CalendarSlotView | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const emptyEvent: CalendarSlotView = {
    id: '',
    date: '',
    status: 'evento',
    title: '',
    detail: '',
    tag: '',
    imageUrl: '',
  }

  const iconButtonClasses = theme === 'dark'
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-200 text-gray-700 transition hover:border-gray-400 hover:bg-gray-300'

  const onCreateEvent = () => {
    setEditingEvent(null)
    setShowEventModal(true)
  }

  const onEditEvent = (e: CalendarSlotView) => {
    setEditingEvent(e)
    setShowEventModal(true)
  }

  const onDeleteEvent = (id: string) => {
    setConfirmDelete({ open: true, id })
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCalendarEvent(confirmDelete.id)
      removeEvent(confirmDelete.id)
      setConfirmDelete({ open: false, id: '' })
    } catch (error: any) {
      console.error('Error eliminando evento:', error)
      setConfirmDelete({ open: false, id: '' })
    } finally {
      setIsDeleting(false)
    }
  }

  const onSaveEvent = async (ev: CalendarSlotView) => {
    const eventData: CalendarSlotView = { ...ev, status: 'evento' }
    try {
      if (!ev.id) {
        const evPayload = { ...eventData, imageUrl: '' }
        const created = await createCalendarEvent(evPayload)

        if (eventData.imageUrl) {
          const img = await createImageRecord({ categoria: 'EVENTO', url: eventData.imageUrl, altText: created.title })
          await attachImageToEvent(img.id, created.id, 0)
          created.imageUrl = eventData.imageUrl
        }
        addEvent(created)
      } else {
        const evPayload = { ...eventData, imageUrl: '' }
        await updateCalendarEvent(ev.id, evPayload)

        if (eventData.imageUrl) {
          const img = await createImageRecord({ categoria: 'EVENTO', url: eventData.imageUrl, altText: eventData.title })
          await attachImageToEvent(img.id, eventData.id, 0)
        }
        updateEvent(eventData.id, eventData)
      }
    } catch (error: any) {
      alert(error.message || 'Error al guardar evento')
    } finally {
      setShowEventModal(false)
      setEditingEvent(null)
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="display">Gestión de Eventos</h1>
          <p className="section__copy">Administra los eventos del calendario. Las acciones pegan a la API.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6 lg:gap-8 items-start">
          <AdminSidebar current="eventos" />

          <div className="min-w-0">
            <section className="section">
              <div className="section__header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">Calendario</p>
                  <h2 className="section__title">Eventos</h2>
                  <p className="text-sm text-gray-400 mt-1">Gestiona los eventos que aparecen en el calendario público</p>
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
                {events.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    No hay eventos registrados. Crea el primero para comenzar.
                  </div>
                )}
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
          </div>
        </div>
      </div>

      {showEventModal && (
        <Modal open={showEventModal} title={editingEvent ? 'Editar evento' : 'Nuevo evento'} onClose={() => setShowEventModal(false)}>
          <AdminEventForm
            ev={editingEvent ?? emptyEvent}
            onCancel={() => { setShowEventModal(false); setEditingEvent(null) }}
            onSave={onSaveEvent}
            uploadImage={uploadImage}
          />
        </Modal>
      )}

      <ConfirmationModal
        open={confirmDelete.open}
        title="Eliminar Evento"
        message="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
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

export default AdminEventos
