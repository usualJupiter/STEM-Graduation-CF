import Image from "next/image"
import { useLocale } from "next-intl"

const LOGO_BY_LOCALE: Record<string, string> = {
  ar: "https://cdn.stem-program.com/assets/logo-web-ar.svg",
  en: "https://cdn.stem-program.com/assets/logo-web-en.svg",
}

interface BrandLogoProps {
  alt: string
  className?: string
  priority?: boolean
}

export function BrandLogo({ alt, className, priority }: BrandLogoProps) {
  const locale = useLocale()
  const src = LOGO_BY_LOCALE[locale] ?? LOGO_BY_LOCALE.en!

  return (
    <Image
      src={src}
      alt={alt}
      width={231}
      height={110}
      className={className}
      priority={priority}
      unoptimized
    />
  )
}
