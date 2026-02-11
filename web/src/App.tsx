import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import AlertDialogs from './components/AlertDialogs'
import AppRoutes from './routes/Routes'
import { CalendarProvider } from './contexts/CalendarContext'
import { ReservationProvider } from './contexts/ReservationContext'
import { AlertProvider } from './contexts/AlertContext'
import { ThemeProvider, useTheme } from './hooks/useTheme.tsx'
import './index.css'
import './App.css'

function AppContent() {
  const { mounted } = useTheme()
  if (!mounted) return null

  return (
    <ErrorBoundary>
      <AlertProvider>
        <CalendarProvider>
          <ReservationProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <AlertDialogs />
              <div className="app-shell">
                <Header />

                <main className="main">
                  <Suspense fallback={<div className="page-loading">Cargando...</div>}>
                    <Routes>
                      {AppRoutes.list.map((r) => (
                        <Route key={r.path} path={r.path} element={r.element} />
                      ))}
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </BrowserRouter>
          </ReservationProvider>
        </CalendarProvider>
      </AlertProvider>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}