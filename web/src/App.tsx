import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRoutes from './routes/Routes'
import { CalendarProvider } from './contexts/CalendarContext'
import './index.css'
import './App.css'

export default function App() {
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
  }, [])

  return (
    <ErrorBoundary>
      <CalendarProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-shell">
            <Header />

            <main className="main">
              <Routes>
                {AppRoutes.list.map((r) => (
                  <Route key={r.path} path={r.path} element={r.element} />
                ))}
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </CalendarProvider>
    </ErrorBoundary>
  )
}