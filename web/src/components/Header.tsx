import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaShoppingCart } from 'react-icons/fa'
import Account from './Account'
import AppRoutes from '../routes/Routes'
import { isAdmin } from '../utils/auth'
import { useTheme } from '../hooks/useTheme.tsx'

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

export default function Header() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
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
  const active = isLight ? 'bg-black/5 text-[var(--color-text)] shadow-sm' : 'bg-white/10 text-white shadow'
  const idle = isLight ? 'text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-black/5' : 'text-gray-200 hover:text-white hover:bg-white/5'

  return (
    <header className={`sticky top-0 z-50 backdrop-blur border-b ${isLight ? 'bg-white/90 text-[var(--color-text)] border-black/10 shadow-sm' : 'bg-[rgba(10,11,15,0.92)] text-white border-white/10'}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={toggle}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition md:hidden ${isLight ? 'border border-black/10 bg-black/5 text-[var(--color-text)] hover:border-black/20 hover:bg-black/10' : 'border border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10'}`}
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

        <div className="text-lg font-semibold tracking-wide">Moments</div>

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

      {/* Mobile Menu Aside */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed top-16 left-0 z-30 bg-black/20 md:hidden"
            style={{ width: '60%', height: 'auto' }}
            onClick={close}
          />
          
          {/* Aside Menu */}
          <aside
            className={`fixed top-16 left-0 z-40 border-b border-r backdrop-blur-md md:hidden rounded-br-2xl rounded-tr-2xl ${isLight ? 'bg-white text-[var(--color-text)] border-black/10 shadow-sm' : 'bg-[rgba(10,11,15,0.98)] text-white border-white/10'}`}
            style={{ width: '60%' }}
          >
            <nav className="space-y-1 px-4 py-4">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  className={({ isActive }) => [
                    'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? (isLight ? 'bg-black/5 text-[var(--color-text)] shadow-sm' : 'bg-white/10 text-white')
                      : (isLight ? 'text-[var(--color-text)] hover:bg-black/5 hover:text-[var(--color-text)]' : 'text-gray-300 hover:bg-white/5 hover:text-white')
                  ].join(' ')}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}
    </header>
  )
}
