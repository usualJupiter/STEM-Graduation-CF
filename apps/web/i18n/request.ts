import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import enMessages from "../messages/en.json"
import arMessages from "../messages/ar.json"

import { routing } from "./routing"

const messagesByLocale = {
  en: enMessages,
  ar: arMessages,
} as const

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: messagesByLocale[locale],
  }
})
