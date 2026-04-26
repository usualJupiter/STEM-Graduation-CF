import Footer from "@/components/home/footer"
import { Nav } from "@/components/home/nav"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
