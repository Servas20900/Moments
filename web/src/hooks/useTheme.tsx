import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggleTheme: (newTheme?: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const preferredTheme = savedTheme || 'dark'

    setTheme(preferredTheme)
    document.documentElement.setAttribute('data-theme', preferredTheme)
    setMounted(true)
  }, [])

  const toggleTheme = (newTheme?: Theme) => {
    const nextTheme = newTheme || (theme === 'dark' ? 'light' : 'dark')
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  const value = useMemo(() => ({ theme, toggleTheme, mounted }), [theme, mounted])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
