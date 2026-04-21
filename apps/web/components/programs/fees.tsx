import { useTranslations } from "next-intl"

const FEE_SECTIONS = ["tuition", "graduation"] as const

export default function Fees() {
  const t = useTranslations("Fees")

  return (
    <section className="w-full bg-web-card-1 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex max-w-3xl flex-col gap-10 text-start">
          {FEE_SECTIONS.map((key) => (
            <article key={key} className="flex flex-col gap-5 text-start">
              <h2 className="text-2xl font-bold leading-none text-black md:text-4xl">
                {t(`${key}.title`)}
              </h2>
              <p className="whitespace-pre-line text-base leading-8 text-black/80 md:text-lg">
                {t(`${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
