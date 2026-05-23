import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('@/pages/home/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const BookingPage = lazy(() => import('@/pages/booking/BookingPage'))
const PatientLookupPage = lazy(() =>
  import('@/pages/patient/PatientLookupPage')
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage')
)
const DoctorSchedulePage = lazy(() =>
  import('@/pages/doctor/DoctorSchedulePage')
)
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'))

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loader />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/book',
    element: (
      <Suspense fallback={<Loader />}>
        <BookingPage />
      </Suspense>
    ),
  },
  {
    path: '/my-appointment',
    element: (
      <Suspense fallback={<Loader />}>
        <PatientLookupPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="Admin">
        <Suspense fallback={<Loader />}>
          <AdminDashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor',
    element: (
      <ProtectedRoute requiredRole="Doctor">
        <Suspense fallback={<Loader />}>
          <DoctorSchedulePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
