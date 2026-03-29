import { useAuth } from '../contexts/auth-context'
import Modal from '../components/ui/Modal'
import { useModal } from '../hooks/useModal'
import ClubForm from '../components/forms/ClubForm'
import CourtForm from '../components/forms/CourtForm'
import type { UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  player:     'Jugador',
  owner:      'Administrador',
  superadmin: 'Superadmin',
}

export default function Dashboard() {
  const { user, activeRole, selectRole, logout } = useAuth()
  const addCourtModal = useModal()
  const addClubModal  = useModal()

  const isOwner      = activeRole === 'owner'
  const isSuperadmin = activeRole === 'superadmin'

  // Roles the user can switch to (excluding the current one)
  const switchableRoles = (user?.rol === 'superadmin'
    ? ['superadmin', 'owner', 'player']
    : user?.rol === 'owner'
    ? ['owner', 'player']
    : []
  ).filter((r) => r !== activeRole) as UserRole[]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">TurnoGo</span>
        </div>
        <div className="flex-none flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
            <p className="text-xs text-base-content/50">{activeRole ? ROLE_LABELS[activeRole] : ''}</p>
          </div>

          {/* Switch role dropdown */}
          {switchableRoles.length > 0 && (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle" title="Cambiar vista">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </button>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box shadow z-10 w-44 p-2 mt-2">
                <li className="menu-title text-xs">Cambiar vista</li>
                {switchableRoles.map((role) => (
                  <li key={role}>
                    <button onClick={() => selectRole(role)}>{ROLE_LABELS[role]}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Actions bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="btn btn-primary">Reservar turno</button>

          {(isOwner || isSuperadmin) && (
            <button className="btn btn-secondary" onClick={addCourtModal.open}>
              + Agregar cancha
            </button>
          )}

          {isSuperadmin && (
            <button className="btn btn-accent" onClick={addClubModal.open}>
              + Agregar club
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Mis reservas</h3>
              <p className="text-base-content/60 text-sm">Próximos turnos</p>
            </div>
          </div>

          {(isOwner || isSuperadmin) && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Canchas</h3>
                <p className="text-base-content/60 text-sm">Gestionar canchas</p>
              </div>
            </div>
          )}

          {isSuperadmin && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Clubs</h3>
                <p className="text-base-content/60 text-sm">Ver todos los clubs</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Agregar cancha */}
      <Modal open={addCourtModal.isOpen} onClose={addCourtModal.close} title="Agregar cancha" description="Completá los datos de la nueva cancha" persistent>
        <CourtForm
          fixedClubId={isOwner ? user?.clubId : undefined}
          onSuccess={() => addCourtModal.close()}
          onCancel={addCourtModal.close}
        />
      </Modal>

      {/* Modal: Agregar club */}
      <Modal open={addClubModal.isOpen} onClose={addClubModal.close} title="Agregar club" description="Completá los datos del nuevo club" persistent>
        <ClubForm
          onSuccess={() => addClubModal.close()}
          onCancel={addClubModal.close}
        />
      </Modal>
    </div>
  )
}
