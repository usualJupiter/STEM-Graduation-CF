"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { APPLICATION_GROUPS_INVALIDATE_EVENT } from "@/components/applications/constants"
import CreateGroup from "@/components/applications/createGroup"
import DelGroup from "@/components/applications/delGroup"
import { fetchJson } from "@/lib/api"

interface ManageApplicationsProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface GroupRow {
  id: number
  name: string
  is_active: number
  application_count: number
}

interface GroupsResponse {
  data: GroupRow[]
}

export default function ManageApplications({
  open,
  onOpenChange,
}: ManageApplicationsProps) {
  const t = useTranslations("Applications.manageDialog")
  const [createOpen, setCreateOpen] = useState(false)
  const [rows, setRows] = useState<GroupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleting, setDeleting] = useState<{
    id: number
    name: string
    count: number
  } | null>(null)

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener(APPLICATION_GROUPS_INVALIDATE_EVENT, handler)
    return () =>
      window.removeEventListener(APPLICATION_GROUPS_INVALIDATE_EVENT, handler)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchJson<GroupsResponse>("/api/admin/applications/groups")
      .then((res) => {
        if (cancelled) return
        setRows(res.data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, refreshKey])

  const toggleActive = async (row: GroupRow) => {
    setBusyId(row.id)
    setError(null)
    try {
      await fetchJson(`/api/admin/applications/groups/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: row.is_active === 0 }),
      })
      window.dispatchEvent(new Event(APPLICATION_GROUPS_INVALIDATE_EVENT))
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failed"))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.group")}</TableHead>
                  <TableHead>{t("columns.count")}</TableHead>
                  <TableHead className="text-right">
                    {t("columns.status")}
                  </TableHead>
                  <TableHead className="w-[180px]">
                    <span className="sr-only">{t("columns.actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      …
                    </TableCell>
                  </TableRow>
                )}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  !error &&
                  rows.map((row) => {
                    const isActive = row.is_active === 1
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.application_count}</TableCell>
                        <TableCell className="text-right">
                          {isActive ? t("on") : t("off")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant={isActive ? "destructive" : "default"}
                              size="sm"
                              disabled={busyId === row.id}
                              onClick={() => toggleActive(row)}
                            >
                              {isActive ? t("deactivate") : t("activate")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("delete")}
                              disabled={busyId === row.id}
                              onClick={() =>
                                setDeleting({
                                  id: row.id,
                                  name: row.name,
                                  count: row.application_count,
                                })
                              }
                            >
                              <Trash2 className="text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              {t("close")}
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-secondry-web text-white hover:bg-secondry-web/90"
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateGroup open={createOpen} onOpenChange={setCreateOpen} />
      <DelGroup
        groupId={deleting?.id ?? null}
        groupName={deleting?.name}
        applicationCount={deleting?.count}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      />
    </>
  )
}
