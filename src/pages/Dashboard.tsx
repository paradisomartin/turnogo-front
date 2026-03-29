import { useAuth } from '../contexts/auth-context'
import Modal from '../components/ui/Modal'
import { useModal } from '../hooks/useModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const addCourtModal = useModal()
  const addClubModal = useModal()

  const isOwner = user?.rol === 'owner'
  const isSuperadmin = user?.rol === 'superadmin'

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
            <p className="text-xs text-base-content/50 capitalize">{user?.rol}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Actions bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Player */}
          <button className="btn btn-primary">Reservar turno</button>

          {/* Owner + SuperAdmin */}
          {(isOwner || isSuperadmin) && (
            <button className="btn btn-secondary" onClick={addCourtModal.open}>
              + Agregar cancha
            </button>
          )}

          {/* SuperAdmin only */}
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
      <Modal
        open={addCourtModal.isOpen}
        onClose={addCourtModal.close}
        title="Agregar cancha"
        description="Completá los datos de la nueva cancha"
      >
        <p className="text-base-content/60 text-sm py-4">Formulario de cancha — próximamente</p>
        <div className="modal-action">
          <button className="btn" onClick={addCourtModal.close}>Cancelar</button>
          <button className="btn btn-primary">Guardar</button>
        </div>
      </Modal>

      {/* Modal: Agregar club (superadmin) */}
      <Modal
        open={addClubModal.isOpen}
        onClose={addClubModal.close}
        title="Agregar club"
        description="Completá los datos del nuevo club"
      >
        <p className="text-base-content/60 text-sm py-4">Formulario de club — próximamente</p>
        <div className="modal-action">
          <button className="btn" onClick={addClubModal.close}>Cancelar</button>
          <button className="btn btn-primary">Guardar</button>
        </div>
      </Modal>
    </div>
  )
}
