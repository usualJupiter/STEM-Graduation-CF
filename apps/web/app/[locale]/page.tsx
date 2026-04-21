import Aword from "@/components/home/word"
import CapstoneShow from "@/components/home/capstone-showcase"
import CtaOne from "@/components/home/cta-one"
import Events from "@/components/home/events"
import Hero from "@/components/home/hero"
import Life from "@/components/home/life"

export default function Home() {
  return (
    <main className="min-h-svh">
      <Hero />
      <CtaOne />
      <Life />
      <CapstoneShow />
      <Events />
      <Aword />
    </main>
  )
}
