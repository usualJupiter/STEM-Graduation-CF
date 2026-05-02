"use client"

import { Fragment, useEffect, useState } from "react"
import {
  ArrowRight,
  ClipboardList,
  Star,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"

import AddEmailDialog from "@/components/settings/addEmailDialog"
import ExportApplicationsGroup from "@/components/applications/exportApplicationsGroup"
import CreateProject from "@/components/capstones/createProject"
import CreateEvent from "@/components/events/createEvent"
import { fetchJson } from "@/lib/api"

interface Stats {
  applications: { thisMonth: number; total: number }
  visitors: { thisMonth: number | null; total: number | null }
}

const PERIOD_COLOR = {
  thisMonth: "text-green-600",
  allTime: "text-indigo-600",
} as const

const STATS_FIELDS = [
  {
    labelKey: "visitors",
    periodKey: "thisMonth",
    pick: (s: Stats) => s.visitors.thisMonth,
  },
  {
    labelKey: "applications",
    periodKey: "thisMonth",
    pick: (s: Stats) => s.applications.thisMonth,
  },
  {
    labelKey: "totalVisitors",
    periodKey: "allTime",
    pick: (s: Stats) => s.visitors.total,
  },
  {
    labelKey: "totalApplications",
    periodKey: "allTime",
    pick: (s: Stats) => s.applications.total,
  },
] as const

const numberFmt = new Intl.NumberFormat()
const fmt = (n: number | null) => (n == null ? "—" : numberFmt.format(n))

export default function Dashboard() {
  const t = useTranslations("Dashboard")
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchJson<{ data: Stats }>("/api/admin/dashboard/stats")
      .then((res) => {
        if (!cancelled) {
          setStats(res.data)
          setStatsError(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[dashboard] stats fetch failed", err)
          setStatsError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items: { key: string; icon: LucideIcon; onClick: () => void }[] = [
    { key: "createEvent", icon: Star, onClick: () => setCreateEventOpen(true) },
    {
      key: "uploadProject",
      icon: Upload,
      onClick: () => setCreateProjectOpen(true),
    },
    {
      key: "exportApplications",
      icon: ClipboardList,
      onClick: () => setExportOpen(true),
    },
    { key: "addUser", icon: UserPlus, onClick: () => setAddUserOpen(true) },
  ]

  return (
    <div className="flex w-full flex-col items-center pb-6">
      <div className="w-full max-w-[1280px] rounded-none border bg-background shadow-sm">
        <div className="flex flex-col items-center px-6 pt-6">
          <div className="w-full max-w-[1280px]">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:flex-row lg:items-center">
              {STATS_FIELDS.map((stat, idx) => (
                <Fragment key={stat.labelKey}>
                  {idx > 0 && (
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
                        className={`text-sm font-medium ${PERIOD_COLOR[stat.periodKey]}`}
                      >
                        {t(`stats.periods.${stat.periodKey}`)}
                      </span>
                    </div>
                    <span className="text-3xl font-semibold text-foreground">
                      {stats
                        ? fmt(stat.pick(stats))
                        : statsError
                          ? "—"
                          : "…"}
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
                {items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onClick}
                    className="flex items-start gap-2 rounded-none border bg-background px-3 py-2.5 text-start"
                  >
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEvent open={createEventOpen} onOpenChange={setCreateEventOpen} />
      <CreateProject
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
      <ExportApplicationsGroup open={exportOpen} onOpenChange={setExportOpen} />
      <AddEmailDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
    </div>
  )
}
