import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role))
    return <Navigate to="/403" replace />

  return <Outlet />
}

export default ProtectedRoute
