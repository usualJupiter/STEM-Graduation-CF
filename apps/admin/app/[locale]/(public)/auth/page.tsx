"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"

import Auth from "@/components/auth/auth"
import { authClient } from "@/lib/auth-client"

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  )
}

function AuthInner() {
  const { locale } = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const hasError = searchParams.get("error") != null

  const handleGoogleLogin = async () => {
    const origin = window.location.origin
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${origin}/${locale}/dashboard`,
      errorCallbackURL: `${origin}/${locale}/auth?error=login_failed`,
    })
  }

  return <Auth onGoogleLogin={handleGoogleLogin} hasError={hasError} />
}
