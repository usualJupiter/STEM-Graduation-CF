"use client"

import { Globe, Menu } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState, useTransition } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
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
import { cn } from "@workspace/ui/lib/utils"

import { BrandLogo } from "@/components/brand-logo"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

type NavLink = { key: string; href: string }
type NavEntry =
  | (NavLink & { kind?: "link" })
  | { key: string; kind: "menu"; children: NavLink[] }

const NAV_KEYS: NavEntry[] = [
  { key: "programs", href: "/programs" },
  { key: "events", href: "/events" },
  {
    key: "resources",
    kind: "menu",
    children: [
      { key: "gallery", href: "/gallery" },
      { key: "schedules", href: "/schedules" },
    ],
  },
  { key: "capstones", href: "/capstones" },
  { key: "about", href: "/about" },
]

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
          className={cn(
            onMain && "hover:bg-main-foreground/10 hover:text-main-foreground"
          )}
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="relative z-50 flex w-full items-center justify-between bg-main px-6 py-6 text-main-foreground md:pl-12 md:pr-20">
      <Link href="/" className="shrink-0">
        <BrandLogo
          alt={t("logoAlt")}
          className="h-10 w-auto object-contain md:h-16"
          priority
        />
      </Link>

      <div className="hidden flex-col items-end gap-1 lg:flex">
        <div className="flex items-center gap-3">
          <LanguageSwitcher onMain />
          <Button asChild className="bg-default-web text-main [a]:hover:bg-default-web/90">
            <Link href="/apply">{t("apply")}</Link>
          </Button>
        </div>

        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {NAV_KEYS.map((item) =>
              item.kind === "menu" ? (
                <NavigationMenuItem key={item.key}>
                  <NavigationMenuTrigger className="h-auto bg-transparent p-2 text-base font-semibold text-main-foreground hover:bg-main-foreground/10 hover:text-main-foreground focus:bg-main-foreground/10 focus:text-main-foreground data-open:bg-main-foreground/10 data-open:text-main-foreground data-open:hover:bg-main-foreground/10 data-popup-open:bg-main-foreground/10 data-popup-open:hover:bg-main-foreground/10">
                    {t(item.key)}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="flex w-48 flex-col gap-1 p-2">
                      {item.children.map((child) => (
                        <li key={child.key}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.href}
                              className="block text-sm font-medium"
                            >
                              {t(child.key)}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={item.key}>
                  <NavigationMenuLink
                    asChild
                    className="text-base font-semibold hover:bg-main-foreground/10 hover:text-main-foreground focus:bg-main-foreground/10 focus:text-main-foreground"
                  >
                    <Link href={item.href}>{t(item.key)}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <LanguageSwitcher onMain />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
              <Button asChild className="bg-default-web text-main [a]:hover:bg-default-web/90">
                <Link href="/apply" onClick={closeMobile}>
                  {t("apply")}
                </Link>
              </Button>
              <div className="flex flex-col gap-2">
                {NAV_KEYS.map((item) =>
                  item.kind === "menu" ? (
                    <div key={item.key} className="flex flex-col gap-1">
                      <span className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(item.key)}
                      </span>
                      {item.children.map((child) => (
                        <Link
                          key={child.key}
                          href={child.href}
                          onClick={closeMobile}
                          className="rounded-md px-3 py-2 text-base font-semibold text-foreground hover:bg-accent"
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={closeMobile}
                      className="rounded-md px-3 py-2 text-base font-semibold text-foreground hover:bg-accent"
                    >
                      {t(item.key)}
                    </Link>
                  )
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
