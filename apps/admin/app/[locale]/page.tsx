import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  const t = useTranslations("Dashboard")

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("title")}</h1>
          <p>{t("description")}</p>
          <p>{t("buttonHint")}</p>
          <Button className="mt-2">{t("button")}</Button>
        </div>
        <div className="text-muted-foreground font-mono text-xs">
          {t.rich("darkModeHint", { kbd: (chunks) => <kbd>{chunks}</kbd> })}
        </div>
      </div>
    </div>
  )
}
