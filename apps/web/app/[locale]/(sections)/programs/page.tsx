import Fees from "@/components/programs/fees"
import Header from "@/components/programs/header"
import Programs from "@/components/programs/programs"

export default function ProgramsPage() {
  return (
    <main className="min-h-svh">
      <Header />
      <Programs />
      <Fees />
    </main>
  )
}
