import { useCallback, useMemo, useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem } from "../types/cookie"
import { filterCookies, filterByDomain, getUniqueDomains, sortCookies } from "../utils/cookie-filter"
import { cookiesToClipboardString } from "../utils/cookie-parser"
import { CookieEditorModal } from "./cookie-editor-modal"
import { CookieRow } from "./cookie-row"
import { SearchFilterBar } from "./search-filter-bar"
import { showToast } from "./toast"

interface CookieListProps {
  cookies: CookieItem[]
  loading: boolean
  error: string | null
  onSetCookie: (cookie: Partial<CookieItem> & { name: string; value: string; domain: string }) => Promise<void>
  onDeleteCookie: (cookie: CookieItem) => Promise<void>
  onDeleteMultiple: (cookies: CookieItem[]) => Promise<void>
  onRefresh: () => void
  onCloneCookie?: (source: CookieItem, targetUrl: string) => Promise<void>
  currentDomain?: string
  compact?: boolean
  headerActions?: React.ReactNode
}

export function CookieList({
  cookies, loading, error, onSetCookie, onDeleteCookie, onDeleteMultiple,
  onRefresh, onCloneCookie, currentDomain, compact = false, headerActions
}: CookieListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const cookieKey = (c: CookieItem) => `${c.domain}::${c.path}::${c.name}`

  const filteredCookies = useMemo(() => {
    let result = cookies
    if (domainFilter) result = filterByDomain(result, domainFilter)
    if (searchQuery) result = filterCookies(result, searchQuery)
    return sortCookies(result, { field: "name", direction: "asc" })
  }, [cookies, searchQuery, domainFilter])

  const domains = useMemo(() => getUniqueDomains(cookies), [cookies])

  const toggleSelect = useCallback((cookie: CookieItem, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const key = cookieKey(cookie)
      if (selected) next.add(key); else next.delete(key)
      return next
    })
  }, [])

  const selectAll = useCallback(() => { setSelectedIds(new Set(filteredCookies.map(cookieKey))) }, [filteredCookies])
  const deselectAll = useCallback(() => { setSelectedIds(new Set()) }, [])

  const handleCopy = useCallback(async (cookie: CookieItem) => {
    try { await navigator.clipboard.writeText(cookie.value); showToast(`${t("toast_copied")} "${cookie.name}"`) }
    catch { showToast(t("toast_copy_failed"), "error") }
  }, [])

  const handleCopySelected = useCallback(async () => {
    const sel = filteredCookies.filter((c) => selectedIds.has(cookieKey(c)))
    try { await navigator.clipboard.writeText(cookiesToClipboardString(sel)); showToast(`${t("toast_copied")} ${sel.length} cookie`) }
    catch { showToast(t("toast_copy_failed"), "error") }
  }, [filteredCookies, selectedIds])

  const handleDelete = useCallback(async (cookie: CookieItem) => {
    try { await onDeleteCookie(cookie); showToast(`${t("toast_deleted")} "${cookie.name}"`) }
    catch { showToast(t("toast_delete_failed"), "error") }
  }, [onDeleteCookie])

  const handleDeleteSelected = useCallback(async () => {
    const sel = filteredCookies.filter((c) => selectedIds.has(cookieKey(c)))
    if (sel.length === 0) return
    try { await onDeleteMultiple(sel); showToast(`${t("toast_deleted")} ${sel.length} cookie`); setSelectedIds(new Set()) }
    catch { showToast(t("toast_delete_failed"), "error") }
  }, [filteredCookies, selectedIds, onDeleteMultiple])

  const handleSaveCookie = useCallback(async (cookie: Partial<CookieItem> & { name: string; value: string; domain: string }) => {
    try { await onSetCookie(cookie); showToast(`${t("toast_saved")} "${cookie.name}"`) }
    catch { showToast(t("toast_save_failed"), "error") }
  }, [onSetCookie])

  const handleClone = useCallback(async (cookie: CookieItem, targetUrl: string) => {
    try {
      await onCloneCookie?.(cookie, targetUrl)
      showToast(`${t("toast_cloned")} ${new URL(targetUrl).hostname}`)
    } catch {
      showToast(t("toast_clone_failed"), "error")
    }
  }, [onCloneCookie])

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-cookie-500 border-t-transparent" />
    </div>
  )

  if (error) return (
    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
      {error}
      <button onClick={onRefresh} className="ml-2 underline">{t("btn_retry")}</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      <SearchFilterBar
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        domains={domains} selectedDomain={domainFilter} onDomainChange={setDomainFilter}
        cookieCount={filteredCookies.length}
        actions={
          <div className="flex items-center gap-1">
            <button onClick={() => setShowAddModal(true)} title={t("btn_add")}
              className="rounded bg-cookie-500 p-1.5 text-white hover:bg-cookie-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button onClick={() => { onRefresh(); showToast(t("toast_refreshed"), "info") }} title={t("btn_refresh")}
              className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {headerActions}
          </div>
        }
      />

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 rounded bg-cookie-50 px-2 py-1.5 dark:bg-cookie-900/30">
          <span className="text-xs font-medium text-cookie-700 dark:text-cookie-400">{selectedIds.size} {t("selected")}</span>
          <button onClick={handleCopySelected} className="text-xs text-cookie-600 hover:underline dark:text-cookie-400">{t("btn_copy")}</button>
          <button onClick={handleDeleteSelected} className="text-xs text-red-600 hover:underline dark:text-red-400">{t("btn_delete")}</button>
          <button onClick={deselectAll} className="ml-auto text-xs text-gray-500 hover:underline dark:text-gray-400">{t("btn_clear")}</button>
        </div>
      )}

      {filteredCookies.length > 0 && selectedIds.size === 0 && (
        <button onClick={selectAll} className="text-left text-xs text-gray-400 hover:text-gray-600 px-2 dark:hover:text-gray-300">
          {t("select_all")}
        </button>
      )}

      <div className="overflow-y-auto" style={{ maxHeight: compact ? "340px" : "calc(100vh - 200px)" }}>
        {filteredCookies.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">{t("no_cookies")}</div>
        ) : (
          filteredCookies.map((cookie) => (
            <CookieRow key={cookieKey(cookie)} cookie={cookie}
              selected={selectedIds.has(cookieKey(cookie))}
              onSelect={(sel) => toggleSelect(cookie, sel)}
              onEdit={setEditingCookie} onDelete={handleDelete} onCopy={handleCopy}
              onClone={onCloneCookie ? handleClone : undefined} compact={compact} />
          ))
        )}
      </div>

      {showAddModal && (
        <CookieEditorModal defaultDomain={currentDomain}
          onSave={(c) => { handleSaveCookie(c); setShowAddModal(false) }}
          onClose={() => setShowAddModal(false)} />
      )}
      {editingCookie && (
        <CookieEditorModal cookie={editingCookie}
          onSave={(c) => { handleSaveCookie(c); setEditingCookie(null) }}
          onClose={() => setEditingCookie(null)} />
      )}
    </div>
  )
}
