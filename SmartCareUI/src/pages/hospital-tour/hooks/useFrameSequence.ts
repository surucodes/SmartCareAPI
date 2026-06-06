import { useEffect, useRef, useState } from 'react'

export const TOTAL_FRAMES = 192

export interface FrameSequenceResult {
  /** Fully-decoded frame images, index 0 → frame 001, index 119 → frame 120. */
  frames: HTMLImageElement[]
  isLoaded: boolean
  /** 0 → 1 */
  loadProgress: number
}

/**
 * Eagerly resolve every frame URL at build time. Vite returns a map of
 * { absolutePath: url }. The frames live in a nested folder whose name is the
 * original ezgif export id — the filenames are zero-padded so an alphabetical
 * sort equals numerical order (001 → 120).
 */
const frameUrlMap = import.meta.glob<string>(
  '../../../assets/images/HospitalAssets/ezgif-1538aed688ee4782-jpg/ezgif-frame-*.jpg',
  { eager: true, query: '?url', import: 'default' }
)

const orderedFrameUrls: string[] = Object.keys(frameUrlMap)
  .sort()
  .map((key) => frameUrlMap[key])

/**
 * Loads and decodes all 120 frames into memory before the experience begins.
 * The decoded HTMLImageElement[] is held in a ref so it survives re-renders
 * without being garbage collected, then surfaced via state once ready.
 */
export function useFrameSequence(enabled = true): FrameSequenceResult {
  const framesRef = useRef<HTMLImageElement[]>([])
  const [frames, setFrames] = useState<HTMLImageElement[]>([])
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const total = orderedFrameUrls.length || TOTAL_FRAMES
    let completed = 0

    const loadOne = (url: string): Promise<HTMLImageElement> => {
      const img = new Image()
      img.src = url
      // decode() resolves only once the bitmap is ready to paint to canvas.
      return img
        .decode()
        .catch(() => undefined)
        .then(() => {
          completed += 1
          if (!cancelled) setLoadProgress(completed / total)
          return img
        })
    }

    Promise.all(orderedFrameUrls.map(loadOne)).then((loaded) => {
      if (cancelled) return
      framesRef.current = loaded
      setFrames(loaded)
      setLoadProgress(1)
      setIsLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { frames, isLoaded, loadProgress }
}
