"use client"

import { Fragment, useState } from "react"
import { Star, Upload, ClipboardList, UserPlus, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import Link from "next/link"
import { type LucideIcon } from "lucide-react"

import CreateEvent from "@/components/events/createEvent"

interface DashboardProps {
  className?: string
}

const stats = [
  {
    labelKey: "visitors",
    periodKey: "thisMonth",
    periodVariant: "green" as const,
    value: "132",
  },
  {
    labelKey: "applications",
    periodKey: "thisMonth",
    periodVariant: "green" as const,
    value: "12",
  },
  {
    labelKey: "totalVisitors",
    periodKey: "allTime",
    periodVariant: "blue" as const,
    value: "12,781",
  },
  {
    labelKey: "totalApplications",
    periodKey: "allTime",
    periodVariant: "blue" as const,
    value: "420",
  },
]

const quickAccessItems: {
  icon: LucideIcon
  key: string
  href: string
}[] = [
  { icon: Star, key: "createEvent", href: "#" },
  { icon: Upload, key: "uploadProject", href: "#" },
  { icon: ClipboardList, key: "exportApplications", href: "#" },
  { icon: UserPlus, key: "addUser", href: "#" },
]

export default function Dashboard({ className }: DashboardProps) {
  const t = useTranslations("Dashboard")
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex w-full flex-col items-center pb-6">
      <div className="w-full max-w-[1280px] rounded-none border bg-background shadow-sm">
        <div className="flex flex-col items-center px-6 pt-6">
          <div className="w-full max-w-[1280px]">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:flex-row lg:items-center">
              {stats.map((stat, index) => (
                <Fragment key={stat.labelKey}>
                  {index > 0 && (
                    <Separator
                      orientation="vertical"
                      className="hidden h-16 self-center lg:block"
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t(`stats.labels.${stat.labelKey}`)}
                      </span>
                      <span
                        className={
                          stat.periodVariant === "green"
                            ? "text-sm font-medium text-green-600"
                            : "text-sm font-medium text-indigo-600"
                        }
                      >
                        {t(`stats.periods.${stat.periodKey}`)}
                      </span>
                    </div>
                    <span className="text-3xl font-semibold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-none bg-background p-6">
            <div className="flex w-full max-w-[1280px] flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("quickAccess.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("quickAccess.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {quickAccessItems.map((item) => {
                  const inner = (
                    <>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-none border bg-muted">
                        <item.icon className="size-4 text-foreground" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                        <span className="text-sm font-medium leading-4 text-foreground">
                          {t(`quickAccess.items.${item.key}.title`)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t(`quickAccess.items.${item.key}.description`)}
                        </span>
                      </div>
                      <div className="flex h-10 items-center">
                        <Button variant="ghost" size="icon" asChild>
                          <span>
                            <ArrowRight />
                          </span>
                        </Button>
                      </div>
                    </>
                  )

                  if (item.key === "createEvent") {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="flex items-start gap-2 rounded-none border bg-background px-3 py-2.5 text-start"
                      >
                        {inner}
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="flex items-start gap-2 rounded-none border px-3 py-2.5"
                    >
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEvent open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
