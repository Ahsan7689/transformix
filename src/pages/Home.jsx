import Hero from '../components/Hero'
import MarqueeTicker from '../components/MarqueeTicker'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import CreditsSection from '../components/CreditsSection'
import FAQ from '../components/FAQ'

export default function Home() {
  return (
    <main>
      <Hero />
      <MarqueeTicker />
      <Features />
      <HowItWorks />
      <CreditsSection />
      <FAQ />
    </main>
  )
}