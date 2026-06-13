// Content model for the "A Life in Practice" doctor-profile scrollytelling page.
// Mirrors the design handoff's `PROFILE` schema (design_handoff_life_in_practice/
// data.js) so the same engine renders either doctor purely from data.
//
// CLOUD_ASSET: every portrait/education/family image below is large (~2–3 MB)
// and is a candidate for CDN replacement. When a CDN is available, swap these
// local imports for CDN URLs (the values are only ever used as <img src>).
//
// Strings may contain a single <em>…</em> span — it marks the gold-italic
// emphasis word(s) and is rendered through `renderEm` in the components.

// ── Prasanna assets ──────────────────────────────────────────────────
import prasannaHero from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/DoctorHeroBeforeSplitFirstSection.png'
import prasannaVillage from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/AfterSplitImage.jpeg'
import nationalCollege from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/NationalCollege(Column card firstimage).png'
import bellaryCollege from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/BellaryMedicalCollegeMBBS(column card 2nd image).png'
import kmcHubliPrasanna from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/KMCHubli(3rdColumn image).png'
import prasannaFamily from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/grandparents.png'

// ── Lakshmi assets ───────────────────────────────────────────────────
import lakshmiHero from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/DrLakshmiHero.png'
import mmArtsCollege from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/MMArtsCollege.png'
import jnmcCollege from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/JNMC.png'
import kmcHubliLakshmi from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/KMCHubli.png'
import lakshmiVillage from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/Sirsi.png'
// PLACEHOLDER: Dr. Lakshmi has no dedicated family photograph yet, so the
// shared Malnad family image stands in. Swap for a Sirsi-specific family
// photograph when it is supplied.
const lakshmiFamily = prasannaFamily

export interface HeroContent {
  /** Centered mono name that fades out as the pin scrolls. */
  nameMini: string
  /** Gold eyebrow beside the hairline rule. */
  pretitle: string
  /** Masked display headline; each line is its own reveal row. */
  titleLines: string[]
  portrait: string
  portraitAlt: string
  /** Standfirst paragraph under the title. */
  stand: string
}

export interface OriginsContent {
  index: string
  img: string
  alt: string
  /** Display place name; one line may carry the gold <em> emphasis. */
  placeLines: string[]
  body: string
  /** Outlined ghost numeral, top-right. */
  year: string
}

export interface EducationCard {
  no: string
  img: string
  alt: string
  year: string
  nameLines: string[]
  degree: string
  body: string
  /** The taller centre card in the reel. */
  tall?: boolean
}

export interface EducationContent {
  /** Top-left chapter marker (e.g. "Ch. 02"). */
  marker: string
  introEyebrow: string
  /** [startYear, dash, endYear] — the dash renders gold italic. */
  introHead: [string, string, string]
  introBody: string
  introCue: string
  cards: EducationCard[]
}

export interface JourneyNode {
  years: string
  place: string
  body: string
  /** Pill caption on the current node. */
  tag?: string
  current?: boolean
}

export interface PracticeContent {
  marriageEyebrow: string
  /** Centre display lines; one may carry the gold <em> emphasis. */
  marriageLines: string[]
  marriageYear: string
  journeyLabel: string
  nodes: JourneyNode[]
}

export interface RootsContent {
  img: string
  alt: string
  /** Closing dedication headline; one line carries the gold <em> emphasis. */
  headLines: string[]
  sub: string
  footer: string
}

export interface LifelineTick {
  /** Position down the page, 0–1. */
  at: number
  year: string
  label: string
}

export interface OtherDoctor {
  name: string
  href: string
}

export interface DoctorProfileData {
  /** Unique key so a route change fully remounts (and re-runs) the page. */
  id: string
  hero: HeroContent
  origins: OriginsContent
  education: EducationContent
  practice: PracticeContent
  roots: RootsContent
  ticks: LifelineTick[]
  otherDoctor: OtherDoctor
}

