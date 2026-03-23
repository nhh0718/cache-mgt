/** Represents a browser cookie with all Chrome cookie properties */
export interface CookieItem {
  name: string
  value: string
  domain: string
  path: string
  secure: boolean
  httpOnly: boolean
  sameSite: chrome.cookies.SameSiteStatus
  expirationDate?: number
  session: boolean
  storeId: string
}

/** A named set of cookies that can be saved and restored */
export interface CookieProfile {
  id: string
  name: string
  cookies: CookieItem[]
  domain: string
  createdAt: number
}

/** Cookie change event from the background service worker */
export interface CookieChangeEvent {
  cookie: CookieItem
  cause: chrome.cookies.OnChangedCause
  removed: boolean
  timestamp: number
}

/** Supported cookie export formats */
export type ExportFormat = "json" | "netscape" | "header"

/** Fields available for filtering cookies */
export type CookieFilterField = "name" | "value" | "domain" | "path"

/** Sort direction */
export type SortDirection = "asc" | "desc"

/** Sort configuration */
export interface CookieSortConfig {
  field: keyof CookieItem
  direction: SortDirection
}
