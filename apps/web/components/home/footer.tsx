import Image from "next/image"
import { Globe, MessageCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

interface FooterProps {
  className?: string
}

const SOCIAL_LINKS = [
  { key: "facebook", Icon: Globe, href: "#" },
  { key: "whatsapp", Icon: MessageCircle, href: "#" },
] as const

const RESOURCE_LINKS = [
  { key: "schedules", href: "#" },
  { key: "gallery", href: "#" },
  { key: "apply", href: "/apply" },
] as const

const MAP_LINKS = [
  { key: "home", href: "/" },
  { key: "programs", href: "/programs" },
  { key: "events", href: "/events" },
  { key: "capstones", href: "/capstones" },
  { key: "about", href: "/about" },
] as const

export default function Footer({ className }: FooterProps) {
  const t = useTranslations("Footer")
  const locale = useLocale()
  const logoSrc = locale === "ar" ? "/assets/logoAR.png" : "/assets/logoEN.png"

  return (
    <footer className={className}>
      <div className="bg-secondry-web py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="flex flex-col items-start gap-6 lg:pe-12">
              <Image
                src={logoSrc}
                alt={t("logoAlt")}
                width={231}
                height={110}
                className="h-14 w-auto object-contain brightness-0 invert"
              />
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {t("orgName")}
                </h2>
                <p className="whitespace-pre-line text-sm leading-5 text-white">
                  {t("contact")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-medium text-white">
                {t("sitemap")}
              </h3>
              <ul className="flex flex-col gap-3">
                {MAP_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="text-sm text-white hover:opacity-80"
                    >
                      {t(`mapLinks.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-medium text-white">
                {t("resources")}
              </h3>
              <ul className="flex flex-col gap-3">
                {RESOURCE_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="text-sm text-white hover:opacity-80"
                    >
                      {t(`resourceLinks.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-medium text-white">
                {t("followUs")}
              </h3>
              <ul className="flex flex-col gap-3">
                {SOCIAL_LINKS.map(({ key, Icon, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-white hover:opacity-80"
                    >
                      <Icon aria-hidden className="size-4 shrink-0" />
                      <span>{t(`social.${key}`)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-main">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <p className="text-sm text-main-foreground">{t("copyright")}</p>
          <div className="flex items-center gap-8">
            <Link
              href="#"
              className="text-sm text-main-foreground hover:opacity-80"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
