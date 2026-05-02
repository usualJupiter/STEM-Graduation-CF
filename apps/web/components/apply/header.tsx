import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

import { BrandLogo } from "@/components/brand-logo"

export default function Header() {
  return (
    <header className="flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
      <Link href="/" className="shrink-0">
        <BrandLogo
          alt="برنامج ستيم"
          className="h-12 w-auto object-contain md:h-16"
          priority
        />
      </Link>
      <Button asChild className="bg-default-web text-main hover:bg-default-web/90">
        <Link href="/">الموقع الرسمي</Link>
      </Button>
    </header>
  )
}
