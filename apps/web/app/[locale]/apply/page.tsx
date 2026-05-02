import type { Metadata } from "next"
import Application from "@/components/apply/application"

export const metadata: Metadata = {
  title: "التقديم للبرنامج",
  description: "التقديم للبرنامج",
}
export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Application />
    </div>
  )
}
