import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import Header from "@/components/capstones/id/header"
import Pictures from "@/components/capstones/id/pictures"
import Materials from "@/components/capstones/id/materials"
import Producers from "@/components/capstones/id/producers"
import Resources from "@/components/capstones/id/resources"
import { TextSection } from "@/components/capstones/id/text-section"
import {
  type CapstoneDetail,
  type CapstonePerson,
  getCapstone,
} from "@/lib/api"

const STUDENTS_PER_LINE = 5

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

function pickLocalized(locale: string, en: string, ar: string): string {
  if (locale === "ar") return ar || en
  return en || ar
}

function namesForLocale(locale: string, people: CapstonePerson[]): string[] {
  return people.map((p) => pickLocalized(locale, p.name_en, p.name_ar))
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (arr.length === 0) return []
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const capstone = await getCapstone(slug)
  if (!capstone) return {}
  const title = pickLocalized(locale, capstone.title_en, capstone.title_ar)
  const description = pickLocalized(
    locale,
    capstone.full_name_en,
    capstone.full_name_ar,
  )
  return { title, description }
}

export default async function CapstoneDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  const capstone: CapstoneDetail | null = await getCapstone(slug)
  if (!capstone) notFound()

  const t = await getTranslations({ locale, namespace: "Capstone" })

  const semesterLabel = t(`header.semester.${capstone.semester}`)
  const year = new Date(capstone.created_at).getFullYear()
  const tagline = t("header.tagline", {
    level: capstone.level,
    semester: semesterLabel,
    year,
  })

  const title = pickLocalized(locale, capstone.title_en, capstone.title_ar)
  const fullName = pickLocalized(
    locale,
    capstone.full_name_en,
    capstone.full_name_ar,
  )

  const supervisorNames = namesForLocale(locale, capstone.supervisors).join(
    " & ",
  )
  const studentsLines = chunk(
    namesForLocale(locale, capstone.students),
    STUDENTS_PER_LINE,
  ).map((group) => group.join(" & "))

  return (
    <main>
      <Header
        tagline={tagline}
        title={title}
        description={fullName}
        supervisorLabel={t("header.supervisor")}
        supervisorNames={supervisorNames}
        studentsLabel={t("header.students")}
        studentsLines={studentsLines}
      />
      <TextSection
        title={t("sections.abstract")}
        description={pickLocalized(
          locale,
          capstone.abstract_en,
          capstone.abstract_ar,
        )}
        bgClass="bg-web-third"
        headingClass="text-primary"
        bodyClass="text-primary/80"
      />
      <TextSection
        title={t("sections.introduction")}
        description={pickLocalized(
          locale,
          capstone.introduction_en,
          capstone.introduction_ar,
        )}
        bgClass="bg-web-card-3"
        headingClass="text-primary"
        bodyClass="text-primary/80"
      />
      <Pictures
        title={t("sections.pictures")}
        images={capstone.photos.map((p) => ({
          id: p.id,
          image: p.url,
          alt: title,
        }))}
      />
      <TextSection
        title={t("sections.methodology")}
        description={pickLocalized(
          locale,
          capstone.methodology_en,
          capstone.methodology_ar,
        )}
        bgClass="bg-main"
        headingClass="text-main-foreground"
        bodyClass="text-main-foreground/80"
      />
      <TextSection
        title={t("sections.analysis")}
        description={pickLocalized(
          locale,
          capstone.analysis_en,
          capstone.analysis_ar,
        )}
        bgClass="bg-secondry-web"
        headingClass="text-primary-foreground"
        bodyClass="text-primary-foreground/80"
      />
      <TextSection
        title={t("sections.conclusion")}
        description={pickLocalized(
          locale,
          capstone.conclusion_en,
          capstone.conclusion_ar,
        )}
        bgClass="bg-web-third"
        headingClass="text-primary"
        bodyClass="text-primary/80"
      />
      <TextSection
        title={t("sections.recommendations")}
        description={pickLocalized(
          locale,
          capstone.recommendations_en,
          capstone.recommendations_ar,
        )}
        bgClass="bg-web-card-3"
        headingClass="text-primary"
        bodyClass="text-primary/80"
      />
      <Materials
        title={t("sections.materials")}
        items={capstone.materials
          .filter((m) => m.photo_url)
          .map((m) => ({
            id: m.id,
            title: pickLocalized(locale, m.name_en, m.name_ar),
            image: m.photo_url as string,
          }))}
      />
      {capstone.producers_photo_url && (
        <Producers
          title={t("sections.producers")}
          imageUrl={capstone.producers_photo_url}
          imageAlt={t("sections.producers")}
        />
      )}
      <Resources
        title={t("resources.title")}
        tagline={t("resources.tagline")}
        presentation={
          capstone.presentation_link
            ? {
                label: t("resources.presentation"),
                href: capstone.presentation_link,
              }
            : null
        }
        portfolio={
          capstone.portfolio_link
            ? {
                label: t("resources.portfolio"),
                href: capstone.portfolio_link,
              }
            : null
        }
        poster={
          capstone.poster_link
            ? { label: t("resources.poster"), href: capstone.poster_link }
            : null
        }
        browse={{
          label: t("resources.browse"),
          href: `/${locale}/capstones`,
        }}
      />
    </main>
  )
}
