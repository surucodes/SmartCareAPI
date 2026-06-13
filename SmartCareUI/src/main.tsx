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

// When a lazily-imported route chunk fails to load it is almost always a stale
// hashed chunk left over from a previous deploy (the new deploy replaced it, so
// the SPA fallback returns index.html and the browser rejects the MIME type).
// Reload once to pull the fresh index.html; the sessionStorage guard prevents a
// reload loop if the chunk is genuinely unreachable.
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('vite-preload-reloaded')) return
  sessionStorage.setItem('vite-preload-reloaded', '1')
  window.location.reload()
})

// Once the page has fully loaded, chunks resolved — clear the guard so a later
// redeploy in the same session can recover too.
window.addEventListener('load', () => {
  sessionStorage.removeItem('vite-preload-reloaded')
})

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
