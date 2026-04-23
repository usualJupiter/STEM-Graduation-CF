"use client"

import Link from "next/link"

interface EventItem {
  id: number
  date: string
  time: string
  title: string
  description: string
  image: string
  href: string
}

const events: EventItem[] = [
  {
    id: 1,
    date: "Nov 11, 2024",
    time: "8:00 AM",
    title: "This is event header This is event header",
    description:
      "this event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpition",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 2,
    date: "Nov 11, 2024",
    time: "8:00 AM",
    title: "This is event header This is event header",
    description:
      "this event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpition",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
  {
    id: 3,
    date: "Nov 11, 2024",
    time: "8:00 AM",
    title: "This is event header This is event header",
    description:
      "this event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpitionthis event descitpition",
    image: "https://ui.shadcn.com/placeholder.svg",
    href: "#",
  },
]

interface Frame12Props {
  items?: EventItem[]
}

export default function Frame12({ items = events }: Frame12Props) {
  return (
    <div className="flex w-full items-center justify-center bg-background px-4 py-10 md:px-8 lg:py-16">
      <div className="grid w-full max-w-[1294px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-[84px]">
        {items.map((event) => (
          <Link
            key={event.id}
            href={event.href}
            className="group flex flex-col gap-4"
          >
            <img
              src={event.image}
              alt={event.title}
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {event.date}
                </span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {event.time}
                </span>
              </div>
              <h3 className="text-base font-semibold leading-6 text-foreground">
                {event.title}
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                {event.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
