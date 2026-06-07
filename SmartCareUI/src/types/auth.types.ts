export type UserRole = 'Admin' | 'Doctor'

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
  role: UserRole
  expiresIn: string
}
