"use client"

import { Globe, LogOut, Menu } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { BrandLogo } from "@/components/brand-logo"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"

type NavKey =
  | "dashboard"
  | "events"
  | "applications"
  | "capstones"
  | "resources"
  | "settings"

const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: "dashboard", href: "/dashboard" },
  { key: "events", href: "/events" },
  { key: "applications", href: "/applications" },
  { key: "capstones", href: "/capstones" },
  { key: "resources", href: "/resources" },
  { key: "settings", href: "/settings" },
]

function getInitials(name: string | undefined | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

export default function Nav({ className }: { className?: string }) {
  const t = useTranslations("Nav")
  const tUser = useTranslations("UserMenu")
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const user = session?.user

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const switchLocale = (locale: (typeof routing.locales)[number]) => {
    router.replace(pathname, { locale })
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.replace("/auth")
  }

  return (
    <nav
      className={cn("bg-background w-full border-b px-6", className)}
    >
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="shrink-0">
            <BrandLogo
              alt={t("logoAlt")}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <LocaleSwitcher onSwitch={switchLocale} label={t("changeLanguage")} />

          <UserMenu
            name={user?.name}
            image={user?.image}
            openLabel={tUser("openMenu")}
            signOutLabel={tUser("signOut")}
            onSignOut={handleSignOut}
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher onSwitch={switchLocale} label={t("changeLanguage")} />

          <UserMenu
            name={user?.name}
            image={user?.image}
            openLabel={tUser("openMenu")}
            signOutLabel={tUser("signOut")}
            onSignOut={handleSignOut}
          />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("toggleMenu")}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4">
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium",
                      isActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

function LocaleSwitcher({
  onSwitch,
  label,
}: {
  onSwitch: (locale: (typeof routing.locales)[number]) => void
  label: string
}) {
  const t = useTranslations("Nav")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem key={locale} onSelect={() => onSwitch(locale)}>
            {t(locale === "en" ? "english" : "arabic")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu({
  name,
  image,
  openLabel,
  signOutLabel,
  onSignOut,
}: {
  name?: string
  image?: string | null
  openLabel: string
  signOutLabel: string
  onSignOut: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={openLabel}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-10">
            {image ? <AvatarImage src={image} alt={name ?? ""} /> : null}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onSelect={onSignOut} variant="destructive">
          <LogOut />
          {signOutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}