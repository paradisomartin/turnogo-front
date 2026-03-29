import { useAuth } from '../contexts/auth-context'
import type { UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  player:     'Jugador',
  owner:      'Administrador',
  superadmin: 'Superadmin',
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  player:     'Reservá canchas y gestioná tus turnos',
  owner:      'Gestioná tu negocio, canchas y reservas',
  superadmin: 'Acceso total al sistema',
}

const ROLE_ICON: Record<UserRole, string> = {
  player:     '🎾',
  owner:      '🏟️',
  superadmin: '⚡',
}

export default function RoleSelect() {
  const { user, pendingRoles, selectRole, logout } = useAuth()

  if (!pendingRoles) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">Bienvenido</h2>
          <p className="text-base-content/60 text-sm mb-2">
            Hola, <span className="font-medium text-base-content">{user?.nombre}</span>. ¿Cómo querés ingresar?
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {pendingRoles.map((role) => (
              <button
                key={role}
                className="btn btn-outline w-full justify-start gap-3 h-auto py-3"
                onClick={() => selectRole(role)}
              >
                <span className="text-xl">{ROLE_ICON[role]}</span>
                <div className="text-left">
                  <p className="font-semibold">{ROLE_LABELS[role]}</p>
                  <p className="text-xs font-normal text-base-content/60">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </button>
            ))}
          </div>

          <button className="btn btn-ghost btn-sm mt-4 text-base-content/40" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
