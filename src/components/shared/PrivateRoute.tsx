import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}
