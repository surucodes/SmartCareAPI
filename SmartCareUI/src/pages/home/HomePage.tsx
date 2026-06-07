import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/pages/home/components/HeroSection'
import { StatsSection } from '@/pages/home/components/StatsSection'
import { MeetTheDoctors } from '@/pages/home/components/MeetTheDoctors'
import { OurSpecialties } from '@/pages/home/components/OurSpecialties'
import { Testimonials } from '@/pages/home/components/Testimonials'
import { CTABanner } from '@/pages/home/components/CTABanner'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <MeetTheDoctors />
        <OurSpecialties />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
