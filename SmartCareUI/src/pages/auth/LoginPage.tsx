import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useLogin } from '@/hooks/useLogin'
import logoImg from '@/assets/images/Logo.png'

/* ── Validation schema ────────────────────────────────────────────────── */

const schema = z.object({
  email:    z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

/* ── Icons ────────────────────────────────────────────────────────────── */

function EnvelopeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="text-gray-400"
    >
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="text-gray-400"
    >
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 9V6a3 3 0 116 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 3l14 14M8.46 8.46A3 3 0 0011.54 11.54M6.1 6.1C3.9 7.45 2 10 2 10s3 6 8 6c1.5 0 2.87-.4 4.05-1.05M14.4 14.4C16.3 13 18 10 18 10s-3-6-8-6c-.84 0-1.65.13-2.4.37"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  )
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { submitLogin, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => submitLogin(values)

  return (
    /* ── Outer: full-screen dark-green background ──────────────────── */
    <div className="min-h-screen bg-[#132b1a] flex items-center justify-center px-4 py-12">

      {/* ── Card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 md:p-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-8 gap-3">
          <img
            src={logoImg}
            alt="Spandana Hospital logo"
            className="h-16 w-auto object-contain"
          />
          <span className="text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
            Staff Portal
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#111111] leading-tight">
            Welcome Back
          </h1>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#333333]"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <EnvelopeIcon />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@hospital.com"
                {...register('email')}
                className={cn(
                  'w-full pl-10 pr-4 rounded-xl border bg-white text-base text-[#111111]',
                  'min-h-[44px] placeholder:text-gray-400 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-[#0F6E56]',
                  errors.email
                    ? 'border-red-400'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#333333]"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={cn(
                  'w-full pl-10 pr-12 rounded-xl border bg-white text-base text-[#111111]',
                  'min-h-[44px] placeholder:text-gray-400 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-[#0F6E56]',
                  errors.password
                    ? 'border-red-400'
                    : 'border-gray-200 hover:border-gray-300',
                )}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 min-w-[44px] justify-end"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'bg-brand-dark text-white font-semibold rounded-xl min-h-[44px]',
              'transition-colors hover:bg-teal-800',
              'disabled:opacity-70 disabled:cursor-not-allowed',
            )}
          >
            {isPending ? (
              <>
                <Spinner />
                <span>Signing in…</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Server error banner */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}
        </form>

        {/* ── Patient redirect ────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Not a staff member?{' '}
            <Link
              to="/my-appointment"
              className="text-[#0F6E56] font-medium hover:underline"
            >
              Looking for your appointment? →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
