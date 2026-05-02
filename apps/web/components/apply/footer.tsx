import { useTranslations } from "next-intl"

const PRIVACY_PDF_URL =
  "https://b.aun.edu.eg/education/sites/default/files/pdf/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9%20%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9%20%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85%20%D9%88%D8%A7%D9%84%D8%B4%D8%B1%D9%88%D8%B7.pdf"

export default function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="bg-main">
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
    </footer>
  )
}
