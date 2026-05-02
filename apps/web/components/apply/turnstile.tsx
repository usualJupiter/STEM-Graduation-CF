"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string
          callback?: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          language?: string
        },
      ) => string
      remove: (widgetId: string) => void
      reset: (widgetId?: string) => void
    }
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("turnstile_load")))
      return
    }
    const s = document.createElement("script")
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.addEventListener("load", () => resolve())
    s.addEventListener("error", () => reject(new Error("turnstile_load")))
    document.head.appendChild(s)
  })
  return scriptPromise
}

interface TurnstileProps {
  siteKey: string
  onToken: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export default function Turnstile({
  siteKey,
  onToken,
  onExpire,
  onError,
}: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const onExpireRef = useRef(onExpire)
  const onErrorRef = useRef(onError)

  // Keep refs current without retriggering the mount effect.
  useLayoutEffect(() => {
    onTokenRef.current = onToken
    onExpireRef.current = onExpire
    onErrorRef.current = onError
  })

  // Mount the widget once per site key. Callback identity changes
  // would otherwise re-render the widget and re-challenge the user.
  useEffect(() => {
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onErrorRef.current?.(),
          language: "ar",
        })
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.()
      })
    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey])

  return <div ref={ref} />
}
