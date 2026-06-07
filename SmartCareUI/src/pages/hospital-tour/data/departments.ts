// CLOUD_ASSET: department photos below are large (~1–2 MB each); replace with
// CDN URLs when available (values are only used as <img src>).
import orthoImg from '@/assets/images/HospitalAssets/OrthoOPD.png'
import gynaeImg from '@/assets/images/HospitalAssets/GynaeOPD.png'
import physioImg from '@/assets/images/HospitalAssets/Physiotherapy.png'
import ultrasoundImg from '@/assets/images/HospitalAssets/Ultrasound.png'
import xrayImg from '@/assets/images/HospitalAssets/Xray.png'
import cArmImg from '@/assets/images/HospitalAssets/C arm machine.png'
import labImg from '@/assets/images/HospitalAssets/Laboratory.png'
import pharmacyImg from '@/assets/images/HospitalAssets/pharmacy.png'

export type DeptIconName =
  | 'lab'
  | 'radiology'
  | 'physio'
  | 'ortho'
  | 'gynae'
  | 'ultrasound'
  | 'surgery'
  | 'pharmacy'

export interface Department {
  id: string
  /** Card title — the department / facility name. */
  name: string
  /** Short accent tag shown top-right of the card. */
  tag: string
  /** Floor / location line. */
  floor: string
  /** One-line description (mobile + reduced-motion views). */
  description: string
  /** Which line-glyph to render in the meta block. */
  icon: DeptIconName
  /** Imported department photo (card background). */
  image: string
  /** `background-position` focal point so the subject stays clear of the scrim. */
  focal: string
}

/**
 * Specialities in the order they rise into focus during the scroll tour:
 * Ortho OPD -> Gynae OPD -> X-Ray -> Ultrasound -> Operation Theatre (C-Arm)
 * -> Laboratory -> Physiotherapy -> Pharmacy.
 */
export const departments: Department[] = [
  {
    id: 'ortho-opd',
    name: 'Orthopaedic OPD',
    tag: 'Bone & Joint',
    floor: 'First Floor',
    description:
      'Consultations, fracture care, and post-surgical follow-up with our orthopaedic surgeon.',
    icon: 'ortho',
    image: orthoImg,
    focal: '50% 42%',
  },
  {
    id: 'gynae-opd',
    name: 'Gynaecology OPD',
    tag: "Women's Health",
    floor: 'First Floor',
    description:
      "Antenatal care and women's-health consultations with our gynaecologist.",
    icon: 'gynae',
    image: gynaeImg,
    focal: '50% 42%',
  },
  {
    id: 'xray',
    name: 'Digital X-Ray',
    tag: 'Radiology',
    floor: 'Ground Floor',
    description: 'On-site digital radiography with same-day reporting.',
    icon: 'radiology',
    image: xrayImg,
    focal: '50% 42%',
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound & Scanning',
    tag: 'Imaging',
    floor: 'First Floor',
    description: 'Obstetric and gynaecological ultrasound scanning, on-site.',
    icon: 'ultrasound',
    image: ultrasoundImg,
    focal: '50% 45%',
  },
  {
    id: 'operation-theatre',
    name: 'Operation Theatre',
    tag: 'Surgery · C-Arm',
    floor: 'First Floor',
    description:
      'A fully-equipped theatre with C-Arm fluoroscopy for orthopaedic and general surgery.',
    icon: 'surgery',
    image: cArmImg,
    focal: '50% 40%',
  },
  {
    id: 'laboratory',
    name: 'Pathology & Laboratory',
    tag: 'Diagnostics',
    floor: 'Ground Floor',
    description:
      'Full diagnostic laboratory and blood testing with same-day results.',
    icon: 'lab',
    image: labImg,
    focal: '50% 45%',
  },
  {
    id: 'physiotherapy',
    name: 'Physiotherapy',
    tag: 'Recovery',
    floor: 'Ground Floor',
    description:
      'Guided rehabilitation for mobility, strength, and lasting pain relief.',
    icon: 'physio',
    image: physioImg,
    focal: '50% 45%',
  },
  {
    id: 'pharmacy',
    name: 'In-House Pharmacy',
    tag: 'Dispensary',
    floor: 'Ground Floor · East Wing',
    description:
      'On-site dispensary stocked for all prescriptions — no separate trip needed.',
    icon: 'pharmacy',
    image: pharmacyImg,
    focal: '50% 45%',
  },
]
