## 1. `useLogin` hook

- [x] 1.1 Create `SmartCareUI/src/hooks/useLogin.ts`. Define a `useLogin()` function that calls `useMutation` wrapping `authService.login()`. In `onSuccess`, call `useAuth().login({ email, role, token })` then `navigate(role === 'Admin' ? '/admin' : '/doctor')`. Expose `{ submitLogin, isPending, error }` where `error` is a human-readable string derived from the Axios response (`401` → "Invalid email or password", other → "Something went wrong. Please try again.").

## 2. `LoginPage` component

- [x] 2.1 Replace the stub in `SmartCareUI/src/pages/auth/LoginPage.tsx` with the full component. Import `useLogin`, `useForm` (RHF), `zodResolver`, `z`, `Link`, `cn`. Define Zod schema: `email` — valid email; `password` — `min(6)`. Call `useForm` with `zodResolver`.
- [x] 2.2 Render outer layout: `<div>` with `min-h-screen bg-[#132b1a] flex items-center justify-center px-4`. Inside, a white `rounded-2xl shadow-xl` card capped at `max-w-md w-full p-8 md:p-10`.
- [x] 2.3 Card header: hospital logo (`Logo.png`), "STAFF PORTAL" label in `text-xs font-semibold tracking-widest text-[#C9A227] uppercase`, "Welcome Back" heading in `font-serif text-3xl font-bold text-[#111111]`.
- [x] 2.4 Email field: label "Email Address", `<input type="email">` with inline SVG envelope icon on the left (icon container `pl-10`). Apply `min-h-[44px] text-base` (resolves to 16px). Show `errors.email.message` inline below.
- [x] 2.5 Password field: label "Password", `<input>` whose `type` is controlled by `showPassword` boolean state (toggle between `"password"` and `"text"`). Inline SVG lock icon on the left. Toggle button on the right with `aria-label={showPassword ? 'Hide password' : 'Show password'}` and inline SVG eye/eye-off icon. Apply `min-h-[44px] text-base`. Show `errors.password.message` inline below.
- [x] 2.6 Sign In button: full-width, `bg-brand-dark text-white font-semibold rounded-xl min-h-[44px]`, disabled + spinner when `isPending` (use an SVG `animate-spin` circle). Label "Sign In" when idle.
- [x] 2.7 Server error banner: render below the button when `useLogin` returns a non-null `error` string. Use `bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm`.
- [x] 2.8 Patient redirect link at bottom of card: `<Link to="/my-appointment">` labelled "Looking for your appointment? →" in `text-sm text-[#0F6E56]`.

## 3. Router update

- [x] 3.1 Create `SmartCareUI/src/pages/setup/SetupPage.tsx` stub: `export default function SetupPage() { return <div>Setup — coming soon</div> }`.
- [x] 3.2 In `SmartCareUI/src/router/index.tsx`, add a lazy import for `SetupPage` and register the `/setup` route (unprotected, same `Suspense`/`Loader` wrapper as other stubs).

## 4. Verification

- [x] 4.1 Run `npm run build` in `SmartCareUI/` and confirm zero TypeScript errors and zero new warnings.
- [x] 4.2 Manually verify: navigate to `/admin` while unauthenticated — confirm redirect to `/login` and the full login UI renders (not the stub).
- [x] 4.3 Manually verify: submit the form with empty fields — confirm inline validation errors appear without a network request.
- [x] 4.4 Manually verify: submit with invalid credentials — confirm the error banner appears and the button re-enables.
- [x] 4.5 Manually verify: submit with valid admin credentials — confirm redirect to `/admin` without a full page reload and `window.__smartcare_token` is set.
- [x] 4.6 Manually verify: click the patient redirect link — confirm navigation to `/my-appointment`.
- [x] 4.7 Manually verify: navigate to `/setup` — confirm the stub renders without errors.

<!-- 4.2–4.7 require a running dev server and real/test credentials. -->
