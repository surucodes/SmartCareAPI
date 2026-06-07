import { motion, type MotionValue } from 'motion/react'

export interface EducationColumnData {
  bg: string
  img: string
  alt: string
  imgFilter: string
  imgOverlay: string
  label: string
  labelClass: string
  nameLines: [string, string]
  nameClass: string
  degree: string
  degreeClass: string
  ruleClass: string
  year: string
  yearClass: string
  body: string
  bodyClass: string
}

interface EducationColumnProps {
  data: EducationColumnData
  translateY: MotionValue<string>
  /** Phase-2 rightward exit — each column sweeps independently so they stack. */
  translateX: MotionValue<string>
  opacity: MotionValue<number>
  /** Stacking order during the exit (leftmost column rides on top). */
  zIndex: number
}

export function EducationColumn({
  data,
  translateY,
  translateX,
  opacity,
  zIndex,
}: EducationColumnProps) {
  return (
    <motion.div
      style={{ x: translateX, y: translateY, opacity, zIndex, backgroundColor: data.bg }}
      className="relative h-full flex-1 overflow-hidden"
    >
      {/* Image — top 60% of the column. */}
      <div className="relative h-[60%] w-full overflow-hidden">
        <img
          src={data.img}
          alt={data.alt}
          className="h-full w-full object-cover"
          style={{ filter: data.imgFilter }}
        />
        <div
          className="absolute inset-0"
          style={{ background: data.imgOverlay }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 md:p-6">
          <p
            className={`font-cormorant text-[10px] uppercase tracking-[0.2em] md:text-xs md:tracking-[0.3em] ${data.labelClass}`}
          >
            {data.label}
          </p>
          <h3
            className={`mt-1.5 font-playfair text-lg font-bold leading-tight sm:text-2xl md:mt-2 md:text-3xl ${data.nameClass}`}
          >
            {data.nameLines[0]}
            <br />
            {data.nameLines[1]}
          </h3>
          <p
            className={`mt-1 font-cormorant text-xs italic sm:text-sm md:text-base ${data.degreeClass}`}
          >
            {data.degree}
          </p>
          <div className={`mt-3 h-px w-8 md:mt-4 ${data.ruleClass}`} />
        </div>
      </div>

      {/* Below image — bottom 40% of the column. */}
      <div className="h-[40%] p-3 sm:p-5 md:p-6">
        <p
          className={`font-playfair text-3xl font-black leading-none opacity-40 sm:text-4xl md:text-5xl ${data.yearClass}`}
        >
          {data.year}
        </p>
        <p
          className={`mt-2 max-w-xs font-cormorant text-xs leading-relaxed sm:text-sm md:mt-4 ${data.bodyClass}`}
        >
          {data.body}
        </p>
      </div>
    </motion.div>
  )
}
