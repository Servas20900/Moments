import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type { CalendarSlot } from '../data/content'
import { fetchCalendar } from '../api/api'

interface CalendarContextType {
  events: CalendarSlot[]
  loading: boolean
  addEvent: (event: CalendarSlot) => void
  updateEvent: (id: string, event: CalendarSlot) => void
  removeEvent: (id: string) => void
  setEvents: (events: CalendarSlot[]) => void
  refetch: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEventsState] = useState<CalendarSlot[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCalendar()
      console.log('[Calendar] Fetched events:', data.length, 'events')
      setEventsState(data)
    } catch (error) {
      console.error('[Calendar] Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar eventos al montar el provider
  useEffect(() => {
    refetch()
  }, [refetch])

  const addEvent = useCallback((event: CalendarSlot) => {
    setEventsState((prev) => [event, ...prev])
    console.log('[Calendar] Event added to context:', event)
  }, [])

  const updateEvent = useCallback((id: string, event: CalendarSlot) => {
    setEventsState((prev) => prev.map((e) => (e.id === id ? event : e)))
    console.log('[Calendar] Event updated in context:', id)
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEventsState((prev) => prev.filter((e) => e.id !== id))
    console.log('[Calendar] Event removed from context:', id)
  }, [])

  const setEvents = useCallback((newEvents: CalendarSlot[]) => {
    setEventsState(newEvents)
  }, [])

  const value: CalendarContextType = {
    events,
    loading,
    addEvent,
    updateEvent,
    removeEvent,
    setEvents,
    refetch,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

// @refresh reset
export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within CalendarProvider')
  }
  return context
}
