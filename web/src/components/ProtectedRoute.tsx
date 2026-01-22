import { Navigate } from 'react-router-dom'
import { isAdmin } from '../utils/auth'

interface ProtectedRouteProps {
  element: React.ReactElement
}

const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }

  return element
}

export default ProtectedRoute
