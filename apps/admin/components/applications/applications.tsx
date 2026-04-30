"use client"

import { useState } from "react"
import { Search, ChevronDown, Ellipsis } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
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

import ExportApplicationsStudent from "@/components/applications/exportApplicationsStudent"

const SORT_OPTIONS = ["dateNewest", "dateOldest", "nameAsc", "nameDesc"] as const
type SortKey = (typeof SORT_OPTIONS)[number]

const TABLE_DATA = [
  { id: 14, name: "أحمد سالم", group: "2026 Wave 1", date: "Sun 1 Mar 26 13:00" },
  { id: 13, name: "أحمد سالم", group: "2026 Wave 1", date: "Sun 1 Mar 26 13:00" },
  { id: 12, name: "أحمد سالم", group: "2026 Wave 1", date: "Sun 1 Mar 26 13:00" },
  { id: 11, name: "أحمد سالم", group: "2026 Wave 1", date: "Sun 1 Mar 26 13:00" },
  { id: 10, name: "أحمد سالم", group: "2026 Wave 1", date: "Sun 1 Mar 26 13:00" },
]

interface ApplicationsProps {
  className?: string
  data?: typeof TABLE_DATA
}

export default function Applications({
  className,
  data = TABLE_DATA,
}: ApplicationsProps) {
  const t = useTranslations("Applications")
  const [exportingStudent, setExportingStudent] = useState<string | null>(null)

  return (
    <div className={`flex flex-col items-center gap-0 px-6 pb-6 ${className ?? ""}`}>
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="p-6">
          <div className="mx-auto max-w-[1280px] px-4">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput placeholder={t("searchPlaceholder")} />
                </InputGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {t("sort")}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value="dateNewest">
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
                      <TableHead>{t("columns.group")}</TableHead>
                      <TableHead>{t("columns.date")}</TableHead>
                      <TableHead className="w-11" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.group}</TableCell>
                        <TableCell>{row.date}</TableCell>
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
                                onSelect={() => setExportingStudent(row.name)}
                              >
                                {t("actionsMenu.export")}
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive">
                                {t("actionsMenu.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("pagination.selected", { selected: 0, total: data.length })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    {t("pagination.previous")}
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    {t("pagination.next")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExportApplicationsStudent
        open={exportingStudent !== null}
        onOpenChange={(open) => {
          if (!open) setExportingStudent(null)
        }}
        studentName={exportingStudent ?? undefined}
      />
    </div>
  )
}
