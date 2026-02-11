import { useEffect, useRef } from 'react'
import type { PropsWithChildren, ReactNode } from 'react'

export type ModalProps = PropsWithChildren<{
  open: boolean
  title?: string
  onClose: () => void
  actions?: ReactNode
}>

const Modal = ({ open, title, actions, onClose, children }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return

    // save previously focused element
    previouslyFocused.current = document.activeElement

    // prevent body scroll
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    
    // Add padding to account for scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    
    document.body.style.overflow = 'hidden'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
      // restore focus
      ;(previouslyFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [open])

  if (!open) return null

  const titleId = title ? 'modal-title' : undefined

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="modal__panel" tabIndex={-1}>
        <header className="modal__header">
          {title && <h3 id={titleId} className="modal__title">{title}</h3>}
          <button 
            className="modal__close" 
            onClick={onClose} 
            aria-label="Cerrar diálogo"
            type="button"
          >
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {actions && <div className="modal__footer">{actions}</div>}
      </div>
    </div>
  )
}

export default Modal
