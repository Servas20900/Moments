// Inicializar estado global de la aplicación
import { getOrCreateCart } from './cart'
import { getStoredUser } from './auth'

export const initializeApp = () => {
  // Inicializar carrito
  const cart = getOrCreateCart()
  console.log('Carrito inicializado:', cart)

  // Verificar usuario guardado
  const user = getStoredUser()
  if (user) {
    console.log('Usuario encontrado:', user.email)
  }

  // Verificar si la app está en modo oscuro
  if (typeof window !== 'undefined') {
    const isDark = localStorage.getItem('moments_dark_mode') !== 'false'
    if (isDark) {
      document.documentElement.dataset.theme = 'dark'
    }
  }
}
