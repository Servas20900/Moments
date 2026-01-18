import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAuthenticated, getStoredUser } from '../utils/auth'
import { getCurrentUser } from '../api/api'

const Account = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    
    // Intentar obtener usuario guardado primero
    const storedUser = getStoredUser()
    if (storedUser) {
      if (mounted) setUser(storedUser)
    }
    
    // Luego intentar sincronizar con la API si está autenticado
    if (isAuthenticated()) {
      getCurrentUser().then((u) => { 
        if (mounted && u) setUser(u) 
      }).catch(() => {
        // Si falla, usar el usuario guardado
        if (mounted && storedUser) setUser(storedUser)
      })
    }
    
    return () => { mounted = false }
  }, [])

  const displayName = user?.nombre || user?.name || user?.email || 'U'

  return (
    <div className="account-button">
      <Link to={isAuthenticated() ? '/profile' : '/login'} aria-label="Cuenta" title={displayName}>
        {isAuthenticated() ? (
          <div className="account-avatar" title={displayName}>
            {String(displayName).slice(0, 1).toUpperCase()}
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </Link>
    </div>
  )
}

export default Account
