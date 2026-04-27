"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("error")) {
      router.replace("/auth?error=login_failed")
      return
    }

    let cancelled = false
    void (async () => {
      const { data } = await authClient.getSession()
      if (cancelled) return
      if (data?.session) {
        router.replace("/dashboard")
      } else {
        router.replace("/auth?error=login_failed")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-10">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
