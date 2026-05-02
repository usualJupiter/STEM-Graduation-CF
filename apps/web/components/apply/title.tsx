"use client"

interface TitleProps {
  tagline?: string
  heading?: string
  academicYearLabel?: string
}

export default function Title({
  tagline = "التقديم للبرنامج",
  heading = "طلب التحاق",
  academicYearLabel,
}: TitleProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full max-w-[576px] flex-col items-center gap-5"
    >
      <span className="text-sm font-medium leading-5 text-muted-foreground">
        {tagline}
      </span>
      <h1 className="text-center text-4xl font-semibold leading-10 tracking-tight text-foreground">
        {heading}
      </h1>
      {academicYearLabel && (
        <p className="text-center text-lg leading-8 text-muted-foreground">
          العام الجامعي {academicYearLabel}
        </p>
      )}
    </div>
  )
}
