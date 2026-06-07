import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/context/AuthContext'
import type { LoginDto } from '@/types/auth.types'

function toErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return 'Invalid email or password.'
    }
    return 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: (data) => {
      login({ email: data.email, role: data.role, token: data.token })
      navigate(data.role === 'Admin' ? '/admin' : '/doctor', { replace: true })
    },
  })

  return {
    submitLogin: (dto: LoginDto) => mutation.mutate(dto),
    isPending: mutation.isPending,
    error: mutation.isError ? toErrorMessage(mutation.error) : null,
  }
}
