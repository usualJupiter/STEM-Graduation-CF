"use client"

import { useParams, useSearchParams } from "next/navigation"

import Auth from "@/components/auth/auth"
import { authClient } from "@/lib/auth-client"

export default function AuthPage() {
  const { locale } = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const hasError = searchParams.get("error") != null

  const handleGoogleLogin = async () => {
    const origin = window.location.origin
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${origin}/${locale}/auth-callback`,
      errorCallbackURL: `${origin}/${locale}/auth-callback`,
    })
  }

  return <Auth onGoogleLogin={handleGoogleLogin} hasError={hasError} />
}
