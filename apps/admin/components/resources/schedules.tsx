"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

import { fetchJson } from "@/lib/api"

const LEVELS = [1, 2, 3, 4] as const
const DRIVE_PREVIEW = /^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/preview$/

type Translator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string

function buildSchema(t: Translator) {
  const url = z.string().regex(DRIVE_PREVIEW, t("invalidUrl"))
  return z.object({
    level1: url,
    level2: url,
    level3: url,
    level4: url,
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

interface ScheduleRow {
  level: number
  drive_url: string
  updated_at: string
  updated_by: string | null
}

interface ListResponse {
  data: ScheduleRow[]
}

export default function Schedules() {
  const t = useTranslations("Resources.schedules")
  const schema = useMemo(() => buildSchema(t), [t])
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<FormValues>({
    // @ts-expect-error zod@4 schema types don't satisfy @hookform/resolvers@5 overloads (runtime is fine)
    resolver: zodResolver(schema),
    defaultValues: { level1: "", level2: "", level3: "", level4: "" },
  })

  useEffect(() => {
    let cancelled = false
    fetchJson<ListResponse>("/api/admin/schedules")
      .then((res) => {
        if (cancelled) return
        const map = new Map(res.data.map((r) => [r.level, r.drive_url]))
        form.reset({
          level1: map.get(1) ?? "",
          level2: map.get(2) ?? "",
          level3: map.get(3) ?? "",
          level4: map.get(4) ?? "",
        })
      })
      .catch(() => {
        /* user can still edit and save */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [form])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      await fetchJson("/api/admin/schedules", {
        method: "PUT",
        body: JSON.stringify({
          levels: LEVELS.map((level) => ({
            level,
            drive_url: values[`level${level}` as keyof FormValues],
          })),
        }),
      })
      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("saveFailed"))
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="flex flex-col items-center gap-8 px-6 pb-6">
      <div className="w-full max-w-[1280px] rounded-none border border-border bg-background shadow-sm">
        <div className="flex flex-col p-6">
          <div className="mx-auto w-full max-w-[1280px] px-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 lg:flex-row"
              >
                <div className="flex flex-col gap-1 lg:w-1/2">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {t("title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("description")}
                  </p>
                </div>
                <div className="flex flex-col gap-6 lg:w-1/2">
                  {LEVELS.map((level) => {
                    const name = `level${level}` as keyof FormValues
                    return (
                      <FormField
                        key={level}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("level", { number: level })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                dir="ltr"
                                disabled={loading || isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  })}
                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="text-sm text-emerald-600">{t("saved")}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="bg-secondry-web text-white hover:bg-secondry-web/90"
                  >
                    {isSubmitting ? t("saving") : t("save")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
