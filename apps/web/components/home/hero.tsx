import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import { Link } from "@/i18n/navigation"

interface HeroProps {
  ctaHref?: string
  imageUrl?: string
}

export default function Hero({
  ctaHref = "/programs",
  imageUrl = "https://ui.shadcn.com/placeholder.svg",
}: HeroProps) {
  const t = useTranslations("Hero")

  return (
    <section className="bg-main text-main-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-12 md:py-24 lg:flex-row lg:gap-0">
        <div className="flex flex-1 flex-col items-start gap-8">
          <div className="flex flex-col items-start gap-6">
            <h1 className="whitespace-pre-line text-3xl font-bold leading-tight sm:text-5xl lg:text-7xl lg:leading-none">
              {t("heading")}
            </h1>
            <p className="max-w-xl text-base sm:text-lg sm:leading-8">
              {t("description")}
            </p>
          </div>
          <Button
            asChild
            className="bg-defult-web text-main [a]:hover:bg-defult-web/90"
          >
            <Link href={ctaHref}>
              {t("cta")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="w-full flex-shrink-0 lg:w-[567px]">
          <Image
            src={imageUrl}
            alt={t("imageAlt")}
            width={567}
            height={567}
            className="h-auto w-full object-cover"
            unoptimized
          />
        </div>
      </div>
    </section>
  )
}
