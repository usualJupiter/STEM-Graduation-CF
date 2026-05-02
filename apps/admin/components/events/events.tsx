"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, ChevronDown, Ellipsis } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { fetchJson } from "@/lib/api"
import { EVENTS_INVALIDATE_EVENT } from "@/components/events/createEvent"
import EditEvent from "@/components/events/editEvent"
import DelEvent from "@/components/events/delEvent"

const SORT_OPTIONS = ["dateNewest", "dateOldest", "titleAsc", "titleDesc"] as const
type SortKey = (typeof SORT_OPTIONS)[number]

const PAGE_SIZE = 20

interface AdminEventRow {
  id: number
  title_en: string
  title_ar: string
  event_date: string
  event_time: string
  card_photo_key: string | null
  created_at: string
  author_name: string
}

interface ListResponse {
  data: AdminEventRow[]
  meta: { total: number; page: number; limit: number }
}

export default function Events() {
  const t = useTranslations("Events")
  const locale = useLocale()

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("dateNewest")
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<AdminEventRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<{
    id: number
    name: string
  } | null>(null)

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener(EVENTS_INVALIDATE_EVENT, handler)
    return () => window.removeEventListener(EVENTS_INVALIDATE_EVENT, handler)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [sort])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      sort,
      page: String(page),
      limit: String(PAGE_SIZE),
    })

    fetchJson<ListResponse>(`/api/admin/events?${params.toString()}`)
      .then((res) => {
        if (cancelled) return
        setRows(res.data)
        setTotal(res.meta.total)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setRows([])
        setTotal(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sort, page, refreshKey])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.title_en.toLowerCase().includes(q) ||
        r.title_ar.toLowerCase().includes(q) ||
        r.author_name.toLowerCase().includes(q),
    )
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col items-center gap-0 px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="p-6">
          <div className="mx-auto max-w-[1280px] px-4">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {t("sort")}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={sort}
                      onValueChange={(v) => setSort(v as SortKey)}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem key={option} value={option}>
                          {t(`sortOptions.${option}`)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("columns.id")}</TableHead>
                      <TableHead>{t("columns.title")}</TableHead>
                      <TableHead>{t("columns.date")}</TableHead>
                      <TableHead>{t("columns.author")}</TableHead>
                      <TableHead className="w-11" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          …
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {t("empty")}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredRows.map((event) => {
                        const title =
                          locale === "ar"
                            ? event.title_ar || event.title_en
                            : event.title_en || event.title_ar
                        return (
                          <TableRow key={event.id}>
                            <TableCell>{event.id}</TableCell>
                            <TableCell>{title}</TableCell>
                            <TableCell>
                              {event.event_date} {event.event_time}
                            </TableCell>
                            <TableCell>{event.author_name}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm" aria-label={t("actions")}>
                                    <Ellipsis />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => setEditingId(event.id)}>
                                    {t("actionsMenu.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setDeletingTarget({ id: event.id, name: title })
                                    }
                                  >
                                    {t("actionsMenu.delete")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("pagination.showing", { shown: filteredRows.length, total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("pagination.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {t("pagination.next")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditEvent
        eventId={editingId}
        onOpenChange={(open) => {
          if (!open) setEditingId(null)
        }}
      />

      <DelEvent
        eventId={deletingTarget?.id ?? null}
        eventName={deletingTarget?.name}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null)
        }}
      />
    </div>
  )
}
