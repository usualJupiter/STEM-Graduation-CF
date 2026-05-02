"use client"

import { useLocale, useTranslations } from "next-intl"

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function Header() {
  const t = useTranslations("Settings")
  const dir = useLocale() === "ar" ? "rtl" : "ltr"

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1280px] border-b border-border">
        <Tabs defaultValue="access" dir={dir}>
          <TabsList variant="line" className="h-10 gap-2 bg-transparent p-0">
            <TabsTrigger value="access" className="px-4 text-sm">
              {t("tabs.access")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
