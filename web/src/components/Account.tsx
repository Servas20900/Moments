import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../api/mocks'

const Account = () => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    getCurrentUser().then((u) => { if (mounted) setUser(u) })
    return () => { mounted = false }
  }, [])

  return (
    <div className="account-button">
      <Link to={user ? '/profile' : '/login'} aria-label="Cuenta">
        {user ? (
          <div className="account-avatar">{String(user.name || 'U').slice(0,1).toUpperCase()}</div>
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
