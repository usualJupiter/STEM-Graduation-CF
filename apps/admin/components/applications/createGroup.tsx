"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

import { APPLICATION_GROUPS_INVALIDATE_EVENT } from "@/components/applications/constants"
import { fetchJson } from "@/lib/api"

interface CreateGroupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type Translator = (key: string, values?: Record<string, unknown>) => string

function buildSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(1, t("validation.required")),
  })
}
type FormValues = z.infer<ReturnType<typeof buildSchema>>

export default function CreateGroup({ open, onOpenChange }: CreateGroupProps) {
  const t = useTranslations("Applications.createGroupDialog")
  const schema = useMemo(() => buildSchema(t as Translator), [t])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    // @ts-expect-error zod@4 schema types don't satisfy @hookform/resolvers@5 overloads (runtime is fine)
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await fetchJson("/api/admin/applications/groups", {
        method: "POST",
        body: JSON.stringify(values),
      })
      window.dispatchEvent(new Event(APPLICATION_GROUPS_INVALIDATE_EVENT))
      onOpenChange?.(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("createFailed"))
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (isSubmitting) return
        onOpenChange?.(o)
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondry-web text-white hover:bg-secondry-web/90"
              >
                {isSubmitting ? t("submitting") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
