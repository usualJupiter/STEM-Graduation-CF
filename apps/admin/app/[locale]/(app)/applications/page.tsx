import Applications from "@/components/applications/applications"
import Header from "@/components/applications/header"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("applications")

export default function ApplicationsPage() {
  return (
    <div>
      <Header />
      <Applications />
    </div>
  )
}