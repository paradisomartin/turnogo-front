import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '../lib/api'
import type { AuthResponse, User, UserRole } from '../types'

// Roles that each real role can impersonate
const AVAILABLE_ROLES: Record<UserRole, UserRole[]> = {
  superadmin: ['superadmin', 'owner', 'player'],
  owner:      ['owner', 'player'],
  player:     ['player'],
}

interface AuthContextValue {
  user: User | null
  activeRole: UserRole | null
  /** Roles available to select after login */
  pendingRoles: UserRole[] | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  selectRole: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [activeRole, setActiveRole]   = useState<UserRole | null>(null)
  const [pendingRoles, setPending]    = useState<UserRole[] | null>(null)
  const [loading, setLoading]         = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token      = localStorage.getItem('token')
    const savedRole  = localStorage.getItem('activeRole') as UserRole | null
    if (token) {
      api.get<User>('/users/me')
        .then((res) => {
          setUser(res.data)
          const roles = AVAILABLE_ROLES[res.data.rol]
          const role  = savedRole && roles.includes(savedRole) ? savedRole : res.data.rol
          setActiveRole(role)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('activeRole')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    setUser(data.user)

    const roles = AVAILABLE_ROLES[data.user.rol]

    if (roles.length > 1) {
      // Show role selection screen
      setPending(roles)
    } else {
      // Player: skip selection, go straight in
      setActiveRole('player')
      localStorage.setItem('activeRole', 'player')
    }
  }

  const selectRole = useCallback((role: UserRole) => {
    setActiveRole(role)
    setPending(null)
    localStorage.setItem('activeRole', role)
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('activeRole')
    setUser(null)
    setActiveRole(null)
    setPending(null)
  }

  return (
    <AuthContext.Provider value={{ user, activeRole, pendingRoles, loading, login, selectRole, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
