import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

interface AuthUser {
  email: string
  role: 'Admin' | 'Doctor'
  token: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isAdmin: boolean
  isDoctor: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

declare global {
  interface Window {
    __smartcare_token?: string
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback((authUser: AuthUser) => {
    window.__smartcare_token = authUser.token
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    window.__smartcare_token = undefined
    setUser(null)
    // Clean up per-session doctor selections so the next sign-in is unambiguous.
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('smartcare:doctorId:')) {
          sessionStorage.removeItem(key)
        }
      }
    } catch {
      /* sessionStorage may be unavailable (e.g. SSR or restricted iframe) */
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('smartcare:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('smartcare:unauthorized', handleUnauthorized)
    }
  }, [logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === 'Admin',
        isDoctor: user?.role === 'Doctor',
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