export const prasannaProfile: DoctorProfileData = {
  id: 'prasanna',
  hero: {
    nameMini: 'Dr. Prasanna N.M',
    pretitle: 'Orthopaedic Surgeon · Sagara, Karnataka',
    titleLines: ['Four', 'Decades of', '<em>Healing.</em>'],
    portrait: prasannaHero,
    portraitAlt: 'Dr. Prasanna N.M, Orthopaedic Surgeon',
    stand:
      'From a tiled house in the Malnad hills to four decades in the operating theatre — a life spent setting bone, and people, back in place.',
  },
  origins: {
    index: 'Ch. 01 — The Origins',
    img: prasannaVillage,
    alt: 'The family home in Nisarani, Karnataka',
    placeLines: ['Nisarani,', '<em>Karnataka.</em>'],
    body: 'A village of areca palms and red-tiled roofs, deep in the Malnad. This is the house he was born into — and the distance he would travel from it is the rest of this story.',
    year: '1969',
  },
  education: {
    marker: 'Ch. 02',
    introEyebrow: 'The Making of a Surgeon',
    introHead: ['1984', '—', '1993'],
    introBody:
      'Nine years, three institutions. The slow forging of a pair of hands that would spend the next four decades repairing what time and accident had broken.',
    introCue: 'Three chapters →',
    cards: [
      {
        no: 'N° 01',
        img: nationalCollege,
        alt: 'National College, Basavanagudi, Bengaluru',
        year: '1984',
        nameLines: ['National College', 'Basavanagudi'],
        degree: 'Pre-Medical · Bengaluru',
        body: 'The first step away from the village. A city classroom, and the long road toward medicine begins.',
      },
      {
        no: 'N° 02',
        img: bellaryCollege,
        alt: 'Bellary Medical College',
        tall: true,
        year: '1986',
        nameLines: ['Bellary Medical', 'College'],
        degree: 'MBBS · Bellary, Karnataka',
        body: 'Five years, one direction. Every ward round shaping the hands that would one day repair what time had broken.',
      },
      {
        no: 'N° 03',
        img: kmcHubliPrasanna,
        alt: 'Kasturba Medical College, Hubli',
        year: '1993',
        nameLines: ['Kasturba Medical', 'College, Hubli'],
        degree: 'D.Ortho · Diploma in Orthopaedics',
        body: 'Specialisation. One discipline, given everything — the beginning of a life in orthopaedic surgery.',
      },
    ],
  },
  practice: {
    marriageEyebrow: 'Hubli · 1995',
    marriageLines: [
      'Two doctors. One family.',
      '<em>The year that changed everything.</em>',
    ],
    marriageYear: '1995',
    journeyLabel: 'The Practice',
    nodes: [
      {
        years: '1995 — 2000',
        place: 'Kerala',
        body: 'Early practice. Building experience, and a reputation, far from home.',
      },
      {
        years: '2000 — 2007',
        place: 'Bhatkal',
        body: 'Coastal Karnataka. Seven years of quiet service and steady growth.',
      },
      {
        years: '2007 — Present',
        place: 'Sagara',
        body: 'Home, at last. Spandana Hospital — built from the ground up.',
        tag: 'Spandana Hospital · Est. 2007',
        current: true,
      },
    ],
  },
  roots: {
    img: prasannaFamily,
    alt: 'Family — the ones who made it possible',
    headLines: ['For the ones', 'who made it', '<em>possible.</em>'],
    sub: 'To the families of Nisarani — your sacrifices built all of this.',
    footer: 'Spandana Hospital · Sagara, Karnataka',
  },
  ticks: [
    { at: 0.02, year: '1969', label: 'Born' },
    { at: 0.22, year: '1984', label: 'Origins' },
    { at: 0.46, year: '1986', label: 'MBBS' },
    { at: 0.62, year: '1995', label: 'Practice' },
    { at: 0.9, year: 'Today', label: 'Roots' },
  ],
  otherDoctor: { name: 'Dr. Lakshmi Hegde', href: '/doctors/lakshmi' },
}

