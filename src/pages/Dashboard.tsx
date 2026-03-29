import { useAuth } from '../contexts/auth-context'
import Modal from '../components/ui/Modal'
import { useModal } from '../hooks/useModal'
import { useClubs, useCourts } from '../hooks/useQueries'
import ClubForm from '../components/forms/ClubForm'
import CourtForm from '../components/forms/CourtForm'
import type { UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  player:     'Jugador',
  owner:      'Administrador',
  superadmin: 'Superadmin',
}

const TIPO_LABELS: Record<string, string> = {
  blindex:   'Blindex',
  cemento:   'Cemento',
  sintetico: 'Sintético',
  cesped:    'Césped',
}

export default function Dashboard() {
  const { user, activeRole, selectRole, logout } = useAuth()
  const addCourtModal = useModal()
  const addClubModal  = useModal()

  const isOwner      = activeRole === 'owner'
  const isSuperadmin = activeRole === 'superadmin'

  // Fetch data based on role
  const { data: clubs = [], isLoading: loadingClubs } = useClubs()
  const { data: courts = [], isLoading: loadingCourts } = useCourts(
    isOwner ? user?.clubId : undefined
  )

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
                  <li key={role}><button onClick={() => selectRole(role)}>{ROLE_LABELS[role]}</button></li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary">Reservar turno</button>
          {(isOwner || isSuperadmin) && (
            <button className="btn btn-secondary" onClick={addCourtModal.open}>+ Agregar cancha</button>
          )}
          {isSuperadmin && (
            <button className="btn btn-accent" onClick={addClubModal.open}>+ Agregar club</button>
          )}
        </div>

        {/* ── CLUBS (superadmin) ─────────────────────────────── */}
        {isSuperadmin && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Clubs</h2>
            {loadingClubs ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
              </div>
            ) : clubs.length === 0 ? (
              <div className="card bg-base-100 shadow">
                <div className="card-body items-center text-center py-8">
                  <p className="text-base-content/50 text-sm">No hay clubs registrados aún.</p>
                  <button className="btn btn-accent btn-sm mt-2" onClick={addClubModal.open}>+ Agregar club</button>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Horario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map((club) => (
                        <tr key={club.id} className="hover">
                          <td className="font-medium">{club.nombre}</td>
                          <td className="text-base-content/60">{club.direccion ?? '—'}</td>
                          <td className="text-base-content/60">{club.telefono ?? '—'}</td>
                          <td className="text-base-content/60 text-sm">
                            {club.horarioApertura && club.horarioCierre
                              ? `${club.horarioApertura} – ${club.horarioCierre}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── COURTS (owner / superadmin) ────────────────────── */}
        {(isOwner || isSuperadmin) && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Canchas</h2>
            {loadingCourts ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
              </div>
            ) : courts.length === 0 ? (
              <div className="card bg-base-100 shadow">
                <div className="card-body items-center text-center py-8">
                  <p className="text-base-content/50 text-sm">No hay canchas registradas aún.</p>
                  <button className="btn btn-secondary btn-sm mt-2" onClick={addCourtModal.open}>+ Agregar cancha</button>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        {isSuperadmin && <th>Club</th>}
                        <th>Superficie</th>
                        <th>Extras</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courts.map((court) => (
                        <tr key={court.id} className="hover">
                          <td className="font-medium">{court.nombre}</td>
                          {isSuperadmin && <td className="text-base-content/60">{court.club?.nombre ?? '—'}</td>}
                          <td>{court.tipo ? TIPO_LABELS[court.tipo] : '—'}</td>
                          <td className="text-sm text-base-content/60">
                            {[court.iluminacion && '💡', court.techada && '🏠'].filter(Boolean).join('  ') || '—'}
                          </td>
                          <td>
                            <span className={`badge badge-sm ${court.estado === 'activa' ? 'badge-success' : court.estado === 'mantenimiento' ? 'badge-warning' : 'badge-ghost'}`}>
                              {court.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── MIS RESERVAS (player) ──────────────────────────── */}
        {activeRole === 'player' && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Mis reservas</h2>
            <div className="card bg-base-100 shadow">
              <div className="card-body items-center text-center py-8">
                <p className="text-base-content/50 text-sm">Todavía no tenés turnos reservados.</p>
                <button className="btn btn-primary btn-sm mt-2">Reservar turno</button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <Modal open={addCourtModal.isOpen} onClose={addCourtModal.close} title="Agregar cancha" description="Completá los datos de la nueva cancha" persistent>
        <CourtForm
          fixedClubId={isOwner ? user?.clubId : undefined}
          onSuccess={() => addCourtModal.close()}
          onCancel={addCourtModal.close}
        />
      </Modal>

      <Modal open={addClubModal.isOpen} onClose={addClubModal.close} title="Agregar club" description="Completá los datos del nuevo club" persistent>
        <ClubForm
          onSuccess={() => addClubModal.close()}
          onCancel={addClubModal.close}
        />
      </Modal>
    </div>
  )
}
