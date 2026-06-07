import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface TourIntroOverlayProps {
  currentFrame: number
}

/**
 * "Step Inside" prompt shown over frame 001. Fades out for good once the user
 * begins scrolling past frame 2 — it never re-shows.
 */
export function TourIntroOverlay({ currentFrame }: TourIntroOverlayProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (currentFrame > 2) setDismissed(true)
  }, [currentFrame])

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
          }}
        >
          <div className="absolute inset-x-0 bottom-12 text-center">
            <p className="mb-4 font-cormorant text-xs uppercase tracking-[0.5em] text-stone-400">
              Spandana Hospital · Est. 2007
            </p>
            <h2 className="mb-6 font-playfair text-2xl font-bold text-white md:text-4xl">
              Step Inside.
            </h2>
            <p className="font-cormorant text-sm tracking-widest text-stone-400">
              scroll to enter
            </p>
            <motion.div
              className="mx-auto mt-3 w-fit"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 3v13M10 16l-5-5M10 16l5-5"
                  stroke="#a8a29e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
