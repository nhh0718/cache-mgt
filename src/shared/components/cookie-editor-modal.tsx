import { useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem } from "../types/cookie"

interface CookieEditorModalProps {
  cookie?: CookieItem
  defaultDomain?: string
  onSave: (cookie: Partial<CookieItem> & { name: string; value: string; domain: string }) => void
  onClose: () => void
}

export function CookieEditorModal({ cookie, defaultDomain = "", onSave, onClose }: CookieEditorModalProps) {
  const [name, setName] = useState(cookie?.name || "")
  const [value, setValue] = useState(cookie?.value || "")
  const [domain, setDomain] = useState(cookie?.domain || defaultDomain)
  const [path, setPath] = useState(cookie?.path || "/")
  const [secure, setSecure] = useState(cookie?.secure || false)
  const [httpOnly, setHttpOnly] = useState(cookie?.httpOnly || false)
  const [sameSite, setSameSite] = useState<chrome.cookies.SameSiteStatus>(cookie?.sameSite || "unspecified")
  const [isSession, setIsSession] = useState(cookie?.session ?? true)
  const [expiryDate, setExpiryDate] = useState(() => {
    if (cookie?.expirationDate) return new Date(cookie.expirationDate * 1000).toISOString().slice(0, 16)
    const d = new Date(); d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 16)
  })

  const isValid = name.trim() && domain.trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSave({
      name: name.trim(), value, domain: domain.trim(), path: path || "/",
      secure, httpOnly, sameSite,
      expirationDate: isSession ? undefined : new Date(expiryDate).getTime() / 1000,
      session: isSession
    })
  }

  const inputCls = "mt-0.5 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-cookie-500 focus:outline-none focus:ring-1 focus:ring-cookie-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
  const labelCls = "text-xs font-medium text-gray-600 dark:text-gray-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">
          {cookie ? t("title_edit_cookie") : t("title_add_cookie")}
        </h2>

        <div className="space-y-2">
          <label className="block">
            <span className={labelCls}>{t("label_name")}</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </label>

          <label className="block">
            <span className={labelCls}>{t("label_value")}</span>
            <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={2} className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className={labelCls}>{t("label_domain")}</span>
              <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} required className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>{t("label_path")}</span>
              <input type="text" value={path} onChange={(e) => setPath(e.target.value)} className={inputCls} />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="rounded border-gray-300 text-cookie-500 dark:border-gray-600 dark:bg-gray-700" />
              {t("label_secure")}
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={httpOnly} onChange={(e) => setHttpOnly(e.target.checked)} className="rounded border-gray-300 text-cookie-500 dark:border-gray-600 dark:bg-gray-700" />
              {t("label_httponly")}
            </label>
            <label className="flex items-center gap-1.5 text-xs dark:text-gray-400">
              <span className="text-gray-600 dark:text-gray-400">{t("label_samesite")}:</span>
              <select value={sameSite} onChange={(e) => setSameSite(e.target.value as chrome.cookies.SameSiteStatus)}
                className="rounded border border-gray-300 px-1 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                <option value="unspecified">Unspecified</option>
                <option value="lax">Lax</option>
                <option value="strict">Strict</option>
                <option value="no_restriction">None</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={isSession} onChange={(e) => setIsSession(e.target.checked)} className="rounded border-gray-300 text-cookie-500 dark:border-gray-600 dark:bg-gray-700" />
              {t("label_session_cookie")}
            </label>
            {!isSession && (
              <input type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                className="rounded border border-gray-300 px-2 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200" />
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            {t("btn_cancel")}
          </button>
          <button type="submit" disabled={!isValid} className="rounded bg-cookie-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cookie-600 disabled:opacity-50">
            {cookie ? t("btn_update") : t("btn_add")}
          </button>
        </div>
      </form>
    </div>
  )
}
