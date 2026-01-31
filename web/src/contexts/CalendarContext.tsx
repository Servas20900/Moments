import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'
import type { CalendarSlotView } from '../data/content'
import { fetchCalendar } from '../api/api'

interface CalendarContextType {
  events: CalendarSlotView[]
  loading: boolean
  addEvent: (event: CalendarSlotView) => void
  updateEvent: (id: string, event: CalendarSlotView) => void
  removeEvent: (id: string) => void
  setEvents: (events: CalendarSlotView[]) => void
  refetch: () => Promise<void>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEventsState] = useState<CalendarSlotView[]>([])
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCalendar()
      setEventsState(data)
    } catch (error) {
      // Silent fail for calendar fetch
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar eventos al montar el provider
  useEffect(() => {
    refetch()
  }, [refetch])

  const addEvent = useCallback((event: CalendarSlotView) => {
    setEventsState((prev) => [event, ...prev])
  }, [])

  const updateEvent = useCallback((id: string, event: CalendarSlotView) => {
    setEventsState((prev) => prev.map((e) => (e.id === id ? event : e)))
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEventsState((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const setEvents = useCallback((newEvents: CalendarSlotView[]) => {
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
