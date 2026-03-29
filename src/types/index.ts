export type UserRole = 'admin' | 'jugador'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthTokens {
  access_token: string
}
