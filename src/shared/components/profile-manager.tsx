import { useCallback, useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem, CookieProfile } from "../types/cookie"
import { useCookieStore } from "../stores/cookie-store"
import { showToast } from "./toast"

interface ProfileManagerProps {
  currentCookies: CookieItem[]
  currentDomain?: string
  onRestoreProfile: (cookies: CookieItem[]) => Promise<void>
}

export function ProfileManager({ currentCookies, currentDomain, onRestoreProfile }: ProfileManagerProps) {
  const { profiles, addProfile, removeProfile } = useCookieStore()
  const [showSave, setShowSave] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [restoring, setRestoring] = useState<string | null>(null)

  const handleSave = useCallback(() => {
    if (!profileName.trim()) return
    addProfile({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: profileName.trim(), cookies: currentCookies,
      domain: currentDomain || "all", createdAt: Date.now()
    })
    showToast(`${t("toast_saved")} "${profileName.trim()}"`)
    setProfileName(""); setShowSave(false)
  }, [profileName, currentCookies, currentDomain, addProfile])

  const handleRestore = useCallback(async (profile: CookieProfile) => {
    try { setRestoring(profile.id); await onRestoreProfile(profile.cookies) }
    finally { setRestoring(null) }
  }, [onRestoreProfile])

  const handleRemove = useCallback((profile: CookieProfile) => {
    removeProfile(profile.id)
    showToast(`${t("toast_deleted")} "${profile.name}"`)
  }, [removeProfile])

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {t("profiles_title")} ({profiles.length})
        </h3>
        <button onClick={() => setShowSave(!showSave)}
          className="rounded bg-cookie-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-cookie-600">
          {t("btn_save_current")}
        </button>
      </div>

      {showSave && (
        <div className="border-b border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
              placeholder={t("profile_name_placeholder")}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-cookie-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            <button onClick={handleSave} disabled={!profileName.trim()}
              className="rounded bg-cookie-500 px-2 py-1 text-xs text-white hover:bg-cookie-600 disabled:opacity-50">
              {t("btn_save")}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            {currentCookies.length} cookie — {currentDomain || "all"}
          </p>
        </div>
      )}

      <div className="max-h-48 overflow-y-auto">
        {profiles.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">{t("no_profiles")}</div>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between border-b border-gray-50 px-3 py-2 last:border-0 dark:border-gray-700">
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-800 truncate dark:text-gray-200">{profile.name}</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">
                  {profile.cookies.length} cookie &middot; {profile.domain} &middot; {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleRestore(profile)} disabled={restoring === profile.id}
                  className="rounded px-2 py-0.5 text-xs text-cookie-600 hover:bg-cookie-50 disabled:opacity-50 dark:text-cookie-400 dark:hover:bg-cookie-900/30">
                  {restoring === profile.id ? "..." : t("btn_restore")}
                </button>
                <button onClick={() => handleRemove(profile)}
                  className="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
