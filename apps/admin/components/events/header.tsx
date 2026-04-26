"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import { fetchJson } from "@/lib/api"
import CreateEvent, {
  EVENTS_INVALIDATE_EVENT,
} from "@/components/events/createEvent"

const MAX_EVENTS = 30

interface CountResponse {
  meta: { total: number }
}

export default function Header() {
  const t = useTranslations("Events")
  const [createOpen, setCreateOpen] = useState(false)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchJson<CountResponse>("/api/admin/events?limit=1")
        .then((res) => {
          if (!cancelled) setTotal(res.meta.total)
        })
        .catch(() => {
          /* ignore — button defaults to enabled if we can't read count */
        })
    }
    load()
    window.addEventListener(EVENTS_INVALIDATE_EVENT, load)
    return () => {
      cancelled = true
      window.removeEventListener(EVENTS_INVALIDATE_EVENT, load)
    }
  }, [])

  const atLimit = total !== null && total >= MAX_EVENTS

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("description")}
            </p>
            {total !== null && (
              <p className="text-sm text-muted-foreground">
                {t("eventCount", { count: total, max: MAX_EVENTS })}
                {atLimit && (
                  <span className="ms-2 text-destructive">
                    {t("atLimit")}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              disabled={atLimit}
              title={atLimit ? t("atLimit") : undefined}
              className="h-8 w-full bg-secondry-web text-base text-white hover:bg-secondry-web/90"
            >
              <Plus />
              {t("createEvent")}
            </Button>
          </div>
        </div>
      </div>
      <CreateEvent open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
