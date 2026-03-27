import { useEffect, useState } from "react"

interface UpdateInfo {
  available: boolean
  version: string | null
}

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours
const GITHUB_API = "https://api.github.com/repos/nhh0718/cache-mgt/releases/latest"
const STORAGE_KEY = "lastUpdateCheck"

/** Compare semver strings: returns true if remote > local */
function isNewer(remote: string, local: string): boolean {
  const r = remote.split(".").map(Number)
  const l = local.split(".").map(Number)
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true
    if ((r[i] || 0) < (l[i] || 0)) return false
  }
  return false
}

/**
 * Check GitHub releases for newer version.
 * Only runs for unpacked installs (no update_url in manifest).
 * Caches result for 24h in chrome.storage.local.
 */
export function useUpdateCheck(): UpdateInfo | null {
  const [update, setUpdate] = useState<UpdateInfo | null>(null)

  useEffect(() => {
    // Skip on Chrome Web Store installs — CWS auto-updates
    const manifest = chrome.runtime.getManifest()
    if ((manifest as any).update_url) return

    const localVersion = manifest.version

    chrome.storage.local.get(STORAGE_KEY).then(async (data) => {
      const last = data[STORAGE_KEY] as { timestamp: number; version: string | null } | undefined
      if (last && Date.now() - last.timestamp < CHECK_INTERVAL_MS) {
        // Use cached result
        if (last.version && isNewer(last.version, localVersion)) {
          setUpdate({ available: true, version: last.version })
        }
        return
      }

      try {
        const res = await fetch(GITHUB_API)
        if (!res.ok) return
        const json = await res.json()
        const remoteVersion = (json.tag_name as string || "").replace(/^v/, "")

        await chrome.storage.local.set({
          [STORAGE_KEY]: { timestamp: Date.now(), version: remoteVersion }
        })

        if (isNewer(remoteVersion, localVersion)) {
          setUpdate({ available: true, version: remoteVersion })
        }
      } catch {
        // Network error — silently ignore
      }
    })
  }, [])

  return update
}
