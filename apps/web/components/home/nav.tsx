"use client"

import Image from "next/image"
import { Globe, Menu } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@workspace/ui/components/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

const NAV_KEYS = [
  { key: "programs", href: "/programs" },
  { key: "events", href: "/events" },
  { key: "resources", href: "/resources" },
  { key: "capstones", href: "/capstones" },
  { key: "about", href: "/about" },
] as const

function LanguageSwitcher({ onMain = false }: { onMain?: boolean }) {
  const t = useTranslations("Nav")
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const onChange = (next: string) => {
    if (next === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("language")}
          disabled={isPending}
          className={
            onMain
              ? "hover:bg-main-foreground/10 hover:text-main-foreground"
              : undefined
          }
        >
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={onChange}>
          {routing.locales.map((loc) => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              {loc === "ar" ? t("arabic") : t("english")}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Nav() {
  const t = useTranslations("Nav")
  const locale = useLocale()
  const logoSrc = locale === "ar" ? "/assets/logoAR.png" : "/assets/logoEN.png"

  return (
    <nav className="flex w-full items-center justify-between bg-main px-6 py-6 text-main-foreground md:pl-12 md:pr-20">
      <Link href="/" className="shrink-0">
        <Image
          src={logoSrc}
          alt={t("logoAlt")}
          width={231}
          height={110}
          className="h-10 w-auto object-contain md:h-16"
          priority
        />
      </Link>

      <div className="hidden flex-col items-end gap-1 lg:flex">
        <div className="flex items-center gap-3">
          <LanguageSwitcher onMain />
          <Button asChild className="bg-defult-web text-main [a]:hover:bg-defult-web/90">
            <Link href="/apply">{t("apply")}</Link>
          </Button>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            {NAV_KEYS.map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink
                  asChild
                  className="hover:bg-main-foreground/10 hover:text-main-foreground focus:bg-main-foreground/10 focus:text-main-foreground"
                >
                  <Link href={item.href} className="text-base font-semibold">
                    {t(item.key)}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("openMenu")}
              className="hover:bg-main-foreground/10 hover:text-main-foreground"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-4">
            <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Button asChild className="bg-defult-web text-main [a]:hover:bg-defult-web/90">
                  <Link href="/apply">{t("apply")}</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {NAV_KEYS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-base font-semibold text-foreground hover:bg-accent"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
