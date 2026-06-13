import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { useLenis } from '@/hooks/useLenis'
import { useLifeEngine } from './useLifeEngine'
import type {
  DoctorProfileData,
  JourneyNode,
  LifelineTick,
} from './doctorProfiles'
import './lifeInPractice.css'

const DARK_BG = '#0c0b09'
const CREAM_BG = '#efe9dd'

/** Render a content string, wrapping any <em>…</em> span as gold-italic. */
function renderEm(s: string): ReactNode {
  return s.split(/(<em>.*?<\/em>)/g).map((part, i) => {
    const match = part.match(/^<em>(.*?)<\/em>$/)
    return match ? (
      <em key={i}>{match[1]}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  })
}

/** Join multi-line copy with <br/>, honouring <em> emphasis per line. */
function renderLines(lines: string[]): ReactNode {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderEm(line)}
    </Fragment>
  ))
}

interface DoctorBiographyProps {
  data: DoctorProfileData
}

export function DoctorBiography({ data }: DoctorBiographyProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  // Lenis eases the document scroll; the engine reads scroll position each
  // frame. Disabled (null ref) under reduced-motion so native scroll is used.
  const lenisRef = useLenis(!prefersReducedMotion)
  useLifeEngine(rootRef, prefersReducedMotion, data.id)

  // Each profile lands at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [data.id])

  const scrollToTick = (at: number) => {
    const target = document.documentElement.scrollHeight * at
    const lenis = lenisRef.current
    if (lenis) lenis.scrollTo(target, { duration: 1.6 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  const { hero, origins, education, practice, roots, ticks, otherDoctor } = data

  return (
    <div className="life-in-practice" ref={rootRef}>
      {/* Fixed background-colour journey + film grain. */}
      <div className="bg-journey" id="bgJourney" />
      <div className="grain" id="grain" />

      {/* LIFELINE — left progress rail with jump-to-chapter ticks. */}
      <div className="lifeline" id="lifeline" aria-hidden>
        <div className="lifeline__track" />
        <div className="lifeline__fill" id="lifelineFill" />
        <div className="lifeline__ticks" id="lifelineTicks">
          {ticks.map((t: LifelineTick) => (
            <button
              key={`${t.year}-${t.label}`}
              type="button"
              className="tick"
              data-tick={t.at}
              style={{ top: `${t.at * 100}%` }}
              onClick={() => scrollToTick(t.at)}
              aria-label={`Jump to ${t.label} (${t.year})`}
            >
              <span className="tick__dot" />
              <span className="tick__meta">
                <span className="tick__year">{t.year}</span>
                <span className="tick__label">{t.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="stage" id="stage">
        {/* ===== CHAPTER I — THE DOCTOR ===== */}
        <section className="scene c-hero" id="chHero" data-bg={DARK_BG}>
          <div className="c-hero__pin">
            <div className="c-hero__photo" id="heroPhoto">
              <img src={hero.portrait} alt={hero.portraitAlt} />
            </div>
            <div className="c-hero__vignette" />

            <div className="c-hero__top" id="heroTop">
              <span className="c-hero__name-mini">{hero.nameMini}</span>
            </div>

            <div className="c-hero__copy" id="heroCopy">
              <div className="c-hero__pretitle">
                <hr className="hairline rule" />
                <span className="eyebrow">{hero.pretitle}</span>
              </div>
              <h1 className="display c-hero__title" id="heroTitle">
                {hero.titleLines.map((line, i) => (
                  <span className="ln" key={i}>
                    <span>{renderEm(line)}</span>
                  </span>
                ))}
              </h1>
              <p className="c-hero__stand">{hero.stand}</p>
            </div>

            <div className="scroll-cue" id="scrollCue" aria-hidden>
              <span className="scroll-cue__txt">Begin</span>
              <span className="scroll-cue__line" />
            </div>
          </div>
        </section>

        {/* ===== CHAPTER II — THE ORIGINS ===== */}
        <section className="scene c-origins" id="chOrigins" data-bg={DARK_BG}>
          <div className="c-origins__pin">
            <div className="ghost-year" id="ghostYear">
              {origins.year}
            </div>
            <figure className="plate" id="originPlate">
              <div className="plate__frame">
                <img src={origins.img} alt={origins.alt} id="originImg" loading="lazy" decoding="async" />
              </div>
              <div className="plate__edge" />
            </figure>
            <figcaption className="c-origins__caption" id="originCaption">
              <p className="c-origins__index">{origins.index}</p>
              <h2 className="display c-origins__place">
                {renderLines(origins.placeLines)}
              </h2>
              <p className="c-origins__body">{origins.body}</p>
            </figcaption>
          </div>
        </section>

        {/* ===== CHAPTER III — THE MAKING ===== */}
        <section className="scene c-edu" id="chEdu" data-bg={DARK_BG}>
          <div className="c-edu__pin">
            <div className="c-edu__marker" id="eduHead">
              <span className="eyebrow">{education.marker}</span>
            </div>

            <div className="reel" id="reel">
              <article className="reel__intro">
                <span className="eyebrow">{education.introEyebrow}</span>
                <h2 className="reel__intro-title">
                  {education.introHead[0]}
                  <span className="d">{education.introHead[1]}</span>
                  {education.introHead[2]}
                </h2>
                <p className="reel__intro-body">{education.introBody}</p>
                <span className="reel__intro-cue">{education.introCue}</span>
              </article>

              {education.cards.map((card) => (
                <article
                  key={card.no}
                  className={`reel__card${card.tall ? ' tall' : ''}`}
                >
                  <div className="reel__img">
                    <span className="reel__no">{card.no}</span>
                    <img src={card.img} alt={card.alt} loading="lazy" decoding="async" />
                    <div className="reel__cap">
                      <div className="reel__yr">{card.year}</div>
                      <h3 className="reel__name">{renderLines(card.nameLines)}</h3>
                      <div className="reel__deg">{card.degree}</div>
                    </div>
                  </div>
                  <p className="reel__body">
                    {card.body}
                    <span className="reel__rule" />
                  </p>
                </article>
              ))}
            </div>

            <div className="reel-dots" id="reelDots" aria-hidden>
              {education.cards.map((card, i) => (
                <i key={card.no} className={i === 0 ? 'on' : undefined} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== CHAPTER IV — THE PRACTICE ===== */}
        <section className="scene c-practice" id="chPractice" data-bg={CREAM_BG}>
          <div className="wrap">
            <div className="marriage">
              <div className="marriage__ghost" id="marriageGhost">
                {practice.marriageYear}
              </div>
              <div className="marriage__inner">
                <span className="eyebrow">{practice.marriageEyebrow}</span>
                <p className="marriage__line">
                  {renderLines(practice.marriageLines)}
                </p>
              </div>
              <div className="marriage__rule" />
            </div>

            <div className="journey">
              <svg
                className="journey__line"
                id="journeyLine"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="jlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop className="jl-stop-a" offset="0" />
                    <stop className="jl-stop-b" offset="1" />
                  </linearGradient>
                </defs>
                <path className="journey__track" id="journeyTrack" d="" />
                <path className="journey__prog" id="journeyProg" d="" />
                <circle className="journey__head" id="journeyHead" r="4.5" />
              </svg>
              <div className="journey__label">{practice.journeyLabel}</div>

              {practice.nodes.map((node, i) => (
                <Milestone key={node.place} node={node} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== CHAPTER V — THE ROOTS ===== */}
        <section className="scene c-roots" id="chRoots" data-bg={DARK_BG}>
          <div className="roots__media" id="rootsMedia">
            <div className="roots__frame" id="rootsFrame">
              <img src={roots.img} alt={roots.alt} loading="lazy" decoding="async" />
              <div className="roots__head">
                <h2>{renderLines(roots.headLines)}</h2>
              </div>
            </div>
          </div>

          <p className="roots__sub rise" id="rootsSub">
            {roots.sub}
          </p>

          <div className="roots__links rise" id="rootsLinks">
            <Link className="link-doctor" to={otherDoctor.href}>
              <span className="ln" />
              Continue to {otherDoctor.name}
              <span className="arr">→</span>
            </Link>
            <Link className="link-home" to="/">
              Return to all doctors
            </Link>
          </div>

          <div className="footer-mark">{roots.footer}</div>
        </section>
      </main>
    </div>
  )
}

/**
 * One career-timeline row. The place name and body copy swap sides on alternate
 * rows; the centred node column carries the year and the travelling-line dot.
 * DOM order (place / centre / body) is preserved so the CSS nth-child alignment
 * rules resolve exactly as in the handoff.
 */
function Milestone({ node, index }: { node: JourneyNode; index: number }) {
  const placeOnLeft = index % 2 === 1

  const center = (
    <div className="milestone__center">
      <span className="milestone__yr">{node.years}</span>
      <span className="milestone__node" />
    </div>
  )
  const body = (
    <p className="milestone__txt">
      {node.body}
      {node.tag && (
        <>
          <br />
          <span className="milestone__tag">{node.tag}</span>
        </>
      )}
    </p>
  )
  const place = (
    <h3
      className="milestone__place"
      style={placeOnLeft ? { textAlign: 'right' } : undefined}
    >
      {node.place}
    </h3>
  )

  return (
    <div
      className={`milestone${node.current ? ' current' : ''}`}
      data-current={node.current ? 'true' : 'false'}
    >
      <div className="milestone__col-left milestone__main">
        {placeOnLeft ? place : body}
      </div>
      {center}
      <div className="milestone__main">{placeOnLeft ? body : place}</div>
    </div>
  )
}
