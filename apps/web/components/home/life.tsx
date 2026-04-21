import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import { Link } from "@/i18n/navigation"

interface LifeProps {
  ctaHref?: string
  imageSrc?: string
}

export default function Life({
  ctaHref = "#",
  imageSrc = "https://ui.shadcn.com/placeholder.svg",
}: LifeProps) {
  const t = useTranslations("Life")

  return (
    <section className="w-full bg-web-third py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 md:flex-row md:gap-16 md:px-16">
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-medium text-black">
              {t("tagline")}
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-black md:text-5xl md:leading-[48px]">
              {t("title")}
            </h2>
            <p className="text-lg text-black/90 md:text-2xl md:leading-8">
              {t("description")}
            </p>
          </div>
          <div>
            <Button
              variant="transparent-outline"
              asChild
              className="border-black font-bold text-black hover:bg-black/10 hover:text-black"
            >
              <Link href={ctaHref}>
                {t("cta")}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="w-full shrink-0 md:w-[344px]">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 344px, 100vw"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  )
}
