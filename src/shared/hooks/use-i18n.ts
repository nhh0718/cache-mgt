import { useCallback, useEffect, useState } from "react"

import viMessages from "../../../assets/locales/vi/messages.json"
import enMessages from "../../../assets/locales/en/messages.json"

export type Locale = "vi" | "en"

const STORAGE_KEY = "cookie-manager-locale"

type MessageFile = Record<string, { message: string }>

const messages: Record<Locale, MessageFile> = {
  vi: viMessages as MessageFile,
  en: enMessages as MessageFile
}

let currentLocale: Locale = "vi"
let listeners: Array<() => void> = []

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

/** Get translation for a key using current locale */
export function t(key: string, subs?: string[]): string {
  const msg = messages[currentLocale]?.[key]?.message
  if (!msg) return key
  if (!subs) return msg
  // Replace $1, $2, etc with substitutions
  return subs.reduce((result, sub, i) => result.replace(`$${i + 1}`, sub), msg)
}

/** Get current locale */
export function getLocale(): Locale {
  return currentLocale
}

/**
 * Hook for i18n — provides t() that re-renders on locale change.
 */
export function useI18n() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1)
    listeners.push(listener)
    return () => { listeners = listeners.filter((l) => l !== listener) }
  }, [])

  return { t, locale: currentLocale }
}

/**
 * Hook to manage locale selection with persistence.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(currentLocale)

  // Load saved locale on mount
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const saved = result[STORAGE_KEY] as Locale | undefined
      if (saved && messages[saved]) {
        currentLocale = saved
        setLocaleState(saved)
        notifyListeners()
      }
    })
  }, [])

  // Sync across views
  useEffect(() => {
    const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEY]) {
        const newLocale = changes[STORAGE_KEY].newValue as Locale
        if (newLocale && messages[newLocale]) {
          currentLocale = newLocale
          setLocaleState(newLocale)
          notifyListeners()
        }
      }
    }
    chrome.storage.onChanged.addListener(handler)
    return () => chrome.storage.onChanged.removeListener(handler)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    currentLocale = newLocale
    setLocaleState(newLocale)
    chrome.storage.local.set({ [STORAGE_KEY]: newLocale })
    notifyListeners()
  }, [])

  return { locale, setLocale }
}
