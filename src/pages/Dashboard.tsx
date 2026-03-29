import { useAuth } from '../contexts/auth-context'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="navbar bg-base-100 rounded-box shadow mb-6">
        <div className="flex-1">
          <span className="text-xl font-bold">TurnoGo</span>
        </div>
        <div className="flex-none gap-2">
          <span className="text-sm text-base-content/60">{user?.nombre} {user?.apellido}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Reservas</h3>
            <p className="text-base-content/60 text-sm">Gestioná tus turnos</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Canchas</h3>
            <p className="text-base-content/60 text-sm">Ver disponibilidad</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Perfil</h3>
            <p className="text-base-content/60 text-sm">Tu cuenta</p>
          </div>
        </div>
      </div>
    </div>
  )
}
