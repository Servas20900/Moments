import type { PropsWithChildren, ReactNode } from 'react'

export type ModalProps = PropsWithChildren<{
  open: boolean
  title?: string
  onClose: () => void
  actions?: ReactNode
}>

const Modal = ({ open, title, actions, onClose, children }: ModalProps) => {
  if (!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title || 'Modal'}>
      <div className="modal__backdrop" onClick={onClose} aria-hidden />
      <div className="modal__panel">
        <header className="modal__header">
          {title && <h3 className="modal__title">{title}</h3>}
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
