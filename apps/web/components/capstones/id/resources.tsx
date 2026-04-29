"use client"

import Link from "next/link"
import { ArrowRight, CloudDownload } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@workspace/ui/components/button"

import {
  fadeUpVariants,
  inViewport,
  sectionContainer,
} from "@/lib/animations"

interface ResourcesProps {
  title: string
  tagline: string
  presentation: { label: string; href: string } | null
  portfolio: { label: string; href: string } | null
  poster: { label: string; href: string } | null
  browse: { label: string; href: string }
}

export default function Resources({
  title,
  tagline,
  presentation,
  portfolio,
  poster,
  browse,
}: ResourcesProps) {
  const downloads = [presentation, portfolio, poster].filter(
    (l): l is { label: string; href: string } => l !== null,
  )

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={inViewport}
      variants={sectionContainer}
      className="w-full bg-web-card-1"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-24 md:gap-10">
        <motion.h2
          variants={fadeUpVariants}
          className="text-4xl font-bold text-primary"
        >
          {title}
        </motion.h2>
        <motion.p
          variants={fadeUpVariants}
          className="text-sm font-bold text-primary/80"
        >
          {tagline}
        </motion.p>
        <motion.div
          variants={fadeUpVariants}
          className="flex w-full max-w-[576px] flex-col gap-2"
        >
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
        </motion.div>
      </div>
    </motion.section>
  )
}
