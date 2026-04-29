"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, User } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { fetchJson } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import AddEmailDialog from "@/components/settings/addEmailDialog"

interface AllowedEmailRow {
  email: string
  name: string | null
  image: string | null
  added_at: string
  is_default: boolean
}

interface ListResponse {
  data: AllowedEmailRow[]
}

export default function Access() {
  const t = useTranslations("Settings.access")
  const { data: sessionData } = authClient.useSession()
  const myEmail = sessionData?.user?.email?.toLowerCase() ?? null

  const [rows, setRows] = useState<AllowedEmailRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState("")

  const [addOpen, setAddOpen] = useState(false)

  const [deletingTarget, setDeletingTarget] = useState<{
    email: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchJson<ListResponse>("/api/allowed-emails", {
      signal: controller.signal,
    })
      .then((res) => {
        if (controller.signal.aborted) return
        setRows(res.data)
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return
        setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [refreshKey])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.name?.toLowerCase().includes(q) ?? false),
    )
  }, [rows, search])

  const handleDeleteOpenChange = (next: boolean) => {
    if (deleting) return
    if (!next) {
      setDeleteError(null)
      setDeletingTarget(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingTarget) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await fetchJson(
        `/api/allowed-emails/${encodeURIComponent(deletingTarget.email)}`,
        { method: "DELETE" },
      )
      setDeletingTarget(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : t("deleteDialog.failed"),
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="flex flex-col p-6">
          <div className="mx-auto w-full max-w-[1280px] px-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-row gap-2">
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => setAddOpen(true)}
                  className="bg-secondry-web text-white hover:bg-secondry-web/90"
                >
                  <Plus />
                  {t("addEmail")}
                </Button>
              </div>

              {loading && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  …
                </p>
              )}
              {!loading && error && (
                <p className="py-4 text-center text-sm text-destructive">
                  {t("loadFailed")}
                </p>
              )}
              {!loading && !error && filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t("empty")}
                </p>
              )}

              {!loading &&
                !error &&
                filtered.map((member) => {
                  const isSelf = myEmail === member.email
                  const canDelete = !member.is_default && !isSelf
                  const displayName = member.name ?? t("waitingLogin")
                  return (
                    <div
                      key={member.email}
                      className="flex flex-row items-center gap-2 rounded-none border px-3 py-2.5"
                    >
                      <Avatar className="size-10 shrink-0">
                        {member.image && (
                          <AvatarImage src={member.image} alt="" />
                        )}
                        <AvatarFallback>
                          <User className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.email}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {displayName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeletingTarget({ email: member.email })
                        }
                        disabled={!canDelete}
                        className="shrink-0 text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={t("deleteAriaLabel", {
                          email: member.email,
                        })}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <AddEmailDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      <Dialog
        open={deletingTarget != null}
        onOpenChange={handleDeleteOpenChange}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description")}
            </DialogDescription>
          </DialogHeader>
          {deletingTarget && (
            <p className="text-sm text-muted-foreground">
              {t("deleteDialog.removing", { email: deletingTarget.email })}
            </p>
          )}
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteOpenChange(false)}
              disabled={deleting}
            >
              {t("deleteDialog.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? t("deleteDialog.submitting")
                : t("deleteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
