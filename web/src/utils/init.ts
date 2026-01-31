// Inicializar estado global de la aplicación
import { getStoredUser } from './auth'

export const initializeApp = () => {
  // Verificar usuario guardado
  getStoredUser()

  // Verificar si la app está en modo oscuro
  if (typeof window !== 'undefined') {
    const isDark = localStorage.getItem('moments_dark_mode') !== 'false'
    if (isDark) {
      document.documentElement.dataset.theme = 'dark'
    }
  }
}
