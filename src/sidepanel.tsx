import "./style.css"

import { CookieChangeMonitor } from "./shared/components/cookie-change-monitor"
import { CookieIcon } from "./shared/components/cookie-icon"
import { CookieList } from "./shared/components/cookie-list"
import { LocaleToggle } from "./shared/components/locale-toggle"
import { ThemeToggle } from "./shared/components/theme-toggle"
import { ToastContainer } from "./shared/components/toast"
import { useI18n } from "./shared/hooks/use-i18n"
import { useCookies } from "./shared/hooks/use-cookies"
import { useCurrentTab } from "./shared/hooks/use-current-tab"
import { useTheme } from "./shared/hooks/use-theme"

function SidePanel() {
  useTheme()
  const { t } = useI18n()
  const tab = useCurrentTab()
  const { cookies, loading, error, refresh, setCookie, removeCookie, removeMultiple, cloneCookie } =
    useCookies(tab?.url ? { url: tab.url, storeId: tab.storeId } : {})

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CookieIcon size={20} />
            <h1 className="text-sm font-bold text-cookie-700 dark:text-cookie-400">{t("app_title")}</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <LocaleToggle />
            <ThemeToggle />
            <button onClick={async () => {
                const win = await chrome.windows.getCurrent()
                chrome.tabs.create({ url: chrome.runtime.getURL("tabs/fullpage.html"), windowId: win.id })
              }} title={t("open_fullpage")}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
        {tab?.domain && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("cookies_for")} <span className="font-medium text-gray-700 dark:text-gray-300">{tab.domain}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <CookieList cookies={cookies} loading={loading} error={error}
          onSetCookie={setCookie} onDeleteCookie={removeCookie} onDeleteMultiple={removeMultiple}
          onRefresh={refresh} onCloneCookie={cloneCookie} currentDomain={tab?.domain} />
      </div>

      <div className="border-t border-gray-100 p-4 dark:border-gray-700">
        <CookieChangeMonitor />
      </div>
      <ToastContainer />
    </div>
  )
}

export default SidePanel
