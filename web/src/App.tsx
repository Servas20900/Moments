import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import Account from './components/Account'
import ErrorBoundary from './components/ErrorBoundary'
import AppRoutes from './routes/Routes'
import { CalendarProvider } from './contexts/CalendarContext'
import { isAdmin } from './utils/auth'
import './index.css'
import './styles/typography.css'
import './styles/responsive.css'
import './App.css'
import './styles/admin.css'

const CartButton = () => {
  const navigate = useNavigate()
  return (
    <button 
      onClick={() => navigate('/carrito')}
      className="cart-icon-btn"
      title="Carrito"
    >
      <FaShoppingCart size={20} />
    </button>
  )
}

const Header = () => {
  const [open, setOpen] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(isAdmin())
  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)

  // Actualizar el estado de admin cuando cambie la autenticación
  useEffect(() => {
    const checkAdmin = () => {
      setUserIsAdmin(isAdmin())
    }
    
    // Escuchar evento personalizado de cambio de autenticación
    window.addEventListener('auth-change', checkAdmin)
    
    return () => {
      window.removeEventListener('auth-change', checkAdmin)
    }
  }, [])

  const allNav = AppRoutes.nav
  const nav = allNav.filter(item => item.to !== '/admin' || userIsAdmin)

  const linkBase = 'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200'
  const active = 'bg-white/10 text-white shadow'
  const idle = 'text-gray-200 hover:text-white hover:bg-white/5'

  return (
    <header className="sticky top-0 z-50 bg-[rgba(10,11,15,0.92)] backdrop-blur border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={toggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle menu</span>
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-6 rounded-full bg-current transition ${open ? 'translate-y-[7px] rotate-45' : ''}`}></span>
            <span className={`h-0.5 w-6 rounded-full bg-current transition ${open ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-6 rounded-full bg-current transition ${open ? '-translate-y-[7px] -rotate-45' : ''}`}></span>
          </span>
        </button>

        <div className="text-lg font-semibold tracking-wide text-white">Moments</div>

        <nav className="ml-auto hidden items-center gap-2 md:flex" aria-label="Navegación principal">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => [linkBase, isActive ? active : idle].join(' ')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-2 flex items-center gap-2">
          <CartButton />
          <Account />
        </div>
      </div>

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform px-4 py-5 shadow-2xl transition-transform duration-250 ease-in-out md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{background: '#181a20', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.85)', opacity: 1}}>
        <div className="mb-6 flex items-center justify-between">
          <div className="text-base font-semibold text-white">Menú</div>
          <button
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) => [
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-white/10 text-white shadow' : 'text-gray-200 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <button
          aria-label="Cerrar menú"
          onClick={close}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}
    </header>
  )
}

const App = () => {
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

            <footer className="footer">
              <div className="footer__brand">Moments · Luxury Chauffeur</div>
              <div className="footer__links">
                <a href="mailto:concierge@moments.cr">concierge@moments.cr</a>
                <a href="tel:+50600000000">+506 0000 0000</a>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CalendarProvider>
    </ErrorBoundary>
  )
}

export default App
