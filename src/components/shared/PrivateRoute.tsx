import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import RoleSelect from '../../pages/RoleSelect'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, activeRole, pendingRoles, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Multi-role user: show role selection screen
  if (pendingRoles && !activeRole) return <RoleSelect />

  return <>{children}</>
}
