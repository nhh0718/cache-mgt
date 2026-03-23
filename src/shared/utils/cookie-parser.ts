import type { CookieItem, ExportFormat } from "../types/cookie"

/**
 * Export cookies to JSON format.
 */
function toJson(cookies: CookieItem[]): string {
  return JSON.stringify(cookies, null, 2)
}

/**
 * Export cookies to Netscape/Mozilla format.
 * Format: domain\tflag\tpath\tsecure\texpiration\tname\tvalue
 */
function toNetscape(cookies: CookieItem[]): string {
  const header = "# Netscape HTTP Cookie File\n# https://curl.se/docs/http-cookies.html\n\n"
  const lines = cookies.map((c) => {
    const flag = c.domain.startsWith(".") ? "TRUE" : "FALSE"
    const secure = c.secure ? "TRUE" : "FALSE"
    const expiry = c.expirationDate ? Math.floor(c.expirationDate) : 0
    return `${c.domain}\t${flag}\t${c.path}\t${secure}\t${expiry}\t${c.name}\t${c.value}`
  })
  return header + lines.join("\n")
}

/**
 * Export cookies to HTTP Set-Cookie header format.
 */
function toHeader(cookies: CookieItem[]): string {
  return cookies
    .map((c) => {
      let header = `${c.name}=${c.value}`
      header += `; Domain=${c.domain}`
      header += `; Path=${c.path}`
      if (c.secure) header += "; Secure"
      if (c.httpOnly) header += "; HttpOnly"
      if (c.sameSite !== "unspecified") header += `; SameSite=${c.sameSite}`
      if (c.expirationDate) {
        header += `; Expires=${new Date(c.expirationDate * 1000).toUTCString()}`
      }
      return header
    })
    .join("\n")
}

/**
 * Export cookies in the specified format.
 */
export function exportCookies(
  cookies: CookieItem[],
  format: ExportFormat
): string {
  switch (format) {
    case "json":
      return toJson(cookies)
    case "netscape":
      return toNetscape(cookies)
    case "header":
      return toHeader(cookies)
  }
}

/**
 * Parse cookies from JSON string.
 */
function parseJson(text: string): CookieItem[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array")
  return parsed.map((c: Record<string, unknown>) => ({
    name: String(c.name || ""),
    value: String(c.value || ""),
    domain: String(c.domain || ""),
    path: String(c.path || "/"),
    secure: Boolean(c.secure),
    httpOnly: Boolean(c.httpOnly),
    sameSite: (c.sameSite as chrome.cookies.SameSiteStatus) || "unspecified",
    expirationDate: c.expirationDate ? Number(c.expirationDate) : undefined,
    session: !c.expirationDate,
    storeId: String(c.storeId || "0")
  }))
}

/**
 * Parse cookies from Netscape format.
 */
function parseNetscape(text: string): CookieItem[] {
  return text
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split("\t")
      if (parts.length < 7) throw new Error(`Invalid Netscape line: ${line}`)
      const [domain, , path, secure, expiry, name, value] = parts
      const expirationDate = Number(expiry)
      return {
        name,
        value: value || "",
        domain,
        path,
        secure: secure === "TRUE",
        httpOnly: false,
        sameSite: "unspecified" as chrome.cookies.SameSiteStatus,
        expirationDate: expirationDate || undefined,
        session: !expirationDate,
        storeId: "0"
      }
    })
}

/**
 * Parse cookies from header string (Cookie: or Set-Cookie format).
 */
function parseHeader(text: string): CookieItem[] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(";").map((p) => p.trim())
      const [nameValue, ...attrs] = parts
      const eqIdx = nameValue.indexOf("=")
      const name = nameValue.slice(0, eqIdx)
      const value = nameValue.slice(eqIdx + 1)

      const cookie: CookieItem = {
        name,
        value,
        domain: "",
        path: "/",
        secure: false,
        httpOnly: false,
        sameSite: "unspecified",
        session: true,
        storeId: "0"
      }

      for (const attr of attrs) {
        const lowerAttr = attr.toLowerCase()
        if (lowerAttr.startsWith("domain=")) {
          cookie.domain = attr.slice(7)
        } else if (lowerAttr.startsWith("path=")) {
          cookie.path = attr.slice(5)
        } else if (lowerAttr === "secure") {
          cookie.secure = true
        } else if (lowerAttr === "httponly") {
          cookie.httpOnly = true
        } else if (lowerAttr.startsWith("samesite=")) {
          cookie.sameSite = attr.slice(9) as chrome.cookies.SameSiteStatus
        } else if (lowerAttr.startsWith("expires=")) {
          const date = new Date(attr.slice(8))
          if (!isNaN(date.getTime())) {
            cookie.expirationDate = date.getTime() / 1000
            cookie.session = false
          }
        }
      }

      return cookie
    })
}

/**
 * Auto-detect format and parse cookies from text.
 */
export function importCookies(text: string): CookieItem[] {
  const trimmed = text.trim()

  // Try JSON first
  if (trimmed.startsWith("[")) {
    return parseJson(trimmed)
  }

  // Try Netscape (starts with comment or has tab-separated fields)
  if (trimmed.startsWith("#") || trimmed.split("\t").length >= 7) {
    return parseNetscape(trimmed)
  }

  // Fall back to header format
  return parseHeader(trimmed)
}

/**
 * Copy cookies as a simple "name=value" string to clipboard.
 */
export function cookiesToClipboardString(cookies: CookieItem[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ")
}
