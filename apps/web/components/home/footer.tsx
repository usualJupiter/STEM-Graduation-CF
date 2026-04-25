import { useTranslations } from "next-intl"

import { Facebook, WhatsApp } from "@workspace/ui/components/svg"

import { BrandLogo } from "@/components/brand-logo"
import { Link } from "@/i18n/navigation"

interface FooterProps {
  className?: string
}

const SOCIAL_LINKS = [
  {
    key: "facebook",
    Icon: Facebook,
    href: "https://www.facebook.com/groups/363069632168597",
  },
  {
    key: "whatsapp",
    Icon: WhatsApp,
    href: "https://chat.whatsapp.com/CmnDO0fcPhKJzdy10x1mxV?mode=ac_t",
  },
] as const

const RESOURCE_LINKS = [
  { key: "schedules", href: "/schedules" },
  { key: "gallery", href: "/gallery" },
  { key: "apply", href: "/apply" },
] as const

const MAP_LINKS = [
  { key: "home", href: "/" },
  { key: "programs", href: "/programs" },
  { key: "events", href: "/events" },
  { key: "capstones", href: "/capstones" },
  { key: "about", href: "/about" },
] as const

const PRIVACY_PDF_URL =
  "https://b.aun.edu.eg/education/sites/default/files/pdf/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%20%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85%20%D9%88%D8%A7%D9%84%D8%B4%D8%B1%D9%88%D8%B7.pdf"

const linkClass = "text-sm text-white hover:opacity-80"
const headingClass = "text-base font-medium text-white"

interface FooterColumnProps {
  title: string
  items: ReadonlyArray<{ key: string; href: string }>
  translateKey: (key: string) => string
}

function FooterColumn({ title, items, translateKey }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={headingClass}>{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map(({ key, href }) => (
          <li key={key}>
            <Link href={href} className={linkClass}>
              {translateKey(key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer({ className }: FooterProps) {
  const t = useTranslations("Footer")

  return (
    <footer className={className}>
      <div className="bg-secondry-web py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="flex flex-col items-start gap-6 lg:pe-12">
              <BrandLogo
                alt={t("logoAlt")}
                className="h-14 w-auto object-contain"
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

            <FooterColumn
              title={t("sitemap")}
              items={MAP_LINKS}
              translateKey={(key) => t(`mapLinks.${key}`)}
            />

            <FooterColumn
              title={t("resources")}
              items={RESOURCE_LINKS}
              translateKey={(key) => t(`resourceLinks.${key}`)}
            />

            <div className="flex flex-col gap-4">
              <h3 className={headingClass}>{t("followUs")}</h3>
              <ul className="flex flex-col gap-3">
                {SOCIAL_LINKS.map(({ key, Icon, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 ${linkClass}`}
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
          <a
            href={PRIVACY_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-main-foreground hover:opacity-80"
          >
            {t("privacy")}
          </a>
        </div>
      </div>
    </footer>
  )
}
