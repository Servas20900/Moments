import { createContext, useContext, useState, type ReactNode } from 'react'

export type AlertType = 'info' | 'error' | 'success' | 'warning'

export type AlertDialogState = {
  open: boolean
  title: string
  message: string
  type: AlertType
}

export type ConfirmDialogState = {
  open: boolean
  title: string
  message: string
  isDangerous?: boolean
  onConfirm?: () => void | Promise<void>
  isLoading?: boolean
}

export type AlertContextType = {
  alertDialog: AlertDialogState
  confirmDialog: ConfirmDialogState
  showAlert: (title: string, message: string, type?: AlertType) => Promise<void>
  showConfirm: (title: string, message: string, isDangerous?: boolean) => Promise<boolean>
  closeAlert: () => void
  closeConfirm: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
    open: false,
    title: '',
    message: '',
    type: 'info',
  })

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    isDangerous: false,
    isLoading: false,
  })

  const closeAlert = () => {
    setAlertDialog((s) => ({ ...s, open: false }))
  }

  const closeConfirm = () => {
    setConfirmDialog((s) => ({ ...s, open: false }))
  }

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = 'info'
  ): Promise<void> => {
    return new Promise((resolve) => {
      setAlertDialog({
        open: true,
        title,
        message,
        type,
      })

      // Store resolve function for when user closes
      const originalResolve = resolve
      // We'll handle this in the modal close handler
      const handleClose = () => {
        closeAlert()
        originalResolve()
      }
      
      // Store in window for access in modal
      ;(window as any).__alertResolve = handleClose
    })
  }

  const showConfirm = (
    title: string,
    message: string,
    isDangerous: boolean = false
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        resolve(true)
        closeConfirm()
      }

      const handleCancel = () => {
        resolve(false)
        closeConfirm()
      }

      setConfirmDialog({
        open: true,
        title,
        message,
        isDangerous,
        onConfirm: handleConfirm,
        isLoading: false,
      })

      // Store handlers for access in modal
      ;(window as any).__confirmResolve = handleConfirm
      ;(window as any).__confirmReject = handleCancel
    })
  }

  return (
    <AlertContext.Provider
      value={{
        alertDialog,
        confirmDialog,
        showAlert,
        showConfirm,
        closeAlert,
        closeConfirm,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}
