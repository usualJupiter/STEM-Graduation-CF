"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const t = useTranslations("AuthGuard")
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.replace("/auth")
    }
  }, [isPending, data, router])

  if (isPending || !data?.session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      </div>
    )
  }

  return <>{children}</>
}
