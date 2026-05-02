import Dashboard from "@/components/dashboard/dashboard"
import Header from "@/components/dashboard/header"
import { buildMetadata } from "@/lib/metadata"

export const generateMetadata = buildMetadata("dashboard")

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-6 py-10">
      <Header />
      <Dashboard />
    </div>
  )
}
