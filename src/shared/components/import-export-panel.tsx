import { useCallback, useRef, useState } from "react"

import { t } from "../hooks/use-i18n"
import type { CookieItem, ExportFormat } from "../types/cookie"
import { exportCookies, importCookies } from "../utils/cookie-parser"
import { showToast } from "./toast"

interface ImportExportPanelProps {
  cookies: CookieItem[]
  onImport: (cookies: CookieItem[]) => Promise<void>
}

export function ImportExportPanel({ cookies, onImport }: ImportExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("json")
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [tab, setTab] = useState<"export" | "import">("export")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    const text = exportCookies(cookies, format)
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const ext = format === "json" ? "json" : "txt"
    a.download = `cookies-${new Date().toISOString().slice(0, 10)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    showToast(t("btn_download") + " OK")
  }, [cookies, format])

  const handleCopyExport = useCallback(async () => {
    const text = exportCookies(cookies, format)
    await navigator.clipboard.writeText(text)
    showToast(t("toast_export_copied"))
  }, [cookies, format])

  const handleImportFromText = useCallback(async () => {
    try {
      setImportError(null); setImporting(true)
      const parsed = importCookies(importText)
      if (parsed.length === 0) throw new Error("No cookies found")
      await onImport(parsed)
      setImportText("")
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t("toast_import_failed"))
    } finally { setImporting(false) }
  }, [importText, onImport])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setImportError(null); setImporting(true)
      const text = await file.text()
      const parsed = importCookies(text)
      if (parsed.length === 0) throw new Error("No cookies found")
      await onImport(parsed)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t("toast_import_failed"))
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [onImport])

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setTab("export")}
          className={`flex-1 py-2 text-xs font-medium ${tab === "export" ? "border-b-2 border-cookie-500 text-cookie-700 dark:text-cookie-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
          {t("btn_export")} ({cookies.length})
        </button>
        <button onClick={() => setTab("import")}
          className={`flex-1 py-2 text-xs font-medium ${tab === "import" ? "border-b-2 border-cookie-500 text-cookie-700 dark:text-cookie-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
          {t("btn_import")}
        </button>
      </div>

      <div className="p-3">
        {tab === "export" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">{t("label_format")}:</span>
              {(["json", "netscape", "header"] as ExportFormat[]).map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`rounded px-2 py-0.5 text-xs ${format === f
                    ? "bg-cookie-100 text-cookie-700 font-medium dark:bg-cookie-900/30 dark:text-cookie-400"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"}`}>
                  {f === "json" ? "JSON" : f === "netscape" ? "Netscape" : "Header"}
                </button>
              ))}
            </div>
            <pre className="max-h-32 overflow-auto rounded bg-gray-50 p-2 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {exportCookies(cookies.slice(0, 3), format)}
              {cookies.length > 3 && `\n... ${t("and_more")}`}
            </pre>
            <div className="flex gap-2">
              <button onClick={handleExport} className="rounded bg-cookie-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cookie-600">
                {t("btn_download")}
              </button>
              <button onClick={handleCopyExport} className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                {t("btn_copy_clipboard")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
              placeholder={t("import_placeholder")} rows={4}
              className="w-full rounded border border-gray-300 p-2 text-xs focus:border-cookie-500 focus:outline-none focus:ring-1 focus:ring-cookie-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500" />
            {importError && <div className="rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">{importError}</div>}
            <div className="flex gap-2">
              <button onClick={handleImportFromText} disabled={!importText.trim() || importing}
                className="rounded bg-cookie-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cookie-600 disabled:opacity-50">
                {importing ? t("importing") : t("btn_import_text")}
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                {t("btn_upload_file")}
              </button>
              <input ref={fileInputRef} type="file" accept=".json,.txt,.cookie" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
