import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PackageView, VehicleView } from '../data/content'

export type ExtraOption = {
  id: string
  name: string
  price: number
  description?: string
}

export type ReservationCart = {
  id: string
  package: Pick<PackageView, 'id' | 'name' | 'price' | 'category' | 'imageUrl' | 'maxPeople'>
  vehicle?: Pick<VehicleView, 'id' | 'name' | 'seats' | 'rate' | 'imageUrl'>
  date: string
  time: string
  origin: string
  destination: string
  people: number
  extras: ExtraOption[]
  total: number
  deposit: number
  notes?: string
  createdAt: string
}

type ReservationContextValue = {
  selectedPackage: PackageView | null
  cart: ReservationCart | null
  startReservation: (pkg: PackageView) => void
  setReservation: (reservation: ReservationCart) => void
  clearReservation: () => void
}

const RESERVATION_CART_KEY = 'moments_reservation_cart'
const SELECTED_PACKAGE_KEY = 'moments_selected_package'

const ReservationContext = createContext<ReservationContextValue | undefined>(undefined)

const loadFromStorage = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : null
  } catch {
    return null
  }
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [selectedPackage, setSelectedPackage] = useState<PackageView | null>(() => loadFromStorage<PackageView>(SELECTED_PACKAGE_KEY))
  const [cart, setCart] = useState<ReservationCart | null>(() => loadFromStorage<ReservationCart>(RESERVATION_CART_KEY))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedPackage) {
      localStorage.setItem(SELECTED_PACKAGE_KEY, JSON.stringify(selectedPackage))
    } else {
      localStorage.removeItem(SELECTED_PACKAGE_KEY)
    }
  }, [selectedPackage])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (cart) {
      localStorage.setItem(RESERVATION_CART_KEY, JSON.stringify(cart))
    } else {
      localStorage.removeItem(RESERVATION_CART_KEY)
    }
  }, [cart])

  const startReservation = useCallback((pkg: PackageView) => {
    setSelectedPackage(pkg)
    setCart(null)
  }, [])

  const setReservation = useCallback((reservation: ReservationCart) => {
    setCart(reservation)
  }, [])

  const clearReservation = useCallback(() => {
    setCart(null)
  }, [])

  const value = useMemo(
    () => ({ selectedPackage, cart, startReservation, setReservation, clearReservation }),
    [selectedPackage, cart, startReservation, setReservation, clearReservation],
  )

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>
}

export function useReservation() {
  const ctx = useContext(ReservationContext)
  if (!ctx) {
    throw new Error('useReservation must be used within ReservationProvider')
  }
  return ctx
}
