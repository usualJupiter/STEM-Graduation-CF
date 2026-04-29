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
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@workspace/ui/components/input-group"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { fetchJson } from "@/lib/api"
import CreateProject, {
  CAPSTONES_INVALIDATE_EVENT,
} from "@/components/capstones/createProject"
import DelCapstone from "@/components/capstones/delCapstone"

const SORT_OPTIONS = ["dateNewest", "dateOldest", "nameAsc", "nameDesc"] as const
type SortKey = (typeof SORT_OPTIONS)[number]

const PAGE_SIZE = 20

const LEVEL_VARIANT: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
  1: "secondary",
  2: "outline",
  3: "destructive",
}

interface AdminCapstoneRow {
  id: number
  slug: string
  title_en: string
  title_ar: string
  level: number
  semester: "first" | "second"
  card_photo_key: string | null
  created_at: string
  author_name: string
}

interface ListResponse {
  data: AdminCapstoneRow[]
  meta: { total: number; page: number; limit: number }
}

export default function Capstones() {
  const t = useTranslations("Capstones")
  const locale = useLocale()

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("dateNewest")
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<AdminCapstoneRow[]>([])
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
    window.addEventListener(CAPSTONES_INVALIDATE_EVENT, handler)
    return () => window.removeEventListener(CAPSTONES_INVALIDATE_EVENT, handler)
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

    fetchJson<ListResponse>(`/api/admin/capstones?${params.toString()}`)
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
    <div className="flex flex-col items-center px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="p-6">
          <div className="mx-auto max-w-[1280px] px-4">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup>
                  <InputGroupInput
                    placeholder={t("searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
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
                      <TableHead>{t("columns.name")}</TableHead>
                      <TableHead>{t("columns.level")}</TableHead>
                      <TableHead>{t("columns.date")}</TableHead>
                      <TableHead>{t("columns.author")}</TableHead>
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
                    {!loading && !error && filteredRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          —
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredRows.map((row) => {
                        const name =
                          locale === "ar"
                            ? row.title_ar || row.title_en
                            : row.title_en || row.title_ar
                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>
                              <Badge variant={LEVEL_VARIANT[row.level] ?? "default"}>
                                {t("level", { number: row.level })}
                              </Badge>
                            </TableCell>
                            <TableCell>{row.created_at}</TableCell>
                            <TableCell>{row.author_name}</TableCell>
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
                                    onSelect={() => setEditingId(row.id)}
                                  >
                                    {t("actionsMenu.edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setDeletingTarget({ id: row.id, name })
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
                  {t("pagination.selected", {
                    selected: filteredRows.length,
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

      <CreateProject
        open={editingId !== null}
        onOpenChange={(o) => {
          if (!o) setEditingId(null)
        }}
        editingId={editingId}
      />

      <DelCapstone
        capstoneId={deletingTarget?.id ?? null}
        capstoneName={deletingTarget?.name}
        onOpenChange={(o) => {
          if (!o) setDeletingTarget(null)
        }}
      />
    </div>
  )
}
