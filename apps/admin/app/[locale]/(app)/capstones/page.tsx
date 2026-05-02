import CapstonesHeader from "@/components/capstones/header"
import Capstones from "@/components/capstones/capstones"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("capstones")

export default function CapstonesPage() {
  return (
    <div>
      <CapstonesHeader />
      <Capstones />
    </div>
  )
}