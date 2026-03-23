import { useCallback, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "cookie-manager-theme"

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

/**
 * Hook for dark/light/system theme management.
 * Persists to chrome.storage.local and syncs across views.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system")

  // Load saved theme on mount
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      const saved = result[STORAGE_KEY] as Theme | undefined
      if (saved) {
        setThemeState(saved)
        applyTheme(saved)
      } else {
        applyTheme("system")
      }
    })
  }, [])

  // Listen for system theme changes when using "system" mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (theme === "system") applyTheme("system")
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  // Sync across views via storage change listener
  useEffect(() => {
    const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEY]) {
        const newTheme = changes[STORAGE_KEY].newValue as Theme
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    }
    chrome.storage.onChanged.addListener(handler)
    return () => chrome.storage.onChanged.removeListener(handler)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    chrome.storage.local.set({ [STORAGE_KEY]: newTheme })
  }, [])

  return { theme, setTheme }
}
