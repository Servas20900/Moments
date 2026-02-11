import Modal from './Modal'
import Button from './Button'

export type ConfirmationModalProps = {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const ConfirmationModal = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) => {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="grid gap-4">
        <p className="text-sm text-gray-300">{message}</p>
        <div className="flex gap-3 pt-2 border-t border-white/10">
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Procesando...' : confirmText}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
            type="button"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
