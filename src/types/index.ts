export type UserRole = 'player' | 'owner' | 'superadmin'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  rol: UserRole
  clubId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface Club {
  id: string
  nombre: string
  direccion?: string
  telefono?: string
  horarioApertura?: string
  horarioCierre?: string
}

export interface Court {
  id: string
  clubId: string
  club?: Club
  nombre: string
  tipo?: 'blindex' | 'cemento' | 'sintetico' | 'cesped'
  iluminacion?: boolean
  techada?: boolean
  estado: 'activa' | 'inactiva' | 'mantenimiento'
}

export interface Availability {
  id: string
  courtId: string
  court?: Court
  diaSemana: number
  horaInicio: string
  horaFin: string
  intervaloMinutos?: number
}

export interface Booking {
  id: string
  userId: string
  courtId: string
  court?: Court & { club?: Club }
  user?: Pick<User, 'id' | 'nombre' | 'apellido' | 'email'>
  fecha: string
  horaInicio: string
  horaFin: string
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  metodoReserva?: 'web' | 'admin' | 'telefono'
  notas?: string
}
