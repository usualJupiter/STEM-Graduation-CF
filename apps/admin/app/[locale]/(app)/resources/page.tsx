import ResourcesView from "@/components/resources/resourcesView"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("resources")

export default function ResourcesPage() {
  return <ResourcesView />
}
