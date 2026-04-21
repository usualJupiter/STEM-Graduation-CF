import Image from "next/image"
import { useTranslations } from "next-intl"

export default function Header() {
  const t = useTranslations("ProgramsHeader")

  return (
    <section className="bg-main">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row md:py-0">
        <div className="flex w-full flex-col items-start justify-end md:w-auto">
          <h1 className="text-4xl font-bold leading-tight text-main-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
        </div>
        <div className="relative aspect-[404/302] w-full max-w-[404px] shrink-0 p-2.5">
          <Image
            src="https://ui.shadcn.com/placeholder.svg"
            alt={t("imageAlt")}
            fill
            sizes="(max-width: 768px) 100vw, 404px"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </section>
  )
}
