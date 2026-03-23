import { useEffect, useRef, useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieChangeEvent } from "../types/cookie"

const MAX_EVENTS = 100

export function CookieChangeMonitor() {
  const [events, setEvents] = useState<CookieChangeEvent[]>([])
  const [paused, setPaused] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (paused) return
    const listener = (changeInfo: chrome.cookies.CookieChangeInfo) => {
      const event: CookieChangeEvent = {
        cookie: {
          name: changeInfo.cookie.name, value: changeInfo.cookie.value,
          domain: changeInfo.cookie.domain, path: changeInfo.cookie.path,
          secure: changeInfo.cookie.secure, httpOnly: changeInfo.cookie.httpOnly,
          sameSite: changeInfo.cookie.sameSite, expirationDate: changeInfo.cookie.expirationDate,
          session: changeInfo.cookie.session, storeId: changeInfo.cookie.storeId
        },
        cause: changeInfo.cause, removed: changeInfo.removed, timestamp: Date.now()
      }
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
    }
    chrome.cookies.onChanged.addListener(listener)
    return () => chrome.cookies.onChanged.removeListener(listener)
  }, [paused])

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = 0 }, [events.length])

  const causeLabel = (cause: string) => {
    const key = `cause_${cause}` as string
    return t(key)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("monitor_title")}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)}
            className={`rounded px-2 py-0.5 text-xs ${paused
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400"
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400"}`}>
            {paused ? t("btn_resume") : t("btn_pause")}
          </button>
          <button onClick={() => setEvents([])}
            className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            {t("btn_clear")}
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{events.length} {t("events")}</span>
        </div>
      </div>

      <div ref={listRef} className="max-h-64 overflow-y-auto rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        {events.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">
            {paused ? t("monitor_paused") : t("monitor_listening")}
          </div>
        ) : (
          events.map((event, i) => (
            <div key={`${event.timestamp}-${i}`}
              className="flex items-start gap-2 border-b border-gray-100 px-2 py-1.5 last:border-0 dark:border-gray-700">
              <span className={`mt-0.5 inline-flex shrink-0 items-center rounded px-1.5 text-[10px] font-medium ${
                event.removed
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"}`}>
                {event.removed ? t("btn_delete") : causeLabel(event.cause)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">{event.cookie.name}</span>
                  <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">{causeLabel(event.cause)}</span>
                </div>
                <div className="truncate text-[10px] text-gray-500 dark:text-gray-400">{event.cookie.domain}</div>
              </div>
              <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
