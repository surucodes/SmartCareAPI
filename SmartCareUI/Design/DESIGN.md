---
name: Spandana Hospital Exact
colors:
  primary: '#132b1a'
  on-primary: '#ffffff'
  primary-container: '#1a3c2a'
  on-primary-container: '#a8d5b8'
  accent: '#C9A227'
  on-accent: '#ffffff'
  accent-light: '#f5e9c0'
  background: '#ffffff'
  on-background: '#111111'
  surface: '#ffffff'
  on-surface: '#111111'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f9fa'
  surface-container: '#f1f3f4'
  surface-container-high: '#e8ebee'
  surface-dim: '#d9dce0'
  text-primary: '#111111'
  text-secondary: '#555555'
  text-muted: '#888888'
  text-light: '#a0aec0'
  outline: '#e5e7eb'
  outline-variant: '#f0f0f0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  surface-inverse: '#132b1a'
  on-surface-inverse: '#ffffff'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 58px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  title-lg:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-section:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.12em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  stat-number:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  nav-link:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  none: 0px
  sm: 4px
  DEFAULT: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  section-padding-y: 80px
  card-padding: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

Spandana Hospital is a 25-year private hospital in Jayanagar, Bengaluru, specializing in Orthopaedics and Gynaecology. Design identity: **"Heritage Care, Modern Medicine"** — deep-rooted community trust + modern clinical precision.

Visual language is **Corporate Modern with Warm Heritage**. Authoritative serif headlines (Playfair Display) + clean functional sans (Inter). Deep Forest Green + Golden Amber palette creates premium trustworthiness distinct from cold clinical whites. Generous, unhurried layout reduces patient anxiety and communicates confidence. Botanical leaf illustrations are used as subtle background decorations in the Doctors and Testimonials sections to reinforce the organic, heritage feel.

## Colors

