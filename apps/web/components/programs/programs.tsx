"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { AspectRatio } from "@workspace/ui/components/aspect-ratio"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

const SUBJECT_KEYS = [
  "physics",
  "chemistry",
  "biology",
  "geology",
  "mathematics",
] as const

type SubjectKey = (typeof SUBJECT_KEYS)[number]

interface ProgramsProps {
  defaultSubject?: SubjectKey
}

const DETAIL_KEYS = ["course", "duration", "credit", "degree"] as const

export default function Programs({
  defaultSubject = "physics",
}: ProgramsProps) {
  const t = useTranslations("Programs")
  const [subject, setSubject] = useState<SubjectKey>(defaultSubject)

  return (
    <section className="bg-background px-6 py-12 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <ToggleGroup
          type="single"
          value={subject}
          onValueChange={(val) => {
            if (val) setSubject(val as SubjectKey)
          }}
          variant="outline"
        >
          {SUBJECT_KEYS.map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="border-transparent bg-secondry-web text-white hover:bg-secondry-web/90 hover:text-white data-[state=on]:bg-main data-[state=on]:text-main-foreground"
            >
              {t(`subjects.${key}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <article className="rounded-xl border border-secondry-web bg-card shadow-sm">
              <header className="flex flex-col gap-1 p-4">
                <h2 className="text-base font-medium text-card-foreground">
                  {t("overview.heading")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("overview.subheading")}
                </p>
              </header>
              <dl className="flex flex-col gap-2 px-4 pb-4">
                {DETAIL_KEYS.map((field) => (
                  <div key={field} className="flex flex-wrap gap-2">
                    <dt className="text-base font-medium leading-6 text-foreground">
                      {t(`labels.${field}`)}:
                    </dt>
                    <dd className="text-base leading-6 text-foreground">
                      {t(`details.${subject}.${field}`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>

            <p className="whitespace-pre-line break-words text-base leading-7 text-foreground">
              {t(`details.${subject}.description`)}
            </p>
          </div>

          <div className="w-full shrink-0 lg:w-[380px]">
            <AspectRatio ratio={3 / 4}>
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="rounded-lg object-cover"
                unoptimized
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  )
}
