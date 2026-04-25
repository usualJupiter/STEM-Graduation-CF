"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"

export default function Page() {
  const router = useRouter()
  const t = useTranslations("AuthGuard")
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return
    router.replace(data?.session ? "/dashboard" : "/auth")
  }, [isPending, data, router])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  )
}
