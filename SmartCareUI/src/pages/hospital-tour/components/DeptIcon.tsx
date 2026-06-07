import type { DeptIconName } from '../data/departments'

interface DeptIconProps {
  name: DeptIconName
  className?: string
}

/**
 * Department line glyphs — 24×24, stroke `currentColor`, weight 1.6 — matching
 * the cinematic card-deck handoff. Colour is inherited from the icon tile.
 */
export function DeptIcon({ name, className }: DeptIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {PATHS[name]}
    </svg>
  )
}

const PATHS: Record<DeptIconName, React.ReactNode> = {
  // Conical lab flask.
  lab: (
    <>
      <path d="M10 2v7.31" />
      <path d="M14 9.3V2" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      <path d="M5.58 16.5h12.85" />
    </>
  ),
  // X-ray / scan frame — corner brackets + a horizontal scan line.
  radiology: (
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </>
  ),
  // Physiotherapy — activity / pulse line.
  physio: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  // Orthopaedics — bone.
  ortho: (
    <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" />
  ),
  // Gynaecology — venus symbol.
  gynae: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </>
  ),
  // Ultrasound — emanating scan waves.
  ultrasound: (
    <>
      <path d="M5 14a7 7 0 0 1 14 0" />
      <path d="M8.5 14a3.5 3.5 0 0 1 7 0" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  // Operation theatre — medical cross in a rounded frame.
  surgery: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </>
  ),
  // Pharmacy — capsule pill (from the handoff icon set).
  pharmacy: (
    <>
      <rect x="3.2" y="8" width="17.6" height="8" rx="4" />
      <path d="M12 8v8" />
    </>
  ),
}
