import { useEffect, useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem } from "../types/cookie"

interface CloneCookieDialogProps {
  cookie: CookieItem
  onConfirm: (targetUrl: string) => void
  onCancel: () => void
}

function deriveTargetDomain(url: string): string {
  try {
    const { hostname } = new URL(url)
    const parts = hostname.split(".")
    if (parts.length > 2) return "." + parts.slice(-2).join(".")
    return hostname
  } catch {
    return ""
  }
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export function CloneCookieDialog({ cookie, onConfirm, onCancel }: CloneCookieDialogProps) {
  const [targetUrl, setTargetUrl] = useState("")
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])

  useEffect(() => {
    chrome.tabs.query({}).then((all) => setTabs(all.filter((t) => !!t.url).slice(0, 20)))
  }, [])

  const derivedDomain = deriveTargetDomain(targetUrl)
  const isHttp = targetUrl.startsWith("http://")
  const showSecureWarning = cookie.secure && isHttp
  const valid = isValidUrl(targetUrl)

  return (
    <div className="bg-gray-50 px-8 py-3 text-xs dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t("clone_title")}</div>

      <div className="flex flex-col gap-2">
        <div>
          <label className="text-gray-500 dark:text-gray-400">{t("clone_target_url")}</label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder={t("clone_target_placeholder")}
            className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 focus:border-purple-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        {tabs.length > 0 && (
          <div>
            <label className="text-gray-500 dark:text-gray-400">{t("clone_or_select_tab")}</label>
            <select
              value=""
              onChange={(e) => { if (e.target.value) setTargetUrl(e.target.value) }}
              className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 focus:border-purple-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">— select tab —</option>
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.url ?? ""}>
                  {tab.title ?? tab.url}
                </option>
              ))}
            </select>
          </div>
        )}

        {derivedDomain && (
          <div className="text-gray-500 dark:text-gray-400">
            {t("clone_domain_preview")} <span className="font-medium text-gray-700 dark:text-gray-300">{derivedDomain}</span>
          </div>
        )}

        {showSecureWarning && (
          <div className="rounded bg-yellow-50 px-2 py-1 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            ⚠ {t("clone_secure_warning")}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onCancel}
            className="rounded border border-gray-200 px-3 py-1 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            {t("btn_cancel")}
          </button>
          <button
            onClick={() => valid && onConfirm(targetUrl)}
            disabled={!valid}
            className="rounded bg-purple-500 px-3 py-1 text-white hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed">
            {t("btn_clone")}
          </button>
        </div>
      </div>
    </div>
  )
}
