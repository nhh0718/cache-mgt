import "./style.css"

import { useState } from "react"

import { CookieIcon } from "./shared/components/cookie-icon"
import { CookieList } from "./shared/components/cookie-list"
import { LocaleToggle } from "./shared/components/locale-toggle"
import { ThemeToggle } from "./shared/components/theme-toggle"
import { ToastContainer } from "./shared/components/toast"
import { useI18n } from "./shared/hooks/use-i18n"
import { useCookies } from "./shared/hooks/use-cookies"
import { useCurrentTab } from "./shared/hooks/use-current-tab"
import { useUpdateCheck } from "./shared/hooks/use-update-check"
import { useTheme } from "./shared/hooks/use-theme"

function Popup() {
  useTheme()
  const { t } = useI18n()
  const update = useUpdateCheck()
  const [updateDismissed, setUpdateDismissed] = useState(false)
  const tab = useCurrentTab()
  const { cookies, loading, error, refresh, setCookie, removeCookie, removeMultiple, cloneCookie } =
    useCookies(tab?.url ? { url: tab.url, storeId: tab.storeId } : {})

  const openSidePanel = async () => {
    const win = await chrome.windows.getCurrent()
    if (win.id) chrome.runtime.sendMessage({ type: "open-sidepanel", windowId: win.id })
  }

  return (
    <div className="w-[420px] min-h-[480px] max-h-[580px] bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <CookieIcon size={20} />
          <h1 className="text-sm font-bold text-cookie-700 dark:text-cookie-400">{t("app_title")}</h1>
        </div>
        <div className="flex items-center gap-0.5">
          <LocaleToggle />
          <ThemeToggle />
          <button onClick={openSidePanel} title={t("open_sidepanel")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </button>
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
        <div className="border-b border-gray-50 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("cookies_for")} <span className="font-medium text-gray-700 dark:text-gray-300">{tab.domain}</span>
          </span>
        </div>
      )}

      {update?.available && !updateDismissed && (
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-3 py-1.5 dark:border-blue-800 dark:bg-blue-900/30">
          <span className="text-xs text-blue-700 dark:text-blue-300">
            {t("update_available").replace("{version}", update.version || "")}
            {" "}<span className="text-blue-500 dark:text-blue-400">{t("update_instructions")}</span>
          </span>
          <button onClick={() => setUpdateDismissed(true)}
            className="ml-2 shrink-0 rounded p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-800 dark:hover:text-blue-200">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-3">
        <CookieList cookies={cookies} loading={loading} error={error}
          onSetCookie={setCookie} onDeleteCookie={removeCookie} onDeleteMultiple={removeMultiple}
          onRefresh={refresh} onCloneCookie={cloneCookie} currentDomain={tab?.domain} compact />
      </div>
      <ToastContainer />
    </div>
  )
}

export default Popup
