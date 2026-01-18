export interface AuthToken {
  token: string
  expiresIn: number
  userId: string
  email: string
}

export interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  identificacion?: string
  estaActivo: boolean
  createdAt?: string
}

const TOKEN_STORAGE_KEY = 'moments_token'
const USER_STORAGE_KEY = 'moments_user'

// Guardar token
export const saveToken = (authToken: AuthToken): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, authToken.token)
  // Save user info
  localStorage.setItem('moments_token_expiry', String(Date.now() + authToken.expiresIn * 1000))
}

// Obtener token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

// Eliminar token (logout)
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem('moments_token_expiry')
  localStorage.removeItem(USER_STORAGE_KEY)
}

// Verificar si hay token válido
export const hasValidToken = (): boolean => {
  const token = getToken()
  const expiry = localStorage.getItem('moments_token_expiry')
  
  if (!token || !expiry) return false
  
  const expiryTime = parseInt(expiry, 10)
  return Date.now() < expiryTime
}

// Guardar usuario
export const saveUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

// Obtener usuario guardado
export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// Verificar autenticación
export const isAuthenticated = (): boolean => {
  return hasValidToken()
}

// Obtener información del usuario actual
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) return null
  return getStoredUser()
}

// Limpiar autenticación (logout)
export const logout = (): void => {
  clearToken()
}
