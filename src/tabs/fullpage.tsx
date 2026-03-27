import "../style.css"

import { useCallback, useEffect, useState } from "react"

import { CookieChangeMonitor } from "../shared/components/cookie-change-monitor"
import { CookieIcon } from "../shared/components/cookie-icon"
import { CookieList } from "../shared/components/cookie-list"
import { ImportExportPanel } from "../shared/components/import-export-panel"
import { LocaleToggle } from "../shared/components/locale-toggle"
import { ProfileManager } from "../shared/components/profile-manager"
import { ThemeToggle } from "../shared/components/theme-toggle"
import { ToastContainer, showToast } from "../shared/components/toast"
import { useI18n, t as tStatic } from "../shared/hooks/use-i18n"
import { useCookies } from "../shared/hooks/use-cookies"
import { useTheme } from "../shared/hooks/use-theme"
import type { CookieItem } from "../shared/types/cookie"

type Tab = "cookies" | "profiles" | "import-export" | "monitor"

function FullPage() {
  useTheme()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>("cookies")
  const [storeId, setStoreId] = useState<string>("0")
  useEffect(() => {
    chrome.windows.getCurrent().then(win => {
      if (win.incognito) setStoreId("1")
    })
  }, [])
  const { cookies, loading, error, refresh, setCookie, removeCookie, removeMultiple, cloneCookie } = useCookies({ storeId })

  const handleImport = useCallback(async (importedCookies: CookieItem[]) => {
    let count = 0
    for (const c of importedCookies) {
      try { await setCookie({ name: c.name, value: c.value, domain: c.domain, path: c.path, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, expirationDate: c.expirationDate }); count++ }
      catch { /* skip */ }
    }
    showToast(`${tStatic("toast_imported")} ${count}/${importedCookies.length} cookie`)
  }, [setCookie])

  const handleRestoreProfile = useCallback(async (profileCookies: CookieItem[]) => {
    let count = 0
    for (const c of profileCookies) {
      try { await setCookie({ name: c.name, value: c.value, domain: c.domain, path: c.path, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, expirationDate: c.expirationDate }); count++ }
      catch { /* skip */ }
    }
    showToast(`${tStatic("toast_restored")} ${count} cookie`)
  }, [setCookie])

  const tabs: { id: Tab; label: string }[] = [
    { id: "cookies", label: t("tab_all_cookies") },
    { id: "profiles", label: t("tab_profiles") },
    { id: "import-export", label: t("tab_import_export") },
    { id: "monitor", label: t("tab_monitor") }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-3">
          <div className="flex items-center gap-3">
            <CookieIcon size={28} />
            <h1 className="text-lg font-bold text-cookie-700 dark:text-cookie-400">{t("app_title")}</h1>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {cookies.length} {t("total_cookies")}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <LocaleToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex gap-6">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                  activeTab === tb.id
                    ? "border-cookie-500 text-cookie-700 dark:text-cookie-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>
                {tb.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {activeTab === "cookies" && (
          <CookieList cookies={cookies} loading={loading} error={error}
            onSetCookie={setCookie} onDeleteCookie={removeCookie} onDeleteMultiple={removeMultiple}
            onRefresh={refresh} onCloneCookie={cloneCookie} />
        )}
        {activeTab === "profiles" && <ProfileManager currentCookies={cookies} onRestoreProfile={handleRestoreProfile} />}
        {activeTab === "import-export" && <ImportExportPanel cookies={cookies} onImport={handleImport} />}
        {activeTab === "monitor" && <CookieChangeMonitor />}
      </main>
      <ToastContainer />
    </div>
  )
}

export default FullPage
