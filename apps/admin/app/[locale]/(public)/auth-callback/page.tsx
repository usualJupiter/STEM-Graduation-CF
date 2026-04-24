"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Link, useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const oauthError = searchParams.get("error")
    if (oauthError) {
      setError(oauthError)
      return
    }

    let cancelled = false
    void (async () => {
      const { data } = await authClient.getSession()
      if (cancelled) return
      if (data?.session) {
        router.replace("/dashboard")
      } else {
        setError("session_failed")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10">
        <div className="flex max-w-sm flex-col gap-4 text-center">
          <h1 className="text-xl font-semibold">Login failed</h1>
          <p className="text-muted-foreground text-sm">
            {decodeURIComponent(error)}
          </p>
          <Link className="text-sm underline" href="/auth">
            Try again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-10">
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </div>
  )
}
