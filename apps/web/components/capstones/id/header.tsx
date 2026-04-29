"use client"

import { motion } from "motion/react"

import { fadeUpVariants, sectionContainer } from "@/lib/animations"

interface HeaderProps {
  tagline: string
  title: string
  description: string
  supervisorLabel: string
  supervisorNames: string
  studentsLabel: string
  studentsLines: string[]
}

export default function Header({
  tagline,
  title,
  description,
  supervisorLabel,
  supervisorNames,
  studentsLabel,
  studentsLines,
}: HeaderProps) {
  return (
    <section className="relative w-full overflow-hidden bg-secondry-web">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none bg-[url('https://cdn.stem-program.com/assets/capstone-header-bg.svg')] bg-[length:100%_100%] bg-no-repeat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="relative z-10 flex min-h-[400px] w-full items-center justify-center px-4 py-16 sm:min-h-[500px] sm:px-8 md:min-h-[598px] md:px-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionContainer}
          className="flex w-full max-w-[700px] flex-col items-center gap-10"
        >
          <div className="flex w-full flex-col items-center gap-4">
            <motion.p
              variants={fadeUpVariants}
              className="text-sm font-medium text-primary-foreground/80"
            >
              {tagline}
            </motion.p>

            <motion.h1
              variants={fadeUpVariants}
              className="text-center text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-[60px] lg:leading-[60px]"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={fadeUpVariants}
              className="whitespace-pre-line text-center text-base text-primary-foreground/80 sm:text-lg sm:leading-8"
            >
              {description}
            </motion.p>

            {supervisorNames && (
              <>
                <motion.h2
                  variants={fadeUpVariants}
                  className="text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl sm:leading-8"
                >
                  {supervisorLabel}
                </motion.h2>

                <motion.p
                  variants={fadeUpVariants}
                  className="text-center text-base text-primary-foreground/80 sm:text-lg sm:leading-8"
                >
                  {supervisorNames}
                </motion.p>
              </>
            )}

            {studentsLines.length > 0 && (
              <>
                <motion.h2
                  variants={fadeUpVariants}
                  className="text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl sm:leading-8"
                >
                  {studentsLabel}
                </motion.h2>

                <motion.div
                  variants={fadeUpVariants}
                  className="text-center text-base leading-6 text-primary-foreground/80 sm:text-lg"
                >
                  {studentsLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
