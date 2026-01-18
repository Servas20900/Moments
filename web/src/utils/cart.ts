import type { Package } from '../data/content'

export interface CartItem {
  id: string
  package: Package
  quantity: number
  addedAt: string
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  createdAt: string
  updatedAt: string
}

const CART_STORAGE_KEY = 'moments_cart'
const CART_ID_STORAGE_KEY = 'moments_cart_id'

// Generar ID único para el carrito
const generateCartId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Obtener o crear carrito
export const getOrCreateCart = (): Cart => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY)
  
  if (storedCart) {
    try {
      return JSON.parse(storedCart)
    } catch {
      // Si el carrito guardado es inválido, crear uno nuevo
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  const newCart: Cart = {
    id: localStorage.getItem(CART_ID_STORAGE_KEY) || generateCartId(),
    items: [],
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(CART_ID_STORAGE_KEY, newCart.id)
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))

  return newCart
}

// Agregar item al carrito
export const addToCart = (pkg: Package, quantity: number = 1): Cart => {
  const cart = getOrCreateCart()
  
  const existingItem = cart.items.find(item => item.package.id === pkg.id)
  
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({
      id: `item_${Date.now()}`,
      package: pkg,
      quantity,
      addedAt: new Date().toISOString(),
    })
  }

  cart.updatedAt = new Date().toISOString()
  updateCartTotal(cart)
  saveCart(cart)

  return cart
}

// Actualizar cantidad de item
export const updateCartItemQuantity = (itemId: string, quantity: number): Cart => {
  const cart = getOrCreateCart()
  const item = cart.items.find(i => i.id === itemId)
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      item.quantity = quantity
      cart.updatedAt = new Date().toISOString()
      updateCartTotal(cart)
      saveCart(cart)
    }
  }

  return cart
}

// Eliminar item del carrito
export const removeFromCart = (itemId: string): Cart => {
  const cart = getOrCreateCart()
  cart.items = cart.items.filter(i => i.id !== itemId)
  cart.updatedAt = new Date().toISOString()
  updateCartTotal(cart)
  saveCart(cart)

  return cart
}

// Vaciar carrito
export const clearCart = (): Cart => {
  const cart = getOrCreateCart()
  cart.items = []
  cart.total = 0
  cart.updatedAt = new Date().toISOString()
  saveCart(cart)

  return cart
}

// Actualizar total del carrito
const updateCartTotal = (cart: Cart): void => {
  cart.total = cart.items.reduce((sum, item) => {
    return sum + (item.package.price * item.quantity)
  }, 0)
}

// Guardar carrito en localStorage
const saveCart = (cart: Cart): void => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

// Obtener carrito actual
export const getCart = (): Cart => {
  return getOrCreateCart()
}

// Obtener cantidad de items
export const getCartItemCount = (): number => {
  const cart = getOrCreateCart()
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

// Obtener total del carrito
export const getCartTotal = (): number => {
  const cart = getOrCreateCart()
  return cart.total
}
