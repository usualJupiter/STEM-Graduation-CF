"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import { Google } from "@workspace/ui/components/svg"

interface AuthProps {
  onGoogleLogin?: () => void
  hasError?: boolean
}

export default function Auth({ onGoogleLogin, hasError }: AuthProps) {
  const t = useTranslations("Auth")

  return (
    <div className="flex min-h-screen w-full flex-row items-center">
      <div className="flex w-full flex-col bg-background p-10 lg:w-1/2">
        <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center">
          <div className="flex w-full max-w-[374px] min-w-[190px] flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold leading-8 text-card-foreground">
                {t("title")}
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                {t("description")}
              </p>
            </div>
            {hasError && (
              <p
                role="alert"
                className="rounded-none border border-destructive bg-destructive/5 p-3 text-sm text-destructive"
              >
                {t("loginFailed")}
              </p>
            )}
            <div className="flex flex-col gap-6">
              <Button
                onClick={onGoogleLogin}
                className="h-12 w-full bg-secondry-web text-base text-white hover:bg-secondry-web/90"
              >
                <Google className="size-5" />
                {t("continueWithGoogle")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden min-h-screen w-1/2 lg:block">
        <Image
          src="https://cdn.stem-program.com/assets/auth.png"
          alt={t("imageAlt")}
          fill
          sizes="50vw"
          className="object-cover"
          unoptimized
          priority
        />
      </div>
    </div>
  )
}
