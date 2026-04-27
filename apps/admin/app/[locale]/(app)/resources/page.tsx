"use client"

import { useState } from "react"

import Gallery from "@/components/resources/gallery"
import Header from "@/components/resources/header"
import Schedules from "@/components/resources/schedules"

export default function ResourcesPage() {
  const [tab, setTab] = useState("gallery")

  return (
    <div>
      <Header defaultValue={tab} onValueChange={setTab} />
      <div hidden={tab !== "gallery"}>
        <Gallery />
      </div>
      <div hidden={tab !== "lecture-schedules"}>
        <Schedules />
      </div>
    </div>
  )
}
