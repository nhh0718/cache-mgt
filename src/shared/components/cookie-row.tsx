import { useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem } from "../types/cookie"
import { CloneCookieDialog } from "./clone-cookie-dialog"

interface CookieRowProps {
  cookie: CookieItem
  selected: boolean
  onSelect: (selected: boolean) => void
  onEdit: (cookie: CookieItem) => void
  onDelete: (cookie: CookieItem) => void
  onCopy: (cookie: CookieItem) => void
  onClone?: (cookie: CookieItem, targetUrl: string) => void
  compact?: boolean
}

export function CookieRow({
  cookie,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onCopy,
  onClone,
  compact = false
}: CookieRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showCloneDialog, setShowCloneDialog] = useState(false)

  const isExpired = cookie.expirationDate
    ? cookie.expirationDate * 1000 < Date.now()
    : false

  const expiryText = cookie.session
    ? t("session")
    : cookie.expirationDate
      ? new Date(cookie.expirationDate * 1000).toLocaleDateString()
      : "N/A"

  return (
    <div className={`border-b border-gray-100 dark:border-gray-700 ${isExpired ? "opacity-50" : ""}`}>
      <div
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onSelect(e.target.checked) }}
          className="h-3.5 w-3.5 rounded border-gray-300 text-cookie-500 focus:ring-cookie-500 dark:border-gray-600 dark:bg-gray-700"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
              {cookie.name}
            </span>
            {cookie.secure && (
              <span className="inline-flex items-center rounded bg-green-100 px-1.5 text-[10px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                {t("label_secure")}
              </span>
            )}
            {cookie.httpOnly && (
              <span className="inline-flex items-center rounded bg-blue-100 px-1.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                {t("label_httponly")}
              </span>
            )}
            {isExpired && (
              <span className="inline-flex items-center rounded bg-red-100 px-1 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                {t("expired")}
              </span>
            )}
          </div>
          {!compact && (
            <div className="text-xs text-gray-500 truncate dark:text-gray-400">
              {cookie.domain} &middot; {expiryText}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onCopy(cookie)} title={t("btn_copy")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button onClick={() => onEdit(cookie)} title={t("title_edit_cookie")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {onClone && (
            <button onClick={() => setShowCloneDialog(!showCloneDialog)} title={t("btn_clone")}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
          )}
          <button onClick={() => onDelete(cookie)} title={t("btn_delete")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-50 px-8 py-2 text-xs dark:bg-gray-800/50">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_value")}: </span>
              <span className="text-gray-700 break-all dark:text-gray-300">{cookie.value || t("empty_value")}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_domain")}: </span>
              <span className="text-gray-700 dark:text-gray-300">{cookie.domain}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_path")}: </span>
              <span className="text-gray-700 dark:text-gray-300">{cookie.path}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_samesite")}: </span>
              <span className="text-gray-700 dark:text-gray-300">{cookie.sameSite}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_expires")}: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {cookie.session ? t("session") : cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t("label_flags")}: </span>
              <span className="text-gray-700 dark:text-gray-300">
                {[cookie.secure && t("label_secure"), cookie.httpOnly && t("label_httponly")].filter(Boolean).join(", ") || t("none_label")}
              </span>
            </div>
          </div>
        </div>
      )}

      {showCloneDialog && onClone && (
        <CloneCookieDialog
          cookie={cookie}
          onConfirm={(targetUrl) => { onClone(cookie, targetUrl); setShowCloneDialog(false) }}
          onCancel={() => setShowCloneDialog(false)}
        />
      )}
    </div>
  )
}
