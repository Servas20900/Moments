import { useEffect } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import MobileNav from './components/MobileNav'
import Account from './components/Account'
import AppRoutes from './routes/Routes'
import { CalendarProvider } from './contexts/CalendarContext'
import './index.css'
import './styles/typography.css'
import './styles/responsive.css'
import './App.css'
import './styles/admin.css'

const nav = AppRoutes.nav

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

const App = () => {
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
  }, [])

  return (
    <CalendarProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-shell">
          <header className="topbar">
            <div className="brand">Moments</div>
            <nav className="nav" aria-label="Navegacion principal">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => ['nav__link', isActive ? 'is-active' : ''].join(' ')}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="topbar__cta">
              <CartButton />
              <MobileNav />
              <Account />
            </div>
          </header>

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
  )
}

export default App
