import Image from "next/image"
import { useTranslations } from "next-intl"

interface AwordProps {
  imageSrc?: string
}

export default function Aword({
  imageSrc = "https://ui.shadcn.com/placeholder.svg",
}: AwordProps) {
  const t = useTranslations("Aword")

  return (
    <section className="w-full bg-web-card-1">
      <div className="flex flex-col items-center px-6 py-16 md:py-24">
        <div className="flex w-full max-w-7xl flex-col items-center gap-8 md:flex-row md:gap-16">
          <div className="w-full max-w-[298px] shrink-0">
            <Image
              src={imageSrc}
              alt={t("name")}
              width={298}
              height={298}
              className="aspect-square w-full rounded-none object-cover"
              unoptimized
            />
          </div>
          <figure className="flex flex-col gap-8">
            <blockquote className="text-xl font-medium leading-8 text-black md:text-2xl">
              &ldquo;{t("quote")}&rdquo;
            </blockquote>
            <figcaption className="flex flex-col gap-0.5">
              <p className="text-base font-semibold leading-6 text-black">
                {t("name")}
              </p>
              <p className="text-base leading-6 text-black/80">{t("role")}</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
