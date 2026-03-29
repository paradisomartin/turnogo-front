export type UserRole = 'player' | 'owner' | 'superadmin'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  rol: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  access_token: string
  user: User
}
