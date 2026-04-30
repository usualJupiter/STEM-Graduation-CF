"use client"

import { useState } from "react"
import { Settings, Upload } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import ExportApplicationsGroup from "@/components/applications/exportApplicationsGroup"
import ManageApplications from "@/components/applications/manageApplications"

export default function Header() {
  const t = useTranslations("Applications")
  const [manageOpen, setManageOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-[30px] font-semibold leading-9 text-foreground">
              {t("title")}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-base"
              onClick={() => setManageOpen(true)}
            >
              <Settings />
              {t("manage")}
            </Button>
            <Button
              size="sm"
              className="h-8 bg-secondry-web text-base text-white hover:bg-secondry-web/90"
              onClick={() => setExportOpen(true)}
            >
              <Upload />
              {t("exportApplications")}
            </Button>
          </div>
        </div>
      </div>
      <ManageApplications open={manageOpen} onOpenChange={setManageOpen} />
      <ExportApplicationsGroup
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </div>
  )
}