export const lakshmiProfile: DoctorProfileData = {
  id: 'lakshmi',
  hero: {
    nameMini: 'Dr. Lakshmi Hegde',
    pretitle: 'Gynaecologist · Sagara, Karnataka',
    titleLines: ['A Lifetime', 'of <em>Care.</em>'],
    portrait: lakshmiHero,
    portraitAlt: 'Dr. Lakshmi Hegde, Gynaecologist',
    stand:
      'From a Malnad town to a lifetime in women’s health — decades spent bringing new life safely into the world, and watching over the families who hold it together.',
  },
  origins: {
    index: 'Ch. 01 — The Origins',
    img: lakshmiVillage,
    alt: 'A traditional Malnad home — Sirsi, Karnataka',
    placeLines: ['Sirsi,', '<em>Karnataka.</em>'],
    body: 'A town of areca groves and temple streets in the heart of the Malnad. This is where she grew up — and the road she took from it runs through every chapter that follows.',
    year: '1970',
  },
  education: {
    marker: 'Ch. 02',
    introEyebrow: 'The Making of a Physician',
    introHead: ['1981', '—', '1995'],
    introBody:
      'Fourteen years, three institutions. The patient shaping of a doctor who would devote her life to the health of women and the families they carry.',
    introCue: 'Three chapters →',
    cards: [
      {
        no: 'N° 01',
        img: mmArtsCollege,
        alt: 'M.M. Arts & Science College, Sirsi',
        year: '1981',
        nameLines: ['M.M. Arts &', 'Science College'],
        degree: 'Pre-University · Sirsi',
        body: 'The first step beyond the Malnad town. A classroom in the sciences, and the long road toward medicine begins.',
      },
      {
        no: 'N° 02',
        img: jnmcCollege,
        alt: 'J.N. Medical College, Belagavi',
        tall: true,
        year: '1988',
        nameLines: ['J.N. Medical', 'College'],
        degree: 'MBBS · Belagavi, Karnataka',
        body: 'Five years, one calling. Every ward round deepening the resolve to care for women through the most fragile passages of life.',
      },
      {
        no: 'N° 03',
        img: kmcHubliLakshmi,
        alt: 'Kasturba Medical College, Hubli',
        year: '1995',
        nameLines: ['Kasturba Medical', 'College, Hubli'],
        degree: 'D.G.O · Obstetrics & Gynaecology',
        body: 'Specialisation in women’s health — the beginning of a life in obstetrics and gynaecology.',
      },
    ],
  },
  practice: {
    marriageEyebrow: 'Hubli · 1995',
    marriageLines: [
      'Two doctors. One family.',
      '<em>The year that changed everything.</em>',
    ],
    marriageYear: '1995',
    journeyLabel: 'The Practice',
    nodes: [
      {
        years: '1995 — 2000',
        place: 'Kerala',
        body: 'Early practice. Building skill and trust in women’s care, far from home.',
      },
      {
        years: '2000 — 2007',
        place: 'Bhatkal',
        body: 'Coastal Karnataka. Seven years of safe deliveries and steady devotion to the families she served.',
      },
      {
        years: '2007 — Present',
        place: 'Sagara',
        body: 'Home, at last. Spandana Hospital — built together, from the ground up.',
        tag: 'Spandana Hospital · Est. 2007',
        current: true,
      },
    ],
  },
  roots: {
    img: lakshmiFamily,
    alt: 'Family — the ones who made it possible',
    headLines: ['For the ones', 'who made it', '<em>possible.</em>'],
    sub: 'To the families of Sirsi — your faith and sacrifice made all of this possible.',
    footer: 'Spandana Hospital · Sagara, Karnataka',
  },
  ticks: [
    { at: 0.02, year: '1970', label: 'Born' },
    { at: 0.22, year: '1981', label: 'Origins' },
    { at: 0.46, year: '1988', label: 'MBBS' },
    { at: 0.62, year: '1995', label: 'Practice' },
    { at: 0.9, year: 'Today', label: 'Roots' },
  ],
  otherDoctor: { name: 'Dr. Prasanna N.M', href: '/doctors/prasanna' },
}
