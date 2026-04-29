"use client"

import Link from "next/link"
import { ArrowRight, CloudDownload } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

interface ResourcesProps {
  title: string
  tagline: string
  imageAlt: string
  presentation: { label: string; href: string } | null
  portfolio: { label: string; href: string } | null
  poster: { label: string; href: string } | null
  browse: { label: string; href: string }
}

export default function Resources({
  title,
  tagline,
  imageAlt,
  presentation,
  portfolio,
  poster,
  browse,
}: ResourcesProps) {
  const downloads = [presentation, portfolio, poster].filter(
    (l): l is { label: string; href: string } => l !== null,
  )

  return (
    <section className="w-full bg-web-card-1">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-10 px-6 py-24 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-col gap-10 lg:w-auto">
          <h2 className="text-4xl font-bold text-primary">{title}</h2>
          <div className="aspect-square w-60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ui.shadcn.com/placeholder.svg"
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex w-full max-w-[576px] flex-col gap-2">
          <p className="mb-1 text-sm font-bold text-primary/80">{tagline}</p>
          {downloads.map((link) => (
            <Button
              key={link.href}
              variant="transparent-outline"
              asChild
              className="h-12 w-full justify-center border-primary px-6 text-base font-bold text-primary hover:bg-primary/10 hover:text-primary [&_svg]:size-5"
            >
              <Link href={link.href} target="_blank" rel="noopener noreferrer">
                <CloudDownload />
                {link.label}
              </Link>
            </Button>
          ))}
          <Button
            variant="transparent-outline"
            asChild
            className="h-12 w-full justify-center border-primary px-6 text-base font-bold text-primary hover:bg-primary/10 hover:text-primary [&_svg]:size-5"
          >
            <Link href={browse.href}>
              {browse.label}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
