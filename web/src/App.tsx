import { useEffect } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Button from './components/Button'
import MobileNav from './components/MobileNav'
import About from './pages/About'
import Home from './pages/Home'
import CalendarPage from './pages/CalendarPage'
import Packages from './pages/Packages'
import Vehicles from './pages/Vehicles'
import Reservar from './pages/Reservar'
import './App.css'

const nav = [
  { to: '/', label: 'Inicio' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/vehiculos', label: 'Vehículos' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/about', label: 'Sobre nosotros' },
]

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
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paquetes" element={<Packages />} />
            <Route path="/vehiculos" element={<Vehicles />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/reservar" element={<Reservar />} />
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
