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
    document.body.style.overflow = 'hidden'

    // focus first focusable element in panel (or panel)
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    ;(focusable ?? panelRef.current)?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        // basic focus trap
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!nodes || nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      // restore focus
      ;(previouslyFocused.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const titleId = title ? 'modal-title' : undefined

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="modal__panel" tabIndex={-1}>
        <header className="modal__header">
          {title && <h3 id={titleId} className="modal__title">{title}</h3>}
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
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
