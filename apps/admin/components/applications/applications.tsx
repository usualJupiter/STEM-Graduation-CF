"use client"

import { ChevronDown, Ellipsis, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import {
  APPLICATIONS_INVALIDATE_EVENT,
  APPLICATION_GROUPS_INVALIDATE_EVENT,
} from "@/components/applications/constants"
import DelApplication from "@/components/applications/delApplication"
import ExportApplicationsStudent from "@/components/applications/exportApplicationsStudent"
import ViewApplication from "@/components/applications/viewApplication"
import { fetchJson } from "@/lib/api"

const SORT_OPTIONS = ["dateNewest", "dateOldest", "nameAsc", "nameDesc"] as const
type SortKey = (typeof SORT_OPTIONS)[number]

const PAGE_SIZE = 20

interface AdminApplicationRow {
  id: string
  name: string
  national_id: string
  created_at: string
  group_name: string
}

interface ListResponse {
  data: AdminApplicationRow[]
  meta: { total: number; page: number; limit: number }
}

interface GroupOption {
  id: number
  name: string
  application_count: number
}

interface GroupsResponse {
  data: GroupOption[]
}

export default function Applications() {
  const t = useTranslations("Applications")

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("dateNewest")
  const [page, setPage] = useState(1)
  const [groupFilter, setGroupFilter] = useState<number | "all">("all")

  const [groups, setGroups] = useState<GroupOption[]>([])
  const [rows, setRows] = useState<AdminApplicationRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [viewing, setViewing] = useState<string | null>(null)
  const [exporting, setExporting] = useState<{
    id: string
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState<{
    id: string
    name: string
  } | null>(null)

  // Refresh on any invalidation event.
  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener(APPLICATIONS_INVALIDATE_EVENT, handler)
    window.addEventListener(APPLICATION_GROUPS_INVALIDATE_EVENT, handler)
    return () => {
      window.removeEventListener(APPLICATIONS_INVALIDATE_EVENT, handler)
      window.removeEventListener(APPLICATION_GROUPS_INVALIDATE_EVENT, handler)
    }
  }, [])

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1)
  }, [sort, groupFilter])

  // Fetch group list (used for the filter dropdown).
  useEffect(() => {
    let cancelled = false
    fetchJson<GroupsResponse>("/api/admin/applications/groups")
      .then((res) => {
        if (cancelled) return
        setGroups(res.data)
      })
      .catch((err) => {
        if (!cancelled) console.error("[applications] groups fetch failed", err)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // Fetch rows.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      sort,
      page: String(page),
      limit: String(PAGE_SIZE),
    })
    if (search.trim()) params.set("q", search.trim())
    if (groupFilter !== "all") params.set("group_id", String(groupFilter))

    fetchJson<ListResponse>(`/api/admin/applications?${params.toString()}`)
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
  }, [sort, page, search, groupFilter, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const groupLabel = useMemo(() => {
    if (groupFilter === "all") return t("groupFilter.all")
    return groups.find((g) => g.id === groupFilter)?.name ?? "—"
  }, [groupFilter, groups, t])

  return (
    <div className="flex flex-col items-center gap-0 px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="p-6">
          <div className="mx-auto max-w-[1280px] px-4">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup className="sm:max-w-md">
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {t("groupFilter.label")}: {groupLabel}
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup
                        value={String(groupFilter)}
                        onValueChange={(v) =>
                          setGroupFilter(v === "all" ? "all" : Number(v))
                        }
                      >
                        <DropdownMenuRadioItem value="all">
                          {t("groupFilter.all")}
                        </DropdownMenuRadioItem>
                        {groups.length > 0 && <DropdownMenuSeparator />}
                        {groups.map((g) => (
                          <DropdownMenuRadioItem key={g.id} value={String(g.id)}>
                            {g.name} ({g.application_count})
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("columns.id")}</TableHead>
                      <TableHead>{t("columns.name")}</TableHead>
                      <TableHead>{t("columns.nationalId")}</TableHead>
                      <TableHead>{t("columns.group")}</TableHead>
                      <TableHead>{t("columns.date")}</TableHead>
                      <TableHead className="w-11" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          …
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-destructive"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && rows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          {t("empty")}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      rows.map((row) => {
                        const shortId = row.id.slice(0, 8)
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="font-mono text-xs">
                              {shortId}
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {row.national_id}
                            </TableCell>
                            <TableCell>{row.group_name}</TableCell>
                            <TableCell>
                              {new Date(row.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={t("actions")}
                                  >
                                    <Ellipsis />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() => setViewing(row.id)}
                                  >
                                    {t("actionsMenu.view")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setExporting({
                                        id: row.id,
                                        name: row.name,
                                      })
                                    }
                                  >
                                    {t("actionsMenu.export")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() =>
                                      setDeleting({
                                        id: row.id,
                                        name: row.name,
                                      })
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
                  {t("pagination.showing", {
                    shown: rows.length,
                    total,
                  })}
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

      <ViewApplication
        applicationId={viewing}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      />
      <ExportApplicationsStudent
        applicationId={exporting?.id ?? null}
        studentName={exporting?.name}
        onOpenChange={(open) => {
          if (!open) setExporting(null)
        }}
      />
      <DelApplication
        applicationId={deleting?.id ?? null}
        applicationName={deleting?.name}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      />
    </div>
  )
}
