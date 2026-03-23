import { useMemo, useRef, useState, useEffect } from "react"

import { t } from "../hooks/use-i18n"

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  domains: string[]
  selectedDomain: string
  onDomainChange: (domain: string) => void
  cookieCount: number
  actions?: React.ReactNode
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  domains,
  selectedDomain,
  onDomainChange,
  cookieCount,
  actions
}: SearchFilterBarProps) {
  const [showDomainDropdown, setShowDomainDropdown] = useState(false)
  const [domainSearch, setDomainSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredDomains = useMemo(() => {
    if (!domainSearch.trim()) return domains
    const q = domainSearch.toLowerCase()
    return domains.filter((d) => d.toLowerCase().includes(q))
  }, [domains, domainSearch])

  useEffect(() => {
    if (!showDomainDropdown) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDomainDropdown(false)
        setDomainSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showDomainDropdown])

  useEffect(() => {
    if (showDomainDropdown) searchInputRef.current?.focus()
  }, [showDomainDropdown])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm
              focus:border-cookie-500 focus:outline-none focus:ring-1 focus:ring-cookie-500
              dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {actions}
      </div>

      <div className="flex items-center justify-between">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setShowDomainDropdown(!showDomainDropdown); setDomainSearch("") }}
            className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs
              text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <span className="max-w-[180px] truncate">{selectedDomain || t("all_domains")}</span>
            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDomainDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg
              dark:border-gray-600 dark:bg-gray-800">
              <div className="border-b border-gray-100 p-1.5 dark:border-gray-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("filter_domains")}
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs
                    focus:border-cookie-400 focus:outline-none
                    dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                <button
                  onClick={() => { onDomainChange(""); setShowDomainDropdown(false) }}
                  className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700
                    ${!selectedDomain ? "bg-cookie-50 text-cookie-700 font-medium dark:bg-cookie-900/30 dark:text-cookie-400" : "dark:text-gray-300"}`}
                >
                  {t("all_domains")} ({domains.length})
                </button>
                {filteredDomains.map((d) => (
                  <button
                    key={d}
                    onClick={() => { onDomainChange(d); setShowDomainDropdown(false) }}
                    className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 truncate dark:hover:bg-gray-700
                      ${selectedDomain === d ? "bg-cookie-50 text-cookie-700 font-medium dark:bg-cookie-900/30 dark:text-cookie-400" : "dark:text-gray-300"}`}
                  >
                    {d}
                  </button>
                ))}
                {filteredDomains.length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400">{t("no_domains_match")}</div>
                )}
              </div>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {cookieCount} {t("cookie")}
        </span>
      </div>
    </div>
  )
}
