import type { EducationColumnData } from './components/EducationColumn'

// ── Prasanna assets ──────────────────────────────────────────────────
import prasannaHero from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/DoctorHeroBeforeSplitFirstSection.png'
import villageImg from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/AfterSplitImage.jpeg'
import nationalCollege from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/NationalCollege(Column card firstimage).png'
import bellaryCollege from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/BellaryMedicalCollegeMBBS(column card 2nd image).png'
import kmcHubliPrasanna from '@/assets/images/DoctorPortfolioImages/Dr.PrasannaRelatedImages/KMCHubli(3rdColumn image).png'

// ── Lakshmi assets ───────────────────────────────────────────────────
import lakshmiHero from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/DrLakshmiHero.png'
import mmArtsCollege from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/MMArtsCollege.png'
import jnmcCollege from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/JNMC.png'
import kmcHubliLakshmi from '@/assets/images/DoctorPortfolioImages/DrLakshmiRelatedImages/KMCHubli.png'

export interface HeroData {
  heroImg: string
  afterSplitImg: string
  heroAlt: string
  villageAlt: string
  preTitle: string
  titleLines: [string, string]
  bodyText: string
  originPlaceYear: string
}

export interface OtherDoctor {
  name: string
  href: string
}

export interface DoctorProfileData {
  /** Used as the unique key so route changes fully remount the page. */
  id: string
  hero: HeroData
  columns: EducationColumnData[]
  otherDoctor: OtherDoctor
}

export const prasannaProfile: DoctorProfileData = {
  id: 'prasanna',
  hero: {
    heroImg: prasannaHero,
    afterSplitImg: villageImg,
    heroAlt: 'Dr. Prasanna N.M, Orthopaedic Surgeon',
    villageAlt: 'The family home in Nisarani, Karnataka',
    preTitle: 'Orthopaedic Surgeon · Sagara, Karnataka',
    titleLines: ['Four Decades', 'of Healing.'],
    bodyText:
      'From the village of Nisarani to four decades of orthopaedic surgery.',
    originPlaceYear: 'Nisarani, Karnataka — 1969',
  },
  columns: [
    {
      bg: '#111111',
      img: nationalCollege,
      alt: 'National College, Basavanagudi, Bengaluru',
      imgFilter: 'grayscale(1)',
      imgOverlay: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
      label: 'Pre-Medical · Bengaluru',
      labelClass: 'text-stone-400',
      nameLines: ['National College', 'Basavanagudi'],
      nameClass: 'text-white',
      degree: 'Pre-Medical',
      degreeClass: 'text-stone-400',
      ruleClass: 'bg-stone-600',
      year: '1984',
      yearClass: 'text-stone-600',
      body: 'From a village classroom to the city. The first step away from Nisarani.',
      bodyClass: 'text-stone-500',
    },
    {
      bg: '#1A1208',
      img: bellaryCollege,
      alt: 'Bellary Medical College',
      imgFilter: 'grayscale(0.6) sepia(0.5)',
      imgOverlay:
        'linear-gradient(to top, rgba(26,18,8,0.92) 0%, transparent 55%)',
      label: 'MBBS · Bellary, Karnataka',
      labelClass: 'text-amber-700/80',
      nameLines: ['Bellary Medical', 'College'],
      nameClass: 'text-amber-100',
      degree: 'Bachelor of Medicine & Surgery',
      degreeClass: 'text-amber-300/70',
      ruleClass: 'bg-amber-800/60',
      year: '1986',
      yearClass: 'text-amber-900/50',
      body: 'Five years. One direction. Every ward round building the hands that would one day repair what time had broken.',
      bodyClass: 'text-amber-200/50',
    },
    {
      bg: '#0D1A14',
      img: kmcHubliPrasanna,
      alt: 'Kasturba Medical College, Hubli',
      imgFilter: 'grayscale(0.15)',
      imgOverlay:
        'linear-gradient(to top, rgba(13,26,20,0.92) 0%, transparent 55%)',
      label: 'D.Ortho · KMC Hubli',
      labelClass: 'text-teal-400/70',
      nameLines: ['Kasturba Medical', 'College, Hubli'],
      nameClass: 'text-teal-100',
      degree: 'Diploma in Orthopaedics',
      degreeClass: 'text-teal-300/70',
      ruleClass: 'bg-teal-700/60',
      year: '1993',
      yearClass: 'text-teal-900/60',
      body: 'Specialisation. The decision to give one discipline everything. The beginning of a life in orthopaedic surgery.',
      bodyClass: 'text-teal-200/60',
    },
  ],
  otherDoctor: { name: 'Dr. Lakshmi Hegde', href: '/doctors/lakshmi' },
}

