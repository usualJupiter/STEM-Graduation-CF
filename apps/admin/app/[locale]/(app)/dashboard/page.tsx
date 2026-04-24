"use client"

import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"

export default function DashboardPage() {
  const t = useTranslations("Dashboard")
  const { data: session } = authClient.useSession()

  return (
    <div className="mx-auto w-full max-w-screen-xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">{t("welcome")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {session?.user.name ?? ""}
        </h1>
      </div>
    </div>
  )
}
