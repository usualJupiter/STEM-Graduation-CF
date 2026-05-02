import Header from "@/components/events/header"
import Events from "@/components/events/events"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("events")

export default function EventsPage() {
  return (
    <div>
      <Header />
      <Events />
    </div>
  )
}