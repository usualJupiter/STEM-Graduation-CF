"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"

type GreetingKey = "morning" | "afternoon" | "evening"

function getGreetingKey(hour: number): GreetingKey {
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

export default function Header() {
  const t = useTranslations("Dashboard.greetings")
  const { data: session } = authClient.useSession()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    setGreeting(t(getGreetingKey(new Date().getHours())))
  }, [t])

  const name = session?.user?.name ?? ""

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <div className="flex max-w-5xl flex-col">
        <p className="text-2xl font-light leading-none text-muted-foreground">
          {greeting}
        </p>
        <h1 className="text-3xl font-semibold leading-9 text-foreground">
          {name}
        </h1>
      </div>
    </div>
  )
}
