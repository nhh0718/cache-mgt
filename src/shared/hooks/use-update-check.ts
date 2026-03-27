import { useCallback, useEffect, useState } from "react"

interface UpdateInfo {
  available: boolean
  version: string | null
  checking: boolean
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

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(GITHUB_API)
    if (!res.ok) return null
    const json = await res.json()
    return (json.tag_name as string || "").replace(/^v/, "") || null
  } catch {
    return null
  }
}

/**
 * Check GitHub releases for newer version.
 * Only runs for unpacked installs (no update_url in manifest).
 * Caches result for 24h. Exposes checkNow() for manual trigger.
 */
export function useUpdateCheck() {
  const [state, setState] = useState<UpdateInfo>({ available: false, version: null, checking: false })

  const doCheck = useCallback(async (force: boolean) => {
    const manifest = chrome.runtime.getManifest()
    if ((manifest as any).update_url) return
    const localVersion = manifest.version

    setState(s => ({ ...s, checking: true }))

    if (!force) {
      const data = await chrome.storage.local.get(STORAGE_KEY)
      const last = data[STORAGE_KEY] as { timestamp: number; version: string | null } | undefined
      if (last && Date.now() - last.timestamp < CHECK_INTERVAL_MS) {
        const avail = !!(last.version && isNewer(last.version, localVersion))
        setState({ available: avail, version: avail ? last.version : null, checking: false })
        return
      }
    }

    const remoteVersion = await fetchLatestVersion()
    if (remoteVersion) {
      await chrome.storage.local.set({ [STORAGE_KEY]: { timestamp: Date.now(), version: remoteVersion } })
      const avail = isNewer(remoteVersion, localVersion)
      setState({ available: avail, version: avail ? remoteVersion : null, checking: false })
    } else {
      setState(s => ({ ...s, checking: false }))
    }
  }, [])

  useEffect(() => { doCheck(false) }, [doCheck])

  /** Force check, ignoring cache */
  const checkNow = useCallback(() => doCheck(true), [doCheck])

  return { ...state, checkNow }
}
