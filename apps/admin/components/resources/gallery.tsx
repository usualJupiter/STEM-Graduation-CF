"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, Ellipsis } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import DelPhoto from "@/components/resources/delPhoto"
import { fetchJson } from "@/lib/api"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const
const MAX_FILE_SIZE = 1024 * 1024
const MAX_BATCH = 5
const PAGE_SIZE = 20

interface AdminPhotoRow {
  id: number
  photo_key: string
  url: string
  file_size: number
  original_name: string | null
  created_at: string
  author_name: string
}

interface ListResponse {
  data: AdminPhotoRow[]
  meta: {
    total: number
    page: number
    limit: number
    used: number
    capacity: number
    maxFileSize: number
  }
}

interface SignResponse {
  data: { items: { uploadUrl: string; key: string }[] }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${bytes} B`
}

function basename(key: string): string {
  return key.split("/").pop() ?? key
}

export default function Gallery() {
  const t = useTranslations("Resources.gallery")
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [rows, setRows] = useState<AdminPhotoRow[]>([])
  const [total, setTotal] = useState(0)
  const [used, setUsed] = useState(0)
  const [capacity, setCapacity] = useState(2 * 1024 * 1024 * 1024)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<{
    id: number
    name: string
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    })

    fetchJson<ListResponse>(`/api/admin/gallery?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (controller.signal.aborted) return
        setRows(res.data)
        setTotal(res.meta.total)
        setUsed(res.meta.used)
        setCapacity(res.meta.capacity)
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return
        setError(err.message)
        setRows([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleFiles = async (files: File[]) => {
    setUploadError(null)
    if (files.length === 0) return

    if (files.length > MAX_BATCH) {
      setUploadError(t("tooManyFiles", { max: MAX_BATCH }))
      return
    }

    for (const file of files) {
      if (
        !(ALLOWED_TYPES as readonly string[]).includes(file.type)
      ) {
        setUploadError(t("fileType"))
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(t("fileTooLarge", { maxKb: MAX_FILE_SIZE / 1024 }))
        return
      }
    }

    setUploading(true)
    try {
      const sign = await fetchJson<SignResponse>(
        "/api/admin/uploads/gallery/sign",
        {
          method: "POST",
          body: JSON.stringify({
            files: files.map((f) => ({
              contentType: f.type,
              fileSize: f.size,
            })),
          }),
        },
      )

      await Promise.all(
        sign.data.items.map(async (item, idx) => {
          const file = files[idx]!
          const res = await fetch(item.uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          })
          if (!res.ok) throw new Error(`R2 upload failed (${res.status})`)
        }),
      )

      await fetchJson("/api/admin/gallery", {
        method: "POST",
        body: JSON.stringify({
          photos: sign.data.items.map((item, idx) => ({
            photo_key: item.key,
            file_size: files[idx]!.size,
            original_name: files[idx]!.name,
          })),
        }),
      })

      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      if (msg === "GALLERY_LIMIT_REACHED") {
        setUploadError(t("limitReached"))
      } else {
        setUploadError(msg)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="flex flex-col p-6">
          <div className="mx-auto w-full max-w-[1280px] px-4">
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files
                  ? Array.from(e.target.files)
                  : []
                e.target.value = ""
                handleFiles(picked)
              }}
            />

            <div className="flex flex-col">
              <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
                <Badge variant="secondary">
                  {t("spaceUsage", {
                    used: formatSize(used),
                    total: formatSize(capacity),
                  })}
                </Badge>
                <Button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="bg-secondry-web text-white hover:bg-secondry-web/90"
                >
                  <Upload />
                  {uploading ? t("uploading") : t("upload")}
                </Button>
              </div>

              {uploadError && (
                <p className="pb-2 text-sm text-destructive">{uploadError}</p>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("columns.id")}</TableHead>
                      <TableHead>{t("columns.fileName")}</TableHead>
                      <TableHead>{t("columns.size")}</TableHead>
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
                        const fileName =
                          row.original_name ?? basename(row.photo_key)
                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{fileName}</TableCell>
                            <TableCell>{formatSize(row.file_size)}</TableCell>
                            <TableCell>
                              {new Date(row.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{row.author_name}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={t("actionsFor", {
                                      name: fileName,
                                    })}
                                  >
                                    <Ellipsis />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={row.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {t("actionsMenu.view")}
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setDeletingTarget({
                                        id: row.id,
                                        name: fileName,
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

              <div className="flex items-center justify-end gap-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  {t("next")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DelPhoto
        photoId={deletingTarget?.id ?? null}
        photoName={deletingTarget?.name}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null)
        }}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
