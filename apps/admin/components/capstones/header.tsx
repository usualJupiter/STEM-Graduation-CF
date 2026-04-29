"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

import CreateProject from "@/components/capstones/createProject"

export default function CapstonesHeader() {
  const t = useTranslations("Capstones")
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-[30px] font-semibold leading-9 text-foreground">
              {t("title")}
            </h1>
            <p className="text-base text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-8 w-full bg-secondry-web text-base text-white hover:bg-secondry-web/90"
            >
              <Plus />
              {t("createProject")}
            </Button>
          </div>
        </div>
      </div>
      <CreateProject open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