export const lakshmiProfile: DoctorProfileData = {
  id: 'lakshmi',
  hero: {
    heroImg: lakshmiHero,
    afterSplitImg: villageImg,
    heroAlt: 'Dr. Lakshmi Hegde, Gynaecologist',
    villageAlt: 'A traditional Malnad home — Sirsi, Karnataka',
    preTitle: 'Gynaecologist · Sagara, Karnataka',
    titleLines: ['A Lifetime', 'of Care.'],
    bodyText: 'From the town of Sirsi to decades of women’s healthcare.',
    originPlaceYear: 'Sirsi, Karnataka — 1970',
  },
  columns: [
    {
      bg: '#111111',
      img: mmArtsCollege,
      alt: 'M.M. Arts & Science College, Sirsi',
      imgFilter: 'grayscale(1)',
      imgOverlay: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
      label: 'Pre-University · Sirsi',
      labelClass: 'text-stone-400',
      nameLines: ['M.M. Arts &', 'Science College'],
      nameClass: 'text-white',
      degree: 'Pre-University',
      degreeClass: 'text-stone-400',
      ruleClass: 'bg-stone-600',
      year: '1981',
      yearClass: 'text-stone-600',
      body: 'From a Malnad town to the sciences. The first step on the road to medicine.',
      bodyClass: 'text-stone-500',
    },
    {
      bg: '#1A1208',
      img: jnmcCollege,
      alt: 'J.N. Medical College, Belagavi',
      imgFilter: 'grayscale(0.6) sepia(0.5)',
      imgOverlay:
        'linear-gradient(to top, rgba(26,18,8,0.92) 0%, transparent 55%)',
      label: 'MBBS · Belagavi, Karnataka',
      labelClass: 'text-amber-700/80',
      nameLines: ['J.N. Medical', 'College'],
      nameClass: 'text-amber-100',
      degree: 'Bachelor of Medicine & Surgery',
      degreeClass: 'text-amber-300/70',
      ruleClass: 'bg-amber-800/60',
      year: '1988',
      yearClass: 'text-amber-900/50',
      body: 'Five years of medicine. The foundation of a life spent caring for women and the families they hold together.',
      bodyClass: 'text-amber-200/50',
    },
    {
      bg: '#0D1A14',
      img: kmcHubliLakshmi,
      alt: 'Kasturba Medical College, Hubli',
      imgFilter: 'grayscale(0.15)',
      imgOverlay:
        'linear-gradient(to top, rgba(13,26,20,0.92) 0%, transparent 55%)',
      label: 'D.G.O · KMC Hubli',
      labelClass: 'text-teal-400/70',
      nameLines: ['Kasturba Medical', 'College, Hubli'],
      nameClass: 'text-teal-100',
      degree: 'Diploma in Obstetrics & Gynaecology',
      degreeClass: 'text-teal-300/70',
      ruleClass: 'bg-teal-700/60',
      year: '1995',
      yearClass: 'text-teal-900/60',
      body: 'Specialisation in women’s health. The beginning of a life in obstetrics and gynaecology.',
      bodyClass: 'text-teal-200/60',
    },
  ],
  otherDoctor: { name: 'Dr. Prasanna N.M', href: '/doctors/prasanna' },
}
