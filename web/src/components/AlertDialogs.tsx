import { useAlert } from '../contexts/AlertContext'
import Modal from './Modal'
import Button from './Button'
import ConfirmationModal from './ConfirmationModal'

const AlertDialogs = () => {
  const { alertDialog, confirmDialog, closeAlert } = useAlert()

  const handleAlertClose = () => {
    closeAlert()
    const resolve = (window as any).__alertResolve
    if (resolve) resolve()
  }

  const handleConfirmConfirm = async () => {
    const handler = (window as any).__confirmResolve
    if (handler) await handler()
  }

  const handleConfirmCancel = () => {
    const handler = (window as any).__confirmReject
    if (handler) handler()
  }

  return (
    <>
      {/* Alert Modal */}
      <Modal open={alertDialog.open} title={alertDialog.title} onClose={handleAlertClose}>
        <div className="grid gap-4">
          <p className="text-sm text-gray-300">{alertDialog.message}</p>
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Button onClick={handleAlertClose} variant="primary" className="flex-1">
              Aceptar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={confirmDialog.isDangerous}
        isLoading={confirmDialog.isLoading}
        onConfirm={handleConfirmConfirm}
        onCancel={handleConfirmCancel}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  )
}

export default AlertDialogs
