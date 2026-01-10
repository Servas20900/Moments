import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import AppRoutes from '../routes/Routes'
import './MobileNav.css'

const nav = AppRoutes.nav

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="mobile-nav">
      <button 
        className="mobile-nav__toggle" 
        onClick={toggleMenu}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <span className="hamburger">
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
          <span className="hamburger__line"></span>
        </span>
      </button>

      {isOpen && (
        <div className="mobile-nav__overlay" onClick={closeMenu} />
      )}

      <nav className={`mobile-nav__menu ${isOpen ? 'is-open' : ''}`}>
        <div className="mobile-nav__header">
          <span className="mobile-nav__title">Menú</span>
          <button 
            className="mobile-nav__close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <ul className="mobile-nav__list">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => ['mobile-nav__link', isActive ? 'is-active' : ''].join(' ')}
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default MobileNav
