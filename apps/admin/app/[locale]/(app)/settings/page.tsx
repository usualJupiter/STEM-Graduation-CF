import Header from "@/components/settings/header"
import Access from "@/components/settings/access"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("settings")

export default function SettingsPage() {
  return (
    <div>
      <Header />
      <Access />
    </div>
  )
}
