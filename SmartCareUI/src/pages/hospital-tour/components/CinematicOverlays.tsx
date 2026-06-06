// Atmospheric layers stacked over the canvas. Together they turn the low-res
// 720p frames into intentional moody cinema: a colour grade unifies the tones,
// a teal key-light sets the brand mood, a vignette pulls focus to centre,
// animated film grain masks the JPEG compression artefacts, and letterbox bars
// give the 2.4:1 cinema crop (also hiding the worst top/bottom edges).

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function CinematicOverlays() {
  return (
    <>
      {/* Vertical colour grade — deep at top & bottom, clear through the middle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,14,12,0.7) 0%, rgba(10,10,10,0) 28%, rgba(10,10,10,0) 68%, rgba(6,14,12,0.78) 100%)',
        }}
      />

      {/* Teal key-light — soft-light blend ties everything to the brand palette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            'radial-gradient(120% 85% at 50% 42%, rgba(15,110,86,0.55) 0%, rgba(10,10,10,0) 60%)',
        }}
      />

      {/* Vignette — darkens the edges, focuses the eye, hides edge artefacts.
          Sits above the starfield + cards so the corners fall away cleanly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            'radial-gradient(ellipse 78% 78% at 50% 47%, transparent 38%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      {/* Animated film grain — high-frequency noise reads as "film", not "JPEG". */}
      <div
        aria-hidden
        className="tour-grain pointer-events-none absolute inset-[-50%] z-[31] h-[200%] w-[200%] opacity-[0.13] mix-blend-overlay"
        style={{ backgroundImage: NOISE_SVG, backgroundSize: '170px 170px' }}
      />

      {/* Cinematic letterbox bars — topmost chrome. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[6vh] bg-[#0A0A0A] md:h-[8vh]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[6vh] bg-[#0A0A0A] md:h-[8vh]" />
    </>
  )
}