**Deep Forest Green (#132b1a):** Primary brand color. Used for: navbar "Book an Appointment" CTA button, "Find a Doctor" primary button, all "View Profile" buttons, full-width CTA section background, footer background. Communicates stability and growth.

**Golden Amber (#C9A227):** Accent color. Used for: italic hero headline "Malnad Families", ALL section eyebrow labels (OUR FOUNDERS, OUR SPECIALTIES, PATIENTS SPEAK), statistic numbers (25+, 50,000+, 15+, 99%), doctor specialty labels (ORTHOPAEDIC SURGEON, GYNAECOLOGIST), star ratings in testimonials, amber circle arrow button in CTA booking card, "25+" badge on hero floating card. Communicates warmth, quality, heritage.

**Pure White (#ffffff):** Page background + all card surfaces.

**Dark Charcoal (#111111):** All primary headings and nav link text.

**Medium Grey (#555555):** Body/descriptive text, feature descriptions.

**Text Light (#a0aec0):** Footer body text, muted captions.

Active nav link ("Home") has a Golden Amber 2px underline with dark text.

## Typography

**Playfair Display** (serif) — ONLY for:
- Hero H1: 48px Bold 700 — dark first line, italic Golden Amber second line ("Malnad Families")
- Section headings: 36px Bold 700 (Meet The Doctors, Comprehensive Care for Every Need, What Our Patients Say, Your Health Our Priority)
- Doctor names: 20px Bold 700
- Footer brand tagline

**Inter** (sans-serif) — for EVERYTHING else:
- Nav links: 14px Medium 500
- Section eyebrow labels: 11px SemiBold 600, UPPERCASE, Golden Amber, letter-spacing 0.12em
- Body text: 16-18px Regular 400, grey #555555
- Stat numbers: 32px Bold 700, Golden Amber
- Doctor specialty labels: 11px SemiBold 600, UPPERCASE, Golden Amber
- Button text: 14px SemiBold 600
- Testimonial text: 15px Regular 400
- Patient names: 14px SemiBold
- Footer links: 13px Regular, #a0aec0

## Layout & Spacing

Desktop: 12-column, 1200px max-width, 24px gutters, 48px outer margins. Section vertical padding: 80px. Navbar: 64px height, white background.

- **Hero:** 55% left column (badge + H1 + body + 2 buttons + 2 feature blocks) + 45% right column (full-height doctor photo, edge-bleeding, with a floating stat card overlaid)
- **Stats bar:** 4-column white floating card with shadow. Each col: small dark-green icon top-left, 32px amber number, grey label below. 4 dividers between columns.
- **Doctors:** 2-column equal card grid. Horizontal card layout — circular photo left + content right. Large botanical leaf illustration in bottom-left background.
- **Specialties:** 6-column icon grid. Icon centered, label below. Right arrow indicator at edge.
- **Testimonials:** 3-column card grid. Pagination dots below. Large quote mark top-left of each card. Decorative botanical leaf on right side background.
- **CTA Banner:** Full-width dark green. Left: decorative circle icon + H2 + body. Right: 2 cards side by side.
- **Footer:** 5-column. Dark green bg.

## Elevation & Depth

- White cards: `box-shadow: 0 2px 12px rgba(19, 43, 26, 0.08)`
- Stats bar: `box-shadow: 0 4px 20px rgba(19, 43, 26, 0.10)`
- Doctor cards: `1px solid #e5e7eb` border + soft shadow
- Hero floating card: `box-shadow: 0 8px 24px rgba(19, 43, 26, 0.12)`, white bg, 12px radius
- No aggressive floating — all surfaces sit close to background
- CTA + Footer: solid dark green, no shadow needed

## Shapes

- **Primary buttons ("Book an Appointment", "Find a Doctor", "View Profile"):** 6px radius — firm, slightly rounded, NOT pill-shaped
- **Badge pill** ("State-of-the-art facilities"): 9999px fully rounded, white bg, small green icon
- **Doctor photos:** Perfect circle (full 9999px radius)
- **Doctor cards, testimonial cards:** 8px radius
- **Stats bar card:** 8px radius
- **Hero floating card:** 12px radius, white bg, subtle shadow
- **CTA inner booking card:** 12px radius, white bg
- **Amber circle arrow (CTA):** Perfect circle, Golden Amber fill, white arrow icon
- **CTA decorative icon circle:** Large circle outline (white/low-opacity stroke), contains a calendar/appointment icon

## Components

### Navbar
White bg, 64px height. LEFT: briefcase-medical icon (green, 20px) + "Spandana Hospital" in Inter SemiBold 18px dark. CENTER: nav links — Home, Find Doctors, Specialties, Services, About Us, Resources — Inter 14px Medium 500 dark. Active "Home" has 2px solid Golden Amber underline. RIGHT: "🗓 Book an Appointment" button — calendar icon (white, 16px) + "Book an Appointment" text — Deep Forest Green bg, white Inter SemiBold 14px, 6px radius, 16px horizontal padding.

### Hero Section
LEFT 55%:
1. Badge pill: white bg, 9999px radius, 1px #e5e7eb border. Small green leaf/shield icon (16px). "State-of-the-art facilities" Inter 13px #555555.
2. H1 Playfair Display 48px Bold: Line 1 dark #111111 — "25 Years of Caring for". Line 2 italic Golden Amber — "Malnad Families".
3. Body text: Inter 16px Regular #555555, 2-3 lines: "Professional healthcare with a personal touch..."
4. Button row: [Find a Doctor button: green bg, white, search icon, 6px radius] + [Our Story → ghost button: transparent, dark text, arrow]
5. Two feature info blocks: Icon (amber shield / green monitor) + Bold Inter 15px SemiBold label + Inter 14px #555555 description (2 lines).

RIGHT 45%: Full-height photo of two doctors (male orthopaedic + female gynaecologist) in white lab coats. Right-edge aligned. No border/card treatment.

FLOATING CARD (overlaid on doctor photo, bottom-center area):
- White bg, 12px radius, soft shadow
- Top row: Two small circular doctor avatar photos (30px each, slightly overlapping) + Golden Amber pill badge with "25+" text
- Bottom row: "Years of trusted medical expertise" Inter 13px #555555
- Card width approximately 200px, positioned lower-right of the hero photo

### Stats Bar
White card with shadow, 8px radius, 4 equal columns with vertical dividers (#e5e7eb, 1px):
- Col 1: Person icon (dark green 20px) | "25+" amber 32px bold | "Years of Trusted Medical Expertise" grey 13px
- Col 2: Group/people icon | "50,000+" amber | "Patients Treated with Care" grey
- Col 3: Award/ribbon icon | "15+" amber | "Specialties Under One Roof" grey
- Col 4: Heart icon | "99%" amber | "Patient Satisfaction Rate" grey

### Section Eyebrow + Heading Pattern
Eyebrow: Inter 11px SemiBold 600, UPPERCASE, Golden Amber, letter-spacing 0.12em.
Heading: Playfair Display 36px Bold 700, dark #111111.
Sub-text: Inter 16px Regular #555555.
Right-aligned secondary link: Inter 14px dark, arrow icon "View all doctors →".

### Doctor Cards
White bg, 8px radius, 1px #e5e7eb border, soft shadow. Horizontal layout, 24px padding:
- LEFT: Circular doctor photo, ~80px diameter.
- RIGHT stacked: Doctor name (Playfair 20px Bold dark) → Specialty (Inter 11px SemiBold Uppercase Golden Amber) → Italic quote (Inter 15px Regular #555555, 2-3 lines) → "View Profile →" button (Deep Forest Green, white Inter 13px SemiBold, 6px radius, arrow icon).

BOTANICAL DECORATION: Large green leaf/botanical illustration positioned in the bottom-left corner of the Doctors section, partially behind the left doctor card. Low opacity (~20-30%), dark forest green color, adds organic warmth to the section background.

### Specialty Icon Grid
6 columns, no card bg. Each item centered:
- Icon: 32px dark green line icon (bone for Orthopaedics, venus for Gynaecology, child for Pediatrics, stethoscope for General Medicine, person-walking for Physiotherapy, flask for Pathology)
- Label: Inter 14px Regular #111111, centered below icon.
Right edge: "→" navigation arrow.

### Testimonial Cards
White bg, 8px radius, 1px #e5e7eb border, soft shadow. Padding 24px:
- TOP LEFT: Large double-quote mark, ~48px, soft sage green #8fad9a (low opacity)
- Star row: 5 filled stars, Golden Amber
- Testimonial text: Inter 15px Regular #333333, 2-3 lines
- BOTTOM: Circular avatar (40px) + "Patient Name" Inter 14px SemiBold dark + "Specialty Patient" Inter 13px #888888

Pagination: 3 dots below — dot 1: filled dark green circle; dots 2-3: hollow light grey circles.

BOTANICAL DECORATION: Decorative botanical leaf illustration on the right side of the testimonials section background, mirroring the one in the Doctors section. Low opacity, adds visual continuity.

### CTA Banner Section
Full-width, Deep Forest Green bg (#132b1a), 80px vertical padding.
LEFT side (~45%): Decorative large circle outline (white, low opacity ~20%, ~80px diameter) containing a calendar/appointment icon (white outline style, ~40px) — positioned left of the headline text, vertically centered. Then: "Your Health, Our Priority" Playfair 36px Bold white. Body: Inter 16px #a0aec0 (light cream-grey), 2 lines: "Book an appointment today and experience healthcare that truly cares."
RIGHT side (~55%): Two side-by-side cards:
- Card 1 "Book Appointment": White bg, 12px radius. "Book Your Appointment" Inter 16px SemiBold dark. "Quick. Easy. Reliable." Inter 13px #555555. Golden Amber circle button (40px diameter) with white right-arrow →.
- Card 2 "Call Us": Slightly lighter dark green bg (#1e3f2a), 12px radius. Phone icon (Golden Amber 24px). "Call Us" Inter 12px SemiBold #a0aec0 uppercase. "080 1234 5678" Inter 20px SemiBold white. "Mon - Sat: 8:00 AM - 8:00 PM" Inter 12px #a0aec0 below the phone number.

### Footer
Deep Forest Green bg (#132b1a). 5-column grid, 48px outer padding, 80px vertical padding.
- Col 1: Logo (white icon + "Spandana Hospital" Inter SemiBold 16px white) + 2-line tagline (Inter 14px #a0aec0) + Social icons row (Facebook, Instagram, WhatsApp, YouTube — white circle icon buttons, 36px, 4 icons total).
- Cols 2-4: Section with bold white header (Inter 14px SemiBold 600) + link list (Inter 13px #a0aec0, 8px gap):
  - "Quick Links": Home, Find Doctors, Specialties, Services
  - "About Us": Our Story, Our Team, Careers, News & Updates
  - "Resources": Health Articles, Patient Guide, FAQs, Insurance & TPA
- Col 5 "Contact Us": Location pin icon (amber) + "115, 9th Cross, Jayanagar 3rd Block, Bengaluru, Karnataka 560011". Phone icon (amber) + "080 1234 5678". Email icon (amber) + "info@spandanahospital.com". All text Inter 13px #a0aec0.
- Bottom divider (1px #1e3f2a). Bottom bar: "© 2024 Spandana Hospital. All rights reserved." left (Inter 12px #666) | "Privacy Policy · Terms & Conditions" right (Inter 12px #a0aec0).
