import { useEffect } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Button from './components/Button'
import MobileNav from './components/MobileNav'
import Account from './components/Account'
import AppRoutes from './routes/Routes'
import './App.css'

  const nav = AppRoutes.nav

const ReservarButton = () => {
  const navigate = useNavigate()
  return <Button variant="primary" onClick={() => navigate('/reservar')}>Reservar</Button>
}

const App = () => {
  useEffect(() => {
    document.documentElement.dataset.theme = 'dark'
  }, [])

  return (
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
            <ReservarButton />
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
  )
}

export default App
