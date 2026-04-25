"use client"

import { useMemo, useState } from "react"
import { Search, ChevronDown, Ellipsis } from "lucide-react"
import { useTranslations } from "next-intl"
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

const events = [
  { id: 14, title: "i dunno", date: "Sun 1 Mar 26 13:00", author: "Mohamed Hamdi" },
  { id: 13, title: "i dunno", date: "Sun 1 Mar 26 13:00", author: "Mohamed Hamdi" },
  { id: 12, title: "i dunno", date: "Sun 1 Mar 26 13:00", author: "Mohamed Hamdi" },
  { id: 11, title: "i dunno", date: "Sun 1 Mar 26 13:00", author: "Dr Marian" },
  { id: 10, title: "i dunno", date: "Sun 1 Mar 26 13:00", author: "Dr Marian" },
]

const SORT_OPTIONS = ["dateNewest", "dateOldest", "titleAsc", "titleDesc"] as const
type SortKey = (typeof SORT_OPTIONS)[number]

interface EventsProps {
  className?: string
}

export default function Events({ className }: EventsProps) {
  const t = useTranslations("Events")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("dateNewest")

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = query
      ? events.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.author.toLowerCase().includes(query),
        )
      : events
    const sorted = [...matches]
    switch (sort) {
      case "dateNewest":
        sorted.sort((a, b) => b.id - a.id)
        break
      case "dateOldest":
        sorted.sort((a, b) => a.id - b.id)
        break
      case "titleAsc":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "titleDesc":
        sorted.sort((a, b) => b.title.localeCompare(a.title))
        break
    }
    return sorted
  }, [search, sort])

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
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>{event.author}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={t("actions")}>
                                <Ellipsis />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t("actionsMenu.view")}</DropdownMenuItem>
                              <DropdownMenuItem>{t("actionsMenu.edit")}</DropdownMenuItem>
                              <DropdownMenuItem>{t("actionsMenu.delete")}</DropdownMenuItem>
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
                  {t("pagination.showing", { shown: filteredEvents.length, total: 50 })}
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
    </div>
  )
}
