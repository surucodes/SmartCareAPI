import api from './api'
import type { LoginDto, LoginResponse } from '@/types/auth.types'

export const authService = {
  login: (dto: LoginDto) =>
    api.post<LoginResponse>('/api/auth/login', dto).then((r) => r.data),
}
