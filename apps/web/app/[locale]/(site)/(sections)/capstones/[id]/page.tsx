import Header from "@/components/capstones/id/header"
import Abstract from "@/components/capstones/id/abstract"
import Introduction from "@/components/capstones/id/introduction"
import Pictures from "@/components/capstones/id/pictures"
import Methodology from "@/components/capstones/id/methodology"
import Analysis from "@/components/capstones/id/analysis"
import Conclusion from "@/components/capstones/id/conclusion"
import Recommendations from "@/components/capstones/id/recommendations"
import Materials from "@/components/capstones/id/materials"
import Resources from "@/components/capstones/id/resources"
export default function CapstoneOverviewPage() {
  return (
    <div>
      <Header />
      <Abstract />
      <Introduction />
      <Pictures />
      <Methodology />
      <Analysis />
      <Conclusion />
      <Recommendations />
      <Materials />
      <Resources />
    </div>
  )
}