import type { CookieItem, CookieFilterField, CookieSortConfig } from "../types/cookie"

/**
 * Filter cookies by search query across multiple fields.
 * Case-insensitive matching on name, value, domain, and path.
 */
export function filterCookies(
  cookies: CookieItem[],
  query: string,
  fields: CookieFilterField[] = ["name", "value", "domain", "path"]
): CookieItem[] {
  if (!query.trim()) return cookies

  const lowerQuery = query.toLowerCase()
  return cookies.filter((cookie) =>
    fields.some((field) => cookie[field].toLowerCase().includes(lowerQuery))
  )
}

/**
 * Filter cookies by domain. Supports partial matching.
 */
export function filterByDomain(
  cookies: CookieItem[],
  domain: string
): CookieItem[] {
  if (!domain.trim()) return cookies
  const lowerDomain = domain.toLowerCase()
  return cookies.filter((c) => c.domain.toLowerCase().includes(lowerDomain))
}

/**
 * Sort cookies by any field.
 */
export function sortCookies(
  cookies: CookieItem[],
  config: CookieSortConfig
): CookieItem[] {
  return [...cookies].sort((a, b) => {
    const aVal = a[config.field]
    const bVal = b[config.field]

    if (typeof aVal === "string" && typeof bVal === "string") {
      const cmp = aVal.localeCompare(bVal)
      return config.direction === "asc" ? cmp : -cmp
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return config.direction === "asc" ? aVal - bVal : bVal - aVal
    }

    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      const cmp = Number(aVal) - Number(bVal)
      return config.direction === "asc" ? cmp : -cmp
    }

    return 0
  })
}

/**
 * Get unique domains from a cookie list, sorted alphabetically.
 */
export function getUniqueDomains(cookies: CookieItem[]): string[] {
  const domains = new Set(cookies.map((c) => c.domain))
  return Array.from(domains).sort()
}

/**
 * Group cookies by domain.
 */
export function groupByDomain(
  cookies: CookieItem[]
): Record<string, CookieItem[]> {
  const groups: Record<string, CookieItem[]> = {}
  for (const cookie of cookies) {
    if (!groups[cookie.domain]) groups[cookie.domain] = []
    groups[cookie.domain].push(cookie)
  }
  return groups
}
