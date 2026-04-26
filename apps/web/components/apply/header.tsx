"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

import { BrandLogo } from "@/components/brand-logo"

interface HeaderProps {
  logoAlt?: string
  websiteUrl?: string
  websiteLabel?: string
}

export default function Header({
  logoAlt = "برنامج ستيم",
  websiteUrl = "/",
  websiteLabel = "الموقع الرسمي",
}: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
      <Link href="/" className="shrink-0">
        <BrandLogo
          alt={logoAlt}
          className="h-12 w-auto object-contain md:h-16"
          priority
        />
      </Link>
      <Button asChild className="bg-defult-web text-main [a]:hover:bg-defult-web/90">
        <Link href={websiteUrl}>{websiteLabel}</Link>
      </Button>
    </header>
  )
}
