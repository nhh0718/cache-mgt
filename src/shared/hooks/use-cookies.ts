import { useCallback, useEffect, useState } from "react"

import type { CookieItem } from "../types/cookie"

/** Convert chrome.cookies.Cookie to our CookieItem type */
function toCookieItem(c: chrome.cookies.Cookie): CookieItem {
  return {
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    expirationDate: c.expirationDate,
    session: c.session,
    storeId: c.storeId
  }
}

/** Build the URL needed by chrome.cookies API from domain + path + secure */
function buildCookieUrl(domain: string, path: string, secure: boolean): string {
  const protocol = secure ? "https" : "http"
  const cleanDomain = domain.startsWith(".") ? domain.slice(1) : domain
  return `${protocol}://${cleanDomain}${path}`
}

interface UseCookiesOptions {
  /** If provided, only fetch cookies for this domain */
  domain?: string
  /** If provided, only fetch cookies matching this URL */
  url?: string
}

/**
 * Hook for cookie CRUD operations via chrome.cookies API.
 * Provides loading state, error handling, and auto-refresh on cookie changes.
 */
export function useCookies(options: UseCookiesOptions = {}) {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCookies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const query: chrome.cookies.GetAllDetails = {}
      if (options.domain) query.domain = options.domain
      if (options.url) query.url = options.url

      const result = await chrome.cookies.getAll(query)
      setCookies(result.map(toCookieItem))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cookies")
    } finally {
      setLoading(false)
    }
  }, [options.domain, options.url])

  const setCookie = useCallback(
    async (cookie: Partial<CookieItem> & { name: string; value: string; domain: string }) => {
      try {
        const url = buildCookieUrl(
          cookie.domain,
          cookie.path || "/",
          cookie.secure ?? false
        )

        await chrome.cookies.set({
          url,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path || "/",
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite || "unspecified",
          expirationDate: cookie.expirationDate
        })

        await fetchCookies()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to set cookie")
        throw err
      }
    },
    [fetchCookies]
  )

  const removeCookie = useCallback(
    async (cookie: CookieItem) => {
      try {
        const url = buildCookieUrl(cookie.domain, cookie.path, cookie.secure)
        await chrome.cookies.remove({ url, name: cookie.name })
        await fetchCookies()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove cookie")
        throw err
      }
    },
    [fetchCookies]
  )

  const removeMultiple = useCallback(
    async (cookiesToRemove: CookieItem[]) => {
      try {
        await Promise.all(
          cookiesToRemove.map((c) => {
            const url = buildCookieUrl(c.domain, c.path, c.secure)
            return chrome.cookies.remove({ url, name: c.name })
          })
        )
        await fetchCookies()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove cookies")
        throw err
      }
    },
    [fetchCookies]
  )

  // Initial fetch
  useEffect(() => {
    fetchCookies()
  }, [fetchCookies])

  // Listen for cookie changes and auto-refresh
  useEffect(() => {
    const listener = () => {
      fetchCookies()
    }
    chrome.cookies.onChanged.addListener(listener)
    return () => chrome.cookies.onChanged.removeListener(listener)
  }, [fetchCookies])

  return {
    cookies,
    loading,
    error,
    refresh: fetchCookies,
    setCookie,
    removeCookie,
    removeMultiple
  }
}
