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
const SetupPage = lazy(() => import('@/pages/setup/SetupPage'))
const DrPrasannaPage = lazy(
  () => import('@/pages/doctor-profile/DrPrasannaPage')
)
const DrLakshmiPage = lazy(
  () => import('@/pages/doctor-profile/DrLakshmiPage')
)
const HospitalTourPage = lazy(
  () => import('@/pages/hospital-tour/HospitalTourPage')
)
const SpecialtiesPage = lazy(() => import('@/pages/specialties/SpecialtiesPage'))
const ServicesPage = lazy(() => import('@/pages/services/ServicesPage'))
const AboutPage = lazy(() => import('@/pages/about/AboutPage'))
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
    path: '/setup',
    element: (
      <Suspense fallback={<Loader />}>
        <SetupPage />
      </Suspense>
    ),
  },
  {
    path: '/doctors/prasanna',
    element: (
      <Suspense fallback={<Loader />}>
        <DrPrasannaPage />
      </Suspense>
    ),
  },
  {
    path: '/hospital-tour',
    element: (
      <Suspense fallback={<Loader />}>
        <HospitalTourPage />
      </Suspense>
    ),
  },
  {
    path: '/specialties',
    element: (
      <Suspense fallback={<Loader />}>
        <SpecialtiesPage />
      </Suspense>
    ),
  },
  {
    path: '/services',
    element: (
      <Suspense fallback={<Loader />}>
        <ServicesPage />
      </Suspense>
    ),
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<Loader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: '/doctors/lakshmi',
    element: (
      <Suspense fallback={<Loader />}>
        <DrLakshmiPage />
      </Suspense>
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
