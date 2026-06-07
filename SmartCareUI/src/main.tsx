import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/router'
import './index.css'

// Surface a clear message during development if the API base URL is missing,
// instead of mysterious network failures against the localhost fallback.
if (!import.meta.env.VITE_API_BASE_URL) {
  console.error(
    '[SmartCare] VITE_API_BASE_URL is not set. ' +
      'Create a .env.local (or .env.development) with ' +
      'VITE_API_BASE_URL=http://localhost:5027 — falling back to http://localhost:5000.',
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
