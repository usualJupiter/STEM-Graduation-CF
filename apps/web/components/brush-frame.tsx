"use client"

import { useId, type ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type BrushVariant = "main" | "secondary" | "tertiary"

const VARIANTS = {
  main: {
    path: "M74.5 267.5L0 206L152.5 0L240.5 45L231 97.5L261 72.5L285.5 54.5L319.5 32.5L334 24.5L351 16.5L367.5 10L384 5L399.5 2L412 1L432 3.5L447 8.5L455.5 12.5L463.5 18L473 27L479.5 37.5L483.5 46.5L485.5 57V66.5V77.5L486.117 87L498 75.5L547.5 30L627.5 91.5L536 239.5V240L538.5 239.5L546.5 236L556 232.5L570.5 229.5H581L585 230L589.5 231.5L595.5 233.5L602 236.5L606 239L611 243L616 248L619 252.5L622 257.5L624.5 264L625.5 269.5L626 283.5V289.5L625 295.5L623.5 301L622 308L619 317L616.5 322L613.5 328L613 330L613.5 331L615.5 332L685 377.5V381.5L679.5 390.5L627.5 472.5L602.5 506.5L577.5 535L558 555L534.5 575.5L507 591.5L490.5 595.5C490.5 595.5 470 595.5 467.5 595.5C465 595.5 449.5 592.5 448 591.5C446.5 590.5 429.5 575.5 429.5 575.5L414.5 550.5L407 525.5L404.5 505V467H403L295.5 565L193 483L137.5 540.5L64 480.5L104.5 439.5L34 413.5L74.5 267.5Z",
    aspectClass: "aspect-[685/596]",
    scaleTransform: "scale(0.00145985 0.00167785)",
  },
  secondary: {
    path: "M25 369.5L0 347V0H721V140.5L615.5 141L648.5 269.5L593 291L624.5 321.5L624 322L566.5 368L523 324L452.5 377L452 376.5L427.5 351V372.5L426.5 376.5L424.5 381.5L421.5 386.5L417.5 392L414 396L409.5 399.5L405.5 402.5L401 405L398 406.5L394 408L390.5 409.5L387 411L383 412L378.5 413L375 414H371H356.5H349.5L343 413L336 411L332.5 410L327 408L314 402.5L295 391.5L285.5 385.5L273.5 377L262 368L254.5 362L249.5 357.5L201.5 394.5L187.5 405L177 393L164 378.5L155 368L148.5 360.5L142 353.5L139 350.5V351.5V352L138 358L135.5 365L132 372.5L129.5 377L126.5 381.5L120 388.5L113 394.5L108 398L102.5 400.5L96 402H86L79.5 401.5L68.5 398L58 393.5L44.5 385.5L25 369.5Z",
    aspectClass: "aspect-[721/414]",
    scaleTransform: "scale(0.00138696 0.00241546)",
  },
  tertiary: {
    path: "M0 0C0 28.5108 11.3259 55.8538 31.486 76.014C51.6462 96.1741 78.9892 107.5 107.5 107.5C136.011 107.5 163.354 96.1741 183.514 76.014C203.674 55.8538 215 28.5108 215 1.6232e-05L107.5 0L0 0Z",
    aspectClass: "aspect-[215/108]",
    scaleTransform: "scale(0.00465116 0.00925926)",
  },
} as const

interface BrushFrameProps {
  children: ReactNode
  className?: string
  variant?: BrushVariant
}

export function BrushFrame({
  children,
  className,
  variant = "main",
}: BrushFrameProps) {
  const id = useId()
  const clipId = `brush-frame-${id}`
  const { path, aspectClass, scaleTransform } = VARIANTS[variant]

  return (
    <>
      <div
        className={cn("relative w-full", aspectClass, className)}
        style={{ clipPath: `url(#${clipId})` }}
      >
        {children}
      </div>
      <svg aria-hidden className="absolute h-0 w-0" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path transform={scaleTransform} d={path} />
          </clipPath>
        </defs>
      </svg>
    </>
  )
}
