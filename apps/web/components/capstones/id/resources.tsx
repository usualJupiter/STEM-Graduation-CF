"use client"

import Link from "next/link"
import { CloudDownload, ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface ResourceLink {
  label: string
  href: string
  icon: "download" | "arrow"
  iconPosition: "left" | "right"
}

const resourceLinks: ResourceLink[] = [
  {
    label: "Project Presentation",
    href: "#",
    icon: "download",
    iconPosition: "left",
  },
  {
    label: "Project Portfolio",
    href: "#",
    icon: "download",
    iconPosition: "left",
  },
  {
    label: "Browse Projects",
    href: "#",
    icon: "arrow",
    iconPosition: "right",
  },
]

interface ResourcesProps {
  title?: string
  tagline?: string
  links?: ResourceLink[]
}

export default function Resources({
  title = "Resources",
  tagline = "Links",
  links = resourceLinks,
}: ResourcesProps) {
  return (
    <section className="w-full bg-web-card-1">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-10 px-6 py-24 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-col gap-10 lg:w-auto">
          <h2 className="text-4xl font-bold text-primary">{title}</h2>
          <div className="aspect-square w-60">
            <img
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Resources illustration"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex w-full max-w-[576px] flex-col gap-2">
          <p className="mb-1 text-sm font-bold text-primary/80">{tagline}</p>
          {links.map((link) => (
            <Button
              key={link.label}
              variant="transparent-outline"
              asChild
              className="h-12 w-full justify-center border-primary px-6 text-base font-bold text-primary hover:bg-primary/10 hover:text-primary [&_svg]:size-5"
            >
              <Link href={link.href}>
                {link.iconPosition === "left" && link.icon === "download" && (
                  <CloudDownload />
                )}
                {link.label}
                {link.iconPosition === "right" && link.icon === "arrow" && (
                  <ArrowRight />
                )}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
